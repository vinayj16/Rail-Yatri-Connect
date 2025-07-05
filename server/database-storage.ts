import { eq, and, gte, like, or, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { 
  User, InsertUser, Station, InsertStation, 
  Train, InsertTrain, TrainStop, InsertTrainStop,
  TrainClass, InsertTrainClass, Booking, InsertBooking,
  Passenger, InsertPassenger, TrainLocation, InsertTrainLocation,
  PaymentReminder, InsertPaymentReminder, ScheduledBooking, InsertScheduledBooking,
  SearchTrainParams, TicketTransfer, InsertTicketTransfer,
  users, stations, trains, trainStops, trainClasses, bookings,
  passengers, trainLocations, paymentReminders, scheduledBookings, ticketTransfers
} from "@shared/schema";

import { IStorage } from "./storage";
import { getChatbotResponse } from "./chatbot";
import { db, pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    // Set up session store
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
    
    // Initialize the database with test data if needed
    this.initializeDatabase();
  }
  
  private async initializeDatabase() {
    try {
      // Check if we need to initialize data by checking if stations table has data
      const stationsCount = await db.select({ count: stations.id }).from(stations);
      if (stationsCount && stationsCount.length > 0 && stationsCount[0].count > 0) {
        console.log("Database already initialized, skipping initialization");
        return;
      }
      
      console.log("Initializing database with test data...");
      
      // Add sample stations
      await this.createStation({
        code: "NDLS",
        name: "New Delhi Railway Station",
        city: "New Delhi"
      });
      
      await this.createStation({
        code: "CSTM",
        name: "Chhatrapati Shivaji Terminus",
        city: "Mumbai"
      });
      
      await this.createStation({
        code: "MAS",
        name: "Chennai Central",
        city: "Chennai"
      });
      
      await this.createStation({
        code: "HWH",
        name: "Howrah Junction",
        city: "Kolkata"
      });
      
      // Get stations for reference
      const allStations = await this.getStations();
      const ndls = allStations.find(s => s.code === "NDLS");
      const cstm = allStations.find(s => s.code === "CSTM");
      const hwh = allStations.find(s => s.code === "HWH");
      
      if (!ndls || !cstm || !hwh) {
        throw new Error("Failed to initialize stations");
      }
      
      // Add a sample train
      const rajdhaniExpress = await this.createTrain({
        number: "12301",
        name: "Rajdhani Express",
        sourceStationId: ndls.id,
        destinationStationId: hwh.id,
        departureTime: "16:00",
        arrivalTime: "10:00",
        duration: "18h",
        runDays: "1,2,3,4,5,6,7",
        trainType: "Rajdhani",
        hasWifi: true,
        hasPantry: true,
        hasChargingPoint: true,
        hasBedroll: true,
        avgSpeed: 95,
        distance: 1450,
        rake: "LHB",
        pantryType: "Full Pantry",
        tatkalAvailable: true,
        tatkalOpeningTime: "10:00",
        liveTrackingEnabled: true
      });
      
      // Add train stops
      await this.createTrainStop({
        trainId: rajdhaniExpress.id,
        stationId: ndls.id,
        departureTime: "16:00",
        arrivalTime: null,
        dayCount: 0,
        haltTime: "10 min",
        distance: 0
      });
      
      await this.createTrainStop({
        trainId: rajdhaniExpress.id,
        stationId: cstm.id,
        departureTime: "22:30",
        arrivalTime: "22:15",
        dayCount: 0,
        haltTime: "15 min",
        distance: 400
      });
      
      await this.createTrainStop({
        trainId: rajdhaniExpress.id,
        stationId: hwh.id,
        departureTime: null,
        arrivalTime: "10:00",
        dayCount: 1,
        haltTime: null,
        distance: 1450
      });
      
      // Add train classes
      await this.createTrainClass({
        trainId: rajdhaniExpress.id,
        classCode: "1A",
        className: "AC First Class",
        fare: 2500,
        totalSeats: 48,
        availableSeats: 35
      });
      
      await this.createTrainClass({
        trainId: rajdhaniExpress.id,
        classCode: "2A",
        className: "AC 2-Tier",
        fare: 1500,
        totalSeats: 72,
        availableSeats: 50
      });
      
      await this.createTrainClass({
        trainId: rajdhaniExpress.id,
        classCode: "3A",
        className: "AC 3-Tier",
        fare: 1050,
        totalSeats: 128,
        availableSeats: 80
      });
      
      // Add live train location for Rajdhani Express
      await this.createTrainLocation({
        trainId: rajdhaniExpress.id,
        currentStationId: ndls.id,
        nextStationId: cstm.id,
        status: "departed",
        delay: 0,
        latitude: "28.6448",
        longitude: "77.2126",
        speed: 85
      });
      
      console.log("Database initialization completed successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0];
  }
  
  async updateUserPassword(id: number, hashedPassword: string): Promise<boolean> {
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  async updateStripeCustomerId(id: number, customerId: string): Promise<User> {
    // Since the schema might not be updated yet, we're using a more generic approach
    const result = await db.execute(
      sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${id} RETURNING *`
    );
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0] as User;
  }
  
  async updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    // Using raw SQL to avoid type issues
    const result = await db.execute(
      sql`UPDATE users 
          SET stripe_customer_id = ${stripeInfo.customerId}, 
              stripe_subscription_id = ${stripeInfo.subscriptionId} 
          WHERE id = ${id} 
          RETURNING *`
    );
    
    if (!result[0]) {
      throw new Error("User not found");
    }
    
    return result[0] as User;
  }
  
  async getStations(): Promise<Station[]> {
    return await db.select().from(stations);
  }
  
  async getStationByCode(code: string): Promise<Station | undefined> {
    const result = await db.select().from(stations).where(eq(stations.code, code));
    return result[0];
  }
  
  async createStation(station: InsertStation): Promise<Station> {
    const result = await db.insert(stations).values(station).returning();
    return result[0];
  }
  
  async getTrains(): Promise<Train[]> {
    return await db.select().from(trains);
  }
  
  async getTrainById(id: number): Promise<Train | undefined> {
    const result = await db.select().from(trains).where(eq(trains.id, id));
    return result[0];
  }
  
  async getTrainByNumber(number: string): Promise<Train | undefined> {
    const result = await db.select().from(trains).where(eq(trains.number, number));
    return result[0];
  }
  
  async createTrain(train: InsertTrain): Promise<Train> {
    const result = await db.insert(trains).values(train).returning();
    return result[0];
  }
  
  async searchTrains(params: SearchTrainParams): Promise<any[]> {
    const { fromStation, toStation, journeyDate, travelClass } = params;
    
    // Get all trains
    const allTrains = await this.getTrains();
    
    // For each train, check if it has stops that match the from and to stations
    const results = [];
    
    for (const train of allTrains) {
      const stops = await this.getTrainStops(train.id);
      
      // Check if this train has stops at both the from and to stations
      const fromStationStop = stops.find(stop => stop.stationId.toString() === fromStation);
      const toStationStop = stops.find(stop => stop.stationId.toString() === toStation);
      
      // If the train has both stops, and the fromStation comes before the toStation
      if (fromStationStop && toStationStop && 
          ((fromStationStop.dayCount !== null && toStationStop.dayCount !== null && fromStationStop.dayCount < toStationStop.dayCount) || 
           (fromStationStop.dayCount !== null && toStationStop.dayCount !== null && fromStationStop.dayCount === toStationStop.dayCount && 
            fromStationStop.departureTime && toStationStop.arrivalTime && 
            fromStationStop.departureTime < toStationStop.arrivalTime))) {
        
        // Get the classes for this train
        const classes = await this.getTrainClasses(train.id);
        
        // Filter classes if travelClass is specified
        const filteredClasses = travelClass 
          ? classes.filter(c => c.classCode === travelClass)
          : classes;
        
        if (filteredClasses.length > 0) {
          // Get the station details
          const fromStationDetails = await this.getStation(parseInt(fromStation));
          const toStationDetails = await this.getStation(parseInt(toStation));
          
          results.push({
            ...train,
            classes: filteredClasses,
            fromStation: fromStationDetails,
            toStation: toStationDetails,
            departureTime: fromStationStop.departureTime,
            arrivalTime: toStationStop.arrivalTime,
            fromStationStop,
            toStationStop
          });
        }
      }
    }
    
    return results;
  }
  
  private async getStation(stationId: number): Promise<Station | undefined> {
    const result = await db.select().from(stations).where(eq(stations.id, stationId));
    return result[0];
  }
  
  async getTrainStops(trainId: number): Promise<TrainStop[]> {
    return await db.select()
      .from(trainStops)
      .where(eq(trainStops.trainId, trainId));
  }
  
  async createTrainStop(trainStop: InsertTrainStop): Promise<TrainStop> {
    const result = await db.insert(trainStops).values(trainStop).returning();
    return result[0];
  }
  
  async getTrainClasses(trainId: number): Promise<TrainClass[]> {
    return await db.select()
      .from(trainClasses)
      .where(eq(trainClasses.trainId, trainId));
  }
  
  async createTrainClass(trainClass: InsertTrainClass): Promise<TrainClass> {
    const result = await db.insert(trainClasses).values(trainClass).returning();
    return result[0];
  }
  
  async getBookings(userId: number): Promise<Booking[]> {
    return await db.select()
      .from(bookings)
      .where(eq(bookings.userId, userId));
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    return result[0];
  }
  
  async getBookingByPnr(pnr: string): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.pnr, pnr));
    return result[0];
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }
  
  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    
    return result[0];
  }
  
  async getPassengers(bookingId: number): Promise<Passenger[]> {
    return await db.select()
      .from(passengers)
      .where(eq(passengers.bookingId, bookingId));
  }
  
  async createPassenger(passenger: InsertPassenger): Promise<Passenger> {
    const result = await db.insert(passengers).values(passenger).returning();
    return result[0];
  }
  
  async getChatbotResponse(message: string): Promise<string> {
    return getChatbotResponse(message);
  }
  
  async getTrainLocation(trainId: number): Promise<TrainLocation | undefined> {
    const result = await db.select()
      .from(trainLocations)
      .where(eq(trainLocations.trainId, trainId));
    
    return result[0];
  }
  
  async createTrainLocation(location: InsertTrainLocation): Promise<TrainLocation> {
    const result = await db.insert(trainLocations).values(location).returning();
    return result[0];
  }
  
  async updateTrainLocation(trainId: number, location: Partial<InsertTrainLocation>): Promise<TrainLocation | undefined> {
    const result = await db.update(trainLocations)
      .set(location)
      .where(eq(trainLocations.trainId, trainId))
      .returning();
    
    return result[0];
  }
  
  async getPaymentReminders(bookingId: number): Promise<PaymentReminder | undefined> {
    const result = await db.select()
      .from(paymentReminders)
      .where(eq(paymentReminders.bookingId, bookingId));
    
    return result[0];
  }
  
  async createPaymentReminder(reminder: InsertPaymentReminder): Promise<PaymentReminder> {
    const result = await db.insert(paymentReminders).values(reminder).returning();
    return result[0];
  }
  
  async updatePaymentReminder(id: number, reminder: Partial<InsertPaymentReminder>): Promise<PaymentReminder | undefined> {
    const result = await db.update(paymentReminders)
      .set(reminder)
      .where(eq(paymentReminders.id, id))
      .returning();
    
    return result[0];
  }
  
  async getScheduledBookings(userId: number): Promise<ScheduledBooking[]> {
    return await db.select()
      .from(scheduledBookings)
      .where(eq(scheduledBookings.userId, userId));
  }
  
  async getScheduledBookingById(id: number): Promise<ScheduledBooking | undefined> {
    const result = await db.select()
      .from(scheduledBookings)
      .where(eq(scheduledBookings.id, id));
    
    return result[0];
  }
  
  async getScheduledBookingsDue(): Promise<ScheduledBooking[]> {
    const now = new Date();
    return await db.select()
      .from(scheduledBookings)
      .where(
        and(
          eq(scheduledBookings.status, "pending"),
          gte(scheduledBookings.scheduledAt, now)
        )
      );
  }
  
  async createScheduledBooking(booking: InsertScheduledBooking): Promise<ScheduledBooking> {
    const result = await db.insert(scheduledBookings).values(booking).returning();
    return result[0];
  }
  
  async updateScheduledBooking(id: number, booking: Partial<InsertScheduledBooking>): Promise<ScheduledBooking | undefined> {
    const result = await db.update(scheduledBookings)
      .set(booking)
      .where(eq(scheduledBookings.id, id))
      .returning();
    
    return result[0];
  }
  
  async getTicketTransfers(userId: number): Promise<TicketTransfer[]> {
    return await db.select()
      .from(ticketTransfers)
      .where(eq(ticketTransfers.senderId, userId));
  }
  
  async createTicketTransfer(transferData: InsertTicketTransfer): Promise<TicketTransfer> {
    const result = await db.insert(ticketTransfers).values(transferData).returning();
    return result[0];
  }
  
  async updateTicketTransfer(id: number, transferData: Partial<InsertTicketTransfer>): Promise<TicketTransfer | undefined> {
    const result = await db.update(ticketTransfers)
      .set(transferData)
      .where(eq(ticketTransfers.id, id))
      .returning();
    
    return result[0];
  }
}