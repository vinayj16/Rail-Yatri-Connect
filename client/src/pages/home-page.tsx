import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TrainSearchForm from "@/components/train-search-form";
import TrainList from "@/components/train-list";
import PnrChecker from "@/components/pnr-checker";
import Chatbot from "@/components/chatbot";
import LiveTrainPlatform from "@/components/live-train-platform";
import { Link } from "wouter";
import { 
  Search, 
  Calendar, 
  CreditCard, 
  Ticket, 
  Map, 
  Clock, 
  BellRing, 
  TicketIcon, 
  Train, 
  MessageCircle,
  QrCode,
  UsersRound,
  Check
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { toast } = useToast();
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [trains, setTrains] = useState<any[]>([]);
  const [activeFeatureTab, setActiveFeatureTab] = useState("live");

  // Check if AI is available
  const { data: aiStatus } = useQuery({
    queryKey: ['/api/ai-status'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/ai-status");
      return await res.json();
    },
  });

  // Train search mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (searchData: any) => {
      const res = await apiRequest("POST", "/api/trains/search", {
        fromStation: searchData.fromStation,
        toStation: searchData.toStation,
        journeyDate: searchData.journeyDate.toISOString().split('T')[0],
        travelClass: searchData.travelClass,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setTrains(data);
      setHasSearched(true);
      
      if (data.length === 0) {
        toast({
          title: "No trains found",
          description: "Try changing your search parameters",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search trains",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (values: any) => {
    setSearchParams(values);
    mutate(values);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* App Information Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to RailYatri Connect</h2>
                <p className="text-gray-700 mb-4">
                  RailYatri Connect revolutionizes train travel with AI-powered assistance, real-time tracking, and innovative ticket management. Our platform offers automated bookings, instant PNR status, live platform updates, and seamless ticket transfers.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Smart bookings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Live train tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Voice-enabled chatbot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Ticket transfers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Digital sharing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Reminder system</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto flex-shrink-0">
                <div className="bg-white shadow-lg rounded-lg p-5 w-full md:w-80">
                  <h3 className="font-semibold text-center mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button size="sm" variant="outline" className="flex items-center justify-center gap-1">
                      <Search className="h-4 w-4" />
                      <span>PNR Status</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center justify-center gap-1">
                      <Train className="h-4 w-4" />
                      <span>Train Schedule</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center justify-center gap-1">
                      <Ticket className="h-4 w-4" />
                      <span>Book Tickets</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center justify-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>Ask Disha</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-primary text-white py-16 bg-railroad-tracks relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-white/30 blur-3xl"></div>
            <div className="absolute right-1/4 top-1/3 w-48 h-48 rounded-full bg-white/20 blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex items-center justify-center mb-4">
              <Train className="h-10 w-10 mr-2 text-white/80" />
              <h1 className="text-3xl md:text-5xl font-bold">RailYatri Connect</h1>
            </div>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Indian Railways' Next-Gen Booking Platform with AI Assistance, Live Tracking & Seamless Ticket Management</p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">Book Train Tickets</Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">Check PNR Status</Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">View Train Schedule</Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <Map className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium">Live Train Tracking</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium">AI Assistance</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <TicketIcon className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium">Ticket Transfers</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <BellRing className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium">Smart Reminders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <TrainSearchForm onSearch={handleSearch} />

        {/* Quick Links Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* PNR Status */}
            <Link href="/pnr-status" className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center hover:shadow-md transition">
              <Search className="text-primary h-8 w-8" />
              <span className="mt-2 text-center font-medium">PNR Status</span>
            </Link>

            {/* Train Schedule */}
            <Link href="/train-schedule" className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center hover:shadow-md transition">
              <Calendar className="text-primary h-8 w-8" />
              <span className="mt-2 text-center font-medium">Train Schedule</span>
            </Link>

            {/* Ticket Transfer */}
            <Link href="#transfer" onClick={() => setActiveFeatureTab("transfer")} className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center hover:shadow-md transition">
              <TicketIcon className="text-primary h-8 w-8" />
              <span className="mt-2 text-center font-medium">Transfer Ticket</span>
            </Link>

            {/* My Bookings */}
            <Link href="/my-bookings" className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center hover:shadow-md transition">
              <Ticket className="text-primary h-8 w-8" />
              <span className="mt-2 text-center font-medium">My Bookings</span>
            </Link>
          </div>
        </div>

        {/* Train Listing */}
        <div className="container mx-auto px-4 py-6">
          <TrainList 
            searchParams={searchParams || {}} 
            trains={trains} 
            isLoading={isPending} 
            hasSearched={hasSearched} 
          />
        </div>

        {/* Featured Tools Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-semibold mb-6">Travel Smarter with RailYatri Connect</h2>
          
          <Tabs value={activeFeatureTab} onValueChange={setActiveFeatureTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="live">Live Platform Status</TabsTrigger>
              <TabsTrigger value="pnr">PNR Status</TabsTrigger>
              <TabsTrigger value="transfer">Ticket Transfer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="live" className="border rounded-lg p-4">
              <LiveTrainPlatform defaultStationCode="NDLS" />
            </TabsContent>
            
            <TabsContent value="pnr">
              <PnrChecker />
            </TabsContent>
            
            <TabsContent value="transfer">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TicketIcon className="h-5 w-5" />
                    RailYatri Connect Ticket Transfer
                  </CardTitle>
                  <CardDescription>
                    Transfer, exchange or gift your tickets to friends and family
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-6 rounded-lg text-center">
                    <h3 className="text-lg font-medium mb-2">New! Transfer or exchange your tickets</h3>
                    <p className="mb-4">Unable to travel? Don't cancel! Transfer your ticket to someone who needs it.</p>
                    <Button className="mx-auto">Login to Transfer Tickets</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 border rounded-lg text-center">
                      <UsersRound className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h4 className="font-medium">Gift to Friends</h4>
                      <p className="text-sm text-muted-foreground mt-1">Transfer your ticket to friends or family</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg text-center">
                      <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h4 className="font-medium">Resell</h4>
                      <p className="text-sm text-muted-foreground mt-1">Resell your ticket at the original price</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg text-center">
                      <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h4 className="font-medium">Exchange</h4>
                      <p className="text-sm text-muted-foreground mt-1">Exchange for a different date</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* AI Assistant Features Section - Without the Chatbot */}
        <div className="container mx-auto px-4 py-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">Ask Any Question</h3>
                <p className="text-sm text-muted-foreground">Get instant answers about train schedules, platforms, and fares</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <BellRing className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">Schedule Bookings</h3>
                <p className="text-sm text-muted-foreground">Set up automated bookings at your preferred time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">Digital Ticket Sharing</h3>
                <p className="text-sm text-muted-foreground">Share your e-tickets via QR code or messaging</p>
              </div>
            </div>
          </div>
          
          {!aiStatus?.enabled && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                AI assistance is currently running in fallback mode. The system will still answer your questions using our knowledge base.
              </p>
            </div>
          )}
        </div>

        {/* App Download Banner */}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between text-white">
            <div>
              <h3 className="text-xl font-semibold">RailYatri Connect Mobile App</h3>
              <p className="mt-2 text-white/80">Download our app for a seamless booking experience on the go</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-300" />
                  <span>Book tickets in seconds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-300" />
                  <span>Live train tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-300" />
                  <span>Offline e-tickets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-300" />
                  <span>One-click ticket transfers</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col md:flex-row gap-4">
              <Button variant="secondary" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 18c-1.11 0-2-.89-2-2V8c0-1.11.89-2 2-2 1.11 0 2 .89 2 2v8c0 1.11-.89 2-2 2Z"></path>
                  <path d="M7 18c-1.11 0-2-.89-2-2V8c0-1.11.89-2 2-2 1.11 0 2 .89 2 2v8c0 1.11-.89 2-2 2Z"></path>
                  <path d="M15 8v8"></path>
                  <path d="M9 8v8"></path>
                  <path d="M5 8v8"></path>
                  <path d="m17 6-5-4-5 4"></path>
                </svg>
                Google Play
              </Button>
              <Button variant="secondary" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
                  <path d="M10 2c1 .5 2 2 2 5"></path>
                </svg>
                App Store
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
