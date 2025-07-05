import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, AlertTriangle, Clock, MapPin, TrendingUp, ThermometerSnowflake, Wifi, Battery, Train } from "lucide-react";

interface LiveTrainMapProps {
  trainId: number;
  trainNumber: string;
  trainName: string;
}

type TrainLocationData = {
  status: string;
  currentStation: {
    code: string;
    name: string;
    city: string;
  };
  nextStation: {
    code: string;
    name: string;
    city: string;
  };
  delay: number | null;
  updatedAt: Date | null;
  latitude: string | null;
  longitude: string | null;
  speed: number | null;
};

export default function LiveTrainMap({ trainId, trainNumber, trainName }: LiveTrainMapProps) {
  const { toast } = useToast();
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // 1 minute default
  
  // Get train location data
  const { data: locationData, isLoading, error, refetch } = useQuery<TrainLocationData>({
    queryKey: ['/api/trains', trainId, 'location'],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trains/${trainId}/location`);
      if (!res.ok) {
        throw new Error("Failed to fetch train location");
      }
      return await res.json();
    },
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: true,
  });

  // Calculate journey progress
  const calculateProgress = (): number => {
    if (!locationData) return 0;
    
    // This is a simplified calculation - in a real app, you would use
    // the actual distance between stations and total journey distance
    const stationCode = parseInt(locationData.currentStation.code);
    const nextStationCode = parseInt(locationData.nextStation.code);
    
    // Assuming station codes somewhat correlate with journey progress
    const progress = (stationCode / nextStationCode) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };
  
  // Get status color based on train status and delay
  const getStatusColor = (): string => {
    if (!locationData) return "bg-gray-400";
    
    if (locationData.status === "ARRIVED") return "bg-green-500";
    if (locationData.status === "DEPARTED") return "bg-blue-500";
    if (locationData.status === "RUNNING" && locationData.delay && locationData.delay > 30) {
      return "bg-amber-500";
    }
    if (locationData.status === "DELAYED") return "bg-red-500";
    if (locationData.status === "CANCELLED") return "bg-destructive";
    
    return "bg-green-500";
  };
  
  // Format delay time
  const formatDelay = (delayMinutes: number | null): string => {
    if (!delayMinutes) return "On Time";
    if (delayMinutes < 1) return "On Time";
    
    const hours = Math.floor(delayMinutes / 60);
    const minutes = delayMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m late`;
    }
    return `${minutes}m late`;
  };
  
  // Weather condition based on time of day and random factors
  const getWeatherInfo = (): { condition: string; icon: JSX.Element } => {
    const conditions = [
      { condition: "Clear", icon: <ThermometerSnowflake className="h-4 w-4" /> },
      { condition: "Fog", icon: <AlertTriangle className="h-4 w-4" /> },
      { condition: "Rain", icon: <ThermometerSnowflake className="h-4 w-4" /> },
    ];
    
    // Randomly select condition - in a real app, you would fetch actual weather data
    const index = Math.floor(Math.random() * conditions.length);
    return conditions[index];
  };
  
  // Last refreshed time
  const getLastRefreshed = (): string => {
    if (!locationData?.updatedAt) return "Not available";
    
    try {
      const updated = new Date(locationData.updatedAt);
      return updated.toLocaleTimeString();
    } catch (e) {
      return "Not available";
    }
  };
  
  // Current train facilities based on status
  const getTrainFacilities = (): JSX.Element[] => {
    const facilities = [];
    
    // These would actually be fetched from the train's data
    facilities.push(
      <Badge variant="outline" key="wifi" className="flex items-center gap-1">
        <Wifi className="h-3 w-3" />
        Wi-Fi
      </Badge>
    );
    
    facilities.push(
      <Badge variant="outline" key="power" className="flex items-center gap-1">
        <Battery className="h-3 w-3" />
        Power Outlets
      </Badge>
    );
    
    return facilities;
  };

  useEffect(() => {
    // Adjust refresh interval based on train status
    if (locationData) {
      if (locationData.status === "RUNNING") {
        setRefreshInterval(30000); // 30 seconds when running
      } else if (locationData.status === "DELAYED") {
        setRefreshInterval(45000); // 45 seconds when delayed
      } else {
        setRefreshInterval(60000); // 1 minute otherwise
      }
    }
  }, [locationData]);

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing location data",
      description: "Getting the latest position of your train",
    });
  };

  // Creating map URL for the iframe
  const getMapUrl = (): string => {
    if (!locationData?.latitude || !locationData?.longitude) {
      // Default to New Delhi Railway Station if no location available
      return `https://maps.google.com/maps?q=28.6419,77.2190&z=15&output=embed`;
    }
    
    return `https://maps.google.com/maps?q=${locationData.latitude},${locationData.longitude}&z=15&output=embed`;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Train className="h-5 w-5" />
            Live Train Location
          </CardTitle>
          <CardDescription>Loading location information...</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !locationData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Train className="h-5 w-5" />
            Live Train Location
          </CardTitle>
          <CardDescription>Could not load train location</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground text-center">
            Live tracking is not available for this train or there was an error loading the data. 
            Try again later.
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
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Train className="h-5 w-5" />
              Live Train Location
            </CardTitle>
            <CardDescription>
              {trainNumber} - {trainName}
            </CardDescription>
          </div>
          <Badge className={getStatusColor()}>
            {locationData.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Map */}
        <div className="h-64 w-full border rounded-md overflow-hidden bg-muted">
          <iframe 
            src={getMapUrl()}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Train Location Map"
          />
        </div>
        
        {/* Current position info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Current Position
            </h3>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{locationData.currentStation.name}</div>
              <div className="text-sm text-muted-foreground">{locationData.currentStation.city}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Next Station
            </h3>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{locationData.nextStation.name}</div>
              <div className="text-sm text-muted-foreground">{locationData.nextStation.city}</div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Journey Progress</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
        
        {/* Status information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Delay:</span>
            <span className={locationData.delay && locationData.delay > 0 ? "text-amber-500 font-medium" : "text-green-500 font-medium"}>
              {formatDelay(locationData.delay)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Speed:</span>
            <span>{locationData.speed ? `${locationData.speed} km/h` : "Not available"}</span>
          </div>
          
          {/* Weather condition */}
          <div className="flex items-center gap-1">
            {getWeatherInfo().icon}
            <span className="text-muted-foreground">Weather:</span>
            <span>{getWeatherInfo().condition}</span>
          </div>
          
          {/* Last updated */}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span>{getLastRefreshed()}</span>
          </div>
        </div>
        
        {/* Train facilities */}
        <div className="flex gap-2 flex-wrap">
          {getTrainFacilities()}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <button 
          onClick={handleRefresh}
          className="text-xs text-primary underline flex items-center gap-1"
        >
          <Clock className="h-3 w-3" />
          Refresh Now
        </button>
        <span className="text-xs text-muted-foreground">
          Auto-refreshes every {refreshInterval / 1000} seconds
        </span>
      </CardFooter>
    </Card>
  );
}