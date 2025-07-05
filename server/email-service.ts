import { User, Booking, Passenger, Train, Station } from "@shared/schema";

/**
 * Email service for sending notifications
 * In a production environment, this would integrate with a real email service like SendGrid, Mailgun, etc.
 */
export class EmailService {
  /**
   * Send a welcome email after registration
   * @param user The user who registered
   * @returns Promise<boolean> indicating success or failure
   */
  static async sendWelcomeEmail(user: User): Promise<boolean> {
    try {
      console.log(`[EMAIL SERVICE] Sending welcome email to ${user.email}`);
      
      // In a real implementation, this would call an actual email API
      const emailContent = `
        Hello ${user.username},
        
        Welcome to TrainGo! Thank you for registering with us.
        
        With TrainGo, you can:
        - Book train tickets with ease
        - Check PNR status and live train locations
        - Get real-time updates and reminders
        - Transfer or exchange tickets
        
        Start exploring our services now!
        
        Best regards,
        The TrainGo Team
      `;
      
      // Log success for demonstration purposes
      console.log(`[EMAIL SERVICE] Welcome email sent successfully to ${user.email}`);
      console.log("[EMAIL CONTENT]", emailContent);
      
      return true;
    } catch (error) {
      console.error("[EMAIL SERVICE] Error sending welcome email:", error);
      return false;
    }
  }
  
