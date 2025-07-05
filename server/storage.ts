import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { 
  User, InsertUser, Station, InsertStation, 
  Train, InsertTrain, TrainStop, InsertTrainStop,
  TrainClass, InsertTrainClass, Booking, InsertBooking,
  Passenger, InsertPassenger, TrainLocation, InsertTrainLocation,
  PaymentReminder, InsertPaymentReminder, ScheduledBooking, InsertScheduledBooking,
  SearchTrainParams, TicketTransfer, InsertTicketTransfer,
  User as UserModel, Station as StationModel, Train as TrainModel, 
  TrainStop as TrainStopModel, TrainClass as TrainClassModel, 
  Booking as BookingModel, Passenger as PassengerModel, 
  TrainLocation as TrainLocationModel, PaymentReminder as PaymentReminderModel, 
  ScheduledBooking as ScheduledBookingModel, TicketTransfer as TicketTransferModel
} from "@shared/schema";

import { getChatbotResponse } from "./chatbot";
import { mongoose } from "./db";
import MongoStore from "connect-mongo";

// Helper function to convert Mongoose document to our type
function convertMongooseDoc<T>(doc: any): T | undefined {
  if (!doc) return undefined;
  
  // Convert the document to a plain object and handle null values
  const obj = doc.toObject();
  
  // Convert null values to undefined for optional fields
  Object.keys(obj).forEach(key => {
    if (obj[key] === null) {
      obj[key] = undefined;
    }
  });
  
  return obj as T;
}

