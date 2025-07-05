import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Wifi, 
  Utensils, 
  Battery, 
  BedDouble,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import BookingModal from "./booking-modal";

interface TrainListProps {
  searchParams: {
    fromStation: string;
    toStation: string;
    journeyDate: Date;
    travelClass?: string;
  };
  trains?: any[];
  isLoading: boolean;
  hasSearched: boolean;
}

export default function TrainList({ 
  searchParams, 
  trains = [], 
  isLoading, 
  hasSearched 
}: TrainListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedTrains, setExpandedTrains] = useState<Set<number>>(new Set());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [departureFilter, setDepartureFilter] = useState<string>("all");
  const [trainTypeFilter, setTrainTypeFilter] = useState<string>("all");
  const [bookingTrain, setBookingTrain] = useState<any>(null);
  const [selectedTrainClass, setSelectedTrainClass] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const toggleTrainDetails = (trainId: number) => {
    setExpandedTrains(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trainId)) {
        newSet.delete(trainId);
      } else {
        newSet.add(trainId);
      }
      return newSet;
    });
  };

  const openBookingModal = (train: any, trainClass: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book tickets",
        variant: "destructive",
      });
      return;
    }

    setBookingTrain(train);
    setSelectedTrainClass(trainClass);
    setBookingModalOpen(true);
  };
  
  const filteredTrains = (trains || []).filter(train => {
    // Filter by class
    if (selectedClass !== "all") {
      const hasClass = train.classes.some((cls: any) => cls.classCode === selectedClass);
      if (!hasClass) return false;
    }
    
    // Filter by departure time
    if (departureFilter !== "all") {
      const depHour = parseInt(train.departureTime.split(":")[0]);
      
      switch (departureFilter) {
        case "morning":
          if (!(depHour >= 4 && depHour < 11)) return false;
          break;
        case "afternoon":
          if (!(depHour >= 11 && depHour < 17)) return false;
          break;
        case "evening":
          if (!(depHour >= 17 && depHour < 21)) return false;
          break;
        case "night":
          if (!(depHour >= 21 || depHour < 4)) return false;
          break;
      }
    }
    
    // Filter by train type
    if (trainTypeFilter !== "all" && train.trainType !== trainTypeFilter) {
      return false;
    }
    
    return true;
  });

  // Before search UI
  if (!hasSearched) {
    return (
      <div className="text-center py-10">
        <svg className="w-16 h-16 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15V9h16v6"></path>
          <path d="M7 19v-4"></path>
          <path d="M17 19v-4"></path>
          <rect x="2" y="19" width="20" height="2" rx="1"></rect>
          <path d="M9 9V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"></path>
          <circle cx="8" cy="22" r="1"></circle>
          <circle cx="16" cy="22" r="1"></circle>
        </svg>
        <p className="mt-4 text-gray-500">Enter source, destination and date to search for trains</p>
      </div>
    );
  }

  // Loading state UI
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
        <p className="mt-4 text-gray-600">Searching for trains...</p>
      </div>
    );
  }

  // No results UI
  if (trains.length === 0 && hasSearched) {
    return (
      <div className="text-center py-10">
        <svg className="w-16 h-16 mx-auto text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
        <p className="mt-4 text-gray-600">No trains found for your search criteria</p>
        <p className="text-sm text-gray-500 mt-2">Try changing your search parameters</p>
      </div>
    );
  }

  // Search results UI
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Search Results</h2>
        <div className="flex items-center text-sm text-gray-600">
          <span>{`${searchParams.fromStation} to ${searchParams.toStation}`}</span>
          <span className="mx-2">•</span>
          <span>{format(searchParams.journeyDate, "EEE, dd MMM")}</span>
          <span className="mx-2">•</span>
          <span>{`${trains.length} Trains`}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="font-medium">Filters: </div>
          
          <div className="flex items-center">
            <Select 
              value={selectedClass} 
              onValueChange={setSelectedClass}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="SL">Sleeper</SelectItem>
                <SelectItem value="3A">AC 3 Tier</SelectItem>
                <SelectItem value="2A">AC 2 Tier</SelectItem>
                <SelectItem value="1A">AC First Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <Select 
              value={departureFilter} 
              onValueChange={setDepartureFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Departure Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                <SelectItem value="morning">Morning (4:00 - 10:59)</SelectItem>
                <SelectItem value="afternoon">Afternoon (11:00 - 16:59)</SelectItem>
                <SelectItem value="evening">Evening (17:00 - 20:59)</SelectItem>
                <SelectItem value="night">Night (21:00 - 3:59)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <Select 
              value={trainTypeFilter} 
              onValueChange={setTrainTypeFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Train Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Rajdhani">Rajdhani</SelectItem>
                <SelectItem value="Shatabdi">Shatabdi</SelectItem>
                <SelectItem value="Duronto">Duronto</SelectItem>
                <SelectItem value="Express">Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Train List */}
      <div className="space-y-4">
        {filteredTrains.map((train) => (
          <div key={train.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition">
            {/* Basic Train Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                {/* Train name and number */}
                <div className="mb-2 sm:mb-0">
                  <h3 className="font-semibold text-lg">{train.name} ({train.number})</h3>
                  <p className="text-xs text-gray-500">Runs on: {train.runDays}</p>
                </div>
                
                {/* Train timings */}
                <div className="flex items-center space-x-4">
                  {/* Departure */}
                  <div className="text-center">
                    <div className="font-semibold">{train.departureTime}</div>
                    <div className="text-xs text-gray-500">{train.sourceStation.code}</div>
                  </div>
                  
                  {/* Duration */}
                  <div className="text-center">
                    <div className="text-xs text-gray-500 whitespace-nowrap">{train.duration}</div>
                    <div className="w-20 h-0.5 bg-gray-300 relative">
                      <ArrowRight className="absolute -top-2 right-0 h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Arrival */}
                  <div className="text-center">
                    <div className="font-semibold">{train.arrivalTime}</div>
                    <div className="text-xs text-gray-500">{train.destinationStation.code}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                {/* Travel Classes */}
                <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
                  {train.classes.map((trainClass: any) => {
                    let availabilityText = "";
                    let textColorClass = "";
                    
                    if (trainClass.availableSeats > 0) {
                      availabilityText = `Available ${trainClass.availableSeats}`;
                      textColorClass = "text-green-600";
                    } else if (trainClass.availableSeats <= 0 && trainClass.availableSeats >= -10) {
                      availabilityText = `RAC ${Math.abs(trainClass.availableSeats)}`;
                      textColorClass = "text-amber-600";
                    } else {
                      availabilityText = `WL ${Math.abs(trainClass.availableSeats)}`;
                      textColorClass = "text-red-600";
                    }
                    
                    return (
                      <div 
                        key={trainClass.id} 
                        onClick={() => openBookingModal(train, trainClass)}
                        className="relative border border-gray-200 rounded p-2 flex-1 min-w-[110px] cursor-pointer hover:border-primary"
                      >
                        <div className="text-xs font-medium">{trainClass.className} ({trainClass.classCode})</div>
                        <div className="text-sm font-semibold">₹{trainClass.fare.toLocaleString()}</div>
                        <div className={`text-xs ${textColorClass}`}>{availabilityText}</div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Book Button */}
                <div>
                  <Button 
                    onClick={() => openBookingModal(train, train.classes[0])} 
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            {expandedTrains.has(train.id) && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Route Information</h4>
                    <div className="flex flex-wrap gap-4">
                      {train.stops.map((stop: any, index: number, stops: any[]) => {
                        const isSourceOrDestination = 
                          (index === 0) || 
                          (index === stops.length - 1);
                          
                        return (
                          <div key={stop.id} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${isSourceOrDestination ? 'bg-primary' : 'bg-gray-400'}`}></div>
                            <div className="ml-2">
                              <div className="text-xs font-medium">{stop.stationId}</div>
                              <div className="text-xs">
                                {stop.arrivalTime && stop.departureTime
                                  ? `${stop.arrivalTime} - ${stop.departureTime}`
                                  : stop.departureTime || stop.arrivalTime}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Facilities</h4>
                    <div className="flex gap-4 text-xs">
                      {train.hasPantry && (
                        <div className="flex items-center">
                          <Utensils className="h-3 w-3 mr-1" />
                          <span>Pantry</span>
                        </div>
                      )}
                      {train.hasWifi && (
                        <div className="flex items-center">
                          <Wifi className="h-3 w-3 mr-1" />
                          <span>WiFi</span>
                        </div>
                      )}
                      {train.hasChargingPoint && (
                        <div className="flex items-center">
                          <Battery className="h-3 w-3 mr-1" />
                          <span>Charging Point</span>
                        </div>
                      )}
                      {train.hasBedroll && (
                        <div className="flex items-center">
                          <BedDouble className="h-3 w-3 mr-1" />
                          <span>Bedroll</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Toggle Details Button */}
            <div className="text-center border-t border-gray-200 p-2">
              <Button 
                variant="ghost"
                onClick={() => toggleTrainDetails(train.id)} 
                className="text-primary text-sm font-medium flex items-center justify-center w-full"
              >
                <span>{expandedTrains.has(train.id) ? "Hide Details" : "Show Details"}</span>
                {expandedTrains.has(train.id) 
                  ? <ChevronUp className="h-4 w-4 ml-1" /> 
                  : <ChevronDown className="h-4 w-4 ml-1" />
                }
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        train={bookingTrain}
        trainClass={selectedTrainClass}
        journeyDate={searchParams.journeyDate}
      />
    </div>
  );
}
