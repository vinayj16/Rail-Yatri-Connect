import { ChatbotMessage } from "@shared/schema";

interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  object: string;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

/**
 * Get a response from the Perplexity AI API
 * Falls back to the local implementation if no API key is available
 * @param message The user's message
 * @returns The AI response or the fallback response
 */
export async function getAIResponse(message: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  // If no API key is available, fall back to local implementation
  if (!apiKey) {
    console.log("No Perplexity API key found, using fallback response");
    return getFallbackResponse(message);
  }
  
  try {
    // Prepare messages for the API
    const messages: PerplexityMessage[] = [
      {
        role: "system",
        content: "You are RailYatri Connect's AI assistant that helps users with train bookings, ticket cancellations, ticket transfers, and detailed information about features and services. The system has the following special features: 1) Scheduling tickets to be booked automatically at a specific date and time, 2) Configure automatic payment reminders with custom frequency, 3) Live train tracking, 4) PNR status checking, 5) Tatkal booking support, 6) Ticket transfer for unused tickets, 7) Real-time platform and train status information, 8) Ticket cancellation, 9) Ticket transfer with payment between users, 10) Detailed feature information about all services. Be precise and concise. Only answer about Indian Railways and train travel. Always be helpful and informative. For scheduled bookings, explain that users must set a future date and time, provide passenger details, and can enable payment reminders. For ticket transfers, explain that users can transfer unused tickets to other users via email with payment option. For ticket cancellations, explain the process and refund policies. When helping users find tickets, provide detailed instructions on using the search form. Offer to assist with corporate, institutional and agent registration processes when asked about them. Be ready to explain About Us, Corporate Profile, FAQs, Terms & Conditions, Privacy Policy, Refund Rules, and other informational sections."
      },
      {
        role: "user",
        content: message
      }
    ];
    
    // Call the Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages,
        temperature: 0.2,
        top_p: 0.9,
        stream: false,
        frequency_penalty: 1,
        presence_penalty: 0
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Perplexity API error: ${response.status} - ${errorData}`);
      return getFallbackResponse(message);
    }
    
    const data: PerplexityResponse = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      console.error("Unexpected API response format:", data);
      return getFallbackResponse(message);
    }
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    return getFallbackResponse(message);
  }
}

/**
 * Get a fallback response using the local implementation
 * @param message The user's message
 * @returns The fallback response
 */
function getFallbackResponse(message: string): string {
  // Scheduled booking queries
  if (message.toLowerCase().includes("schedule") && message.toLowerCase().includes("book")) {
    return "You can schedule bookings to be processed automatically at a specific time. Go to 'Search Trains', select your train, and then choose 'Schedule Booking'. You'll need to provide passenger details, select the exact date and time for booking, and enable payment reminders if needed. Our system will automatically book your tickets at the scheduled time and notify you for payment.";
  }

  // Scheduled booking payment reminder queries
  if ((message.toLowerCase().includes("schedule") || message.toLowerCase().includes("automatic")) && 
      message.toLowerCase().includes("remind") && message.toLowerCase().includes("payment")) {
    return "When creating a scheduled booking, you can enable payment reminders. Once your tickets are booked at the scheduled time, you'll receive reminders via SMS or email based on your frequency settings (default is 24 hours). You can set the maximum number of reminders and how often they should be sent. Check your bookings page to see all payment due dates.";
  }

  // Train related queries
  if (message.toLowerCase().includes("train") && (
    message.toLowerCase().includes("find") || 
    message.toLowerCase().includes("search") || 
    message.toLowerCase().includes("book")
  )) {
    return "You can search for trains by providing source, destination, and journey date using our train search form on the homepage.";
  }

  // PNR status queries
  if (message.toLowerCase().includes("pnr") || message.toLowerCase().includes("ticket status")) {
    return "You can check your PNR status by visiting the PNR Status page and entering your 10-digit PNR number.";
  }

  // Booking related queries
  if (message.toLowerCase().includes("book") || message.toLowerCase().includes("reservation")) {
    return "To book tickets, first search for trains between your source and destination, then select a train and click on the Book button. You can also schedule bookings to be processed automatically at a specific time by using our Schedule Booking feature.";
  }

  // Train location queries
  if (message.toLowerCase().includes("location") || message.toLowerCase().includes("track") || 
      message.toLowerCase().includes("where is") || message.toLowerCase().includes("train position")) {
    return "You can now track the live location of selected trains. Go to train details and click on 'Live Location' to see the current position of your train on a map along with details like speed and delay information.";
  }
  
  // Payment reminders
  if (message.toLowerCase().includes("payment reminder") || 
      message.toLowerCase().includes("due payment") || 
      message.toLowerCase().includes("pending payment")) {
    return "For tatkal bookings, payment must be completed within 3 hours. For scheduled bookings, you can set custom reminder frequencies. We'll send payment reminders via SMS and email. Check your bookings page to see pending payments and due dates.";
  }
  
  // Tatkal booking
  if (message.toLowerCase().includes("tatkal")) {
    return "Tatkal booking opens at 10:00 AM for all classes, one day before the journey date. You need to be quick as tickets sell out fast. You can schedule automatic tatkal bookings using our Schedule Booking feature - just set the time to 10:00 AM on the day before your journey.";
  }
  
  // Ticket transfers
  if (message.toLowerCase().includes("transfer") && 
      (message.toLowerCase().includes("ticket") || message.toLowerCase().includes("booking"))) {
    return "You can transfer your unused tickets to another user via email. Go to 'My Bookings', select the booking you want to transfer, and click on 'Transfer Ticket'. You'll need to provide the recipient's email address. They'll receive a notification with a transfer code that they can use to accept the transfer. Transfers can be for all passengers (full transfer) or selected passengers (partial transfer). You can also request payment from the recipient for the ticket transfer.";
  }
  
  // Ticket cancellation
  if (message.toLowerCase().includes("cancel") && 
      (message.toLowerCase().includes("ticket") || message.toLowerCase().includes("booking"))) {
    return "To cancel your ticket, go to 'My Bookings', select the booking you want to cancel, and click on 'Cancel Ticket'. You can cancel the entire booking or select specific passengers. The refund will be processed according to the cancellation policy (full refund if cancelled more than 24 hours before departure, partial refund if cancelled between 4 and 24 hours before departure, no refund if cancelled less than 4 hours before departure).";
  }
  
  // Finding tickets
  if ((message.toLowerCase().includes("find") || message.toLowerCase().includes("locate")) && 
      message.toLowerCase().includes("ticket")) {
    return "To find your tickets, log in to your account and go to 'My Bookings'. You'll see all your active and past bookings. You can filter by journey date, status, or search by PNR number. Click on any booking to see its details. If you've received a ticket transfer, go to 'Transfers' section and use the transfer code to claim the ticket.";
  }
  
  // Platform information
  if (message.toLowerCase().includes("platform") || 
      (message.toLowerCase().includes("station") && message.toLowerCase().includes("status"))) {
    return "You can view real-time platform information for any station. Go to the 'Live Platform' section and select your station. You'll see which trains are currently at which platforms, their expected arrival and departure times, and current status (on time, delayed, arrived, etc.).";
  }
  
  // About us or corporate information
  if (message.toLowerCase().includes("about") || 
      message.toLowerCase().includes("corporate profile") ||
      message.toLowerCase().includes("company")) {
    return "RailYatri Connect is India's premier railway booking platform, offering comprehensive train booking solutions with advanced features like automated ticket booking, live train tracking, and innovative ticket management. Our mission is to simplify railway travel through technology. Visit the 'About Us' section on our website for more details about our journey, mission, and vision.";
  }
  
  // FAQs
  if (message.toLowerCase().includes("faq") || 
      message.toLowerCase().includes("frequently asked") ||
      message.toLowerCase().includes("help")) {
    return "Our FAQs section covers common questions about bookings, cancellations, refunds, tatkal tickets, train status, and account management. Check the 'FAQs' link in the footer of our website for detailed answers to the most common questions.";
  }
  
  // Terms & Conditions or Privacy Policy
  if (message.toLowerCase().includes("terms") || 
      message.toLowerCase().includes("conditions") ||
      message.toLowerCase().includes("privacy") ||
      message.toLowerCase().includes("policy")) {
    return "Our Terms & Conditions and Privacy Policy outline your rights and responsibilities when using RailYatri Connect. These include booking rules, cancellation policies, refund conditions, data protection practices, and more. Visit the 'Terms & Conditions' or 'Privacy Policy' links in the footer of our website to learn more.";
  }
  
  // Agent Registration
  if (message.toLowerCase().includes("agent") && 
      message.toLowerCase().includes("register")) {
    return "Travel agents can register with RailYatri Connect to get special privileges like bulk bookings, commission on bookings, and dedicated support. Click on 'Agent Registration' in the header menu to start the process. You'll need to provide your business details, ID proof, and contact information. Our team will verify your documents and activate your agent account within 2-3 business days.";
  }

  // Default response
  return "I'm your RailYatri Connect assistant. I can help you with train searches, PNR status, bookings, cancellations, ticket transfers with payment options, scheduled bookings, tatkal tickets, payment reminders, live tracking, and platform information. I can also provide information about our company, policies, and registration processes. Please ask a specific question about our services.";
}