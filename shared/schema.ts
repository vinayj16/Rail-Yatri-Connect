import { z } from "zod";
import mongoose from "mongoose";

// Chatbot schema
export const chatbotSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export type ChatbotMessage = z.infer<typeof chatbotSchema>;

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  role: { type: String, default: "user" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  phoneNumber: { type: String },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  phoneNumber: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

// Station schema
const stationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
}, { timestamps: true });

export const Station = mongoose.model('Station', stationSchema);

export const insertStationSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
});

// Train schema
const trainSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sourceStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  destinationStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  runDays: { type: String, required: true },
  trainType: { type: String, required: true },
  hasWifi: { type: Boolean, default: false },
  hasPantry: { type: Boolean, default: false },
  hasChargingPoint: { type: Boolean, default: false },
  hasBedroll: { type: Boolean, default: false },
  avgSpeed: { type: Number, default: 60 },
  distance: { type: Number, default: 0 },
  rake: { type: String, default: "LHB" },
  pantryType: { type: String },
  tatkalAvailable: { type: Boolean, default: true },
  tatkalOpeningTime: { type: String, default: "10:00" },
  liveTrackingEnabled: { type: Boolean, default: false },
}, { timestamps: true });

export const Train = mongoose.model('Train', trainSchema);

export const insertTrainSchema = z.object({
  number: z.string().min(1),
  name: z.string().min(1),
  sourceStationId: z.string().min(1),
  destinationStationId: z.string().min(1),
  departureTime: z.string().min(1),
  arrivalTime: z.string().min(1),
  duration: z.string().min(1),
  runDays: z.string().min(1),
  trainType: z.string().min(1),
  hasWifi: z.boolean().optional(),
  hasPantry: z.boolean().optional(),
  hasChargingPoint: z.boolean().optional(),
  hasBedroll: z.boolean().optional(),
  avgSpeed: z.number().optional(),
  distance: z.number().optional(),
  rake: z.string().optional(),
  pantryType: z.string().optional(),
  tatkalAvailable: z.boolean().optional(),
  tatkalOpeningTime: z.string().optional(),
  liveTrackingEnabled: z.boolean().optional(),
});

// TrainStop schema
const trainStopSchema = new mongoose.Schema({
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  arrivalTime: { type: String },
  departureTime: { type: String },
  dayCount: { type: Number, default: 0 },
  haltTime: { type: String },
  distance: { type: Number, default: 0 },
}, { timestamps: true });

export const TrainStop = mongoose.model('TrainStop', trainStopSchema);

export const insertTrainStopSchema = z.object({
  trainId: z.string().min(1),
  stationId: z.string().min(1),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
  dayCount: z.number().optional(),
  haltTime: z.string().optional(),
  distance: z.number().optional(),
});

// TrainClass schema
const trainClassSchema = new mongoose.Schema({
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  classCode: { type: String, required: true },
  className: { type: String, required: true },
  fare: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
}, { timestamps: true });

export const TrainClass = mongoose.model('TrainClass', trainClassSchema);

export const insertTrainClassSchema = z.object({
  trainId: z.string().min(1),
  classCode: z.string().min(1),
  className: z.string().min(1),
  fare: z.number().min(0),
  totalSeats: z.number().min(0),
  availableSeats: z.number(),
});

// Booking schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  journeyDate: { type: String, required: true },
  pnr: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  classCode: { type: String, required: true },
  totalFare: { type: Number, required: true },
  bookingType: { type: String, default: "general" },
  paymentStatus: { type: String, default: "pending" },
  paymentId: { type: String },
  paymentDueDate: { type: Date },
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);

export const insertBookingSchema = z.object({
  userId: z.string().min(1),
  trainId: z.string().min(1),
  journeyDate: z.string().min(1),
  pnr: z.string().min(1),
  status: z.string().min(1),
  classCode: z.string().min(1),
  totalFare: z.number().min(0),
  bookingType: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentId: z.string().optional(),
  paymentDueDate: z.date().optional(),
});

// Passenger schema
const passengerSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  berthPreference: { type: String },
  seatNumber: { type: String },
  status: { type: String, default: "Confirmed" },
}, { timestamps: true });

export const Passenger = mongoose.model('Passenger', passengerSchema);

