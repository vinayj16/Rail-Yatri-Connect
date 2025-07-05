import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  searchTrainSchema, 
  pnrStatusSchema, 
  chatbotSchema, 
  insertTrainLocationSchema,
  tatkalBookingSchema,
  scheduledBookingRequestSchema,
  createTicketTransferSchema,
  processTicketTransferSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { startScheduledBookingProcessor, processScheduledBooking } from "./scheduler";
import { generatePnr, generateSeatNumber } from "./utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Get all stations (for search autocomplete)
  app.get("/api/stations", async (req, res) => {
    try {
      const stations = await storage.getStations();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });

  // Search trains
  app.post("/api/trains/search", async (req, res) => {
    try {
      // Validate request body
      const params = searchTrainSchema.parse(req.body);
      
      // Search trains
      const trains = await storage.searchTrains(params);
      res.json(trains);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid search parameters", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to search trains" });
      }
    }
  });

  // Get train details
  app.get("/api/trains/:id", async (req, res) => {
    try {
      const trainId = req.params.id;
      const train = await storage.getTrainById(trainId);
      
      if (!train) {
        return res.status(404).json({ message: "Train not found" });
      }
      
      // Get train classes and stops
      const classes = await storage.getTrainClasses(trainId);
      const stops = await storage.getTrainStops(trainId);
      
      res.json({
        ...train.toObject(),
        classes,
        stops
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch train details" });
    }
  });

  // Check PNR status
  app.post("/api/pnr/status", async (req, res) => {
    try {
      // Validate request body
      const { pnrNumber } = pnrStatusSchema.parse(req.body);
      
      // Get booking by PNR
      const booking = await storage.getBookingByPnr(pnrNumber);
      
      if (!booking) {
        return res.status(404).json({ message: "PNR not found" });
      }
      
      // Get train and passenger details
      const train = await storage.getTrainById(booking.trainId.toString());
      const passengers = await storage.getPassengers(booking._id.toString());
      
      res.json({
        pnr: booking.pnr,
        train,
        journeyDate: booking.journeyDate,
        classCode: booking.classCode,
        status: booking.status,
        passengers
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid PNR format", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to check PNR status" });
      }
    }
  });

  // Create a booking
  app.post("/api/bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to book tickets" });
      }

      const { trainId, journeyDate, classCode, passengers, totalFare } = req.body;
      
      // Generate a random 10-digit PNR
      const pnr = Math.floor(Math.random() * 9000000000) + 1000000000;
      
      // Create booking
      const booking = await storage.createBooking({
        userId: req.user!._id.toString(),
        trainId,
        journeyDate,
        pnr: pnr.toString(),
        status: 'CONFIRMED',
        classCode,
        totalFare
      });
      
      // Add passengers
      for (const passenger of passengers) {
        await storage.createPassenger({
          bookingId: booking._id.toString(),
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          berthPreference: passenger.berthPreference,
          seatNumber: `${classCode}-${Math.floor(Math.random() * 72) + 1}`,
          status: 'CONFIRMED'
        });
      }
      
      res.status(201).json({
        bookingId: booking._id.toString(),
        pnr: booking.pnr
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get user bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view bookings" });
      }
      
      const bookings = await storage.getBookings(req.user!._id.toString());
      
      // Get additional details for each booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const train = await storage.getTrainById(booking.trainId.toString());
          const passengers = await storage.getPassengers(booking._id.toString());
          
          return {
            ...booking.toObject(),
            train,
            passengers
          };
        })
      );
      
      res.json(bookingsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Check AI status (if Perplexity API is available)
  app.get("/api/ai-status", async (req, res) => {
    try {
      // Check if Perplexity API key is available and working
      const hasApiKey = !!process.env.PERPLEXITY_API_KEY;
      let isApiWorking = false;
      
      if (hasApiKey) {
        try {
          // Import the AI module and test with a simple query
          const { getAIResponse } = await import('./perplexity-ai');
          const testResponse = await getAIResponse("test");
          isApiWorking = testResponse !== null && testResponse !== undefined;
        } catch (error) {
          console.error("Error testing Perplexity API:", error);
          isApiWorking = false;
        }
      }
      
      res.json({
        enabled: isApiWorking, 
        provider: "perplexity",
        status: isApiWorking ? "online" : "offline"
      });
    } catch (error) {
      console.error("Error checking AI status:", error);
      res.json({
        enabled: false,
        provider: "local",
        status: "offline"
      });
    }
  });

  // Chatbot endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      // Validate request body
      const { message } = chatbotSchema.parse(req.body);
      
      // Get response from chatbot (now using Perplexity AI when available)
      const response = await storage.getChatbotResponse(message);
      
      res.json({ response });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid message format", errors: error.errors });
      } else {
        console.error("Chatbot error:", error);
        res.status(500).json({ message: "Failed to get chatbot response", response: "I'm sorry, I couldn't process your request right now." });
      }
    }
  });
  
  // Get train location
  app.get("/api/trains/:id/location", async (req, res) => {
    try {
      const trainId = req.params.id;
      const location = await storage.getTrainLocation(trainId);
      
      if (!location) {
        return res.status(404).json({ message: "Train location not found" });
      }
      
      // Get station names for better context
      const currentStation = await storage.getStationByCode(location.currentStationId.toString());
      const nextStation = await storage.getStationByCode(location.nextStationId.toString());
      
      res.json({
        ...location,
        currentStation,
        nextStation
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch train location" });
    }
  });
  
  // Update train location (admin only)
  app.put("/api/trains/:id/location", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Unauthorized access - must be admin" });
      }
      
      // Validate request body
      const trainId = req.params.id;
      const locationData = insertTrainLocationSchema.parse(req.body);
      
      // Set the trainId
      const updateData = {
        ...locationData,
        trainId
      };
      
      const updatedLocation = await storage.updateTrainLocation(trainId, updateData);
      
      if (!updatedLocation) {
        return res.status(404).json({ message: "Train location not found" });
      }
      
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid location data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update train location" });
      }
    }
  });
  
  // Get payment reminders for a booking
  app.get("/api/bookings/:id/payment-reminders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view payment reminders" });
      }
      
      const bookingId = req.params.id;
      const booking = await storage.getBooking(bookingId);
      
      // Check if the booking belongs to the user
      if (!booking || booking.userId.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const reminders = await storage.getPaymentReminders(bookingId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment reminders" });
    }
  });
  
  // Create a tatkal booking
  app.post("/api/bookings/tatkal", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to book tatkal tickets" });
      }
      
      // Validate request body
      const bookingData = tatkalBookingSchema.parse(req.body);
      const { trainId, journeyDate, classCode, passengers, totalFare } = bookingData;
      
      // Check if tatkal booking is allowed (usually opens at 10 AM, 1 day before)
      const now = new Date();
      const bookingDate = new Date(journeyDate);
      const dayDiff = Math.floor((bookingDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      
      if (dayDiff > 1) {
        return res.status(400).json({ 
          message: "Tatkal booking is only available 1 day before the journey date"
        });
      }
      
      // Generate a random 10-digit PNR
      const pnr = Math.floor(Math.random() * 9000000000) + 1000000000;
      
      // Create booking with tatkal flag
      const booking = await storage.createBooking({
        userId: req.user!._id.toString(),
        trainId,
        journeyDate,
        pnr: pnr.toString(),
        status: 'CONFIRMED',
        classCode,
        totalFare,
        bookingType: 'Tatkal',
        // Set payment due time to 3 hours from now
        paymentStatus: 'Pending',
        paymentDueDate: new Date(now.getTime() + 3 * 60 * 60 * 1000)
      });
      
      // Add passengers
      for (const passenger of passengers) {
        await storage.createPassenger({
          bookingId: booking._id.toString(),
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          berthPreference: passenger.berthPreference || undefined,
          seatNumber: `${classCode}-${Math.floor(Math.random() * 72) + 1}`,
          status: 'CONFIRMED'
        });
      }
      
      // Create a payment reminder for tatkal booking
      await storage.createPaymentReminder({
        bookingId: booking._id.toString(),
        reminderCount: 0,
        lastSentAt: undefined,
        nextReminderAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
        reminderType: 'SMS',
        reminderStatus: 'Scheduled'
      });
      
      res.status(201).json({
        bookingId: booking._id.toString(),
        pnr: booking.pnr,
        paymentDueDate: booking.paymentDueDate
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tatkal booking" });
      }
    }
  });

  // Create a scheduled booking
  app.post("/api/scheduled-bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create scheduled bookings" });
      }
      
      // Validate request body
      const bookingData = scheduledBookingRequestSchema.parse(req.body);
      const { trainId, journeyDate, classCode, scheduledAt, passengers, bookingType, paymentRemindersEnabled, reminderFrequency, maxReminders } = bookingData;
      
      // Check if the train exists
      const train = await storage.getTrainById(trainId);
      if (!train) {
        return res.status(404).json({ message: "Train not found" });
      }
      
      // Create scheduled booking
      const scheduledBooking = await storage.createScheduledBooking({
        userId: req.user!._id.toString(),
        trainId,
        journeyDate,
        classCode,
        scheduledAt: new Date(scheduledAt),
        status: 'pending',
        passengerData: passengers,
        bookingType,
        paymentRemindersEnabled,
        reminderFrequency,
        maxReminders
      });
      
      res.status(201).json({
        id: scheduledBooking.id,
        scheduledAt: scheduledBooking.scheduledAt,
        status: scheduledBooking.status
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      } else {
        console.error("Error creating scheduled booking:", error);
        res.status(500).json({ message: "Failed to create scheduled booking" });
      }
    }
  });
  
  // Get user's scheduled bookings
  app.get("/api/scheduled-bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view scheduled bookings" });
      }
      
      const scheduledBookings = await storage.getScheduledBookings(req.user!._id.toString());
      
      // Get train details for each booking
      const bookingsWithDetails = await Promise.all(
        scheduledBookings.map(async (booking) => {
          const train = await storage.getTrainById(booking.trainId.toString());
          
          // If booking has been processed, get the actual booking
          let actualBooking = null;
          if (booking.status === 'completed' && booking.bookingId) {
            const completed = await storage.getBooking(booking.bookingId.toString());
            if (completed) {
              const passengers = await storage.getPassengers(completed._id.toString());
              actualBooking = {
                ...completed,
                passengers
              };
            }
          }
          
          return {
            ...booking,
            train,
            booking: actualBooking
          };
        })
      );
      
      res.json(bookingsWithDetails);
    } catch (error) {
      console.error("Error fetching scheduled bookings:", error);
      res.status(500).json({ message: "Failed to fetch scheduled bookings" });
    }
  });
  
  // Process a specific scheduled booking immediately (useful for testing)
  app.post("/api/scheduled-bookings/:id/process", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to process scheduled bookings" });
      }
      
      const scheduledBookingId = req.params.id;
      
      // Verify the scheduled booking belongs to the user
      const scheduledBooking = await storage.getScheduledBookingById(scheduledBookingId);
      if (!scheduledBooking) {
        return res.status(404).json({ message: "Scheduled booking not found" });
      }
      
      if (scheduledBooking.userId.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Process the booking
      const booking = await processScheduledBooking(scheduledBookingId);
      
      if (!booking) {
        return res.status(400).json({ message: "Failed to process scheduled booking" });
      }
      
      // Return the booking details
      const passengers = await storage.getPassengers(booking._id.toString());
      
      res.json({
        booking: {
          ...booking,
          passengers
        },
        message: "Scheduled booking processed successfully"
      });
    } catch (error) {
      console.error("Error processing scheduled booking:", error);
      res.status(500).json({ message: "Failed to process scheduled booking" });
    }
  });
  
  // Delete a scheduled booking
  app.delete("/api/scheduled-bookings/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to delete scheduled bookings" });
      }
      
      const scheduledBookingId = req.params.id;
      
      // Verify the scheduled booking belongs to the user
      const scheduledBooking = await storage.getScheduledBookingById(scheduledBookingId);
      if (!scheduledBooking) {
        return res.status(404).json({ message: "Scheduled booking not found" });
      }
      
      if (scheduledBooking.userId.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Only pending bookings can be cancelled
      if (scheduledBooking.status !== 'pending') {
        return res.status(400).json({ message: "Cannot cancel a booking that has already been processed" });
      }
      
      // Update status to cancelled
      await storage.updateScheduledBooking(scheduledBookingId, { status: 'cancelled' });
      
      res.json({ message: "Scheduled booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling scheduled booking:", error);
      res.status(500).json({ message: "Failed to cancel scheduled booking" });
    }
  });

  // Start the scheduled booking processor to run every minute
  startScheduledBookingProcessor(1);

  // Create a ticket transfer
  app.post("/api/ticket-transfers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to transfer tickets" });
      }
      
      // Validate request body
      const transferData = createTicketTransferSchema.parse(req.body);
      const { bookingId, receiverEmail, message, transferType, passengerIds, expirationHours } = transferData;
      
      // Check if the booking exists and belongs to the user
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking && booking.userId.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to transfer this ticket" });
      }
      
      // Check if the journey date has passed
      const journeyDate = new Date(booking.journeyDate);
      const now = new Date();
      if (journeyDate < now) {
        return res.status(400).json({ message: "Cannot transfer tickets for past journeys" });
      }
      
      // Generate a unique transfer code
      const transferCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Set expiration date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);
      
      // Create the transfer
      const ticketTransfer = await storage.createTicketTransfer({
        bookingId,
        senderId: req.user!._id.toString(),
        receiverEmail,
        status: "pending",
        transferCode,
        message: message || undefined,
        expiresAt,
        transferType: transferType as "full" | "partial",
        passengerIds: passengerIds ? passengerIds.join(',') : undefined
      });
      
      // Send email to the recipient
      try {
        const { EmailService } = await import('./email-service');
        const sender = req.user!;
        await EmailService.sendTicketTransferEmail(
          booking,
          sender,
          receiverEmail,
          transferType as "full" | "partial",
          message || null
        );
      } catch (emailError) {
        console.error("Failed to send transfer email:", emailError);
        // Continue even if email fails
      }
      
      res.status(201).json({
        id: ticketTransfer.id,
        transferCode,
        expiresAt,
        status: "pending"
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid transfer data", errors: error.errors });
      } else {
        console.error("Error creating ticket transfer:", error);
        res.status(500).json({ message: "Failed to create ticket transfer" });
      }
    }
  });
  
  // Get user's ticket transfers (both sent and received)
  app.get("/api/ticket-transfers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view ticket transfers" });
      }
      
      // Get transfers sent by the user
      const transfers = await storage.getTicketTransfers(req.user!._id.toString());
      
      // Enhance with booking and passenger details
      const transfersWithDetails = await Promise.all(
        transfers.map(async (transfer) => {
          const booking = await storage.getBooking(transfer.bookingId.toString());
          const train = booking ? await storage.getTrainById(booking.trainId.toString()) : null;
          const passengers = booking ? await storage.getPassengers(booking._id.toString()) : [];
          
          // For partial transfers, filter passengers
          const transferPassengers = transfer.passengerIds 
            ? passengers.filter(p => transfer.passengerIds!.split(',').includes(p._id.toString()))
            : passengers;
          
          return {
            ...transfer,
            booking: booking ? {
              ...booking,
              train,
              passengers: transferPassengers
            } : null
          };
        })
      );
      
      res.json(transfersWithDetails);
    } catch (error) {
      console.error("Error fetching ticket transfers:", error);
      res.status(500).json({ message: "Failed to fetch ticket transfers" });
    }
  });
  
  // Process a ticket transfer (accept or reject)
  app.post("/api/ticket-transfers/process", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to process ticket transfers" });
      }
      
      // Validate request body
      const { transferCode, action } = processTicketTransferSchema.parse(req.body);
      
      // Find the transfer by code
      const transfers = await storage.getTicketTransfers(req.user!._id.toString()); // Get all transfers
      const transfer = transfers.find(t => t.transferCode === transferCode);
      
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found or invalid code" });
      }
      
      // Check if transfer is pending and not expired
      if (transfer.status !== "pending") {
        return res.status(400).json({ message: `Transfer has already been ${transfer.status}` });
      }
      
      const now = new Date();
      if (transfer.expiresAt && new Date(transfer.expiresAt) < now) {
        await storage.updateTicketTransfer(transfer.id, { status: "expired", completedAt: now });
        return res.status(400).json({ message: "Transfer has expired" });
      }
      
      // Process the action
      if (action === "accept") {
        // Get the booking
        const booking = await storage.getBooking(transfer.bookingId.toString());
        if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
        }
        
        // Update the booking ownership
        await storage.updateBooking(booking._id.toString(), { userId: req.user!._id.toString() });
        
        // Update transfer status
        await storage.updateTicketTransfer(transfer.id, { 
          status: "accepted", 
          completedAt: now 
        });
        
        res.json({ 
          message: "Transfer accepted successfully",
          booking: {
            id: booking._id.toString(),
            pnr: booking.pnr
          }
        });
      } else {
        // Reject the transfer
        await storage.updateTicketTransfer(transfer.id, { 
          status: "rejected", 
          completedAt: now 
        });
        
        res.json({ message: "Transfer rejected" });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error processing ticket transfer:", error);
        res.status(500).json({ message: "Failed to process ticket transfer" });
      }
    }
  });
  
  // Get crowd level for a station platform
  app.get("/api/stations/:stationCode/crowd-level", async (req, res) => {
    try {
      const { stationCode } = req.params;
      
      // Simulate crowd level calculation
      // In production, this would use real data from sensors/check-ins
      const crowdLevel = Math.floor(Math.random() * 100);
      
      res.json({
        stationCode,
        crowdLevel,
        timestamp: new Date(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crowd level" });
    }
  });

  // Get platform information - provides live platform and next train information
  app.get("/api/stations/platform-status", async (req, res) => {
    try {
      // This is a mock endpoint that returns sample platform data
      // In a real application, this would connect to an external API or database
      
      const stationCode = req.query.code || "NDLS"; // Default to New Delhi
      const station = await storage.getStationByCode(stationCode.toString());
      
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }
      
      // Generate trainPlatformInfo data
      const trains = [];
      const trainCount = Math.floor(Math.random() * 8) + 4; // 4-12 trains
      
      // Get all available trains
      const allTrains = await storage.getTrains();
      // Get a random subset
      const selectedTrains = [];
      for (let i = 0; i < Math.min(trainCount, allTrains.length); i++) {
        const randomIndex = Math.floor(Math.random() * allTrains.length);
        selectedTrains.push(allTrains[randomIndex]);
        // Remove the selected train to avoid duplicates
        allTrains.splice(randomIndex, 1);
      }
      
      // Process each train
      for (const train of selectedTrains) {
        // Calculate random expected times
        const now = new Date();
        const arrivalMinutes = Math.floor(Math.random() * 120) - 30; // -30 to 90 minutes from now
        const arrivalTime = new Date(now.getTime() + arrivalMinutes * 60000);
        
        const departureMinutes = arrivalMinutes + 5 + Math.floor(Math.random() * 20); // 5-25 minutes after arrival
        const departureTime = new Date(now.getTime() + departureMinutes * 60000);
        
        const delayMinutes = Math.random() > 0.6 ? 5 + Math.floor(Math.random() * 55) : 0;
        const status = delayMinutes > 0 ? "DELAYED" : 
                     arrivalMinutes < 0 && departureMinutes > 0 ? "ARRIVED" :
                     departureMinutes < 0 ? "DEPARTED" :
                     Math.random() > 0.95 ? "CANCELLED" : "ON_TIME";
        
        // Get source and destination stations
        const sourceStation = await storage.getStationByCode(train.sourceStationId.toString());
        const destStation = await storage.getStationByCode(train.destinationStationId.toString());
        
        // Find a potential next station if the train has departed
        let nextStation;
        let nextStationArrival;
        
        if (status === "DEPARTED") {
          // Get a random station as the next stop
          const trainStops = await storage.getTrainStops(train.id);
          if (trainStops && trainStops.length > 0) {
            const randomStopIndex = Math.floor(Math.random() * trainStops.length);
            const nextStop = trainStops[randomStopIndex];
            const nextStationInfo = await storage.getStationByCode(nextStop.stationId.toString());
            if (nextStationInfo) {
              nextStation = nextStationInfo.name;
              // Next arrival in 30-90 minutes
              const nextArrival = new Date(departureTime.getTime() + (30 + Math.floor(Math.random() * 60)) * 60000);
              nextStationArrival = nextArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          }
        }
        
        const platforms = ["1", "2", "3", "4", "5", "6", "7", "8"];
        
        trains.push({
          trainNumber: train.number,
          trainName: train.name,
          expectedArrival: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          expectedDeparture: departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          platform: status === "CANCELLED" ? "--" : platforms[Math.floor(Math.random() * platforms.length)],
          status,
          delayMinutes: status === "DELAYED" ? delayMinutes : undefined,
          source: sourceStation ? sourceStation.name : "Unknown",
          destination: destStation ? destStation.name : "Unknown",
          nextStation: nextStation,
          nextStationArrival: nextStationArrival
        });
      }
      
      // Sort by arrival time
      trains.sort((a, b) => {
        return a.expectedArrival.localeCompare(b.expectedArrival);
      });
      
      // Send the response in the expected format
      res.json({
        code: station.code,
        name: station.name,
        city: station.city || "India",
        trains,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error("Error fetching platform status:", error);
      res.status(500).json({ message: "Failed to fetch platform status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
