import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Share2, Download, MapPin } from "lucide-react";
import { format, parse } from "date-fns";

// Import our new components
import LiveTrainMap from "./live-train-map";
import SeatingArrangement from "./seating-arrangement";
import TimeStatus from "./time-status";
import ReminderMessages from "./reminder-messages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const pnrFormSchema = z.object({
  pnrNumber: z.string().length(10, { message: "PNR must be 10 digits" }),
});

type PnrFormValues = z.infer<typeof pnrFormSchema>;

export default function PnrChecker() {
  const { toast } = useToast();
  const [pnrDetails, setPnrDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  
  const form = useForm<PnrFormValues>({
    resolver: zodResolver(pnrFormSchema),
    defaultValues: {
      pnrNumber: "",
    },
  });
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: PnrFormValues) => {
      const res = await apiRequest("POST", "/api/pnr/status", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setPnrDetails(data);
      // Reset to basic tab when new PNR details are loaded
      setActiveTab("basic");
    },
    onError: (error: Error) => {
      toast({
        title: "PNR check failed",
        description: error.message || "Invalid PNR number",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: PnrFormValues) => {
    setPnrDetails(null);
    mutate(values);
  };
  
  // Handle refreshing PNR status
  const handleRefresh = () => {
    if (form.getValues().pnrNumber) {
      mutate(form.getValues());
      toast({
        title: "Refreshing PNR status",
        description: "Getting the latest information for your booking",
      });
    }
  };
  
  // Handle sharing PNR details
  const handleShare = () => {
    if (!pnrDetails) return;
    
    const shareText = `
      PNR: ${pnrDetails.pnr}
      Train: ${pnrDetails.train.name} (${pnrDetails.train.number})
      Journey Date: ${pnrDetails.journeyDate}
      Status: ${pnrDetails.status}
    `;
    
    if (navigator.share) {
      navigator.share({
        title: `PNR ${pnrDetails.pnr} Details`,
        text: shareText,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "PNR details copied",
          description: "The information has been copied to your clipboard.",
        });
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Check PNR Status</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <FormField
                control={form.control}
                name="pnrNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PNR Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 10-digit PNR number" 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">e.g. 8104852637</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Status"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* PNR Results */}
      {pnrDetails && (
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">PNR Status: {pnrDetails.pnr}</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex flex-col md:flex-row justify-between mb-2">
              <div>
                <div className="font-medium">{pnrDetails.train.name} ({pnrDetails.train.number})</div>
                <div className="text-sm text-gray-600">
                  Journey Date: {pnrDetails.journeyDate}
                </div>
              </div>
              <div className="mt-2 md:mt-0">
                <div className="text-sm font-medium">Class: {pnrDetails.classCode}</div>
                <div className="text-sm text-green-600">Status: {pnrDetails.status}</div>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="time">Time Status</TabsTrigger>
              <TabsTrigger value="location">Live Location</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <h4 className="font-medium text-md mb-2">Passenger Details</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">#</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Age/Gender</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Seat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pnrDetails.passengers.map((passenger: any, index: number) => (
                      <tr key={passenger.id} className="border-b">
                        <td className="py-2 px-3 text-sm">{index + 1}</td>
                        <td className="py-2 px-3 text-sm">{passenger.name}</td>
                        <td className="py-2 px-3 text-sm">{passenger.age}/{passenger.gender}</td>
                        <td className="py-2 px-3 text-sm">{passenger.status}</td>
                        <td className="py-2 px-3 text-sm">{passenger.seatNumber || 'NA'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <SeatingArrangement
                  trainId={pnrDetails.train.id}
                  trainNumber={pnrDetails.train.number}
                  trainName={pnrDetails.train.name}
                  classCode={pnrDetails.classCode}
                  journeyDate={new Date(pnrDetails.journeyDate)}
                  readOnly={true}
                  selectedSeats={pnrDetails.passengers.map((p: any) => p.seatNumber).filter(Boolean)}
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download E-Ticket
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Coach Position
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="time">
              <TimeStatus
                trainId={pnrDetails.train.id}
                pnr={pnrDetails.pnr}
                journeyDate={new Date(pnrDetails.journeyDate)}
                status={pnrDetails.status}
              />
            </TabsContent>
            
            <TabsContent value="location">
              <LiveTrainMap
                trainId={pnrDetails.train.id}
                trainNumber={pnrDetails.train.number}
                trainName={pnrDetails.train.name}
              />
            </TabsContent>
            
            <TabsContent value="reminders">
              <ReminderMessages
                bookingId={pnrDetails.bookingId || 1} // Fallback for demo
                pnr={pnrDetails.pnr}
                journeyDate={new Date(pnrDetails.journeyDate)}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
