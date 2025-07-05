import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, TicketIcon, RefreshCw, UserPlus, Users, CheckCircle, AlertTriangle } from "lucide-react";

// Define the ticket transfer form schema
const transferFormSchema = z.object({
  pnrNumber: z.string().length(10, { message: "PNR must be 10 digits" }),
  transferType: z.enum(["gift", "resell", "exchange"]),
  recipientEmail: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().max(200, { message: "Message cannot exceed 200 characters" }).optional(),
  price: z.coerce.number().min(0).optional(),
});

const exchangeFormSchema = z.object({
  pnrNumber: z.string().length(10, { message: "PNR must be 10 digits" }),
  preferredDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, {
    message: "Please select a valid future date.",
  }),
  preferredTrainNumber: z.string().optional(),
  preferredClass: z.enum(["SL", "3A", "2A", "1A", "CC", "EC"]),
  exchangeReason: z.enum(["schedule_change", "family_emergency", "business_trip", "medical", "other"]),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;
type ExchangeFormValues = z.infer<typeof exchangeFormSchema>;

// Define the transfer history item type
type TransferHistoryItem = {
  id: number;
  pnr: string;
  transferType: "gift" | "resell" | "exchange";
  status: "pending" | "completed" | "cancelled" | "expired";
  recipientEmail?: string;
  timestamp: Date;
  trainNumber: string;
  trainName: string;
  originalJourneyDate: Date;
  newJourneyDate?: Date;
  price?: number;
};

interface TicketTransferProps {
  userId?: number;
  onClose?: () => void;
}

export default function TicketTransfer({ userId, onClose }: TicketTransferProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("transfer");
  const [transferComplete, setTransferComplete] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  
  // Form for direct transfer (gift or resell)
  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      pnrNumber: "",
      transferType: "gift",
      recipientEmail: "",
      message: "",
      price: 0,
    },
  });
  
  // Form for ticket exchange
  const exchangeForm = useForm<ExchangeFormValues>({
    resolver: zodResolver(exchangeFormSchema),
    defaultValues: {
      pnrNumber: "",
      preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
      preferredClass: "SL",
      exchangeReason: "schedule_change",
    },
  });
  
  // Fetch user's bookings for PNR dropdown
  const { data: userBookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/bookings");
        return await res.json();
      } catch (error) {
        // Return empty array if not logged in or error
        return [];
      }
    },
    enabled: !!userId,
  });
  
  // Fetch transfer history
  const { data: transferHistory, isLoading: loadingHistory } = useQuery<TransferHistoryItem[]>({
    queryKey: ['/api/ticket-transfers'],
    queryFn: async () => {
      // In a real app, this would call an API
      // For now, simulate with mock data
      return [
        {
          id: 1,
          pnr: "1234567890",
          transferType: "gift",
          status: "completed",
          recipientEmail: "friend@example.com",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          trainNumber: "12301",
          trainName: "Howrah Rajdhani",
          originalJourneyDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
        {
          id: 2,
          pnr: "9876543210",
          transferType: "exchange",
          status: "pending",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          trainNumber: "12259",
          trainName: "Sealdah Duronto",
          originalJourneyDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          newJourneyDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: 3,
          pnr: "5678901234",
          transferType: "resell",
          status: "cancelled",
          recipientEmail: "buyer@example.com",
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          trainNumber: "12302",
          trainName: "Howrah Rajdhani",
          originalJourneyDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          price: 850,
        },
      ];
    },
    enabled: !!userId,
  });
  
  // Mutation for ticket transfer
  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormValues) => {
      // This would be a real API call in production
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful response
      return {
        success: true,
        transferId: Math.floor(Math.random() * 10000),
        message: "Ticket transfer initiated successfully",
      };
    },
    onSuccess: () => {
      setTransferComplete(true);
      toast({
        title: "Transfer Initiated",
        description: "The ticket transfer request has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "An error occurred during the transfer process",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for ticket exchange
  const exchangeMutation = useMutation({
    mutationFn: async (data: ExchangeFormValues) => {
      // This would be a real API call in production
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful response
      return {
        success: true,
        exchangeId: Math.floor(Math.random() * 10000),
        message: "Ticket exchange request submitted successfully",
      };
    },
    onSuccess: () => {
      setTransferComplete(true);
      toast({
        title: "Exchange Requested",
        description: "Your ticket exchange request has been submitted for processing.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Exchange Failed",
        description: error.message || "An error occurred while processing your exchange request",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission for transfer
  const onTransferSubmit = (values: TransferFormValues) => {
    transferMutation.mutate(values);
  };
  
  // Handle form submission for exchange
  const onExchangeSubmit = (values: ExchangeFormValues) => {
    exchangeMutation.mutate(values);
  };
  
  // Reset the form and state
  const handleReset = () => {
    setTransferComplete(false);
    transferForm.reset();
    exchangeForm.reset();
    setActiveTab("transfer");
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case "expired":
        return <Badge className="bg-gray-500">Expired</Badge>;
      default:
        return <Badge className="bg-blue-500">{status}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Handle ticket selection from dropdown
  const handleTicketSelect = (pnr: string) => {
    if (!userBookings) return;
    
    const ticket = userBookings.find((booking: any) => booking.pnr === pnr);
    if (ticket) {
      setSelectedTicket(ticket);
      
      // Set form values based on selected ticket
      if (activeTab === "transfer") {
        transferForm.setValue("pnrNumber", ticket.pnr);
      } else {
        exchangeForm.setValue("pnrNumber", ticket.pnr);
      }
    }
  };
  
  // Render success message after transfer/exchange
  const renderSuccessMessage = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="rounded-full bg-green-100 p-3 mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {activeTab === "transfer" ? "Transfer Initiated" : "Exchange Requested"}
      </h3>
      <p className="text-center text-muted-foreground mb-6">
        {activeTab === "transfer"
          ? "We've notified the recipient about your ticket transfer. They will need to accept it within 24 hours."
          : "Your exchange request has been submitted. You'll receive updates via email and app notifications."}
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleReset}>Start New Request</Button>
        <Button onClick={() => setActiveTab("history")}>View History</Button>
      </div>
    </div>
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          TrainGo Ticket Transfer
        </CardTitle>
        <CardDescription>
          Transfer, exchange or gift your tickets to friends and family
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="transfer" disabled={transferComplete}>Direct Transfer</TabsTrigger>
            <TabsTrigger value="exchange" disabled={transferComplete}>Exchange Ticket</TabsTrigger>
            <TabsTrigger value="history">Transfer History</TabsTrigger>
          </TabsList>
          
          {transferComplete ? (
            renderSuccessMessage()
          ) : (
            <>
              <TabsContent value="transfer">
                <Form {...transferForm}>
                  <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4">
                    {/* Ticket Selection */}
                    {userBookings && userBookings.length > 0 ? (
                      <div className="mb-6">
                        <FormLabel className="mb-2 block">Select a ticket to transfer</FormLabel>
                        <Select onValueChange={handleTicketSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a ticket from your bookings" />
                          </SelectTrigger>
                          <SelectContent>
                            {userBookings.map((booking: any) => (
                              <SelectItem key={booking.pnr} value={booking.pnr}>
                                {booking.train.number} - {formatDate(new Date(booking.journeyDate))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <FormField
                        control={transferForm.control}
                        name="pnrNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PNR Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter 10-digit PNR" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the PNR of the ticket you want to transfer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Transfer Type */}
                    <FormField
                      control={transferForm.control}
                      name="transferType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transfer Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transfer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gift">Gift (Free Transfer)</SelectItem>
                              <SelectItem value="resell">Resell Ticket</SelectItem>
                              <SelectItem value="exchange">Exchange with Another User</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose how you want to transfer this ticket
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Recipient Email */}
                    <FormField
                      control={transferForm.control}
                      name="recipientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="friend@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            We'll send a notification to this email address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Price (for resell only) */}
                    {transferForm.watch("transferType") === "resell" && (
                      <FormField
                        control={transferForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selling Price (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the amount you want to receive
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Message */}
                    <FormField
                      control={transferForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Add a personal message to the recipient" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Selected Ticket Preview */}
                    {selectedTicket && (
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <h4 className="font-medium text-sm mb-2">Selected Ticket Details</h4>
                        <div className="text-sm">
                          <p><strong>Train:</strong> {selectedTicket.train.number} - {selectedTicket.train.name}</p>
                          <p><strong>Journey Date:</strong> {formatDate(new Date(selectedTicket.journeyDate))}</p>
                          <p><strong>Class:</strong> {selectedTicket.classCode}</p>
                          <p><strong>PNR:</strong> {selectedTicket.pnr}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => onClose && onClose()}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={transferMutation.isPending}
                      >
                        {transferMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Submit Transfer Request"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="exchange">
                <Form {...exchangeForm}>
                  <form onSubmit={exchangeForm.handleSubmit(onExchangeSubmit)} className="space-y-4">
                    {/* Ticket Selection */}
                    {userBookings && userBookings.length > 0 ? (
                      <div className="mb-6">
                        <FormLabel className="mb-2 block">Select a ticket to exchange</FormLabel>
                        <Select onValueChange={handleTicketSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a ticket from your bookings" />
                          </SelectTrigger>
                          <SelectContent>
                            {userBookings.map((booking: any) => (
                              <SelectItem key={booking.pnr} value={booking.pnr}>
                                {booking.train.number} - {formatDate(new Date(booking.journeyDate))}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <FormField
                        control={exchangeForm.control}
                        name="pnrNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PNR Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter 10-digit PNR" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the PNR of the ticket you want to exchange
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Preferred Date */}
                    <FormField
                      control={exchangeForm.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred New Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Choose your preferred travel date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Preferred Train */}
                    <FormField
                      control={exchangeForm.control}
                      name="preferredTrainNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Train (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter train number if you have a preference" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Preferred Class */}
                    <FormField
                      control={exchangeForm.control}
                      name="preferredClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Class</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SL">Sleeper (SL)</SelectItem>
                              <SelectItem value="3A">AC 3 Tier (3A)</SelectItem>
                              <SelectItem value="2A">AC 2 Tier (2A)</SelectItem>
                              <SelectItem value="1A">AC First Class (1A)</SelectItem>
                              <SelectItem value="CC">Chair Car (CC)</SelectItem>
                              <SelectItem value="EC">Executive Chair Car (EC)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Exchange Reason */}
                    <FormField
                      control={exchangeForm.control}
                      name="exchangeReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Exchange</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="schedule_change">Change in Schedule</SelectItem>
                              <SelectItem value="family_emergency">Family Emergency</SelectItem>
                              <SelectItem value="business_trip">Business Trip</SelectItem>
                              <SelectItem value="medical">Medical Reasons</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This helps us process your request faster
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Selected Ticket Preview */}
                    {selectedTicket && (
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <h4 className="font-medium text-sm mb-2">Selected Ticket Details</h4>
                        <div className="text-sm">
                          <p><strong>Train:</strong> {selectedTicket.train.number} - {selectedTicket.train.name}</p>
                          <p><strong>Journey Date:</strong> {formatDate(new Date(selectedTicket.journeyDate))}</p>
                          <p><strong>Class:</strong> {selectedTicket.classCode}</p>
                          <p><strong>PNR:</strong> {selectedTicket.pnr}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => onClose && onClose()}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={exchangeMutation.isPending}
                      >
                        {exchangeMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Submit Exchange Request"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </>
          )}
          
          <TabsContent value="history">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transferHistory && transferHistory.length > 0 ? (
              <div className="space-y-4">
                {transferHistory.map((item) => (
                  <div key={item.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{item.trainName} ({item.trainNumber})</h4>
                        <p className="text-sm text-muted-foreground">PNR: {item.pnr}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transfer Type</p>
                        <p className="capitalize">{item.transferType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p>{formatDate(item.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Original Journey</p>
                        <p>{formatDate(item.originalJourneyDate)}</p>
                      </div>
                      {item.newJourneyDate && (
                        <div>
                          <p className="text-muted-foreground">New Journey</p>
                          <p>{formatDate(item.newJourneyDate)}</p>
                        </div>
                      )}
                      {item.recipientEmail && (
                        <div>
                          <p className="text-muted-foreground">Recipient</p>
                          <p>{item.recipientEmail}</p>
                        </div>
                      )}
                      {item.price !== undefined && (
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p>₹{item.price.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                    
                    {item.status === "pending" && (
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Check Status
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="rounded-full bg-muted p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <TicketIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No transfer history</h3>
                <p className="text-muted-foreground mb-6">You haven't transferred or exchanged any tickets yet.</p>
                <Button onClick={() => setActiveTab("transfer")}>Start a Transfer</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Transfer fees may apply based on ticket type and timing</p>
        <Button variant="link" size="sm" className="text-xs p-0 h-auto">
          Transfer Policy
        </Button>
      </CardFooter>
    </Card>
  );
}