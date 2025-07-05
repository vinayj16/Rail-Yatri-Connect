import { Link } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { 
  Train, Ticket, MapPin, Bell, CreditCard, 
  Share2, Calendar, QrCode, Clock, 
  MessageSquare, RotateCcw, Smartphone 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">Our Services</h1>
              <p className="text-xl text-gray-700 mb-8">
                Discover how RailYatri Connect makes your train journey seamless from booking to arrival.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/auth?tab=register">
                  <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Core Services */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2 text-center">Core Services</h2>
            <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Our comprehensive platform offers everything you need for a stress-free train journey experience
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Ticket className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>Ticket Booking</CardTitle>
                  <CardDescription>Quick and simplified booking process</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Regular and Tatkal ticket booking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Multiple payment options</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Automated booking for high-demand trains</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Instant confirmation & digital tickets</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>Live Tracking</CardTitle>
                  <CardDescription>Real-time information at your fingertips</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Live train position tracking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Platform number updates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Expected arrival time calculations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Station approach notifications</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Bell className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>Smart Notifications</CardTitle>
                  <CardDescription>Stay informed throughout your journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>PNR status change alerts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Platform and schedule changes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Departure and arrival reminders</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/10 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                      <span>Payment deadlines for Tatkal bookings</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Advanced Features */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2 text-center">Advanced Features</h2>
            <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Exclusive features designed to enhance your train travel experience
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Scheduled Bookings</h3>
                  <p className="text-gray-600">
                    Schedule automatic ticket bookings for Tatkal and high-demand trains. Our system will attempt
                    bookings at the optimal time and notify you immediately once secured.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ticket Transfer</h3>
                  <p className="text-gray-600">
                    Need to transfer your ticket to someone else? Our unique ticket transfer feature lets you securely
                    share tickets with family and friends without cancellation fees.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Digital Tickets</h3>
                  <p className="text-gray-600">
                    Paperless travel with secure, verified digital tickets. Includes QR codes for quick validation
                    and all passenger information in an easy-to-access format.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI Travel Assistant</h3>
                  <p className="text-gray-600">
                    Ask Disha, our AI-powered assistant, can handle complex queries, help with bookings,
                    provide journey information, and offer personalized travel advice.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Quick Refunds</h3>
                  <p className="text-gray-600">
                    Fast and hassle-free refund processing for canceled tickets. Initiate refunds with a single
                    click and track the status in real-time through your account.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Offline Access</h3>
                  <p className="text-gray-600">
                    Access your tickets and essential journey information even without an internet connection.
                    Perfect for traveling through areas with limited connectivity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Premium Services */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2 text-center">Premium Services</h2>
            <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Enhanced services available for premium members
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="border border-primary/20 rounded-lg p-6 bg-white shadow-sm">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <RotateCcw className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Auto Waitlist Conversion</h3>
                <p className="text-gray-600 text-center">
                  Our system automatically monitors waitlisted tickets and attempts to secure confirmed seats
                  through available alternatives, increasing your chances of travel confirmation.
                </p>
              </div>
              
              <div className="border border-primary rounded-lg p-6 bg-gradient-to-b from-primary/5 to-white shadow-md transform scale-105">
                <div className="text-center mb-2">
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">MOST POPULAR</span>
                </div>
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Priority Tatkal Booking</h3>
                <p className="text-gray-600 text-center">
                  Get priority queue access during Tatkal booking hours, giving you a significant advantage
                  in securing high-demand tickets during peak travel seasons.
                </p>
              </div>
              
              <div className="border border-primary/20 rounded-lg p-6 bg-white shadow-sm">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Train className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">Journey Planner</h3>
                <p className="text-gray-600 text-center">
                  Advanced trip planning tools with personalized recommendations for routes, trains, 
                  and connecting services based on your preferences and travel history.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Experience Better Train Travel?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join millions of travelers who trust RailYatri Connect for their railway journey needs.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/auth?tab=register">
                <Button className="bg-white text-primary hover:bg-gray-100">Sign Up Now</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Train className="h-6 w-6 mr-2" />
              <span className="font-bold text-lg">RailYatri Connect</span>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} RailYatri Connect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}