export interface IStorage {
  sessionStore: any;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<InsertUser>): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string): Promise<boolean>;
  updateStripeCustomerId(id: string, customerId: string): Promise<User>;
  updateUserStripeInfo(id: string, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;

  // Station methods
  getStations(): Promise<Station[]>;
  getStationByCode(code: string): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;

  // Train methods
  getTrains(): Promise<Train[]>;
  getTrainById(id: string): Promise<Train | undefined>;
  getTrainByNumber(number: string): Promise<Train | undefined>;
  createTrain(train: InsertTrain): Promise<Train>;
  searchTrains(params: SearchTrainParams): Promise<any[]>;

  // TrainStop methods
  getTrainStops(trainId: string): Promise<TrainStop[]>;
  createTrainStop(trainStop: InsertTrainStop): Promise<TrainStop>;

  // TrainClass methods
  getTrainClasses(trainId: string): Promise<TrainClass[]>;
  createTrainClass(trainClass: InsertTrainClass): Promise<TrainClass>;

  // Booking methods
  getBookings(userId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByPnr(pnr: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, bookingData: Partial<InsertBooking>): Promise<Booking | undefined>;

  // Passenger methods
  getPassengers(bookingId: string): Promise<Passenger[]>;
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;
  
  // Chatbot methods
  getChatbotResponse(message: string): Promise<string>;

  // TrainLocation methods
  getTrainLocation(trainId: string): Promise<TrainLocation | undefined>;
  createTrainLocation(location: InsertTrainLocation): Promise<TrainLocation>;
  updateTrainLocation(trainId: string, location: Partial<InsertTrainLocation>): Promise<TrainLocation | undefined>;
  
  // PaymentReminder methods
  getPaymentReminders(bookingId: string): Promise<PaymentReminder | undefined>;
  createPaymentReminder(reminder: InsertPaymentReminder): Promise<PaymentReminder>;
  updatePaymentReminder(id: string, reminder: Partial<InsertPaymentReminder>): Promise<PaymentReminder | undefined>;
  
  // ScheduledBooking methods
  getScheduledBookings(userId: string): Promise<ScheduledBooking[]>;
  getScheduledBookingById(id: string): Promise<ScheduledBooking | undefined>;
  getScheduledBookingsDue(): Promise<ScheduledBooking[]>;
  createScheduledBooking(booking: InsertScheduledBooking): Promise<ScheduledBooking>;
  updateScheduledBooking(id: string, booking: Partial<InsertScheduledBooking>): Promise<ScheduledBooking | undefined>;
  
  // Ticket Transfer methods
  getTicketTransfers(userId: string): Promise<TicketTransfer[]>;
  createTicketTransfer(transferData: InsertTicketTransfer): Promise<TicketTransfer>;
  updateTicketTransfer(id: string, transferData: Partial<InsertTicketTransfer>): Promise<TicketTransfer | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable is not set!");
      console.error("Please create a .env file with your MongoDB connection string:");
      console.error("MONGODB_URI=mongodb://localhost:27017/irctc_booking");
      console.error("Or for MongoDB Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/irctc_booking");
      throw new Error("MONGODB_URI environment variable is not set");
    }
    
    // Set up session store
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions"
    });
    
    // Initialize the database with test data if needed
    this.initializeDatabase();
  }
  
  private async initializeDatabase() {
    try {
      // Check if we need to initialize data by checking if stations table has data
      const stationsCount = await StationModel.countDocuments();
      if (stationsCount > 0) {
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
        sourceStationId: ndls._id.toString(),
        destinationStationId: hwh._id.toString(),
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
        trainId: rajdhaniExpress._id.toString(),
        stationId: ndls._id.toString(),
        departureTime: "16:00",
        arrivalTime: undefined,
        dayCount: 0,
        haltTime: "10 min",
        distance: 0
      });
      
      await this.createTrainStop({
        trainId: rajdhaniExpress._id.toString(),
        stationId: cstm._id.toString(),
        departureTime: "22:30",
        arrivalTime: "22:15",
        dayCount: 0,
        haltTime: "15 min",
        distance: 400
      });
      
      await this.createTrainStop({
        trainId: rajdhaniExpress._id.toString(),
        stationId: hwh._id.toString(),
        departureTime: undefined,
        arrivalTime: "10:00",
        dayCount: 1,
        haltTime: undefined,
        distance: 1450
      });
      
      // Add train classes
      await this.createTrainClass({
        trainId: rajdhaniExpress._id.toString(),
        classCode: "1A",
        className: "AC First Class",
        fare: 2500,
        totalSeats: 48,
        availableSeats: 35
      });
      
      await this.createTrainClass({
        trainId: rajdhaniExpress._id.toString(),
        classCode: "2A",
        className: "AC 2-Tier",
        fare: 1500,
        totalSeats: 72,
        availableSeats: 50
      });
      
      await this.createTrainClass({
        trainId: rajdhaniExpress._id.toString(),
        classCode: "3A",
        className: "AC 3-Tier",
        fare: 1050,
        totalSeats: 128,
        availableSeats: 80
      });
      
      // Add live train location for Rajdhani Express
      await this.createTrainLocation({
        trainId: rajdhaniExpress._id.toString(),
        currentStationId: ndls._id.toString(),
        nextStationId: cstm._id.toString(),
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
  
  async getUser(id: string): Promise<User | undefined> {
    const result = await UserModel.findById(id);
    return convertMongooseDoc<User>(result);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await UserModel.findOne({ username });
    return convertMongooseDoc<User>(result);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await UserModel.findOne({ email });
    return convertMongooseDoc<User>(result);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();
    return convertMongooseDoc<User>(savedUser)!;
  }
  
  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const result = await UserModel.findByIdAndUpdate(id, userData, { new: true });
    if (!result) {
      throw new Error("User not found");
    }
    return convertMongooseDoc<User>(result)!;
  }
  
  async updateUserPassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await UserModel.findByIdAndUpdate(id, { password: hashedPassword });
    return !!result;
  }
  
  async updateStripeCustomerId(id: string, customerId: string): Promise<User> {
    const result = await UserModel.findByIdAndUpdate(id, { stripeCustomerId: customerId }, { new: true });
    if (!result) {
      throw new Error("User not found");
    }
    return convertMongooseDoc<User>(result)!;
  }
  
  async updateUserStripeInfo(id: string, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    const result = await UserModel.findByIdAndUpdate(id, {
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId
    }, { new: true });
    
    if (!result) {
      throw new Error("User not found");
    }
    return convertMongooseDoc<User>(result)!;
  }
  
  async getStations(): Promise<Station[]> {
    const stations = await StationModel.find();
    return stations.map(station => convertMongooseDoc<Station>(station)!);
  }

  async getStationByCode(code: string): Promise<Station | undefined> {
    const result = await StationModel.findOne({ code });
    return convertMongooseDoc<Station>(result);
  }

  async createStation(station: InsertStation): Promise<Station> {
    const newStation = new StationModel(station);
    const savedStation = await newStation.save();
    return convertMongooseDoc<Station>(savedStation)!;
  }
  
  async getTrains(): Promise<Train[]> {
    const trains = await TrainModel.find();
    return trains.map(train => convertMongooseDoc<Train>(train)!);
  }

  async getTrainById(id: string): Promise<Train | undefined> {
    const result = await TrainModel.findById(id);
    return convertMongooseDoc<Train>(result);
  }

  async getTrainByNumber(number: string): Promise<Train | undefined> {
    const result = await TrainModel.findOne({ number });
    return convertMongooseDoc<Train>(result);
  }

  async createTrain(train: InsertTrain): Promise<Train> {
    const newTrain = new TrainModel(train);
    const savedTrain = await newTrain.save();
    return convertMongooseDoc<Train>(savedTrain)!;
  }

  async searchTrains(params: SearchTrainParams): Promise<any[]> {
    const { fromStation, toStation, journeyDate, travelClass } = params;
    
    // Get all trains
    const allTrains = await this.getTrains();
    
    // For each train, check if it has stops that match the from and to stations
    const results = [];
    
    for (const train of allTrains) {
      const stops = await this.getTrainStops(train._id.toString());
      
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
        const classes = await this.getTrainClasses(train._id.toString());
        
        // Filter classes if travelClass is specified
        const filteredClasses = travelClass 
          ? classes.filter(c => c.classCode === travelClass)
          : classes;
        
        if (filteredClasses.length > 0) {
          // Get the station details
          const fromStationDetails = await this.getStation(fromStation);
          const toStationDetails = await this.getStation(toStation);
          
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

  private async getStation(stationId: string): Promise<Station | undefined> {
    const result = await StationModel.findById(stationId);
    return convertMongooseDoc<Station>(result);
  }
  
  async getTrainStops(trainId: string): Promise<TrainStop[]> {
    const stops = await TrainStopModel.find({ trainId });
    return stops.map(stop => convertMongooseDoc<TrainStop>(stop)!);
  }

  async createTrainStop(trainStop: InsertTrainStop): Promise<TrainStop> {
    const newTrainStop = new TrainStopModel(trainStop);
    const savedStop = await newTrainStop.save();
    return convertMongooseDoc<TrainStop>(savedStop)!;
  }
  
  async getTrainClasses(trainId: string): Promise<TrainClass[]> {
    const classes = await TrainClassModel.find({ trainId });
    return classes.map(cls => convertMongooseDoc<TrainClass>(cls)!);
  }

  async createTrainClass(trainClass: InsertTrainClass): Promise<TrainClass> {
    const newTrainClass = new TrainClassModel(trainClass);
    const savedClass = await newTrainClass.save();
    return convertMongooseDoc<TrainClass>(savedClass)!;
  }
  
  async getBookings(userId: string): Promise<Booking[]> {
    const bookings = await BookingModel.find({ userId });
    return bookings.map(booking => convertMongooseDoc<Booking>(booking)!);
  }
  
  async getBooking(id: string): Promise<Booking | undefined> {
    const result = await BookingModel.findById(id);
    return convertMongooseDoc<Booking>(result);
  }

  async getBookingByPnr(pnr: string): Promise<Booking | undefined> {
    const result = await BookingModel.findOne({ pnr });
    return convertMongooseDoc<Booking>(result);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const newBooking = new BookingModel(booking);
    const savedBooking = await newBooking.save();
    return convertMongooseDoc<Booking>(savedBooking)!;
  }
  
  async updateBooking(id: string, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const result = await BookingModel.findByIdAndUpdate(id, bookingData, { new: true });
    return convertMongooseDoc<Booking>(result);
  }
  
  async getPassengers(bookingId: string): Promise<Passenger[]> {
    const passengers = await PassengerModel.find({ bookingId });
    return passengers.map(passenger => convertMongooseDoc<Passenger>(passenger)!);
  }

  async createPassenger(passenger: InsertPassenger): Promise<Passenger> {
    const newPassenger = new PassengerModel(passenger);
    const savedPassenger = await newPassenger.save();
    return convertMongooseDoc<Passenger>(savedPassenger)!;
  }

  async getChatbotResponse(message: string): Promise<string> {
    return getChatbotResponse(message);
  }
  
  async getTrainLocation(trainId: string): Promise<TrainLocation | undefined> {
    const result = await TrainLocationModel.findOne({ trainId });
    return convertMongooseDoc<TrainLocation>(result);
  }
  
  async createTrainLocation(location: InsertTrainLocation): Promise<TrainLocation> {
    const newLocation = new TrainLocationModel(location);
    const savedLocation = await newLocation.save();
    return convertMongooseDoc<TrainLocation>(savedLocation)!;
  }
  
  async updateTrainLocation(trainId: string, location: Partial<InsertTrainLocation>): Promise<TrainLocation | undefined> {
    const result = await TrainLocationModel.findOneAndUpdate({ trainId }, location, { new: true });
    return convertMongooseDoc<TrainLocation>(result);
  }
  
  async getPaymentReminders(bookingId: string): Promise<PaymentReminder | undefined> {
    const result = await PaymentReminderModel.findOne({ bookingId });
    return convertMongooseDoc<PaymentReminder>(result);
  }
  
  async createPaymentReminder(reminder: InsertPaymentReminder): Promise<PaymentReminder> {
    const newReminder = new PaymentReminderModel(reminder);
    const savedReminder = await newReminder.save();
    return convertMongooseDoc<PaymentReminder>(savedReminder)!;
  }
  
  async updatePaymentReminder(id: string, reminder: Partial<InsertPaymentReminder>): Promise<PaymentReminder | undefined> {
    const result = await PaymentReminderModel.findByIdAndUpdate(id, reminder, { new: true });
    return convertMongooseDoc<PaymentReminder>(result);
  }
  
  async getScheduledBookings(userId: string): Promise<ScheduledBooking[]> {
    const bookings = await ScheduledBookingModel.find({ userId });
    return bookings.map(booking => convertMongooseDoc<ScheduledBooking>(booking)!);
  }
  
  async getScheduledBookingById(id: string): Promise<ScheduledBooking | undefined> {
    const result = await ScheduledBookingModel.findById(id);
    return convertMongooseDoc<ScheduledBooking>(result);
  }

  async getScheduledBookingsDue(): Promise<ScheduledBooking[]> {
    const now = new Date();
    const bookings = await ScheduledBookingModel.find({
      status: "pending",
      scheduledAt: { $lte: now }
    });
    return bookings.map(booking => convertMongooseDoc<ScheduledBooking>(booking)!);
  }

  async createScheduledBooking(booking: InsertScheduledBooking): Promise<ScheduledBooking> {
    const newScheduledBooking = new ScheduledBookingModel(booking);
    const savedBooking = await newScheduledBooking.save();
    return convertMongooseDoc<ScheduledBooking>(savedBooking)!;
  }
  
  async updateScheduledBooking(id: string, booking: Partial<InsertScheduledBooking>): Promise<ScheduledBooking | undefined> {
    const result = await ScheduledBookingModel.findByIdAndUpdate(id, booking, { new: true });
    return convertMongooseDoc<ScheduledBooking>(result);
  }
  
  async getTicketTransfers(userId: string): Promise<TicketTransfer[]> {
    const transfers = await TicketTransferModel.find({ senderId: userId });
    return transfers.map(transfer => convertMongooseDoc<TicketTransfer>(transfer)!);
  }
  
  async createTicketTransfer(transferData: InsertTicketTransfer): Promise<TicketTransfer> {
    const newTransfer = new TicketTransferModel(transferData);
    const savedTransfer = await newTransfer.save();
    return convertMongooseDoc<TicketTransfer>(savedTransfer)!;
  }
  
  async updateTicketTransfer(id: string, transferData: Partial<InsertTicketTransfer>): Promise<TicketTransfer | undefined> {
    const result = await TicketTransferModel.findByIdAndUpdate(id, transferData, { new: true });
    return convertMongooseDoc<TicketTransfer>(result);
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();
