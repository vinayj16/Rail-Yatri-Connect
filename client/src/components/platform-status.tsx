
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Users, AlertCircle } from "lucide-react";

interface PlatformStatusProps {
  stationCode: string;
}

export function PlatformStatus({ stationCode }: PlatformStatusProps) {
  const [crowdLevel, setCrowdLevel] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchCrowdLevel = async () => {
      try {
        const response = await fetch(`/api/stations/${stationCode}/crowd-level`);
        const data = await response.json();
        setCrowdLevel(data.crowdLevel);
        setLastUpdate(new Date(data.timestamp));
      } catch (error) {
        console.error("Failed to fetch crowd level:", error);
      }
    };

    fetchCrowdLevel();
    const interval = setInterval(fetchCrowdLevel, 60000);
    return () => clearInterval(interval);
  }, [stationCode]);

  const getCrowdStatus = () => {
    if (crowdLevel < 30) return { text: "Low", color: "bg-green-500" };
    if (crowdLevel < 70) return { text: "Moderate", color: "bg-yellow-500" };
    return { text: "High", color: "bg-red-500" };
  };

  const status = getCrowdStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Platform Crowd Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{status.text}</span>
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <Progress value={crowdLevel} className={status.color} />
          {crowdLevel > 80 && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Platform is very crowded. Please be cautious.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
