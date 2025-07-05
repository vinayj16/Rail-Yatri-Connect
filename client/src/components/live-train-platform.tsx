import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, ArrowRight, Train, MapPin, AlertCircle, Calendar, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type TrainPlatformInfo = {
  trainNumber: string;
  trainName: string;
  expectedArrival: string;
  expectedDeparture: string;
  platform: string;
  status: "ON_TIME" | "DELAYED" | "ARRIVED" | "DEPARTED" | "CANCELLED";
  delayMinutes?: number;
  source: string;
  destination: string;
  nextStation?: string;
  nextStationArrival?: string;
};

type StationInfo = {
  code: string;
  name: string;
  city: string;
  trains: TrainPlatformInfo[];
  lastUpdated: string | Date;
};

interface LiveTrainPlatformProps {
  defaultStationCode?: string;
}

export default function LiveTrainPlatform({ defaultStationCode = "NDLS" }: LiveTrainPlatformProps) {
  const [stationCode, setStationCode] = useState(defaultStationCode);
  const [searchInput, setSearchInput] = useState(defaultStationCode);
  const { toast } = useToast();
  
  // Formatter function for timestamp display
  const formatLastUpdated = (timestamp: string | Date | null | undefined): string => {
    if (!timestamp) return "Unknown";
    
    try {
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } else if (timestamp instanceof Date) {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      return "Unknown";
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Unknown";
    }
  };

  // Fetch station data
  const { data: stationData, isLoading, error, refetch } = useQuery<StationInfo>({
    queryKey: ['/api/stations/platform-status', stationCode],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/stations/platform-status?code=${stationCode}`);
        return await res.json();
      } catch (error) {
        // Generate mock data when API is not available yet
        return generateMockStationData(stationCode);
      }
    },
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      setStationCode(searchInput.trim().toUpperCase());
    } else {
      toast({
        title: "Invalid input",
        description: "Please enter a valid station code",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const generateMockStationData = (code: string): StationInfo => {
    const stations: Record<string, { name: string; city: string }> = {
      "NDLS": { name: "New Delhi Railway Station", city: "New Delhi" },
      "MMCT": { name: "Mumbai Central", city: "Mumbai" },
      "HWH": { name: "Howrah Junction", city: "Kolkata" },
      "MAS": { name: "Chennai Central", city: "Chennai" },
      "PNBE": { name: "Patna Junction", city: "Patna" },
    };

    const station = stations[code] || { name: `${code} Station`, city: "Unknown" };
    
    // Generate random trains
    const trains: TrainPlatformInfo[] = [];
    const statusTypes: ("ON_TIME" | "DELAYED" | "ARRIVED" | "DEPARTED" | "CANCELLED")[] = 
      ["ON_TIME", "DELAYED", "ARRIVED", "DEPARTED", "CANCELLED"];
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Current time
    const now = new Date();
    
    // Generate 5-10 random trains
    const trainCount = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < trainCount; i++) {
      const arrivalMinutes = Math.floor(Math.random() * 120) - 30; // -30 to 90 minutes from now
      const arrivalTime = new Date(now.getTime() + arrivalMinutes * 60000);
      
      const departureMinutes = arrivalMinutes + 5 + Math.floor(Math.random() * 20); // 5-25 minutes after arrival
      const departureTime = new Date(now.getTime() + departureMinutes * 60000);
      
      const delayMinutes = Math.random() > 0.6 ? 5 + Math.floor(Math.random() * 55) : 0;
      const status = delayMinutes > 0 ? "DELAYED" : 
                    arrivalMinutes < 0 && departureMinutes > 0 ? "ARRIVED" :
                    departureMinutes < 0 ? "DEPARTED" :
                    Math.random() > 0.95 ? "CANCELLED" : "ON_TIME";
      
      const trainNumber = `${1 + Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 10000)}`.padStart(5, '0');
      
      const trainNames = [
        "Rajdhani Express", "Shatabdi Express", "Duronto Express", "Garib Rath",
        "Jan Shatabdi", "Sampark Kranti", "Vande Bharat", "Double Decker",
        "Intercity Express", "Humsafar Express"
      ];
      
      const cities = ["Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru", "Hyderabad", 
                      "Ahmedabad", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
                      "Bhopal", "Patna", "Kochi", "Guwahati", "Chandigarh"];
                      
      const sourceCities = cities.filter(city => city !== station.city);
      const destCities = cities.filter(city => city !== station.city && Math.random() > 0.5);
      
      const sourceCity = sourceCities[Math.floor(Math.random() * sourceCities.length)];
      const destCity = destCities[Math.floor(Math.random() * destCities.length)];
      
      const platforms = ["1", "2", "3", "4", "5", "6", "7", "8"];
      
      const trainName = trainNames[Math.floor(Math.random() * trainNames.length)];
      
      trains.push({
        trainNumber,
        trainName,
        expectedArrival: formatTime(arrivalTime),
        expectedDeparture: formatTime(departureTime),
        platform: status === "CANCELLED" ? "--" : platforms[Math.floor(Math.random() * platforms.length)],
        status,
        delayMinutes: status === "DELAYED" ? delayMinutes : undefined,
        source: sourceCity,
        destination: destCity,
        nextStation: status === "DEPARTED" ? cities[Math.floor(Math.random() * cities.length)] : undefined,
        nextStationArrival: status === "DEPARTED" ? formatTime(new Date(departureTime.getTime() + 60 * 60000)) : undefined,
      });
    }
    
    // Sort by arrival time
    trains.sort((a, b) => {
      return a.expectedArrival.localeCompare(b.expectedArrival);
    });
    
    return {
      code,
      name: station.name,
      city: station.city,
      trains,
      lastUpdated: new Date(),
    };
  };

  const getStatusText = (train: TrainPlatformInfo) => {
    switch (train.status) {
      case "ON_TIME":
        return "On Time";
      case "DELAYED":
        return `Delayed by ${train.delayMinutes} mins`;
      case "ARRIVED":
        return "Arrived";
      case "DEPARTED":
        return "Departed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ON_TIME":
        return "bg-green-500";
      case "DELAYED":
        return "bg-amber-500";
      case "ARRIVED":
        return "bg-blue-500";
      case "DEPARTED":
        return "bg-indigo-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 w-full max-w-md mx-auto">
        <Input
          placeholder="Enter station code (e.g., NDLS)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>
      
      {isLoading && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-32" />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to fetch station data. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {stationData && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h3 className="text-xl font-semibold">{stationData.name} ({stationData.code})</h3>
              <p className="text-sm text-muted-foreground">{stationData.city}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Last updated: {formatLastUpdated(stationData.lastUpdated)}
              </span>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </div>
          
          {stationData.trains.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No trains scheduled at this station right now.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {stationData.trains.map((train) => (
                <Card key={train.trainNumber} className={train.status === "CANCELLED" ? "opacity-75" : ""}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2">
                          <Train className="h-5 w-5 text-primary" />
                          <div>
                            <span className="font-semibold">{train.trainNumber}</span>
                            <h3 className="font-medium">{train.trainName}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{train.source}</span>
                          <ArrowRight className="h-3 w-3 mx-1" />
                          <span>{train.destination}</span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-muted-foreground">Arrival</div>
                            <div className="font-medium">{train.expectedArrival}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Departure</div>
                            <div className="font-medium">{train.expectedDeparture}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Platform</div>
                        <div className="font-semibold text-lg">{train.platform}</div>
                      </div>
                      
                      <div className="md:col-span-2 flex flex-col items-start gap-1">
                        <Badge 
                          className={getStatusColor(train.status)}
                          variant="secondary"
                        >
                          {getStatusText(train)}
                        </Badge>
                        
                        {train.status === "DEPARTED" && train.nextStation && (
                          <div className="text-xs flex items-center gap-1 mt-1">
                            <Info className="h-3 w-3" />
                            <span>Next: {train.nextStation} ({train.nextStationArrival})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}