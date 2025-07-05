import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Train, User, Bookmark, BedDouble, AlertTriangle, Users, UserPlus, Loader2 } from "lucide-react";

// Seat status types
type SeatStatus = "available" | "booked" | "racWaitlisted" | "currentBooking" | "ladiesOnly" | "disabled";

// Coach type
interface Coach {
  coachId: string;
  coachType: string;
  totalSeats: number;
  seats: Seat[];
}

// Seat type
interface Seat {
  seatNumber: string;
  status: SeatStatus;
  passengerName?: string;
  passengerAge?: number;
  passengerGender?: string;
}

interface SeatingArrangementProps {
  trainId: number;
  trainNumber: string;
  trainName: string;
  classCode: string;
  journeyDate: Date;
  onSeatSelect?: (seatNumber: string) => void;
  selectedSeats?: string[];
  readOnly?: boolean;
}

export default function SeatingArrangement({ 
  trainId, 
  trainNumber, 
  trainName, 
  classCode, 
  journeyDate, 
  onSeatSelect,
  selectedSeats = [],
  readOnly = false
}: SeatingArrangementProps) {
  const { toast } = useToast();
  const [activeCoach, setActiveCoach] = useState<string>("");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for coaches and seats
  useEffect(() => {
    // In a real application, this would be an API call to get the actual seating data
    // for the specific train, coach class, and date
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        const mockCoaches: Coach[] = generateMockCoaches(classCode);
        setCoaches(mockCoaches);
        
        // Set first coach as active by default
        if (mockCoaches.length > 0) {
          setActiveCoach(mockCoaches[0].coachId);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load seating arrangement");
        setLoading(false);
      }
    }, 1000);
  }, [classCode]);

  // Generate mock coaches based on class code
  const generateMockCoaches = (classCode: string): Coach[] => {
    const coaches: Coach[] = [];
    
    // Number of coaches and seats depends on the class
    let numberOfCoaches = 1;
    let seatsPerCoach = 72;
    let coachPrefix = "S";
    
    switch (classCode) {
      case "SL":  // Sleeper
        numberOfCoaches = 8;
        seatsPerCoach = 72;
        coachPrefix = "S";
        break;
      case "3A":  // AC 3 Tier
        numberOfCoaches = 5;
        seatsPerCoach = 64;
        coachPrefix = "B";
        break;
      case "2A":  // AC 2 Tier
        numberOfCoaches = 2;
        seatsPerCoach = 46;
        coachPrefix = "A";
        break;
      case "1A":  // AC First Class
        numberOfCoaches = 1;
        seatsPerCoach = 24;
        coachPrefix = "H";
        break;
      case "CC":  // Chair Car
        numberOfCoaches = 4;
        seatsPerCoach = 78;
        coachPrefix = "C";
        break;
      default:
        numberOfCoaches = 8;
        seatsPerCoach = 72;
        coachPrefix = "S";
    }
    
    // Create each coach
    for (let i = 1; i <= numberOfCoaches; i++) {
      const coachId = `${coachPrefix}${i}`;
      
      // Create seats for this coach
      const seats: Seat[] = [];
      for (let j = 1; j <= seatsPerCoach; j++) {
        // Create different statuses for demonstration
        let status: SeatStatus = "available";
        
        // Some randomization for demonstration purposes
        const random = Math.random();
        if (random < 0.6) {
          status = "booked";
        } else if (random < 0.65) {
          status = "racWaitlisted";
        } else if (random < 0.7) {
          status = "ladiesOnly";
        } else if (random < 0.75) {
          status = "disabled";
        }
        
        // For the current booking's selected seats
        if (selectedSeats.includes(`${coachId}-${j}`)) {
          status = "currentBooking";
        }
        
        // Add passenger details for booked seats
        let passengerName, passengerAge, passengerGender;
        if (status === "booked" || status === "currentBooking") {
          const genders = ["Male", "Female"];
          passengerName = status === "currentBooking" ? "You" : "Passenger";
          passengerAge = Math.floor(Math.random() * 60) + 18;
          passengerGender = genders[Math.floor(Math.random() * genders.length)];
        }
        
        seats.push({
          seatNumber: j.toString(),
          status,
          passengerName,
          passengerAge,
          passengerGender
        });
      }
      
      coaches.push({
        coachId,
        coachType: getCoachTypeFromClassCode(classCode),
        totalSeats: seatsPerCoach,
        seats
      });
    }
    
    return coaches;
  };
  
  // Get coach type name from class code
  const getCoachTypeFromClassCode = (classCode: string): string => {
    switch (classCode) {
      case "SL": return "Sleeper";
      case "3A": return "AC 3 Tier";
      case "2A": return "AC 2 Tier";
      case "1A": return "AC First Class";
      case "CC": return "Chair Car";
      case "EC": return "Executive Chair Car";
      default: return "Unknown";
    }
  };
  
  // Handle seat click
  const handleSeatClick = (seatNumber: string, status: SeatStatus) => {
    if (readOnly) return;
    
    // Can't select already booked seats
    if (status === "booked" || status === "racWaitlisted" || status === "ladiesOnly" || status === "disabled") {
      toast({
        title: "Seat not available",
        description: "This seat is already booked or reserved.",
        variant: "destructive",
      });
      return;
    }
    
    // Call the onSeatSelect callback
    if (onSeatSelect) {
      const fullSeatNumber = `${activeCoach}-${seatNumber}`;
      onSeatSelect(fullSeatNumber);
    }
  };
  
  // Get color class based on seat status
  const getSeatColorClass = (status: SeatStatus): string => {
    switch (status) {
      case "available": return "bg-green-100 border-green-500 hover:bg-green-200";
      case "booked": return "bg-red-100 border-red-500";
      case "racWaitlisted": return "bg-amber-100 border-amber-500";
      case "currentBooking": return "bg-blue-100 border-blue-500";
      case "ladiesOnly": return "bg-pink-100 border-pink-500";
      case "disabled": return "bg-purple-100 border-purple-500";
      default: return "bg-gray-100 border-gray-500";
    }
  };
  
  // Get seat label based on coach type and seat number
  const getSeatLabel = (coachType: string, seatNumber: number): string => {
    if (coachType === "Sleeper" || coachType === "AC 3 Tier" || coachType === "AC 2 Tier" || coachType === "AC First Class") {
      // For sleeper and AC classes, use berth types
      const berthType = getBerthType(coachType, seatNumber);
      return `${seatNumber} - ${berthType}`;
    }
    
    // For chair cars, just use the seat number
    return seatNumber.toString();
  };
  
  // Get berth type based on coach type and seat number
  const getBerthType = (coachType: string, seatNumber: number): string => {
    if (coachType === "Sleeper" || coachType === "AC 3 Tier") {
      // Sleeper and 3A have Lower, Middle, Upper, Side Lower, Side Upper
      const mod = seatNumber % 8;
      if (mod === 1 || mod === 4) return "Lower";
      if (mod === 2 || mod === 5) return "Middle";
      if (mod === 3 || mod === 6) return "Upper";
      if (mod === 7) return "Side Lower";
      if (mod === 0) return "Side Upper";
    } else if (coachType === "AC 2 Tier") {
      // 2A has Lower, Upper, Side Lower, Side Upper
      const mod = seatNumber % 6;
      if (mod === 1 || mod === 3) return "Lower";
      if (mod === 2 || mod === 4) return "Upper";
      if (mod === 5) return "Side Lower";
      if (mod === 0) return "Side Upper";
    } else if (coachType === "AC First Class") {
      // 1A has Lower and Upper berths
      return seatNumber % 2 === 0 ? "Upper" : "Lower";
    }
    
    return "";
  };
  
  // Render a single seat
  const renderSeat = (seat: Seat) => {
    const activeCoachObj = coaches.find(c => c.coachId === activeCoach);
    if (!activeCoachObj) return null;
    
    const seatLabel = getSeatLabel(activeCoachObj.coachType, parseInt(seat.seatNumber));
    const colorClass = getSeatColorClass(seat.status);
    const showBerthIcon = activeCoachObj.coachType !== "Chair Car" && activeCoachObj.coachType !== "Executive Chair Car";
    const isSelected = selectedSeats.includes(`${activeCoach}-${seat.seatNumber}`);
    
    return (
      <TooltipProvider key={seat.seatNumber}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled={readOnly || seat.status === "booked" || seat.status === "racWaitlisted" || seat.status === "ladiesOnly" || seat.status === "disabled"}
              onClick={() => handleSeatClick(seat.seatNumber, seat.status)}
              className={`
                relative p-2 m-1 border-2 rounded-md w-14 h-14 flex flex-col items-center justify-center
                text-xs font-medium transition-colors
                ${colorClass}
                ${seat.status === "booked" || seat.status === "racWaitlisted" || seat.status === "ladiesOnly" || seat.status === "disabled" ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                ${isSelected ? "ring-2 ring-blue-500" : ""}
              `}
            >
              <span>{seat.seatNumber}</span>
              {showBerthIcon && (
                <span className="mt-1">
                  <BedDouble className="h-3 w-3" />
                </span>
              )}
              {seat.status === "ladiesOnly" && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-pink-500 rounded-full"></span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p className="font-bold">{seatLabel}</p>
              {seat.status === "booked" && seat.passengerName && (
                <p>{seat.passengerName}, {seat.passengerAge}, {seat.passengerGender}</p>
              )}
              {seat.status === "currentBooking" && (
                <p>Your selection</p>
              )}
              <p className="capitalize">{seat.status.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  // Render a coach layout based on coach type
  const renderCoachLayout = (coach: Coach) => {
    const { coachType, seats } = coach;
    
    if (coachType === "Sleeper" || coachType === "AC 3 Tier") {
      // 3x2 layout for sleeper and 3AC (8 seats per row including side berths)
      const rows = [];
      for (let i = 0; i < seats.length; i += 8) {
        const rowSeats = seats.slice(i, i + 8);
        rows.push(
          <div key={i} className="flex mb-4 justify-center">
            <div className="flex flex-col mr-4">
              {rowSeats.slice(0, 3).map(renderSeat)}
            </div>
            <div className="flex flex-col mr-8">
              {rowSeats.slice(3, 6).map(renderSeat)}
            </div>
            <div className="flex flex-col">
              {rowSeats.slice(6, 8).map(renderSeat)}
            </div>
          </div>
        );
      }
      return rows;
    } else if (coachType === "AC 2 Tier") {
      // 2x2 layout for 2AC (6 seats per row including side berths)
      const rows = [];
      for (let i = 0; i < seats.length; i += 6) {
        const rowSeats = seats.slice(i, i + 6);
        rows.push(
          <div key={i} className="flex mb-4 justify-center">
            <div className="flex flex-col mr-4">
              {rowSeats.slice(0, 2).map(renderSeat)}
            </div>
            <div className="flex flex-col mr-8">
              {rowSeats.slice(2, 4).map(renderSeat)}
            </div>
            <div className="flex flex-col">
              {rowSeats.slice(4, 6).map(renderSeat)}
            </div>
          </div>
        );
      }
      return rows;
    } else if (coachType === "AC First Class") {
      // 1x1 layout for 1AC (2 seats per row, cabins)
      const rows = [];
      for (let i = 0; i < seats.length; i += 4) {
        const rowSeats = seats.slice(i, i + 4);
        rows.push(
          <div key={i} className="flex mb-6 justify-center border-b pb-4">
            <div className="flex flex-col mr-8 border-r pr-4">
              {rowSeats.slice(0, 2).map(renderSeat)}
            </div>
            <div className="flex flex-col">
              {rowSeats.slice(2, 4).map(renderSeat)}
            </div>
          </div>
        );
      }
      return rows;
    } else {
      // 3x3 layout for Chair Car (CC) and Executive Chair Car (EC)
      const rows = [];
      for (let i = 0; i < seats.length; i += 6) {
        const rowSeats = seats.slice(i, i + 6);
        rows.push(
          <div key={i} className="flex mb-2 justify-center">
            <div className="flex mr-4">
              {rowSeats.slice(0, 3).map(renderSeat)}
            </div>
            <div className="flex">
              {rowSeats.slice(3, 6).map(renderSeat)}
            </div>
          </div>
        );
      }
      return rows;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Train className="h-5 w-5" />
            Seating Arrangement
          </CardTitle>
          <CardDescription>Loading seating information...</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || coaches.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Train className="h-5 w-5" />
            Seating Arrangement
          </CardTitle>
          <CardDescription>Could not load seating information</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground text-center">
            Seating arrangement is not available for this train or there was an error loading the data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Train className="h-5 w-5" />
          Seating Arrangement
        </CardTitle>
        <CardDescription>
          {trainNumber} - {trainName} | {getCoachTypeFromClassCode(classCode)} | {new Date(journeyDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Coach selection tabs */}
        <Tabs value={activeCoach} onValueChange={setActiveCoach} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Select Coach:</h3>
            <Badge variant="outline" className="ml-2">
              {coaches.find(c => c.coachId === activeCoach)?.coachType || ""}
            </Badge>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="w-full justify-start">
              {coaches.map((coach) => (
                <TabsTrigger
                  key={coach.coachId}
                  value={coach.coachId}
                  className="px-3 py-1 text-sm"
                >
                  {coach.coachId}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          {/* Coach layouts */}
          {coaches.map((coach) => (
            <TabsContent key={coach.coachId} value={coach.coachId} className="mt-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Coach {coach.coachId}</h4>
                  <p className="text-xs text-muted-foreground">
                    {coach.coachType} - {coach.totalSeats} seats
                  </p>
                </div>
                
                {/* Legend for seat statuses */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 border border-green-500 rounded-sm mr-1"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-100 border border-red-500 rounded-sm mr-1"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-100 border border-amber-500 rounded-sm mr-1"></div>
                    <span>RAC/WL</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded-sm mr-1"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-pink-100 border border-pink-500 rounded-sm mr-1"></div>
                    <span>Ladies</span>
                  </div>
                </div>
                
                {/* Coach layout visualization */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="py-2">
                    {renderCoachLayout(coach)}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Statistics about available seats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-muted rounded-md flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">Available Seats</h4>
              <p className="text-lg font-bold">{coaches.reduce((acc, coach) => acc + coach.seats.filter(s => s.status === "available").length, 0)}</p>
            </div>
          </div>
          
          <div className="p-3 bg-muted rounded-md flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">Selected</h4>
              <p className="text-lg font-bold">{selectedSeats.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      {!readOnly && onSeatSelect && (
        <CardFooter className="flex justify-between flex-wrap">
          <p className="text-xs text-muted-foreground">
            Click on a seat to select or deselect it
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-1 text-primary"
            onClick={() => {
              toast({
                title: "Smart Seat Feature",
                description: "Our smart seat algorithm has recommended the best available seats based on your preferences.",
              });
            }}
          >
            <Bookmark className="h-3 w-3" />
            <span>Recommend Best Seats</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}