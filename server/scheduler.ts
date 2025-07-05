import { storage } from './storage';
import { generatePnr } from './utils'; // Import from server utils
import { Booking, Passenger } from '@shared/schema';

// Function to generate a unique PNR number
async function generateUniquePnr(): Promise<string> {
  let pnr: string;
  let exists = true;
  
  // Keep generating until we find a unique one
  while (exists) {
    pnr = generatePnr();
    const existingBooking = await storage.getBookingByPnr(pnr);
    exists = !!existingBooking;
  }
  
  return pnr!;
}

// Process a scheduled booking
export async function processScheduledBooking(scheduledBookingId: string): Promise<Booking | null> {
  try {
  // Get the scheduled booking
  const scheduledBooking = await storage.getScheduledBookingById(scheduledBookingId);
  if (!scheduledBooking) {
    console.error(`Scheduled booking ${scheduledBookingId} not found`);
    return null;
  }
  
    // Check if it's already been processed
  if (scheduledBooking.status !== 'pending') {
      console.log(`Scheduled booking ${scheduledBookingId} is already ${scheduledBooking.status}`);
    return null;
  }
  
    // Get train classes to calculate fare
    const trainClasses = await storage.getTrainClasses(scheduledBooking.trainId.toString());
    const selectedClass = trainClasses.find(c => c.classCode === scheduledBooking.classCode);
    
    if (!selectedClass) {
      console.error(`Train class ${scheduledBooking.classCode} not found for train ${scheduledBooking.trainId}`);
      return null;
    }
    
    // Calculate total fare
    const totalFare = selectedClass.fare * scheduledBooking.passengerData.length;

    // Generate unique PNR
    const pnr = await generateUniquePnr();
    
    // Create the actual booking
    const booking = await storage.createBooking({
      status: 'CONFIRMED',
      trainId: scheduledBooking.trainId.toString(),
      classCode: scheduledBooking.classCode,
      userId: scheduledBooking.userId.toString(),
      journeyDate: scheduledBooking.journeyDate,
      pnr,
      totalFare,
      bookingType: scheduledBooking.bookingType,
      paymentStatus: 'Pending',
      paymentDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });
    
    // Add the passengers to the booking
    for (const passengerInfo of scheduledBooking.passengerData) {
      await storage.createPassenger({
        bookingId: booking._id.toString(),
        name: passengerInfo.name,
        age: passengerInfo.age,
        gender: passengerInfo.gender,
        berthPreference: passengerInfo.berthPreference,
        status: 'Waiting List'  // Start as waiting list until payment
      });
    }
    
    // Update the scheduled booking status
    await storage.updateScheduledBooking(scheduledBookingId, {
      status: 'completed',
      bookingId: booking._id.toString()
    });

    // Create payment reminder if enabled
    if (scheduledBooking.paymentRemindersEnabled) {
      const firstReminderAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours from now
      
      await storage.createPaymentReminder({
        bookingId: booking._id.toString(),
        reminderType: 'email', // Default to email reminders
        reminderStatus: 'pending',
        reminderCount: 0,
        nextReminderAt: firstReminderAt
      });
    }
    
    console.log(`Successfully processed scheduled booking ${scheduledBookingId} into booking ${booking._id}`);
    return booking;

  } catch (error) {
    console.error(`Error processing scheduled booking ${scheduledBookingId}:`, error);
    return null;
  }
}

// Process all due scheduled bookings
export async function processScheduledBookings(): Promise<{ successCount: number; errorCount: number }> {
  try {
  const dueBookings = await storage.getScheduledBookingsDue();
  console.log(`Found ${dueBookings.length} scheduled bookings due for processing`);
  
  let successCount = 0;
    let errorCount = 0;
  
  for (const booking of dueBookings) {
      const result = await processScheduledBooking(booking._id.toString());
    if (result) {
      successCount++;
      } else {
        errorCount++;
}
    }

    console.log(`Processed ${successCount} bookings successfully, ${errorCount} failed`);
    return { successCount, errorCount };

  } catch (error) {
    console.error('Error processing scheduled bookings:', error);
    return { successCount: 0, errorCount: 1 };
  }
}

// Start the scheduled booking processor
export function startScheduledBookingProcessor(intervalMinutes: number = 1): void {
  console.log(`Starting scheduled booking processor (runs every ${intervalMinutes} minute(s))`);
  
  // Process immediately on startup
  processScheduledBookings();
  
  // Then set up the interval
  setInterval(() => {
    processScheduledBookings();
  }, intervalMinutes * 60 * 1000);
}