import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
// Chatbot schema
export const chatbotSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export type ChatbotMessage = z.infer<typeof chatbotSchema>;

import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  role: text("role").default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  phoneNumber: text("phone_number"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  phoneNumber: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

// Station schema
export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
});

export const insertStationSchema = createInsertSchema(stations).pick({
  code: true,
  name: true,
  city: true,
});

// Train schema
export const trainSchedules = pgTable("train_schedules", {
  id: serial("id").primaryKey(),
  trainId: integer("train_id").notNull(),
  departureStation: text("departure_station").notNull(),
  arrivalStation: text("arrival_station").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  fare: integer("fare").notNull(),
  availableSeats: integer("available_seats").notNull(),
  status: text("status").default("On Time"),
  platform: text("platform"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trains = pgTable("trains", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  name: text("name").notNull(),
  sourceStationId: integer("source_station_id").notNull(),
  destinationStationId: integer("destination_station_id").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  runDays: text("run_days").notNull(),
  trainType: text("train_type").notNull(),
  hasWifi: boolean("has_wifi").default(false),
  hasPantry: boolean("has_pantry").default(false),
  hasChargingPoint: boolean("has_charging_point").default(false),
  hasBedroll: boolean("has_bedroll").default(false),
  avgSpeed: integer("avg_speed").default(60), // Average speed in km/h
  distance: integer("distance").default(0), // Total distance in km
  rake: text("rake").default("LHB"), // LHB or ICF
  pantryType: text("pantry_type"), // Mini pantry, Full Pantry, etc.
  tatkalAvailable: boolean("tatkal_available").default(true),
  tatkalOpeningTime: text("tatkal_opening_time").default("10:00"), // Opening time for tatkal booking
  liveTrackingEnabled: boolean("live_tracking_enabled").default(false),
});

export const insertTrainSchema = createInsertSchema(trains).pick({
  number: true,
  name: true,
  sourceStationId: true,
  destinationStationId: true,
  departureTime: true,
  arrivalTime: true,
  duration: true,
  runDays: true,
  trainType: true,
  hasWifi: true,
  hasPantry: true,
  hasChargingPoint: true,
  hasBedroll: true,
  avgSpeed: true,
  distance: true,
  rake: true,
  pantryType: true,
  tatkalAvailable: true,
  tatkalOpeningTime: true,
  liveTrackingEnabled: true,
});

// TrainStop schema (intermediate stops for a train)
export const trainStops = pgTable("train_stops", {
  id: serial("id").primaryKey(),
  trainId: integer("train_id").notNull(),
  stationId: integer("station_id").notNull(),
  arrivalTime: text("arrival_time"),
  departureTime: text("departure_time"),
  dayCount: integer("day_count").default(0),
  haltTime: text("halt_time"),
  distance: integer("distance").default(0),
});

export const insertTrainStopSchema = createInsertSchema(trainStops).pick({
  trainId: true,
  stationId: true,
  arrivalTime: true,
  departureTime: true,
  dayCount: true,
  haltTime: true,
  distance: true,
});

// TrainClass schema (available classes for a train)
export const trainClasses = pgTable("train_classes", {
  id: serial("id").primaryKey(),
  trainId: integer("train_id").notNull(),
  classCode: text("class_code").notNull(),
  className: text("class_name").notNull(),
  fare: integer("fare").notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
});

export const insertTrainClassSchema = createInsertSchema(trainClasses).pick({
  trainId: true,
  classCode: true,
  className: true,
  fare: true,
  totalSeats: true,
  availableSeats: true,
});

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trainId: integer("train_id").notNull(),
  journeyDate: text("journey_date").notNull(),
  pnr: text("pnr").notNull().unique(),
  status: text("status").notNull(),
  classCode: text("class_code").notNull(),
  totalFare: integer("total_fare").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  bookingType: text("booking_type").default("general"), // general, tatkal
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed
  paymentId: text("payment_id"),
  paymentDueDate: timestamp("payment_due_date"),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  trainId: true,
  journeyDate: true,
  pnr: true,
  status: true,
  classCode: true,
  totalFare: true,
  bookingType: true,
  paymentStatus: true,
  paymentId: true,
  paymentDueDate: true,
});

