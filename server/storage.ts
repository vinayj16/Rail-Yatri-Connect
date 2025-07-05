import { 
  users, type User, type InsertUser,
  stations, type Station, type InsertStation, 
  trains, type Train, type InsertTrain,
  trainStops, type TrainStop, type InsertTrainStop,
  trainClasses, type TrainClass, type InsertTrainClass,
  bookings, type Booking, type InsertBooking,
  passengers, type Passenger, type InsertPassenger,
  trainLocations, type TrainLocation, type InsertTrainLocation,
  paymentReminders, type PaymentReminder, type InsertPaymentReminder,
  scheduledBookings, type ScheduledBooking, type InsertScheduledBooking,
  type SearchTrainParams
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define the storage interface
export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<boolean>;
  updateStripeCustomerId(id: number, customerId: string): Promise<User>;
  updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;

  // Station methods
  getStations(): Promise<Station[]>;
  getStationByCode(code: string): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;

  // Train methods
  getTrains(): Promise<Train[]>;
  getTrainById(id: number): Promise<Train | undefined>;
  getTrainByNumber(number: string): Promise<Train | undefined>;
  createTrain(train: InsertTrain): Promise<Train>;
  searchTrains(params: SearchTrainParams): Promise<any[]>;

  // Train Stop methods
  getTrainStops(trainId: number): Promise<TrainStop[]>;
  createTrainStop(trainStop: InsertTrainStop): Promise<TrainStop>;

  // Train Class methods
  getTrainClasses(trainId: number): Promise<TrainClass[]>;
  createTrainClass(trainClass: InsertTrainClass): Promise<TrainClass>;

  // Booking methods
  getBookings(userId: number): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByPnr(pnr: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined>;

  // Chatbot methods
  getChatbotResponse(message: string): Promise<string>;

  // Passenger methods
  getPassengers(bookingId: number): Promise<Passenger[]>;
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;
  
  // Train Location methods
  getTrainLocation(trainId: number): Promise<TrainLocation | undefined>;
  createTrainLocation(location: InsertTrainLocation): Promise<TrainLocation>;
  updateTrainLocation(trainId: number, location: Partial<InsertTrainLocation>): Promise<TrainLocation | undefined>;
  
  // Payment Reminder methods
  getPaymentReminders(bookingId: number): Promise<PaymentReminder | undefined>;
  createPaymentReminder(reminder: InsertPaymentReminder): Promise<PaymentReminder>;
  updatePaymentReminder(id: number, reminder: Partial<InsertPaymentReminder>): Promise<PaymentReminder | undefined>;
  
  // Scheduled Booking methods
  getScheduledBookings(userId: number): Promise<ScheduledBooking[]>;
  getScheduledBookingById(id: number): Promise<ScheduledBooking | undefined>;
  getScheduledBookingsDue(): Promise<ScheduledBooking[]>;
  createScheduledBooking(booking: InsertScheduledBooking): Promise<ScheduledBooking>;
  updateScheduledBooking(id: number, booking: Partial<InsertScheduledBooking>): Promise<ScheduledBooking | undefined>;
  
  // Ticket Transfer methods
  getTicketTransfers(userId: number): Promise<any[]>;
  createTicketTransfer(transferData: any): Promise<any>;
  updateTicketTransfer(id: number, transferData: any): Promise<any>;
}

export class MemStorage implements IStorage {
  // In-memory data stores
  private users: Map<number, User>;
  private stations: Map<number, Station>;
  private trains: Map<number, Train>;
  private trainStops: Map<number, TrainStop>;
  private trainClasses: Map<number, TrainClass>;
  private bookings: Map<number, Booking>;
  private passengers: Map<number, Passenger>;
  private trainLocations: Map<number, TrainLocation>;
  private paymentReminders: Map<number, PaymentReminder>;
  private scheduledBookings: Map<number, ScheduledBooking>;
  
  // Session store
  sessionStore: session.Store;

  // Current IDs for auto-increment
  private userIdCounter: number;
  private stationIdCounter: number;
  private trainIdCounter: number;
  private trainStopIdCounter: number;
  private trainClassIdCounter: number;
  private bookingIdCounter: number;
  private passengerIdCounter: number;
  private trainLocationIdCounter: number;
  private paymentReminderIdCounter: number;
  private scheduledBookingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.stations = new Map();
    this.trains = new Map();
    this.trainStops = new Map();
    this.trainClasses = new Map();
    this.bookings = new Map();
    this.passengers = new Map();
    this.trainLocations = new Map();
    this.paymentReminders = new Map();
    this.scheduledBookings = new Map();

    this.userIdCounter = 1;
    this.stationIdCounter = 1;
    this.trainIdCounter = 1;
    this.trainStopIdCounter = 1;
    this.trainClassIdCounter = 1;
    this.bookingIdCounter = 1;
    this.passengerIdCounter = 1;
    this.trainLocationIdCounter = 1;
    this.paymentReminderIdCounter = 1;
    this.scheduledBookingIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });

    // Initialize with some test data
    this.initializeTestData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
      role: user.role || 'user',
      phoneNumber: user.phoneNumber || null
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = await this.getUser(id);
    
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    // Prevent updating sensitive fields
    const { password, username, ...updatableFields } = userData;
    
    const updatedUser: User = {
      ...existingUser,
      ...updatableFields
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPassword(id: number, hashedPassword: string): Promise<boolean> {
    const existingUser = await this.getUser(id);
    
    if (!existingUser) {
      return false;
    }
    
    const updatedUser: User = {
      ...existingUser,
      password: hashedPassword
    };
    
    this.users.set(id, updatedUser);
    return true;
  }
  
  async updateStripeCustomerId(id: number, customerId: string): Promise<User> {
    const existingUser = await this.getUser(id);
    
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = {
      ...existingUser,
      stripeCustomerId: customerId
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    const existingUser = await this.getUser(id);
    
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = {
      ...existingUser,
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Station methods
  async getStations(): Promise<Station[]> {
    return Array.from(this.stations.values());
  }

  async getStationByCode(code: string): Promise<Station | undefined> {
    return Array.from(this.stations.values()).find(station => station.code === code);
  }

  async createStation(station: InsertStation): Promise<Station> {
    const id = this.stationIdCounter++;
    const newStation: Station = { ...station, id };
    this.stations.set(id, newStation);
    return newStation;
  }

  // Train methods
  async getTrains(): Promise<Train[]> {
    return Array.from(this.trains.values());
  }

  async getTrainById(id: number): Promise<Train | undefined> {
    return this.trains.get(id);
  }

  async getTrainByNumber(number: string): Promise<Train | undefined> {
    return Array.from(this.trains.values()).find(train => train.number === number);
  }

  async createTrain(train: InsertTrain): Promise<Train> {
    const id = this.trainIdCounter++;
    const newTrain: Train = { ...train, id };
    this.trains.set(id, newTrain);
    return newTrain;
  }

  async searchTrains(params: SearchTrainParams): Promise<any[]> {
    const { fromStation, toStation } = params;
    
    // Get station IDs from codes
    const fromStationObj = await this.getStationByCode(fromStation);
    const toStationObj = await this.getStationByCode(toStation);
    
    if (!fromStationObj || !toStationObj) {
      return [];
    }

    // Find trains that match the route
    const matchingTrains = Array.from(this.trains.values()).filter(train => 
      train.sourceStationId === fromStationObj.id && 
      train.destinationStationId === toStationObj.id
    );

    // For each train, get its classes and return a combined result
    const results = await Promise.all(
      matchingTrains.map(async (train) => {
        const classes = await this.getTrainClasses(train.id);
        const stops = await this.getTrainStops(train.id);
        
        const sourceStation = this.stations.get(train.sourceStationId);
        const destinationStation = this.stations.get(train.destinationStationId);
        
        return {
          ...train,
          sourceStation,
          destinationStation,
          classes,
          stops
        };
      })
    );

    return results;
  }

  // Train Stop methods
  async getTrainStops(trainId: number): Promise<TrainStop[]> {
    return Array.from(this.trainStops.values()).filter(stop => stop.trainId === trainId);
  }

  async createTrainStop(trainStop: InsertTrainStop): Promise<TrainStop> {
    const id = this.trainStopIdCounter++;
    const newTrainStop: TrainStop = { ...trainStop, id };
    this.trainStops.set(id, newTrainStop);
    return newTrainStop;
  }

  // Train Class methods
  async getTrainClasses(trainId: number): Promise<TrainClass[]> {
    return Array.from(this.trainClasses.values()).filter(cls => cls.trainId === trainId);
  }

  async createTrainClass(trainClass: InsertTrainClass): Promise<TrainClass> {
    const id = this.trainClassIdCounter++;
    const newTrainClass: TrainClass = { ...trainClass, id };
    this.trainClasses.set(id, newTrainClass);
    return newTrainClass;
  }

  // Booking methods
  async getBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingByPnr(pnr: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(booking => booking.pnr === pnr);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt: new Date(),
      bookingType: booking.bookingType || null,
      paymentStatus: booking.paymentStatus || null,
      paymentId: booking.paymentId || null,
      paymentDueDate: booking.paymentDueDate || null
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const existingBooking = await this.getBooking(id);
    
    if (!existingBooking) {
      return undefined;
    }
    
    const updatedBooking: Booking = {
      ...existingBooking,
      ...bookingData
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Passenger methods
  async getPassengers(bookingId: number): Promise<Passenger[]> {
    return Array.from(this.passengers.values()).filter(passenger => passenger.bookingId === bookingId);
  }

  async createPassenger(passenger: InsertPassenger): Promise<Passenger> {
    const id = this.passengerIdCounter++;
    const newPassenger: Passenger = { ...passenger, id };
    this.passengers.set(id, newPassenger);
    return newPassenger;
  }

  async getChatbotResponse(message: string): Promise<string> {
    // Import the getChatbotResponse function from chatbot.ts
    const { getChatbotResponse } = await import('./chatbot');
    return getChatbotResponse(message);
  }
  
  // Train Location methods
  async getTrainLocation(trainId: number): Promise<TrainLocation | undefined> {
    return Array.from(this.trainLocations.values()).find(loc => loc.trainId === trainId);
  }
  
  async createTrainLocation(location: InsertTrainLocation): Promise<TrainLocation> {
    const id = this.trainLocationIdCounter++;
    const newLocation: TrainLocation = { 
      ...location, 
      id, 
      updatedAt: new Date() 
    };
    this.trainLocations.set(id, newLocation);
    return newLocation;
  }
  
  async updateTrainLocation(trainId: number, location: Partial<InsertTrainLocation>): Promise<TrainLocation | undefined> {
    const existingLocation = await this.getTrainLocation(trainId);
    
    if (!existingLocation) {
      return undefined;
    }
    
    const updatedLocation: TrainLocation = { 
      ...existingLocation, 
      ...location,
      updatedAt: new Date() 
    };
    
    this.trainLocations.set(existingLocation.id, updatedLocation);
    return updatedLocation;
  }
  
  // Payment Reminder methods
  async getPaymentReminders(bookingId: number): Promise<PaymentReminder | undefined> {
    return Array.from(this.paymentReminders.values()).find(reminder => reminder.bookingId === bookingId);
  }
  
  async createPaymentReminder(reminder: InsertPaymentReminder): Promise<PaymentReminder> {
    const id = this.paymentReminderIdCounter++;
    const newReminder: PaymentReminder = { ...reminder, id };
    this.paymentReminders.set(id, newReminder);
    return newReminder;
  }
  
  async updatePaymentReminder(id: number, reminder: Partial<InsertPaymentReminder>): Promise<PaymentReminder | undefined> {
    const existingReminder = this.paymentReminders.get(id);
    
    if (!existingReminder) {
      return undefined;
    }
    
    const updatedReminder: PaymentReminder = { 
      ...existingReminder, 
      ...reminder 
    };
    
    this.paymentReminders.set(id, updatedReminder);
    return updatedReminder;
  }

  // Initialize with some test data
  private async initializeTestData() {
    // Add stations
    const ndls = await this.createStation({ code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi' });
    const mmct = await this.createStation({ code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai' });
    const mtj = await this.createStation({ code: 'MTJ', name: 'Mathura Junction', city: 'Mathura' });
    const kota = await this.createStation({ code: 'KOTA', name: 'Kota Junction', city: 'Kota' });
    const brc = await this.createStation({ code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara' });
    const bdts = await this.createStation({ code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai' });
    const jat = await this.createStation({ code: 'JAT', name: 'Jammu Tawi', city: 'Jammu' });
    const hwh = await this.createStation({ code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' });
    const mas = await this.createStation({ code: 'MAS', name: 'Chennai Central', city: 'Chennai' });
    const pnbe = await this.createStation({ code: 'PNBE', name: 'Patna Junction', city: 'Patna' });
    
    // Add trains
    // Rajdhani Express
    const rajdhani = await this.createTrain({
      number: '12951',
      name: 'Rajdhani Express',
      sourceStationId: ndls.id,
      destinationStationId: mmct.id,
      departureTime: '16:25',
      arrivalTime: '09:45',
      duration: '17h 20m',
      runDays: 'M T W T F S S',
      trainType: 'Rajdhani',
      hasWifi: true,
      hasPantry: true,
      hasChargingPoint: true,
      hasBedroll: true
    });

    // Add train stops for Rajdhani
    await this.createTrainStop({ trainId: rajdhani.id, stationId: ndls.id, departureTime: '16:25', dayCount: 0, distance: 0 });
    await this.createTrainStop({ trainId: rajdhani.id, stationId: mtj.id, arrivalTime: '18:10', departureTime: '18:15', dayCount: 0, haltTime: '5m', distance: 150 });
    await this.createTrainStop({ trainId: rajdhani.id, stationId: kota.id, arrivalTime: '22:30', departureTime: '22:35', dayCount: 0, haltTime: '5m', distance: 450 });
    await this.createTrainStop({ trainId: rajdhani.id, stationId: brc.id, arrivalTime: '05:15', departureTime: '05:20', dayCount: 1, haltTime: '5m', distance: 650 });
    await this.createTrainStop({ trainId: rajdhani.id, stationId: mmct.id, arrivalTime: '09:45', dayCount: 1, distance: 1384 });

    // Add train classes for Rajdhani
    await this.createTrainClass({ 
      trainId: rajdhani.id, 
      classCode: '3A', 
      className: 'AC 3 Tier', 
      fare: 2475, 
      totalSeats: 72, 
      availableSeats: 42 
    });
    await this.createTrainClass({ 
      trainId: rajdhani.id, 
      classCode: '2A', 
      className: 'AC 2 Tier', 
      fare: 3350, 
      totalSeats: 48, 
      availableSeats: 12 
    });
    await this.createTrainClass({ 
      trainId: rajdhani.id, 
      classCode: '1A', 
      className: 'AC First Class', 
      fare: 5600, 
      totalSeats: 24, 
      availableSeats: 4 
    });
    await this.createTrainClass({ 
      trainId: rajdhani.id, 
      classCode: 'SL', 
      className: 'Sleeper', 
      fare: 915, 
      totalSeats: 72, 
      availableSeats: -24 
    });

    // August Kranti Rajdhani Express
    const augustKranti = await this.createTrain({
      number: '12953',
      name: 'August Kranti Rajdhani',
      sourceStationId: ndls.id,
      destinationStationId: mmct.id,
      departureTime: '17:40',
      arrivalTime: '09:30',
      duration: '15h 50m',
      runDays: 'M W F',
      trainType: 'Rajdhani',
      hasWifi: true,
      hasPantry: true,
      hasChargingPoint: true,
      hasBedroll: true
    });

    // Add train classes for August Kranti
    await this.createTrainClass({ 
      trainId: augustKranti.id, 
      classCode: '3A', 
      className: 'AC 3 Tier', 
      fare: 2560, 
      totalSeats: 72, 
      availableSeats: 8 
    });
    await this.createTrainClass({ 
      trainId: augustKranti.id, 
      classCode: '2A', 
      className: 'AC 2 Tier', 
      fare: 3480, 
      totalSeats: 48, 
      availableSeats: 6 
    });
    await this.createTrainClass({ 
      trainId: augustKranti.id, 
      classCode: '1A', 
      className: 'AC First Class', 
      fare: 5880, 
      totalSeats: 24, 
      availableSeats: 2 
    });

    // Add more trains for different routes
    const duronto = await this.createTrain({
      number: '12223',
      name: 'Mumbai LTT - Ernakulam AC Duronto Express',
      sourceStationId: mmct.id,
      destinationStationId: mas.id,
      departureTime: '23:05',
      arrivalTime: '15:25',
      duration: '16h 20m',
      runDays: 'F',
      trainType: 'Duronto',
      hasWifi: false,
      hasPantry: true,
      hasChargingPoint: true,
      hasBedroll: true
    });

    const shatabdi = await this.createTrain({
      number: '12001',
      name: 'Shatabdi Express',
      sourceStationId: ndls.id,
      destinationStationId: hwh.id,
      departureTime: '06:00',
      arrivalTime: '13:45',
      duration: '7h 45m',
      runDays: 'M T W T F S S',
      trainType: 'Shatabdi',
      hasWifi: true,
      hasPantry: true,
      hasChargingPoint: true,
      hasBedroll: false,
      liveTrackingEnabled: true
    });
    
    // Add sample train location for tracking
    await this.createTrainLocation({
      trainId: rajdhani.id,
      currentStationId: kota.id,
      nextStationId: brc.id,
      latitude: "25.2138", 
      longitude: "75.8648",
      speed: 84,
      delay: 15,
      status: 'Running'
    });
    
    // Create a sample user for bookings
    const user = await this.createUser({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '9876543210'
    });
    
    // Create a sample booking
    const booking = await this.createBooking({
      userId: user.id,
      trainId: rajdhani.id,
      classCode: '3A',
      journeyDate: '2025-04-15',
      pnr: 'PNR1234567',
      totalFare: 2475,
      status: 'Confirmed',
      bookingType: 'Tatkal',
      paymentStatus: 'Pending',
      paymentId: 'PAY123456',
      paymentDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });
    
    // Add passenger to the booking
    await this.createPassenger({
      bookingId: booking.id,
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      status: 'Confirmed',
      berthPreference: 'Lower',
      seatNumber: 'B1-32'
    });
    
    // Create payment reminder for the booking
    await this.createPaymentReminder({
      bookingId: booking.id,
      reminderCount: 1,
      lastSentAt: new Date(),
      reminderType: 'SMS',
      reminderStatus: 'Sent',
      nextReminderAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now
    });
  }

  // Scheduled Booking methods
  async getScheduledBookings(userId: number): Promise<ScheduledBooking[]> {
    return Array.from(this.scheduledBookings.values()).filter(booking => booking.userId === userId);
  }

  async getScheduledBookingById(id: number): Promise<ScheduledBooking | undefined> {
    return this.scheduledBookings.get(id);
  }

  async getScheduledBookingsDue(): Promise<ScheduledBooking[]> {
    const now = new Date();
    return Array.from(this.scheduledBookings.values()).filter(booking => {
      return booking.status === 'pending' && booking.scheduledAt <= now;
    });
  }

  async createScheduledBooking(booking: InsertScheduledBooking): Promise<ScheduledBooking> {
    const id = this.scheduledBookingIdCounter++;
    const newBooking: ScheduledBooking = {
      ...booking,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending'
    };
    this.scheduledBookings.set(id, newBooking);
    return newBooking;
  }

  async updateScheduledBooking(id: number, booking: Partial<InsertScheduledBooking>): Promise<ScheduledBooking | undefined> {
    const existingBooking = this.scheduledBookings.get(id);
    
    if (!existingBooking) {
      return undefined;
    }
    
    const updatedBooking: ScheduledBooking = {
      ...existingBooking,
      ...booking,
      updatedAt: new Date()
    };
    
    this.scheduledBookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Ticket Transfer methods
  private ticketTransfers: Map<number, any> = new Map();
  private ticketTransferIdCounter: number = 1;
  
  async getTicketTransfers(userId: number): Promise<any[]> {
    return Array.from(this.ticketTransfers.values()).filter(transfer => 
      transfer.senderId === userId || transfer.recipientId === userId
    );
  }
  
  async createTicketTransfer(transferData: any): Promise<any> {
    const id = this.ticketTransferIdCounter++;
    const newTransfer = {
      ...transferData,
      id,
      status: transferData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.ticketTransfers.set(id, newTransfer);
    return newTransfer;
  }
  
  async updateTicketTransfer(id: number, transferData: any): Promise<any> {
    const existingTransfer = this.ticketTransfers.get(id);
    
    if (!existingTransfer) {
      return undefined;
    }
    
    const updatedTransfer = {
      ...existingTransfer,
      ...transferData,
      updatedAt: new Date()
    };
    
    this.ticketTransfers.set(id, updatedTransfer);
    return updatedTransfer;
  }
}

// Initialize storage with MemStorage
const storage: IStorage = new MemStorage();

// Export the storage instance
export { storage };
