import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default connection string for local development
const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/irctc_booking";

// Use environment variable or default connection string
const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

export async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      // MongoDB connection options
    });
    
    console.log('MongoDB connection established successfully');
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Import models to ensure they're registered
    const { User, Station, Train, TrainStop, TrainClass, Booking, Passenger, TrainLocation, PaymentReminder, ScheduledBooking, TicketTransfer } = await import('@shared/schema');
    
    // Create indexes for better query performance
    await User.createIndexes();
    await Station.createIndexes();
    await Train.createIndexes();
    await TrainStop.createIndexes();
    await TrainClass.createIndexes();
    await Booking.createIndexes();
    await Passenger.createIndexes();
    await TrainLocation.createIndexes();
    await PaymentReminder.createIndexes();
    await ScheduledBooking.createIndexes();
    await TicketTransfer.createIndexes();
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

export { mongoose };
