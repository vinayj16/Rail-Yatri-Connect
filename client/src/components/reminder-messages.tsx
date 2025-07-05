import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "./ui/form";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, BellRing, Calendar, Clock, Check, X, Settings, PhoneCall, Mail, MessageSquare } from "lucide-react";
import { z } from "zod";

// Define types for reminder messages
type ReminderType = "PAYMENT" | "JOURNEY" | "CHECK_IN" | "COACH_POSITION" | "PLATFORM" | "DELAY" | "CUSTOM";
type ReminderStatus = "PENDING" | "SENT" | "FAILED" | "CANCELLED";
type ReminderMethod = "SMS" | "EMAIL" | "APP" | "WHATSAPP";

interface Reminder {
  id: number;
  bookingId: number;
  type: ReminderType;
  message: string;
  scheduledFor: Date;
  status: ReminderStatus;
  method: ReminderMethod;
  sentAt?: Date;
  readAt?: Date;
}

interface ReminderMessagesProps {
  bookingId: number;
  pnr: string;
  journeyDate: Date;
}

// Validation schema for new reminders
const reminderFormSchema = z.object({
  type: z.enum(["PAYMENT", "JOURNEY", "CHECK_IN", "COACH_POSITION", "PLATFORM", "DELAY", "CUSTOM"]),
  message: z.string().min(5, {
    message: "Message must be at least 5 characters.",
  }).max(200, {
    message: "Message cannot be longer than 200 characters.",
  }),
  method: z.enum(["SMS", "EMAIL", "APP", "WHATSAPP"]),
  scheduledFor: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: "Please select a valid date and time."
  }),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export default function ReminderMessages({ bookingId, pnr, journeyDate }: ReminderMessagesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isAddingReminder, setIsAddingReminder] = useState<boolean>(false);
  
  // Form for creating new reminders
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      type: "JOURNEY",
      message: "",
      method: "APP",
      scheduledFor: new Date(new Date(journeyDate).getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 1 day before journey
    },
  });
  
  // Get reminders for this booking
  const { data: reminders, isLoading, error } = useQuery<Reminder[]>({
    queryKey: ['/api/bookings', bookingId, 'reminders'],
    queryFn: async () => {
      // For demonstration purposes, generate mock data
      // In a real application, this would be an API call
      return generateMockReminders(bookingId, journeyDate);
    },
  });
  
  // Mutation for creating a new reminder
  const createReminderMutation = useMutation({
    mutationFn: async (data: ReminderFormValues) => {
      // In a real application, this would call an API
      // For now, we'll simulate success
      return {
        id: Math.floor(Math.random() * 1000),
        bookingId,
        ...data,
        scheduledFor: new Date(data.scheduledFor),
        status: "PENDING" as ReminderStatus,
      };
    },
    onSuccess: () => {
      // Invalidate and refetch reminders
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', bookingId, 'reminders'] });
      
      toast({
        title: "Reminder created",
        description: "Your reminder has been scheduled successfully.",
      });
      
      // Close the dialog and reset form
      setIsAddingReminder(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for cancelling a reminder
  const cancelReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      // In a real application, this would call an API
      // For now, we'll simulate success
      return reminderId;
    },
    onSuccess: (reminderId) => {
      // Invalidate and refetch reminders
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', bookingId, 'reminders'] });
      
      toast({
        title: "Reminder cancelled",
        description: "The reminder has been cancelled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filtering reminders based on active tab
  const getFilteredReminders = (): Reminder[] => {
    if (!reminders) return [];
    
    switch (activeTab) {
      case "pending":
        return reminders.filter(r => r.status === "PENDING");
      case "sent":
        return reminders.filter(r => r.status === "SENT");
      case "failed":
        return reminders.filter(r => r.status === "FAILED" || r.status === "CANCELLED");
      default:
        return reminders;
    }
  };
  
  // Generate mock reminders for demonstration
  const generateMockReminders = (bookingId: number, journeyDate: Date): Reminder[] => {
    const journey = new Date(journeyDate);
    const now = new Date();
    const isPastJourney = journey < now;
    
    const mockReminders: Reminder[] = [
      {
        id: 1,
        bookingId,
        type: "PAYMENT",
        message: "Reminder: Your payment for PNR " + pnr + " is due in 24 hours. Please complete the payment to confirm your booking.",
        scheduledFor: new Date(journey.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before journey
        status: isPastJourney ? "SENT" : "PENDING",
        method: "APP",
        sentAt: isPastJourney ? new Date(journey.getTime() - 2 * 24 * 60 * 60 * 1000) : undefined,
        readAt: isPastJourney ? new Date(journey.getTime() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000) : undefined // 30 minutes after sent
      },
      {
        id: 2,
        bookingId,
        type: "JOURNEY",
        message: "Your journey from New Delhi to Mumbai is tomorrow. Be at the station 30 minutes before departure. Safe travels!",
        scheduledFor: new Date(journey.getTime() - 24 * 60 * 60 * 1000), // 1 day before journey
        status: isPastJourney ? "SENT" : "PENDING",
        method: "SMS",
        sentAt: isPastJourney ? new Date(journey.getTime() - 24 * 60 * 60 * 1000) : undefined,
      },
      {
        id: 3,
        bookingId,
        type: "CHECK_IN",
        message: "Check-in for your journey (PNR: " + pnr + ") is now available. Download your e-ticket from the app.",
        scheduledFor: new Date(journey.getTime() - 4 * 60 * 60 * 1000), // 4 hours before journey
        status: isPastJourney ? "SENT" : "PENDING",
        method: "EMAIL",
        sentAt: isPastJourney ? new Date(journey.getTime() - 4 * 60 * 60 * 1000) : undefined,
      },
      {
        id: 4,
        bookingId,
        type: "PLATFORM",
        message: "Your train will arrive on Platform 5. The coach position chart is now available. Check the app for details.",
        scheduledFor: new Date(journey.getTime() - 2 * 60 * 60 * 1000), // 2 hours before journey
        status: isPastJourney ? "SENT" : "PENDING",
        method: "APP",
        sentAt: isPastJourney ? new Date(journey.getTime() - 2 * 60 * 60 * 1000) : undefined,
      }
    ];
    
    // If journey is in the past, add a delay notification
    if (isPastJourney) {
      mockReminders.push({
        id: 5,
        bookingId,
        type: "DELAY",
        message: "Your train is running 15 minutes late. The new expected arrival time is " + new Date(journey.getTime() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scheduledFor: new Date(journey.getTime() + 5 * 60 * 60 * 1000), // 5 hours into journey
        status: "SENT",
        method: "SMS",
        sentAt: new Date(journey.getTime() + 5 * 60 * 60 * 1000),
      });
    }
    
    return mockReminders;
  };
  
  // Handle form submission
  const onSubmit = (values: ReminderFormValues) => {
    createReminderMutation.mutate(values);
  };
  
  // Get notification method icon
  const getMethodIcon = (method: ReminderMethod) => {
    switch (method) {
      case "SMS": return <PhoneCall className="h-4 w-4" />;
      case "EMAIL": return <Mail className="h-4 w-4" />;
      case "APP": return <BellRing className="h-4 w-4" />;
      case "WHATSAPP": return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  // Get reminder type badge color
  const getTypeBadgeColor = (type: ReminderType): string => {
    switch (type) {
      case "PAYMENT": return "bg-amber-100 border-amber-500 text-amber-800";
      case "JOURNEY": return "bg-green-100 border-green-500 text-green-800";
      case "CHECK_IN": return "bg-blue-100 border-blue-500 text-blue-800";
      case "COACH_POSITION": return "bg-indigo-100 border-indigo-500 text-indigo-800";
      case "PLATFORM": return "bg-purple-100 border-purple-500 text-purple-800";
      case "DELAY": return "bg-red-100 border-red-500 text-red-800";
      case "CUSTOM": return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: ReminderStatus) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4 text-amber-500" />;
      case "SENT": return <Check className="h-4 w-4 text-green-500" />;
      case "FAILED": 
      case "CANCELLED": 
        return <X className="h-4 w-4 text-red-500" />;
    }
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get the default reminder message based on type
  const getDefaultMessage = (type: ReminderType): string => {
    switch (type) {
      case "PAYMENT":
        return `Reminder: Your payment for PNR ${pnr} is due soon. Please complete to confirm your booking.`;
      case "JOURNEY":
        return `Your journey is scheduled for ${new Date(journeyDate).toLocaleDateString()}. Be at the station 30 minutes before departure.`;
      case "CHECK_IN":
        return `Check-in for your journey (PNR: ${pnr}) is now available. Download your e-ticket from the app.`;
      case "COACH_POSITION":
        return `Coach position for your train is now available. Check the app for details.`;
      case "PLATFORM":
        return `Platform information for your train is now available.`;
      case "DELAY":
        return `Important update regarding your journey with PNR ${pnr}.`;
      case "CUSTOM":
        return "";
    }
  };
  
  // Handle reminder type change
  const handleReminderTypeChange = (type: ReminderType) => {
    const defaultMessage = getDefaultMessage(type);
    form.setValue("type", type);
    form.setValue("message", defaultMessage);
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Reminder Messages
          </CardTitle>
          <CardDescription>Loading your reminders...</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !reminders) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Reminder Messages
          </CardTitle>
          <CardDescription>Could not load your reminders</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex flex-col items-center justify-center gap-4">
          <X className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground text-center">
            There was an error loading your reminder messages. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Reminder Messages
            </CardTitle>
            <CardDescription>
              PNR: {pnr} | Journey Date: {new Date(journeyDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Dialog open={isAddingReminder} onOpenChange={setIsAddingReminder}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <BellRing className="h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
                <DialogDescription>
                  Set up a reminder for your upcoming journey. Choose a type, method, and when you want to be notified.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Type</FormLabel>
                        <Select
                          onValueChange={(value) => handleReminderTypeChange(value as ReminderType)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reminder type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PAYMENT">Payment Reminder</SelectItem>
                            <SelectItem value="JOURNEY">Journey Reminder</SelectItem>
                            <SelectItem value="CHECK_IN">Check-in Reminder</SelectItem>
                            <SelectItem value="COACH_POSITION">Coach Position</SelectItem>
                            <SelectItem value="PLATFORM">Platform Update</SelectItem>
                            <SelectItem value="DELAY">Delay Notification</SelectItem>
                            <SelectItem value="CUSTOM">Custom Message</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the reminder message (max 200 characters).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a notification method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="APP">In-App</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>When to Send</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormDescription>
                          Select when you want to receive this reminder.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddingReminder(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createReminderMutation.isPending}
                    >
                      {createReminderMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create Reminder
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="relative">
              All
              <Badge variant="secondary" className="ml-1 text-xs">{reminders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              <Badge variant="secondary" className="ml-1 text-xs">
                {reminders.filter(r => r.status === "PENDING").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sent" className="relative">
              Sent
              <Badge variant="secondary" className="ml-1 text-xs">
                {reminders.filter(r => r.status === "SENT").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="failed" className="relative">
              Failed/Cancelled
              <Badge variant="secondary" className="ml-1 text-xs">
                {reminders.filter(r => r.status === "FAILED" || r.status === "CANCELLED").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="space-y-4">
            {getFilteredReminders().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reminders found in this category.
              </div>
            ) : (
              getFilteredReminders().map((reminder) => (
                <div 
                  key={reminder.id}
                  className="p-4 border rounded-md flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1 items-center">
                      {getMethodIcon(reminder.method)}
                      <Badge variant="outline" className={getTypeBadgeColor(reminder.type)}>
                        {reminder.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {getStatusIcon(reminder.status)}
                      <span className="capitalize">{reminder.status.toLowerCase()}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm">{reminder.message}</p>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Scheduled: {formatDate(reminder.scheduledFor)}</span>
                    </div>
                    
                    {reminder.sentAt && (
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Sent: {formatDate(reminder.sentAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {reminder.status === "PENDING" && (
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive"
                        onClick={() => cancelReminderMutation.mutate(reminder.id)}
                        disabled={cancelReminderMutation.isPending}
                      >
                        {cancelReminderMutation.isPending && cancelReminderMutation.variables === reminder.id && (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        Cancel Reminder
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-4 flex justify-between">
        <span className="text-xs text-muted-foreground">
          Showing {getFilteredReminders().length} of {reminders.length} reminders
        </span>
        <button 
          onClick={() => {
            toast({
              title: "Reminder Settings",
              description: "Notification preferences updated successfully",
            });
          }}
          className="text-xs flex items-center gap-1 text-primary"
        >
          <Settings className="h-3 w-3" />
          Notification Settings
        </button>
      </CardFooter>
    </Card>
  );
}