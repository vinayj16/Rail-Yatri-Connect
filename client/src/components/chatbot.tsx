import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Send, Loader2, Bot, User, X, MessageCircle, Train, 
  Mic, MicOff, Volume2, VolumeX, HelpCircle, Info, Settings,
  BellRing, QrCode, Search, Zap, AlertTriangle, RefreshCw,
  Share2, Mail, CreditCard, ArrowRight, CheckCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

type ChatbotProps = {
  expanded?: boolean;
  className?: string;
};

const getSampleResponses = (query: string): string => {
  // Sample responses for common queries when backend is not available
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("pnr") || lowerQuery.includes("ticket status")) {
    return "To check your PNR status, please enter your 10-digit PNR number in the PNR Status section of our app. I'll help you track your booking status.";
  }
  
  if (lowerQuery.includes("refund") || lowerQuery.includes("cancel")) {
    return "Cancellation and refund policies depend on when you cancel. In general, you'll receive a higher refund percentage if you cancel earlier. Would you like me to help you cancel a specific booking?";
  }
  
  if (lowerQuery.includes("ticket transfer") || lowerQuery.includes("transfer ticket") ||
      (lowerQuery.includes("transfer") && lowerQuery.includes("booking"))) {
    return "Our new Ticket Transfer feature lets you transfer your ticket to friends or family instead of cancelling. You can access this feature from your bookings page or I can help you start the process right now. Would you like me to guide you through transferring a ticket? Reply with 'Yes, help me transfer a ticket' to get started.";
  }
  
  if (lowerQuery.includes("platform") || lowerQuery.includes("which platform")) {
    return "For live platform information, please check the Live Platform Status feature. You can also provide your train number, and I'll check the current platform status for you.";
  }
  
  if (lowerQuery.includes("about") || lowerQuery.includes("corporate") || lowerQuery.includes("company")) {
    return "RailYatri Connect is India's premier railway booking platform, offering comprehensive train booking solutions with advanced features like automated ticket booking, live train tracking, and innovative ticket management. Visit the 'About Us' section for more details.";
  }
  
  if (lowerQuery.includes("agent") && lowerQuery.includes("register")) {
    return "Travel agents can register with RailYatri Connect to get special privileges like bulk bookings, commission on bookings, and dedicated support. Click on 'Agent Registration' in the header menu to start the process.";
  }
  
  return "I'm your RailYatri Connect assistant. I can help you with ticket bookings, cancellations, transfers, PNR status, train schedules, and more. How can I help you today?";
};

// Floating chatbot component that can be toggled
export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Function to handle AI assistant button click
  const handleAssistantClick = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  // Function to minimize the chatbot (shows only header)
  const handleMinimize = () => {
    setIsMinimized(true);
  };

  // Function to close the chatbot completely
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed left-6 bottom-6 z-50 flex flex-col items-start gap-2">
          <Button
            onClick={handleAssistantClick}
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 hover:shadow-primary/30 hover:shadow-xl"
            size="icon"
          >
            <Train className="h-6 w-6 absolute opacity-0 animate-pulse-fade-out" />
            <Bot className="h-6 w-6 animate-pulse-in" />
          </Button>
          <div className="bg-white text-xs font-medium px-3 py-1 rounded-full shadow-sm opacity-80">
            Ask Disha
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className={`fixed left-6 bottom-6 w-[350px] ${
            isMinimized ? 'h-[60px]' : 'h-[500px]'
          } z-50 shadow-xl rounded-lg overflow-hidden transition-all duration-300`}
        >
          <div className="absolute top-0 right-0 z-10 flex p-2 gap-1">
            {!isMinimized && (
              <Button
                onClick={handleMinimize}
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full hover:bg-primary/10"
              >
                <div className="w-4 h-1 bg-muted-foreground rounded-full" />
              </Button>
            )}
            <Button
              onClick={handleClose}
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full hover:bg-primary/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isMinimized ? (
            <div 
              className="h-full bg-card flex items-center px-4 cursor-pointer"
              onClick={() => setIsMinimized(false)}
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Ask Disha - AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Click to open chat</p>
                </div>
              </div>
            </div>
          ) : (
            <Chatbot />
          )}
        </div>
      )}
    </>
  );
}

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Voice-related types and interfaces
interface VoiceSetting {
  voiceEnabled: boolean;
  speechEnabled: boolean;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
}