  /**
   * Send a booking confirmation email
   * @param booking The booking details
   * @param user The user who made the booking
   * @param passengers List of passengers
   * @param train Train details
   * @param sourceStation Source station
   * @param destinationStation Destination station
   * @returns Promise<boolean> indicating success or failure
   */
  static async sendBookingConfirmationEmail(
    booking: Booking,
    user: User,
    passengers: Passenger[],
    train: Train,
    sourceStation: Station,
    destinationStation: Station
  ): Promise<boolean> {
    try {
      console.log(`[EMAIL SERVICE] Sending booking confirmation email to ${user.email}`);
      
      // Format passenger list
      const passengerList = passengers.map((p, index) => 
        `${index + 1}. ${p.name} (${p.age}, ${p.gender}) - Seat: ${p.seatNumber || 'Will be allocated'}`
      ).join("\\n");
      
      // Format journey date
      const journeyDate = new Date(booking.journeyDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // In a real implementation, this would call an actual email API
      const emailContent = `
        Hello ${user.username},
        
        Your booking is confirmed!
        
        PNR: ${booking.pnr}
        Train: ${train.number} - ${train.name}
        Journey Date: ${journeyDate}
        From: ${sourceStation.name} (${sourceStation.code})
        To: ${destinationStation.name} (${destinationStation.code})
        Class: ${booking.classCode}
        
        Passenger Details:
        ${passengerList}
        
        Total Fare: ₹${booking.totalFare}
        
        You can check your PNR status and get live updates on our app or website.
        
        Happy Journey!
        The TrainGo Team
      `;
      
      // Log success for demonstration purposes
      console.log(`[EMAIL SERVICE] Booking confirmation email sent successfully to ${user.email}`);
      console.log("[EMAIL CONTENT]", emailContent);
      
      return true;
    } catch (error) {
      console.error("[EMAIL SERVICE] Error sending booking confirmation email:", error);
      return false;
    }
  }
  
  /**
   * Send a payment reminder email
   * @param booking The booking with pending payment
   * @param user The user who made the booking
   * @param hoursRemaining Hours remaining before payment deadline
   * @returns Promise<boolean> indicating success or failure
   */
  static async sendPaymentReminderEmail(
    booking: Booking,
    user: User,
    hoursRemaining: number
  ): Promise<boolean> {
    try {
      console.log(`[EMAIL SERVICE] Sending payment reminder email to ${user.email}`);
      
      // Format deadline
      const deadline = booking.paymentDueDate 
        ? new Date(booking.paymentDueDate).toLocaleString() 
        : "Unknown";
      
      // In a real implementation, this would call an actual email API
      const emailContent = `
        Hello ${user.username},
        
        This is a reminder that payment for your booking (PNR: ${booking.pnr}) is due soon.
        
        You have ${hoursRemaining} hours remaining to complete the payment before your booking is cancelled.
        
        Payment Deadline: ${deadline}
        Amount Due: ₹${booking.totalFare}
        
        Please login to your account to complete the payment.
        
        Thank you,
        The RailYatri Connect Team
      `;
      
      // Log success for demonstration purposes
      console.log(`[EMAIL SERVICE] Payment reminder email sent successfully to ${user.email}`);
      console.log("[EMAIL CONTENT]", emailContent);
      
      return true;
    } catch (error) {
      console.error("[EMAIL SERVICE] Error sending payment reminder email:", error);
      return false;
    }
  }
  
  /**
   * Send an email about an upcoming journey
   * @param booking The booking details
   * @param user The user who made the booking
   * @param train Train details
   * @param hoursRemaining Hours remaining before journey
   * @returns Promise<boolean> indicating success or failure
   */
  static async sendJourneyReminderEmail(
    booking: Booking,
    user: User,
    train: Train,
    hoursRemaining: number
  ): Promise<boolean> {
    try {
      console.log(`[EMAIL SERVICE] Sending journey reminder email to ${user.email}`);
      
      // In a real implementation, this would call an actual email API
      const emailContent = `
        Hello ${user.username},
        
        Your journey on ${train.name} (${train.number}) is coming up in ${hoursRemaining} hours.
        
        PNR: ${booking.pnr}
        Journey Date: ${new Date(booking.journeyDate).toLocaleDateString()}
        
        Remember to check the live train status and platform number before heading to the station.
        
        Have a safe and pleasant journey!
        The RailYatri Connect Team
      `;
      
      // Log success for demonstration purposes
      console.log(`[EMAIL SERVICE] Journey reminder email sent successfully to ${user.email}`);
      console.log("[EMAIL CONTENT]", emailContent);
      
      return true;
    } catch (error) {
      console.error("[EMAIL SERVICE] Error sending journey reminder email:", error);
      return false;
    }
  }
  
  /**
   * Send notification about ticket transfer or exchange
   * @param booking The booking being transferred
   * @param sender The user sending/transferring the ticket
   * @param recipient The recipient email address
   * @param transferType The type of transfer
   * @param message Optional message from sender
   * @returns Promise<boolean> indicating success or failure
   */
  static async sendTicketTransferEmail(
    booking: Booking,
    sender: User,
    recipientEmail: string,
    transferType: "full" | "partial",
    message?: string | null
  ): Promise<boolean> {
    try {
      console.log(`[EMAIL SERVICE] Sending ticket transfer email to ${recipientEmail}`);
      
      // Format title based on transfer type
      const transferTitle = transferType === "full" 
        ? "has transferred a complete ticket booking to you" 
        : "has transferred selected passengers from a booking to you";
      
      // In a real implementation, this would call an actual email API
      const emailContent = `
        Hello,
        
        ${sender.username} ${transferTitle}.
        
        PNR: ${booking.pnr}
        Journey Date: ${new Date(booking.journeyDate).toLocaleDateString()}
        Train: ${booking.trainId}
        Class: ${booking.classCode}
        
        ${message ? `Message from ${sender.username}: "${message}"` : ""}
        
        Please login to your RailYatri Connect account to accept this ticket transfer.
        The transfer request will expire in 24 hours.
        
        Thank you,
        The RailYatri Connect Team
      `;
      
      // Log success for demonstration purposes
      console.log(`[EMAIL SERVICE] Ticket transfer email sent successfully to ${recipientEmail}`);
      console.log("[EMAIL CONTENT]", emailContent);
      
      return true;
    } catch (error) {
      console.error("[EMAIL SERVICE] Error sending ticket transfer email:", error);
      return false;
    }
  }
  
  /**
   * Send notification about platform or schedule changes
   * @param booking The affected booking
   * @param user The user to notify
   * @param updateType The type of update
   * @param oldValue Previous value
   * @param newValue Updated value
   * @returns Promise<boolean> indicating success or failure
   */
  static async sendScheduleUpdateEmail(
    booking: Booking,
    user: User,
    updateType: "platform" | "delay" | "cancellation" | "reschedule",
    oldValue?: string,
    newValue?: string
  ): Promise<boolean> {
    try {
      console.log(`[EMAIL SERVICE] Sending schedule update email to ${user.email}`);
      
      // Format subject based on update type
      let subject = "";
      let detailMessage = "";
      
      switch (updateType) {
        case "platform":
          subject = "Platform Change";
          detailMessage = `Platform changed from ${oldValue} to ${newValue}.`;
          break;
        case "delay":
          subject = "Train Delayed";
          detailMessage = `Train is delayed by ${newValue} minutes.`;
          break;
        case "cancellation":
          subject = "Train Cancelled";
          detailMessage = "Train has been cancelled. Please visit our website or app for refund options.";
          break;
        case "reschedule":
          subject = "Train Rescheduled";
          detailMessage = `Departure rescheduled from ${oldValue} to ${newValue}.`;
          break;
      }
      
      // In a real implementation, this would call an actual email API
      const emailContent = `
        Hello ${user.username},
        
        IMPORTANT: ${subject} for your upcoming journey.
        
        PNR: ${booking.pnr}
        Journey Date: ${new Date(booking.journeyDate).toLocaleDateString()}
        
        ${detailMessage}
        
        Please check the RailYatri Connect app or website for real-time updates.
        
        Thank you for your understanding,
        The RailYatri Connect Team
      `;
      
      // Log success for demonstration purposes
      console.log(`[EMAIL SERVICE] Schedule update email sent successfully to ${user.email}`);
      console.log("[EMAIL CONTENT]", emailContent);
      
      return true;
    } catch (error) {
      console.error("[EMAIL SERVICE] Error sending schedule update email:", error);
      return false;
    }
  }
  
  /**
   * Send promotional emails or app updates
   * @param user The user to notify
   * @param subject Email subject
   * @param content Email content
   * @returns Promise<boolean> indicating success or failure
   */
  static async sendPromotionalEmail(
    user: User,
    subject: string,
    content: string
  ): Promise<boolean> {
    try {
      console.log(`[EMAIL SERVICE] Sending promotional email to ${user.email}`);
      
      // In a real implementation, this would call an actual email API
      const emailContent = `
        Hello ${user.username},
        
        ${content}
        
        You're receiving this because you're subscribed to RailYatri Connect updates.
        To unsubscribe, visit your account settings.
        
        Best regards,
        The RailYatri Connect Team
      `;
      
      // Log success for demonstration purposes
      console.log(`[EMAIL SERVICE] Promotional email sent successfully to ${user.email}`);
      console.log("[EMAIL CONTENT]", emailContent);
      
      return true;
    } catch (error) {
      console.error("[EMAIL SERVICE] Error sending promotional email:", error);
      return false;
    }
  }
}