import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Loader2 } from "lucide-react";

const passengerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  age: z.coerce.number().min(1).max(120),
  gender: z.string().min(1, { message: "Gender is required" }),
  berthPreference: z.string().optional(),
});

const contactSchema = z.object({
  mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const bookingFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1, { message: "At least one passenger is required" }),
  contact: contactSchema,
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  train: any;
  trainClass: any;
  journeyDate: Date;
}

export default function BookingModal({ 
  open, 
  onClose, 
  train, 
  trainClass,
  journeyDate
}: BookingModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // If no train is selected, don't render the modal content
  if (!train || !trainClass) {
    return <Dialog open={open} onOpenChange={onClose} />;
  }
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      passengers: [
        { name: "", age: undefined, gender: "", berthPreference: "" }
      ],
      contact: {
        mobile: user?.phone || "",
        email: user?.email || "",
      },
    },
  });
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const payload = {
        trainId: train.id,
        journeyDate: format(journeyDate, "yyyy-MM-dd"),
        classCode: trainClass.classCode,
        passengers: data.passengers,
        totalFare: calculateTotalFare(),
      };
      
      const res = await apiRequest("POST", "/api/bookings", payload);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking successful",
        description: `Your PNR number is ${data.pnr}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message || "Failed to book tickets",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: BookingFormValues) => {
    mutate(values);
  };
  
  const addPassenger = () => {
    const passengers = form.getValues("passengers");
    if (passengers.length >= 6) {
      toast({
        title: "Maximum limit reached",
        description: "You can book tickets for maximum 6 passengers at a time",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("passengers", [
      ...passengers,
      { name: "", age: undefined, gender: "", berthPreference: "" }
    ]);
  };
  
  const removePassenger = (index: number) => {
    const passengers = form.getValues("passengers");
    if (passengers.length <= 1) {
      return;
    }
    
    form.setValue(
      "passengers", 
      passengers.filter((_, i) => i !== index)
    );
  };
  
  const passengers = form.watch("passengers");
  
  const calculateTotalFare = () => {
    if (!trainClass) return 0;
    
    const baseFare = trainClass.fare * passengers.length;
    const reservationCharge = 40 * passengers.length;
    const superfastCharge = 45 * passengers.length;
    const gst = Math.round(baseFare * 0.05);
    
    return baseFare + reservationCharge + superfastCharge + gst;
  };
  
  const baseFare = trainClass.fare * passengers.length;
  const reservationCharge = 40 * passengers.length;
  const superfastCharge = 45 * passengers.length;
  const gst = Math.round(baseFare * 0.05);
  const totalFare = baseFare + reservationCharge + superfastCharge + gst;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Passenger Details</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="font-semibold">{train.name} ({train.number})</h3>
              <div className="text-sm text-gray-600">
                {train.sourceStation?.code} → {train.destinationStation?.code} | {format(journeyDate, "EEE, dd MMM")}
              </div>
            </div>
            <div className="mt-2 md:mt-0">
              <div className="text-sm font-medium">{trainClass.className} ({trainClass.classCode})</div>
              <div className="text-sm text-green-600">
                {trainClass.availableSeats > 0 
                  ? `Available ${trainClass.availableSeats}`
                  : trainClass.availableSeats <= 0 && trainClass.availableSeats >= -10
                    ? `RAC ${Math.abs(trainClass.availableSeats)}`
                    : `WL ${Math.abs(trainClass.availableSeats)}`
                }
              </div>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Add Passengers</h3>
              
              {passengers.map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Passenger {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePassenger(index)}
                      disabled={passengers.length <= 1}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`passengers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input type="number" min={1} max={120} {...field} />
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
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Male</SelectItem>
                              <SelectItem value="F">Female</SelectItem>
                              <SelectItem value="O">Other</SelectItem>
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
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="No Preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No Preference</SelectItem>
                              <SelectItem value="LB">Lower</SelectItem>
                              <SelectItem value="MB">Middle</SelectItem>
                              <SelectItem value="UB">Upper</SelectItem>
                              <SelectItem value="SL">Side Lower</SelectItem>
                              <SelectItem value="SU">Side Upper</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              {/* Add Passenger Button */}
              <Button
                type="button"
                variant="outline"
                onClick={addPassenger}
                className="flex items-center text-primary hover:text-primary/80 font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Passenger
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact.mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Payment Summary</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <span>Base Fare ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})</span>
                  <span>₹{baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Reservation Charges</span>
                  <span>₹{reservationCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Superfast Charges</span>
                  <span>₹{superfastCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>GST</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold mt-3 pt-3 border-t border-gray-300">
                  <span>Total Amount</span>
                  <span>₹{totalFare.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