// Passenger schema (passengers in a booking)
export const passengers = pgTable("passengers", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  berthPreference: text("berth_preference"),
  seatNumber: text("seat_number"),
  status: text("status").notNull(),
});

export const insertPassengerSchema = createInsertSchema(passengers).pick({
  bookingId: true,
  name: true,
  age: true,
  gender: true,
  berthPreference: true,
  seatNumber: true,
  status: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Station = typeof stations.$inferSelect;
export type InsertStation = z.infer<typeof insertStationSchema>;

export type Train = typeof trains.$inferSelect;
export type InsertTrain = z.infer<typeof insertTrainSchema>;

export type TrainStop = typeof trainStops.$inferSelect;
export type InsertTrainStop = z.infer<typeof insertTrainStopSchema>;

export type TrainClass = typeof trainClasses.$inferSelect;
export type InsertTrainClass = z.infer<typeof insertTrainClassSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Passenger = typeof passengers.$inferSelect;
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;

// Search train schema for request validation
export const searchTrainSchema = z.object({
  fromStation: z.string().min(1, { message: "Source station is required" }),
  toStation: z.string().min(1, { message: "Destination station is required" }),
  journeyDate: z.string().min(1, { message: "Journey date is required" }),
  travelClass: z.string().optional(),
});

export type SearchTrainParams = z.infer<typeof searchTrainSchema>;

// PNR status schema for request validation
export const pnrStatusSchema = z.object({
  pnrNumber: z.string().length(10, { message: "PNR must be 10 digits" }),
});

export type PnrStatusParams = z.infer<typeof pnrStatusSchema>;

// Live train location schema
export const trainLocations = pgTable("train_locations", {
  id: serial("id").primaryKey(),
  trainId: integer("train_id").notNull(),
  currentStationId: integer("current_station_id").notNull(),
  nextStationId: integer("next_station_id").notNull(),
  status: text("status").notNull(), // running, arrived, departed, delayed, cancelled
  delay: integer("delay").default(0), // delay in minutes
  updatedAt: timestamp("updated_at").defaultNow(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  speed: integer("speed").default(0), // current speed in km/h
});

export const insertTrainLocationSchema = createInsertSchema(trainLocations).pick({
  trainId: true,
  currentStationId: true,
  nextStationId: true,
  status: true,
  delay: true,
  latitude: true,
  longitude: true,
  speed: true,
});

export type TrainLocation = typeof trainLocations.$inferSelect;
export type InsertTrainLocation = z.infer<typeof insertTrainLocationSchema>;

// Payment reminder schema
export const paymentReminders = pgTable("payment_reminders", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  reminderType: text("reminder_type").notNull(), // email, sms, push
  reminderStatus: text("reminder_status").notNull(), // pending, sent, failed
  reminderCount: integer("reminder_count").default(0),
  lastSentAt: timestamp("last_sent_at"),
  nextReminderAt: timestamp("next_reminder_at"),
});

export const insertPaymentReminderSchema = createInsertSchema(paymentReminders).pick({
  bookingId: true,
  reminderType: true,
  reminderStatus: true,
  reminderCount: true,
  lastSentAt: true,
  nextReminderAt: true,
});

// Update train location schema with lastUpdated field
export const trainLocationSchema = z.object({
  trainId: z.number(),
  currentStationId: z.number(),
  nextStationId: z.number(),
  status: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  speed: z.number().optional(),
  delay: z.number().optional(),
});

// Tatkal booking schema
export const tatkalBookingSchema = z.object({
  trainId: z.number(),
  journeyDate: z.string(),
  classCode: z.string(),
  passengers: z.array(z.object({
    name: z.string(),
    age: z.number(),
    gender: z.string(),
    berthPreference: z.string().optional(),
  })),
  totalFare: z.number(),
});

// Scheduled Booking schema
export const scheduledBookings = pgTable("scheduled_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trainId: integer("train_id").notNull(),
  journeyDate: text("journey_date").notNull(),
  classCode: text("class_code").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(), // When to attempt the booking
  status: text("status").notNull().default("pending"), // pending, completed, failed
  bookingId: integer("booking_id"), // Reference to the booking once created
  passengerData: jsonb("passenger_data").notNull(), // JSON array of passenger details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  bookingType: text("booking_type").default("general"), // general, tatkal
  paymentRemindersEnabled: boolean("payment_reminders_enabled").default(true),
  reminderFrequency: integer("reminder_frequency").default(24), // Hours between reminders
  maxReminders: integer("max_reminders").default(3), // Maximum number of reminders to send
});

export const insertScheduledBookingSchema = createInsertSchema(scheduledBookings).pick({
  userId: true,
  trainId: true,
  journeyDate: true,
  classCode: true,
  scheduledAt: true,
  status: true,
  passengerData: true,
  bookingType: true,
  paymentRemindersEnabled: true,
  reminderFrequency: true,
  maxReminders: true,
});

export type ScheduledBooking = typeof scheduledBookings.$inferSelect;
export type InsertScheduledBooking = z.infer<typeof insertScheduledBookingSchema>;

// Schema for scheduled booking request
export const scheduledBookingRequestSchema = z.object({
  trainId: z.number(),
  journeyDate: z.string(),
  classCode: z.string(),
  scheduledAt: z.string(), // ISO datetime string for when to book
  passengers: z.array(z.object({
    name: z.string(),
    age: z.number(),
    gender: z.string(),
    berthPreference: z.string().optional(),
  })),
  bookingType: z.enum(["general", "tatkal"]).default("general"),
  paymentRemindersEnabled: z.boolean().default(true),
  reminderFrequency: z.number().default(24),
  maxReminders: z.number().default(3),
});

export type PaymentReminder = typeof paymentReminders.$inferSelect;
export type InsertPaymentReminder = z.infer<typeof insertPaymentReminderSchema>;

// Ticket Transfer schema
export const ticketTransfers = pgTable("ticket_transfers", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  senderId: integer("sender_id").notNull(), // User who is transferring the ticket
  receiverEmail: text("receiver_email").notNull(), // Email of the recipient
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, expired
  transferCode: text("transfer_code").notNull(), // Unique code for verifying the transfer
  message: text("message"), // Optional message from sender
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // When the transfer offer expires
  completedAt: timestamp("completed_at"), // When the transfer was completed/rejected
  transferType: text("transfer_type").default("full"), // full, partial (for specific passengers)
  passengerIds: text("passenger_ids"), // Comma-separated IDs of passengers for partial transfers
});

export const insertTicketTransferSchema = createInsertSchema(ticketTransfers).pick({
  bookingId: true,
  senderId: true,
  receiverEmail: true,
  status: true,
  transferCode: true,
  message: true,
  expiresAt: true,
  transferType: true,
  passengerIds: true,
});

export type TicketTransfer = typeof ticketTransfers.$inferSelect;
export type InsertTicketTransfer = z.infer<typeof insertTicketTransferSchema>;

// Schema for ticket transfer request
export const createTicketTransferSchema = z.object({
  bookingId: z.number(),
  receiverEmail: z.string().email({ message: "Invalid email address" }),
  message: z.string().optional(),
  transferType: z.enum(["full", "partial"]).default("full"),
  passengerIds: z.string().optional(), // Comma-separated list of passenger IDs for partial transfers
  expirationHours: z.number().default(24) // How many hours until the transfer expires
});

// Schema for accepting/rejecting ticket transfers
export const processTicketTransferSchema = z.object({
  transferCode: z.string(),
  action: z.enum(["accept", "reject"]),
});