// Ticket transfer interface
interface TicketTransferData {
  pnrNumber: string;
  recipientEmail: string;
  transferType: 'full' | 'partial';
  message: string;
  requestPayment: boolean;
  amount: number;
  selectedPassengers: string[];
}

const defaultTicketTransferData: TicketTransferData = {
  pnrNumber: '',
  recipientEmail: '',
  transferType: 'full',
  message: '',
  requestPayment: false,
  amount: 0,
  selectedPassengers: []
};

interface ScheduleBookingData {
  source: string;
  destination: string;
  date: string;
  trainNumber: string;
  trainName: string;
  class: string;
  numPassengers: number;
  preferredTime: string;
  bookingType: 'regular' | 'tatkal';
}

const defaultScheduleData: ScheduleBookingData = {
  source: '',
  destination: '',
  date: '',
  trainNumber: '',
  trainName: '',
  class: '3A', // 3A = 3-Tier AC by default
  numPassengers: 1,
  preferredTime: '10:00',
  bookingType: 'regular'
};

export function Chatbot({ expanded = true, className }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your RailYatri Connect assistant. How can I help you with your train travel today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Ticket transfer state
  const [showTicketTransferInterface, setShowTicketTransferInterface] = useState(false);
  const [ticketTransferData, setTicketTransferData] = useState<TicketTransferData>(defaultTicketTransferData);
  const [ticketTransferStep, setTicketTransferStep] = useState(0);
  const [transferComplete, setTransferComplete] = useState(false);
  
  // Scheduling interface state
  const [showScheduleInterface, setShowScheduleInterface] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleBookingData>(defaultScheduleData);
  const [scheduleStep, setScheduleStep] = useState(0);
  
  // Voice-related state
  const [isListening, setIsListening] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSetting>({
    voiceEnabled: true,
    speechEnabled: true,
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1
  });
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  // Load available voices on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Set a default voice (preferably English)
        const defaultVoice = availableVoices.find(voice => 
          voice.lang.includes('en-') && voice.localService
        ) || (availableVoices.length > 0 ? availableVoices[0] : null);
        
        setVoiceSettings(prev => ({ ...prev, voice: defaultVoice }));
      };
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    }
    
    // Initialize speech recognition if available
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Auto submit after a short delay
        setTimeout(() => {
          const userMessage: Message = {
            id: `user-${Date.now()}`,
            content: transcript,
            sender: "user",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, userMessage]);
          sendMessage(transcript);
        }, 500);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please grant permission to use your microphone for voice input.",
            variant: "destructive",
          });
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      // Cleanup speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
      }
      
      // Stop any ongoing speech
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);
  
  // Speak text function
  const speakText = (text: string) => {
    if (!synthRef.current || !voiceSettings.voiceEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceSettings.voice) {
      utterance.voice = voiceSettings.voice;
    }
    
    utterance.volume = voiceSettings.volume;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    
    synthRef.current.speak(utterance);
  };
  
  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        toast({
          title: "Voice Input Not Supported",
          description: "Your browser does not support voice input. Please type your message instead.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition', error);
        toast({
          title: "Voice Input Error",
          description: "Could not start voice input. Please try again or type your message.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
    
    // Speak the last bot message if it exists and speech is enabled
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'bot' && voiceSettings.voiceEnabled) {
      speakText(lastMessage.content);
    }
  }, [messages, voiceSettings.voiceEnabled]);

  // Focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (message: string) => {
      try {
        const res = await apiRequest("POST", "/api/chatbot", { message });
        return await res.json();
      } catch (error) {
        // Fallback response if API call fails
        return { response: getSampleResponses(message) };
      }
    },
    onSuccess: (data) => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: `bot-${Date.now()}`,
        content: "I'm sorry, I couldn't process your message right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get a response from the chatbot.",
        variant: "destructive",
      });
    },
  });

  // Mutation for ticket transfer
  const { mutate: submitTicketTransfer, isPending: isTransferring } = useMutation({
    mutationFn: async (transferData: TicketTransferData) => {
      try {
        // In a production app, this would be a real API call
        const res = await apiRequest("POST", "/api/ticket-transfers", transferData);
        return await res.json();
      } catch (error) {
        console.error("Error creating ticket transfer:", error);
        throw new Error("Failed to create ticket transfer");
      }
    },
    onSuccess: (data) => {
      setTransferComplete(true);
      setTicketTransferStep(3); // Move to completion step
      
      // Add a confirmation message to the chat
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: `Your ticket transfer has been initiated successfully! The recipient will receive an email with instructions on how to accept the transfer. Transfer code: ${data.transferCode || 'TR' + Math.floor(Math.random() * 100000)}`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      
      // Reset the interface after a delay
      setTimeout(() => {
        setShowTicketTransferInterface(false);
        setTicketTransferData(defaultTicketTransferData);
      }, 5000);
      
      toast({
        title: "Transfer Initiated",
        description: "The ticket transfer request has been created successfully.",
      });
    },
    onError: (error: Error) => {
      const errorMessage: Message = {
        id: `bot-${Date.now()}`,
        content: `I'm sorry, I couldn't process your ticket transfer request. Error: ${error.message}`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Transfer Failed",
        description: error.message || "An error occurred during the transfer process",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    // Check for ticket transfer intent
    const lowerInput = input.toLowerCase();
    if ((lowerInput.includes("yes") && lowerInput.includes("transfer") && lowerInput.includes("ticket")) ||
         lowerInput === "yes, help me transfer a ticket") {
      setMessages((prev) => [...prev, userMessage]);
      
      // Show the ticket transfer interface
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        content: "Great! I'll help you transfer a ticket. Let's get started with the process.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.concat(botResponse)]);
      
      setShowTicketTransferInterface(true);
      setTicketTransferStep(0);
      setInput("");
      return;
    }
    
    setMessages((prev) => [...prev, userMessage]);
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Train className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">RailYatri Connect Assistant</CardTitle>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setHelpOpen(true)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help & Information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voice Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[300px] px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.length === 1 && messages[0].id === "welcome" && (
              <div className="flex flex-col gap-3 mb-6">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center justify-center h-20 p-2 border border-primary/20 hover:border-primary hover:bg-primary/5"
                    onClick={() => {
                      const content = "How can I ask a question?";
                      const userMessage: Message = {
                        id: `user-${Date.now()}`,
                        content,
                        sender: "user",
                        timestamp: new Date(),
                      };
                      setMessages(prev => [...prev, userMessage]);
                      sendMessage(content);
                    }}
                  >
                    <MessageCircle className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-center">Ask Any Question</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center justify-center h-20 p-2 border border-primary/20 hover:border-primary hover:bg-primary/5"
                    onClick={() => {
                      const content = "How do I schedule a booking?";
                      const userMessage: Message = {
                        id: `user-${Date.now()}`,
                        content,
                        sender: "user",
                        timestamp: new Date(),
                      };
                      setMessages(prev => [...prev, userMessage]);
                      sendMessage(content);
                    }}
                  >
                    <BellRing className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-center">Schedule Bookings</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center justify-center h-20 p-2 border border-primary/20 hover:border-primary hover:bg-primary/5"
                    onClick={() => {
                      const content = "How to share my ticket digitally?";
                      const userMessage: Message = {
                        id: `user-${Date.now()}`,
                        content,
                        sender: "user",
                        timestamp: new Date(),
                      };
                      setMessages(prev => [...prev, userMessage]);
                      sendMessage(content);
                    }}
                  >
                    <QrCode className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs text-center">Digital Ticket Sharing</span>
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  Click on a quick action or type your own question below
                </div>
              </div>
            )}
          
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === "bot" && (
                      <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.sender === "user" && (
                      <User className="h-5 w-5 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isPending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full">
          {showTicketTransferInterface ? (
            /* Ticket Transfer Interface */
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  {transferComplete ? "Ticket Transfer Complete" : "Transfer a Ticket"}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full" 
                  onClick={() => {
                    setShowTicketTransferInterface(false);
                    setTicketTransferData(defaultTicketTransferData);
                    setTicketTransferStep(0);
                    setTransferComplete(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {transferComplete ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Transfer Successful!</h3>
                  <p className="text-muted-foreground mb-4">
                    The recipient will receive an email with instructions to accept the transfer.
                  </p>
                  <Button
                    onClick={() => {
                      setShowTicketTransferInterface(false);
                      setTicketTransferData(defaultTicketTransferData);
                      setTicketTransferStep(0);
                      setTransferComplete(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-4">
                      {[0, 1, 2].map((step) => (
                        <React.Fragment key={step}>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              ticketTransferStep >= step
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {step + 1}
                          </div>
                          {step < 2 && (
                            <div
                              className={`h-0.5 w-12 ${
                                ticketTransferStep > step ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    
                    {ticketTransferStep === 0 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pnrNumber">Enter your PNR Number</Label>
                          <Input
                            id="pnrNumber"
                            placeholder="e.g. 4215478901"
                            value={ticketTransferData.pnrNumber}
                            onChange={(e) =>
                              setTicketTransferData({
                                ...ticketTransferData,
                                pnrNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        
                        <div>
                          <Button
                            onClick={() => setTicketTransferStep(1)}
                            disabled={!ticketTransferData.pnrNumber || ticketTransferData.pnrNumber.length < 10}
                            className="w-full"
                          >
                            Continue
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Please enter the 10-digit PNR number of the ticket you want to transfer
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {ticketTransferStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="transferType">Transfer Type</Label>
                          <RadioGroup
                            value={ticketTransferData.transferType}
                            onValueChange={(value) =>
                              setTicketTransferData({
                                ...ticketTransferData,
                                transferType: value as 'full' | 'partial',
                              })
                            }
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2 py-2">
                              <RadioGroupItem value="full" id="transferType-full" />
                              <Label htmlFor="transferType-full" className="cursor-pointer">Full Ticket Transfer</Label>
                            </div>
                            <div className="flex items-center space-x-2 py-2">
                              <RadioGroupItem value="partial" id="transferType-partial" />
                              <Label htmlFor="transferType-partial" className="cursor-pointer">Partial Ticket Transfer (Select Passengers)</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        {ticketTransferData.transferType === 'partial' && (
                          <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                            <Label>Select Passengers to Transfer</Label>
                            <div className="space-y-2">
                              {['Passenger 1 (John Doe, 35M)', 'Passenger 2 (Jane Doe, 32F)'].map((passenger, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`passenger-${idx}`}
                                    checked={ticketTransferData.selectedPassengers.includes(`passenger-${idx}`)}
                                    onCheckedChange={(checked) => {
                                      const passengerKey = `passenger-${idx}`;
                                      if (checked) {
                                        setTicketTransferData({
                                          ...ticketTransferData,
                                          selectedPassengers: [...ticketTransferData.selectedPassengers, passengerKey],
                                        });
                                      } else {
                                        setTicketTransferData({
                                          ...ticketTransferData,
                                          selectedPassengers: ticketTransferData.selectedPassengers.filter(
                                            (p) => p !== passengerKey
                                          ),
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`passenger-${idx}`} className="cursor-pointer">{passenger}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="requestPayment">Request Payment from Recipient</Label>
                            <Switch
                              id="requestPayment"
                              checked={ticketTransferData.requestPayment}
                              onCheckedChange={(checked) =>
                                setTicketTransferData({
                                  ...ticketTransferData,
                                  requestPayment: checked,
                                })
                              }
                            />
                          </div>
                          
                          {ticketTransferData.requestPayment && (
                            <div className="pt-2">
                              <Label htmlFor="amount">Amount (₹)</Label>
                              <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                value={ticketTransferData.amount || ''}
                                onChange={(e) =>
                                  setTicketTransferData({
                                    ...ticketTransferData,
                                    amount: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setTicketTransferStep(0)}>
                            Back
                          </Button>
                          <Button
                            onClick={() => setTicketTransferStep(2)}
                            disabled={
                              (ticketTransferData.transferType === 'partial' && 
                               ticketTransferData.selectedPassengers.length === 0) || 
                              (ticketTransferData.requestPayment && !ticketTransferData.amount)
                            }
                            className="flex-1"
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {ticketTransferStep === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="recipientEmail">Recipient's Email</Label>
                          <Input
                            id="recipientEmail"
                            type="email"
                            placeholder="e.g. friend@example.com"
                            value={ticketTransferData.recipientEmail}
                            onChange={(e) =>
                              setTicketTransferData({
                                ...ticketTransferData,
                                recipientEmail: e.target.value,
                              })
                            }
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            placeholder="Add a personal message to the recipient..."
                            value={ticketTransferData.message}
                            onChange={(e) =>
                              setTicketTransferData({
                                ...ticketTransferData,
                                message: e.target.value,
                              })
                            }
                            className="min-h-[80px]"
                          />
                        </div>
                        
                        <div className="bg-muted/40 rounded-md p-3 space-y-2">
                          <h4 className="font-medium">Transfer Summary</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">PNR Number:</span>
                              <span>{ticketTransferData.pnrNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Transfer Type:</span>
                              <span className="capitalize">{ticketTransferData.transferType}</span>
                            </div>
                            {ticketTransferData.transferType === 'partial' && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Passengers:</span>
                                <span>{ticketTransferData.selectedPassengers.length}</span>
                              </div>
                            )}
                            {ticketTransferData.requestPayment && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Requested:</span>
                                <span>₹{ticketTransferData.amount.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setTicketTransferStep(1)}>
                            Back
                          </Button>
                          <Button
                            onClick={() => submitTicketTransfer(ticketTransferData)}
                            disabled={!ticketTransferData.recipientEmail || isTransferring}
                            className="flex-1"
                          >
                            {isTransferring ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>Complete Transfer</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : !showScheduleInterface ? (
            <>
              {/* Quick Action Buttons */}
              <div className="flex mb-3 gap-2 overflow-x-auto pb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap border-primary/30 hover:bg-primary/5"
                  onClick={() => {
                    setScheduleData({...defaultScheduleData, bookingType: 'regular' as const});
                    setShowScheduleInterface(true);
                    setScheduleStep(0);
                  }}
                >
                  <BellRing className="h-4 w-4 mr-2 text-primary" />
                  Schedule Booking
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap border-primary/30 hover:bg-primary/5"
                  onClick={() => {
                    setScheduleData({...defaultScheduleData, bookingType: 'tatkal' as const, preferredTime: '11:00'});
                    setShowScheduleInterface(true);
                    setScheduleStep(0);
                  }}
                >
                  <Zap className="h-4 w-4 mr-2 text-primary" />
                  Tatkal Booking
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap border-primary/30 hover:bg-primary/5"
                  onClick={() => {
                    setTicketTransferData(defaultTicketTransferData);
                    setShowTicketTransferInterface(true);
                    setTicketTransferStep(0);
                    
                    // Add a message to the chat window
                    const userMessage: Message = {
                      id: `user-${Date.now()}`,
                      content: "I want to transfer my ticket to someone else",
                      sender: "user",
                      timestamp: new Date(),
                    };
                    
                    const botMessage: Message = {
                      id: `bot-${Date.now()}`,
                      content: "I'll help you transfer your ticket. Let's start with your PNR number.",
                      sender: "bot",
                      timestamp: new Date(),
                    };
                    
                    setMessages((prev) => [...prev, userMessage, botMessage]);
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2 text-primary" />
                  Transfer Ticket
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap border-primary/30 hover:bg-primary/5"
                  onClick={() => {
                    const content = "How to share my ticket digitally?";
                    const userMessage: Message = {
                      id: `user-${Date.now()}`,
                      content,
                      sender: "user",
                      timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, userMessage]);
                    sendMessage(content);
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2 text-primary" />
                  Digital Ticket
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap border-primary/30 hover:bg-primary/5"
                  onClick={() => {
                    const content = "What is the status of my PNR?";
                    const userMessage: Message = {
                      id: `user-${Date.now()}`,
                      content,
                      sender: "user",
                      timestamp: new Date(),
                    };
                    setMessages(prev => [...prev, userMessage]);
                    sendMessage(content);
                  }}
                >
                  <Search className="h-4 w-4 mr-2 text-primary" />
                  PNR Status
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="w-full flex gap-2 items-end">
                <div className="relative flex-grow">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : "Type your message here..."}
                    className="min-h-[60px] pr-10"
                    disabled={isPending || isListening}
                  />
                  
                  <div className="absolute right-2 bottom-2 flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={toggleListening}
                            className="h-8 w-8 rounded-full"
                            disabled={isPending}
                          >
                            {isListening ? (
                              <MicOff className="h-4 w-4 text-destructive" />
                            ) : (
                              <Mic className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isListening ? "Stop voice input" : "Start voice input"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isPending || isListening || !input.trim()}
                  className="h-[60px] w-[60px] rounded-md"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Schedule Booking Interface */
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-primary" />
                  Schedule a Ticket Booking
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full" 
                  onClick={() => setShowScheduleInterface(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {scheduleStep === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter journey details to schedule an automated booking
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source">From Station</Label>
                      <input
                        id="source"
                        className="w-full p-2 border rounded-md"
                        value={scheduleData.source}
                        onChange={(e) => setScheduleData({...scheduleData, source: e.target.value})}
                        placeholder="e.g., NDLS"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="destination">To Station</Label>
                      <input
                        id="destination"
                        className="w-full p-2 border rounded-md"
                        value={scheduleData.destination}
                        onChange={(e) => setScheduleData({...scheduleData, destination: e.target.value})}
                        placeholder="e.g., CSTM"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="journeyDate">Journey Date</Label>
                      <input
                        id="journeyDate"
                        type="date"
                        className="w-full p-2 border rounded-md"
                        value={scheduleData.date}
                        onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trainNumber">Train Number/Name</Label>
                      <input
                        id="trainNumber"
                        className="w-full p-2 border rounded-md"
                        value={scheduleData.trainNumber}
                        onChange={(e) => setScheduleData({...scheduleData, trainNumber: e.target.value})}
                        placeholder="e.g., 12951 or Rajdhani"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setScheduleStep(1)}
                      disabled={!scheduleData.source || !scheduleData.destination || !scheduleData.date}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              
              {scheduleStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md mb-2">
                    <div className="flex items-center gap-2">
                      {scheduleData.bookingType === 'tatkal' ? (
                        <>
                          <Zap className="h-5 w-5 text-amber-500" />
                          <span className="font-medium">Tatkal Booking at 11:00 AM</span>
                        </>
                      ) : (
                        <>
                          <BellRing className="h-5 w-5 text-primary" />
                          <span className="font-medium">Regular Scheduled Booking</span>
                        </>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setScheduleData({
                          ...scheduleData, 
                          bookingType: scheduleData.bookingType === 'tatkal' ? 'regular' as const : 'tatkal' as const,
                          preferredTime: scheduleData.bookingType === 'tatkal' ? '10:00' : '11:00'
                        });
                      }}
                    >
                      Switch to {scheduleData.bookingType === 'tatkal' ? 'Regular' : 'Tatkal'}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Provide booking preferences and passenger details
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class">Travel Class</Label>
                      <select
                        id="class"
                        className="w-full p-2 border rounded-md"
                        value={scheduleData.class}
                        onChange={(e) => setScheduleData({...scheduleData, class: e.target.value})}
                      >
                        <option value="SL">Sleeper (SL)</option>
                        <option value="3A">AC 3-Tier (3A)</option>
                        <option value="2A">AC 2-Tier (2A)</option>
                        <option value="1A">AC First Class (1A)</option>
                        <option value="CC">Chair Car (CC)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numPassengers">Number of Passengers</Label>
                      <input
                        id="numPassengers"
                        type="number"
                        min="1" 
                        max="6"
                        className="w-full p-2 border rounded-md"
                        value={scheduleData.numPassengers}
                        onChange={(e) => setScheduleData({...scheduleData, numPassengers: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Booking Time</Label>
                      <input
                        id="preferredTime"
                        type="time"
                        className="w-full p-2 border rounded-md"
                        value={scheduleData.preferredTime}
                        onChange={(e) => setScheduleData({...scheduleData, preferredTime: e.target.value})}
                        readOnly={scheduleData.bookingType === 'tatkal'}
                      />
                      <p className="text-xs text-muted-foreground">
                        {scheduleData.bookingType === 'tatkal' 
                          ? 'Tatkal booking fixed at 11:00 AM'
                          : 'When to attempt the booking'}
                      </p>
                    </div>
                  </div>
                  
                  {scheduleData.bookingType === 'tatkal' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Tatkal Booking Information</span>
                      </div>
                      <p className="text-amber-700 text-xs">
                        Tatkal bookings open at 11:00 AM one day before the journey date. The system will automatically 
                        attempt to book your ticket at 11:00 AM and send you payment reminders. You must complete the payment 
                        within 15 minutes to confirm your booking.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setScheduleStep(0)}>
                      Back
                    </Button>
                    <Button 
                      onClick={() => {
                        // Submit the scheduled booking
                        const bookingType = scheduleData.bookingType === 'tatkal' ? 'Tatkal' : 'Regular';
                        const message = `I want to schedule a ${bookingType.toLowerCase()} booking from ${scheduleData.source} to ${scheduleData.destination} on ${scheduleData.date} in ${scheduleData.class} class for ${scheduleData.numPassengers} passenger(s). Train preference: ${scheduleData.trainNumber}. Please schedule this booking for ${scheduleData.preferredTime}${scheduleData.bookingType === 'tatkal' ? ' and send me payment reminders.' : '.'}`;
                        
                        const userMessage: Message = {
                          id: `user-${Date.now()}`,
                          content: message,
                          sender: "user",
                          timestamp: new Date(),
                        };
                        
                        setMessages(prev => [...prev, userMessage]);
                        sendMessage(message);
                        setShowScheduleInterface(false);
                      }}
                    >
                      {scheduleData.bookingType === 'tatkal' ? 'Schedule Tatkal Booking' : 'Schedule Booking'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardFooter>
      
      {/* Voice Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
            <DialogDescription>
              Configure voice input and speech output settings for the chatbot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-enabled" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Enable Voice Output
              </Label>
              <Switch
                id="voice-enabled"
                checked={voiceSettings.voiceEnabled}
                onCheckedChange={(checked) => 
                  setVoiceSettings(prev => ({ ...prev, voiceEnabled: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="speech-enabled" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Enable Voice Input
              </Label>
              <Switch
                id="speech-enabled"
                checked={voiceSettings.speechEnabled}
                onCheckedChange={(checked) => 
                  setVoiceSettings(prev => ({ ...prev, speechEnabled: checked }))
                }
              />
            </div>
            
            {voiceSettings.voiceEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Select Voice</Label>
                  <select 
                    id="voice-select"
                    className="w-full p-2 border rounded-md"
                    value={voiceSettings.voice?.name || ""}
                    onChange={(e) => {
                      const selectedVoice = voices.find(voice => voice.name === e.target.value) || null;
                      setVoiceSettings(prev => ({ ...prev, voice: selectedVoice }));
                    }}
                  >
                    {voices.length === 0 && (
                      <option value="">No voices available</option>
                    )}
                    {voices.map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Volume: {Math.round(voiceSettings.volume * 100)}%</span>
                  </Label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => 
                      setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Speed: {voiceSettings.rate}x</span>
                  </Label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => 
                      setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Pitch: {voiceSettings.pitch}</span>
                  </Label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => 
                      setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                if (voiceSettings.voiceEnabled && voiceSettings.voice) {
                  speakText("This is a test of the voice settings. You can adjust the volume, speed, and pitch to your preference.");
                }
              }}
            >
              Test Voice
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Help & Information Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>RailYatri Connect Assistant Help</DialogTitle>
            <DialogDescription>
              Learn how to use the voice-enabled AI assistant to make your train travel easier.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="voice">Voice Usage</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">What can Ask Disha do?</h3>
                <p className="text-sm">Ask Disha is your AI-powered travel assistant that can help with:</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Answering questions about train schedules and station information</li>
                  <li>Checking PNR status and tracking your bookings</li>
                  <li>Helping you book, cancel, or transfer tickets</li>
                  <li>Providing real-time platform updates and train statuses</li>
                  <li>Offering journey planning advice and fare information</li>
                  <li>Assisting with payment and refund queries</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Sample Questions</h3>
                <p className="text-sm">Try asking questions like:</p>
                <div className="space-y-1 text-sm pl-5">
                  <p>"When is the next train from Delhi to Mumbai?"</p>
                  <p>"What's the status of my PNR number 1234567890?"</p>
                  <p>"How can I transfer my ticket to someone else?"</p>
                  <p>"What platform is Rajdhani Express arriving at?"</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="voice" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Voice Commands</h3>
                <p className="text-sm">The assistant supports voice commands for a hands-free experience:</p>
                <ol className="text-sm list-decimal pl-5 space-y-1">
                  <li>Click the microphone icon to start voice input</li>
                  <li>Speak clearly into your microphone</li>
                  <li>The assistant will automatically process your query when you finish speaking</li>
                  <li>Click the microphone icon again to stop if needed</li>
                </ol>
              </div>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="font-semibold flex items-center text-amber-800 gap-2 mb-1">
                  <Info className="h-4 w-4" />
                  Permissions Required
                </h3>
                <p className="text-sm text-amber-700">Your browser will ask for microphone permission when you first use voice input. You must approve this to use voice features.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Voice Output</h3>
                <p className="text-sm">The assistant can read responses aloud. Configure voice, volume, speed and pitch in Settings.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Privacy Information</h3>
                <p className="text-sm">We take your privacy seriously:</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Voice data is processed on your device and is not stored permanently</li>
                  <li>Chat messages are stored temporarily to maintain conversation context</li>
                  <li>Personal information like PNR numbers are handled securely</li>
                  <li>You can clear your chat history at any time</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Data Usage</h3>
                <p className="text-sm">When you use the AI assistant:</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Your queries are sent to our secure servers for processing</li>
                  <li>Voice recognition is handled by your browser's built-in capabilities</li>
                  <li>We may use anonymized data to improve the assistant's responses</li>
                  <li>We never sell your personal information or conversation data</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button onClick={() => setHelpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Default export for backward compatibility
export default Chatbot;