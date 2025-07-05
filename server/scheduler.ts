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
export async function processScheduledBooking(scheduledBookingId: number): Promise<Booking | null> {
  // Get the scheduled booking
  const scheduledBooking = await storage.getScheduledBookingById(scheduledBookingId);
  
  if (!scheduledBooking) {
    console.error(`Scheduled booking ${scheduledBookingId} not found`);
    return null;
  }
  
  // Check if it's already processed or failed
  if (scheduledBooking.status !== 'pending') {
    console.log(`Scheduled booking ${scheduledBookingId} already processed, status: ${scheduledBooking.status}`);
    return null;
  }
  
  try {
    // Get train class for fare information
    const trainClasses = await storage.getTrainClasses(scheduledBooking.trainId);
    const trainClass = trainClasses.find(cls => cls.classCode === scheduledBooking.classCode);
    
    if (!trainClass) {
      throw new Error(`Train class ${scheduledBooking.classCode} not found for train ${scheduledBooking.trainId}`);
    }
    
    // Check if seats are available
    if (trainClass.availableSeats <= 0) {
      await storage.updateScheduledBooking(scheduledBookingId, { status: 'failed' });
      console.error(`No seats available for train ${scheduledBooking.trainId}, class ${scheduledBooking.classCode}`);
      return null;
    }
    
    // Generate a unique PNR
    const pnr = await generateUniquePnr();
    
    // Create the booking
    const passengerData = scheduledBooking.passengerData as Passenger[];
    const totalFare = trainClass.fare * passengerData.length;
    
    // Set payment due date based on booking type
    // For tatkal, payment is due sooner than for regular bookings
    const paymentDueDate = new Date();
    if (scheduledBooking.bookingType === 'tatkal') {
      // Due in 2 hours for tatkal
      paymentDueDate.setHours(paymentDueDate.getHours() + 2);
    } else {
      // Due in 24 hours for general
      paymentDueDate.setHours(paymentDueDate.getHours() + 24);
    }
    
    // Create the booking
    const booking = await storage.createBooking({
      userId: scheduledBooking.userId,
      trainId: scheduledBooking.trainId,
      journeyDate: scheduledBooking.journeyDate,
      classCode: scheduledBooking.classCode,
      pnr,
      status: 'Waiting List', // Start as waiting list until payment
      totalFare,
      bookingType: scheduledBooking.bookingType,
      paymentStatus: 'pending',
      paymentDueDate
    });
    
    // Update scheduled booking with status to 'completed'
    await storage.updateScheduledBooking(scheduledBookingId, {
      status: 'completed'
    });
    
    // Add the passengers to the booking
    for (const passengerInfo of passengerData) {
      await storage.createPassenger({
        bookingId: booking.id,
        name: passengerInfo.name,
        age: passengerInfo.age,
        gender: passengerInfo.gender,
        berthPreference: passengerInfo.berthPreference,
        status: 'Waiting List'  // Start as waiting list until payment
      });
    }
    
    // If payment reminders are enabled, create a payment reminder
    if (scheduledBooking.paymentRemindersEnabled) {
      // Calculate when to send the first reminder
      const firstReminderAt = new Date();
      firstReminderAt.setHours(firstReminderAt.getHours() + (scheduledBooking.reminderFrequency || 24));
      
      await storage.createPaymentReminder({
        bookingId: booking.id,
        reminderType: 'email', // Default to email reminders
        reminderStatus: 'pending',
        reminderCount: 0,
        nextReminderAt: firstReminderAt
      });
    }
    
    console.log(`Successfully processed scheduled booking ${scheduledBookingId}, created booking with PNR ${pnr}`);
    return booking;
  } catch (error) {
    console.error(`Error processing scheduled booking ${scheduledBookingId}:`, error);
    await storage.updateScheduledBooking(scheduledBookingId, { status: 'failed' });
    return null;
  }
}

// Process all due scheduled bookings
export async function processAllDueScheduledBookings(): Promise<number> {
  const dueBookings = await storage.getScheduledBookingsDue();
  console.log(`Found ${dueBookings.length} scheduled bookings due for processing`);
  
  let successCount = 0;
  
  for (const booking of dueBookings) {
    const result = await processScheduledBooking(booking.id);
    if (result) {
      successCount++;
    }
  }
  
  return successCount;
}

// Start the scheduled booking processor to run at regular intervals
let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduledBookingProcessor(intervalMinutes = 1): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }
  
  // Convert minutes to milliseconds
  const intervalMs = intervalMinutes * 60 * 1000;
  
  schedulerInterval = setInterval(async () => {
    try {
      const processed = await processAllDueScheduledBookings();
      if (processed > 0) {
        console.log(`Processed ${processed} scheduled bookings`);
      }
    } catch (error) {
      console.error('Error in scheduled booking processor:', error);
    }
  }, intervalMs);
  
  console.log(`Started scheduled booking processor to run every ${intervalMinutes} minute(s)`);
}

export function stopScheduledBookingProcessor(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Stopped scheduled booking processor');
  }
}