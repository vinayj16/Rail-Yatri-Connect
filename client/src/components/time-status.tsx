import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, Calendar, AlertCircle, Bell, BellRing, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TimeStatusProps {
  trainId: number;
  pnr: string;
  journeyDate: Date;
  status: string;
}

type TimeStatusData = {
  status: string;
  scheduledDeparture: string;
  actualDeparture: string | null;
  scheduledArrival: string;
  estimatedArrival: string | null;
  delay: number | null;
  journeyTime: number;
  platformNumber: string | null;
  nextStationArrival: string | null;
  messages: {
    type: "info" | "warning" | "error" | "success";
    message: string;
  }[];
};

export default function TimeStatus({ trainId, pnr, journeyDate, status }: TimeStatusProps) {
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  // Get time status data
  const { data: timeStatus, isLoading, error, refetch } = useQuery<TimeStatusData>({
    queryKey: ['/api/trains', trainId, 'time-status', pnr],
    queryFn: async () => {
      // In a real implementation, this would be an API call
      // For now, we'll simulate time status data
      return simulateTimeStatusData(status);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Simulate time status data based on booking status
  function simulateTimeStatusData(status: string): TimeStatusData {
    const now = new Date();
    const journey = new Date(journeyDate);
    const isToday = journey.toDateString() === now.toDateString();
    
    // Create different data based on status
    let mockData: TimeStatusData = {
      status: status,
      scheduledDeparture: formatTime(new Date(journey.setHours(10, 30))),
      actualDeparture: null,
      scheduledArrival: formatTime(new Date(journey.setHours(18, 45))),
      estimatedArrival: null,
      delay: 0,
      journeyTime: 8 * 60 + 15, // 8h 15m in minutes
      platformNumber: "4",
      nextStationArrival: null,
      messages: []
    };
    
    // Adjust based on status
    if (status === "CANCELLED") {
      mockData.messages.push({
        type: "error",
        message: "Your train has been cancelled due to operational reasons. You are eligible for a full refund."
      });
    } else if (status === "CONFIRMED") {
      if (isDate1BeforeDate2(now, journey)) {
        // Train journey is in the future
        const daysDiff = Math.ceil((journey.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff <= 1) {
          mockData.messages.push({
            type: "info",
            message: `Your journey starts tomorrow. Departure from platform ${mockData.platformNumber}.`
          });
        } else {
          mockData.messages.push({
            type: "info",
            message: `Your journey is scheduled in ${daysDiff} days. Prepare for a comfortable trip.`
          });
        }
      } else if (isToday) {
        // Journey is today
        mockData.status = "RUNNING";
        mockData.actualDeparture = formatTime(new Date(journey.setHours(10, 45)));
        mockData.delay = 15;
        mockData.estimatedArrival = formatTime(new Date(journey.setHours(19, 0)));
        mockData.nextStationArrival = formatTime(new Date(now.setMinutes(now.getMinutes() + 25)));
        
        mockData.messages.push({
          type: "warning",
          message: `Your train is running ${mockData.delay} minutes late. Current delay may change.`
        });
      } else {
        // Journey is in the past
        mockData.status = "COMPLETED";
        mockData.actualDeparture = formatTime(new Date(journey.setHours(10, 40)));
        mockData.delay = 10;
        mockData.estimatedArrival = formatTime(new Date(journey.setHours(18, 55)));
        
        mockData.messages.push({
          type: "success",
          message: "Your journey has been completed. We hope you had a pleasant trip."
        });
      }
    } else if (status === "WAITING_LIST" || status === "RAC") {
      if (isDate1BeforeDate2(now, journey)) {
        mockData.messages.push({
          type: "warning",
          message: `Your ticket is currently on ${status}. Confirmation chances: Moderate.`
        });
      } else {
        mockData.messages.push({
          type: "error",
          message: `Your ${status} ticket was not confirmed. Please apply for a refund.`
        });
      }
    }
    
    return mockData;
  }
  
  // Helper to format time
  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Helper to compare dates
  function isDate1BeforeDate2(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
  }
  
  // Calculate and update time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!timeStatus) return;
      
      const now = new Date();
      const journey = new Date(journeyDate);
      
      // If train is already departed
      if (timeStatus.status === "RUNNING" || timeStatus.status === "COMPLETED") {
        if (timeStatus.nextStationArrival) {
          const nextArrival = parseTimeString(timeStatus.nextStationArrival);
          const diffMs = nextArrival.getTime() - now.getTime();
          
          if (diffMs > 0) {
            const diffMins = Math.floor(diffMs / 60000);
            setTimeRemaining(`Next station in ${diffMins} min`);
          } else {
            setTimeRemaining("Arriving at station");
          }
        } else {
          setTimeRemaining("In transit");
        }
      } 
      // If train is scheduled in the future
      else if (isDate1BeforeDate2(now, journey)) {
        const diffMs = journey.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
          setTimeRemaining(`${diffDays}d ${diffHrs}h ${diffMins}m`);
        } else if (diffHrs > 0) {
          setTimeRemaining(`${diffHrs}h ${diffMins}m`);
        } else {
          setTimeRemaining(`${diffMins}m`);
        }
      } else {
        setTimeRemaining("Journey time passed");
      }
    };
    
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [timeStatus, journeyDate]);
  
  // Parse time string (HH:MM format) to Date
  function parseTimeString(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  // Get status badge variant
  function getStatusBadgeVariant(status: string): "default" | "destructive" | "outline" | "secondary" | null | undefined {
    switch (status) {
      case "CONFIRMED": return "default";
      case "WAITING_LIST": return "secondary";
      case "RAC": return "secondary";
      case "CANCELLED": return "destructive";
      case "RUNNING": return "default";
      case "COMPLETED": return "outline";
      default: return "outline";
    }
  }
  
  // Get message icon based on type
  function getMessageIcon(type: "info" | "warning" | "error" | "success") {
    switch (type) {
      case "info": return <Clock className="h-4 w-4 text-blue-500" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "error": return <X className="h-4 w-4 text-red-500" />;
      case "success": return <Check className="h-4 w-4 text-green-500" />;
    }
  }
  
  // Manually refresh the data
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing time status",
      description: "Getting the latest time information for your journey",
    });
  };
  
  // Create a notification reminder
  const handleCreateReminder = () => {
    // In a real app, this would call an API to create a reminder
    toast({
      title: "Reminder Set",
      description: "You will be notified 2 hours before your train departure.",
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Status
          </CardTitle>
          <CardDescription>Loading time information...</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !timeStatus) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Status
          </CardTitle>
          <CardDescription>Could not load time information</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground text-center">
            Time status is not available for this booking.
          </p>
          <button 
            onClick={handleRefresh}
            className="text-primary text-sm underline"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Status
            </CardTitle>
            <CardDescription>
              PNR: {pnr}
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(timeStatus.status)}>
            {timeStatus.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time remaining */}
        <div className="flex justify-between items-center py-2">
          <div className="text-sm font-medium">Time until departure:</div>
          <div className="font-bold text-lg">{timeRemaining}</div>
        </div>
        
        {/* Departure and arrival times */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col p-3 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Departure</div>
            <div className="font-bold">{timeStatus.scheduledDeparture}</div>
            {timeStatus.actualDeparture && timeStatus.actualDeparture !== timeStatus.scheduledDeparture && (
              <div className="text-xs text-amber-500 mt-1">
                Actual: {timeStatus.actualDeparture}
              </div>
            )}
            {timeStatus.platformNumber && (
              <div className="text-xs text-muted-foreground mt-1">
                Platform {timeStatus.platformNumber}
              </div>
            )}
          </div>
          
          <div className="flex flex-col p-3 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Arrival</div>
            <div className="font-bold">{timeStatus.scheduledArrival}</div>
            {timeStatus.estimatedArrival && timeStatus.estimatedArrival !== timeStatus.scheduledArrival && (
              <div className="text-xs text-amber-500 mt-1">
                Est. Arrival: {timeStatus.estimatedArrival}
              </div>
            )}
            {timeStatus.delay && timeStatus.delay > 0 && (
              <div className="text-xs text-amber-500 mt-1">
                Delayed by {timeStatus.delay} min
              </div>
            )}
          </div>
        </div>
        
        {/* Journey date */}
        <div className="flex items-center gap-2 mt-4 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Journey Date:</span>
          <span>{new Date(journeyDate).toLocaleDateString()}</span>
        </div>
        
        {/* Messages and alerts */}
        <div className="space-y-2 mt-4">
          {timeStatus.messages.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-md text-sm flex gap-2 items-start
                ${msg.type === 'info' ? 'bg-blue-50 text-blue-800' : ''}
                ${msg.type === 'warning' ? 'bg-amber-50 text-amber-800' : ''}
                ${msg.type === 'error' ? 'bg-red-50 text-red-800' : ''}
                ${msg.type === 'success' ? 'bg-green-50 text-green-800' : ''}
              `}
            >
              {getMessageIcon(msg.type)}
              <div>{msg.message}</div>
            </div>
          ))}
        </div>
        
        {/* Next station arrival (if train is running) */}
        {timeStatus.status === "RUNNING" && timeStatus.nextStationArrival && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>Next station arrival</span>
              <span>{timeStatus.nextStationArrival}</span>
            </div>
            <Progress value={70} className="h-1" />
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between mt-6">
          <button 
            onClick={handleRefresh}
            className="text-xs text-primary underline flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Refresh
          </button>
          
          {timeStatus.status !== "COMPLETED" && timeStatus.status !== "CANCELLED" && (
            <button 
              onClick={handleCreateReminder}
              className="text-xs flex items-center gap-1 text-primary"
            >
              <BellRing className="h-3 w-3" />
              Set Reminder
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}