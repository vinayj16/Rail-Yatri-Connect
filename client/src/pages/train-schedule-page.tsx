import Header from "@/components/header";
import TrainList from "@/components/train-list";
import { PlatformStatus } from "@/components/platform-status";
import LiveTrainPlatform from "@/components/live-train-platform";
import TrainSearchForm from "@/components/train-search-form";
import { useState } from "react";

export default function TrainSchedulePage() {
  const [selectedStation, setSelectedStation] = useState("NDLS");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Live Train Schedule</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Get real-time updates on train timings, platform numbers, and crowd levels
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Panel */}
            <div className="lg:col-span-2 space-y-6">
              <TrainSearchForm onStationSelect={setSelectedStation} />
              <TrainList />
            </div>

            {/* Live Status Panel */}
            <div className="space-y-6">
              <PlatformStatus stationCode={selectedStation} />
              <LiveTrainPlatform stationCode={selectedStation} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}