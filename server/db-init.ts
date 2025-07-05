
import { db } from './db';
import { trains, trainSchedules } from '@shared/schema';

export async function initializeDatabase() {
  try {
    // Sample train data
    const sampleTrains = [
      {
        number: "12951",
        name: "Mumbai Rajdhani",
        sourceStationId: 1,
        destinationStationId: 2,
        departureTime: "16:25",
        arrivalTime: "09:45",
        duration: "17h 20m",
        trainType: "Rajdhani",
        runDays: "Daily"
      },
      {
        number: "12952",
        name: "Delhi Rajdhani",
        sourceStationId: 2,
        destinationStationId: 1,
        departureTime: "17:00",
        arrivalTime: "10:00",
        duration: "17h 00m",
        trainType: "Rajdhani",
        runDays: "Daily"
      }
    ];

    // Insert trains
    for (const train of sampleTrains) {
      await db.insert(trains).values(train).onConflictDoNothing();
    }

    // Sample schedules
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sampleSchedules = [
      {
        trainId: 1,
        departureStation: "Mumbai Central",
        arrivalStation: "New Delhi",
        departureTime: today,
        arrivalTime: tomorrow,
        fare: 2500,
        availableSeats: 120,
        platform: "1"
      }
    ];

    // Insert schedules
    for (const schedule of sampleSchedules) {
      await db.insert(trainSchedules).values(schedule).onConflictDoNothing();
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