export const insertPassengerSchema = z.object({
  bookingId: z.string().min(1),
  name: z.string().min(1),
  age: z.number().min(1).max(120),
  gender: z.string().min(1),
  berthPreference: z.string().optional(),
  seatNumber: z.string().optional(),
  status: z.string().optional(),
});

// TrainLocation schema
const trainLocationSchema = new mongoose.Schema({
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  currentStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  nextStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  status: { type: String, required: true },
  delay: { type: Number, default: 0 },
  latitude: { type: String },
  longitude: { type: String },
  speed: { type: Number },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const TrainLocation = mongoose.model('TrainLocation', trainLocationSchema);

export const insertTrainLocationSchema = z.object({
  trainId: z.string().min(1),
  currentStationId: z.string().min(1),
  nextStationId: z.string().min(1),
  status: z.string().min(1),
  delay: z.number().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  speed: z.number().optional(),
  updatedAt: z.date().optional(),
});

// PaymentReminder schema
const paymentReminderSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  reminderCount: { type: Number, default: 0 },
  lastSentAt: { type: Date },
  nextReminderAt: { type: Date },
  reminderType: { type: String, default: "SMS" },
  reminderStatus: { type: String, default: "pending" },
}, { timestamps: true });

export const PaymentReminder = mongoose.model('PaymentReminder', paymentReminderSchema);

export const insertPaymentReminderSchema = z.object({
  bookingId: z.string().min(1),
  reminderCount: z.number().optional(),
  lastSentAt: z.date().optional(),
  nextReminderAt: z.date().optional(),
  reminderType: z.string().optional(),
  reminderStatus: z.string().optional(),
});

// ScheduledBooking schema
const scheduledBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  journeyDate: { type: String, required: true },
  classCode: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, default: "pending" },
  passengerData: { type: [Object], required: true },
  bookingType: { type: String, default: "general" },
  paymentRemindersEnabled: { type: Boolean, default: false },
  reminderFrequency: { type: Number, default: 24 },
  maxReminders: { type: Number, default: 3 },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
}, { timestamps: true });

export const ScheduledBooking = mongoose.model('ScheduledBooking', scheduledBookingSchema);

export const insertScheduledBookingSchema = z.object({
  userId: z.string().min(1),
  trainId: z.string().min(1),
  journeyDate: z.string().min(1),
  classCode: z.string().min(1),
  scheduledAt: z.date(),
  status: z.string().optional(),
  passengerData: z.array(z.object({
    name: z.string().min(1),
    age: z.number().min(1).max(120),
    gender: z.string().min(1),
    berthPreference: z.string().optional(),
  })),
  bookingType: z.string().optional(),
  paymentRemindersEnabled: z.boolean().optional(),
  reminderFrequency: z.number().optional(),
  maxReminders: z.number().optional(),
  bookingId: z.string().optional(),
});

// TicketTransfer schema
const ticketTransferSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverEmail: { type: String, required: true },
  status: { type: String, default: "pending" },
  transferCode: { type: String, required: true, unique: true },
  message: { type: String },
  expiresAt: { type: Date, required: true },
  transferType: { type: String, required: true },
  passengerIds: { type: String },
  completedAt: { type: Date },
}, { timestamps: true });

export const TicketTransfer = mongoose.model('TicketTransfer', ticketTransferSchema);

export const insertTicketTransferSchema = z.object({
  bookingId: z.string().min(1),
  senderId: z.string().min(1),
  receiverEmail: z.string().email(),
  status: z.string().optional(),
  transferCode: z.string().min(1),
  message: z.string().optional(),
  expiresAt: z.date(),
  transferType: z.string().min(1),
  passengerIds: z.string().optional(),
  completedAt: z.date().optional(),
});

// Search schemas
export const searchTrainSchema = z.object({
  fromStation: z.string().min(1),
  toStation: z.string().min(1),
  journeyDate: z.string().min(1),
  travelClass: z.string().optional(),
});

export const pnrStatusSchema = z.object({
  pnrNumber: z.string().length(10, "PNR must be exactly 10 digits"),
});

export const tatkalBookingSchema = z.object({
  trainId: z.string().min(1),
  journeyDate: z.string().min(1),
  classCode: z.string().min(1),
  passengers: z.array(z.object({
    name: z.string().min(1),
    age: z.number().min(1).max(120),
    gender: z.string().min(1),
    berthPreference: z.string().optional(),
  })),
  totalFare: z.number().min(0),
});

