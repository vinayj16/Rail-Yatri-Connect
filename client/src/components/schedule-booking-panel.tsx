import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, CalendarDays, Clock, User, Train, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Separator } from "./ui/separator";
import { TimePickerDemo } from "@/components/ui/time-picker";

type ScheduleBookingPanelProps = {
  onClose: () => void;
  onScheduled: (data: any) => void;
  isVisible: boolean;
  trainId?: number;
  classCode?: string;
};

const passengerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  berthPreference: z.string().optional(),
});

const scheduledBookingSchema = z.object({
  trainId: z.coerce.number().positive("Train is required"),
  classCode: z.string().min(1, "Class is required"),
  journeyDate: z.date({ required_error: "Journey date is required" }),
  scheduledAt: z.date({ required_error: "Scheduled booking date and time is required" }),
  bookingType: z.string().default("general"),
  paymentRemindersEnabled: z.boolean().default(true),
  reminderFrequency: z.coerce.number().min(1).default(24),
  maxReminders: z.coerce.number().min(1).default(3),
  passengers: z.array(passengerSchema).min(1, "At least one passenger is required"),
});

type FormValues = z.infer<typeof scheduledBookingSchema>;

export default function ScheduleBookingPanel({ 
  onClose, 
  onScheduled, 
  isVisible, 
  trainId,
  classCode
}: ScheduleBookingPanelProps) {
  const { toast } = useToast();
  const [passengerCount, setPassengerCount] = useState(1);
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Modified for type safety - replacing useNavigate

  const form = useForm<FormValues>({
    resolver: zodResolver(scheduledBookingSchema),
    defaultValues: {
      trainId: trainId || 0,
      classCode: classCode || "",
      bookingType: "general",
      paymentRemindersEnabled: true,
      reminderFrequency: 24,
      maxReminders: 3,
      passengers: [{ name: "", age: 0, gender: "", berthPreference: "" }],
    },
  });

  const watchBookingType = form.watch("bookingType");
  const watchPaymentReminders = form.watch("paymentRemindersEnabled");

  const handleAddPassenger = () => {
    const currentPassengers = form.getValues("passengers");
    form.setValue("passengers", [
      ...currentPassengers, 
      { name: "", age: 0, gender: "", berthPreference: "" }
    ]);
    setPassengerCount(prev => prev + 1);
  };

  const handleRemovePassenger = (index: number) => {
    const currentPassengers = form.getValues("passengers");
    if (currentPassengers.length > 1) {
      form.setValue(
        "passengers", 
        currentPassengers.filter((_, i) => i !== index)
      );
      setPassengerCount(prev => prev - 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsScheduling(true);
    try {
      // Format the scheduled time correctly
      const scheduledTime = data.scheduledAt;
      
      // Send to backend
      const response = await fetch("/api/scheduled-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule booking");
      }

      const result = await response.json();
      
      // Show success message
      toast({
        title: "Booking Scheduled",
        description: `Your booking has been scheduled for ${format(scheduledTime, "PPP 'at' p")}`,
      });
      
      onScheduled(result);
    } catch (error) {
      console.error("Error scheduling booking:", error);
      toast({
        title: "Scheduling Failed",
        description: error instanceof Error ? error.message : "Failed to schedule booking",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Schedule Automatic Booking
        </CardTitle>
        <CardDescription>
          Set up an automatic booking to be processed at your chosen date and time
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Train className="h-5 w-5" />
                  Train Details
                </h3>

                <FormField
                  control={form.control}
                  name="trainId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Train Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter train number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Train number from your search results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel Class</FormLabel>
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

                <FormField
                  control={form.control}
                  name="journeyDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Journey Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date of your journey
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select booking type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="tatkal">Tatkal</SelectItem>
                        </SelectContent>
                      </Select>
                      {watchBookingType === "tatkal" && (
                        <FormDescription className="text-amber-500 flex items-center gap-1">
                          <Info className="h-4 w-4" />
                          For Tatkal, we recommend scheduling at 10:00 AM, one day before journey
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Scheduling Details
                </h3>

                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Schedule For</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP 'at' p")
                              ) : (
                                <span>Pick date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3 border-b">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  const currentTime = field.value 
                                    ? new Date(field.value) 
                                    : new Date();
                                  date.setHours(currentTime.getHours());
                                  date.setMinutes(currentTime.getMinutes());
                                  field.onChange(date);
                                }
                              }}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </div>
                          <div className="p-3">
                            <TimePickerDemo 
                              setDate={(date) => {
                                field.onChange(date);
                              }} 
                              date={field.value || new Date()}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When should the system try to book your tickets
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentRemindersEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Payment Reminders</FormLabel>
                        <FormDescription>
                          Receive reminders to complete payment after booking
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchPaymentReminders && (
                  <>
                    <FormField
                      control={form.control}
                      name="reminderFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reminder Frequency (hours)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormDescription>
                            How often to send payment reminders (in hours)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxReminders"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Reminders</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={10} {...field} />
                          </FormControl>
                          <FormDescription>
                            Maximum number of reminders to send
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Passenger Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-5 w-5" />
                Passenger Details
              </h3>

              {Array.from({ length: passengerCount }).map((_, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Passenger {index + 1}</h4>
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemovePassenger(index)}
                        type="button"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`passengers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`passengers.${index}.age`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={120} placeholder="Enter age" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`passengers.${index}.gender`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`passengers.${index}.berthPreference`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Berth Preference</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preference (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Lower">Lower</SelectItem>
                              <SelectItem value="Middle">Middle</SelectItem>
                              <SelectItem value="Upper">Upper</SelectItem>
                              <SelectItem value="Side Lower">Side Lower</SelectItem>
                              <SelectItem value="Side Upper">Side Upper</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Optional berth preference
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddPassenger}
                className="w-full"
              >
                + Add Another Passenger
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isScheduling}>
              {isScheduling ? "Scheduling..." : "Schedule Booking"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}