export const scheduledBookingRequestSchema = z.object({
  trainId: z.string().min(1),
  journeyDate: z.string().min(1),
  classCode: z.string().min(1),
  scheduledAt: z.date(),
  passengers: z.array(z.object({
    name: z.string().min(1),
    age: z.number().min(1).max(120),
    gender: z.string().min(1),
    berthPreference: z.string().optional(),
  })),
  bookingType: z.string().optional(),
  paymentRemindersEnabled: z.boolean().optional(),
  reminderFrequency: z.number().optional(),
  maxReminders: z.number().optional(),
});

export const createTicketTransferSchema = z.object({
  bookingId: z.string().min(1),
  receiverEmail: z.string().email(),
  message: z.string().optional(),
  transferType: z.string().min(1),
  passengerIds: z.array(z.string()).optional(),
  expirationHours: z.number().min(1).max(168),
});

export const processTicketTransferSchema = z.object({
  transferCode: z.string().min(1),
  action: z.enum(["accept", "reject"]),
});

// Type exports
export type User = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  phoneNumber?: string;
};

export type InsertUser = z.infer<typeof insertUserSchema>;

export type Station = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  city: string;
};

export type InsertStation = z.infer<typeof insertStationSchema>;

export type Train = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  number: string;
  name: string;
  sourceStationId: mongoose.Types.ObjectId;
  destinationStationId: mongoose.Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runDays: string;
  trainType: string;
  hasWifi: boolean;
  hasPantry: boolean;
  hasChargingPoint: boolean;
  hasBedroll: boolean;
  avgSpeed: number;
  distance: number;
  rake: string;
  pantryType?: string;
  tatkalAvailable: boolean;
  tatkalOpeningTime: string;
  liveTrackingEnabled: boolean;
};

export type InsertTrain = z.infer<typeof insertTrainSchema>;

export type TrainStop = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  trainId: mongoose.Types.ObjectId;
  stationId: mongoose.Types.ObjectId;
  arrivalTime?: string;
  departureTime?: string;
  dayCount: number;
  haltTime?: string;
  distance: number;
};

export type InsertTrainStop = z.infer<typeof insertTrainStopSchema>;

export type TrainClass = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  trainId: mongoose.Types.ObjectId;
  classCode: string;
  className: string;
  fare: number;
  totalSeats: number;
  availableSeats: number;
};

export type InsertTrainClass = z.infer<typeof insertTrainClassSchema>;

export type Booking = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  trainId: mongoose.Types.ObjectId;
  journeyDate: string;
  pnr: string;
  status: string;
  classCode: string;
  totalFare: number;
  bookingType: string;
  paymentStatus: string;
  paymentId?: string;
  paymentDueDate?: Date;
  createdAt: Date;
};

export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Passenger = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  gender: string;
  berthPreference?: string;
  seatNumber?: string;
  status: string;
};

export type InsertPassenger = z.infer<typeof insertPassengerSchema>;

export type SearchTrainParams = z.infer<typeof searchTrainSchema>;

export type PnrStatusParams = z.infer<typeof pnrStatusSchema>;

export type TrainLocation = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  trainId: mongoose.Types.ObjectId;
  currentStationId: mongoose.Types.ObjectId;
  nextStationId: mongoose.Types.ObjectId;
  status: string;
  delay: number;
  latitude?: string;
  longitude?: string;
  speed?: number;
  updatedAt: Date;
};

export type InsertTrainLocation = z.infer<typeof insertTrainLocationSchema>;

export type ScheduledBooking = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  trainId: mongoose.Types.ObjectId;
  journeyDate: string;
  classCode: string;
  scheduledAt: Date;
  status: string;
  passengerData: any[];
  bookingType: string;
  paymentRemindersEnabled: boolean;
  reminderFrequency: number;
  maxReminders: number;
  bookingId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertScheduledBooking = z.infer<typeof insertScheduledBookingSchema>;

export type PaymentReminder = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  reminderCount: number;
  lastSentAt?: Date;
  nextReminderAt?: Date;
  reminderType: string;
  reminderStatus: string;
};

export type InsertPaymentReminder = z.infer<typeof insertPaymentReminderSchema>;

export type TicketTransfer = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverEmail: string;
  status: string;
  transferCode: string;
  message?: string;
  expiresAt: Date;
  transferType: string;
  passengerIds?: string;
  completedAt?: Date;
};

export type InsertTicketTransfer = z.infer<typeof insertTicketTransferSchema>;
