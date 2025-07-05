import { Link } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Train, Shield, Ticket, Clock, Award, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">About RailYatri Connect</h1>
              <p className="text-xl text-gray-700 mb-8">
                India's premier railway booking platform bringing cutting-edge technology
                to simplify your train journey experience.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/contact">
                  <Button className="bg-primary hover:bg-primary/90">Contact Us</Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline">Our Services</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
              <div className="prose prose-lg mx-auto">
                <p>
                  Founded in 2023, RailYatri Connect started with a simple mission: to transform the way
                  Indian travelers book and manage train journeys.
                </p>
                <p>
                  We recognized the challenges faced by millions of Indians daily when dealing with train
                  travel - from securing tickets during high-demand periods to getting accurate, real-time
                  information about train statuses. That's why we built a platform focused on creating a
                  seamless, stress-free booking experience.
                </p>
                <p>
                  Today, RailYatri Connect serves over 5 million users across India, providing not just
                  ticket booking but comprehensive journey management with innovative features like live
                  platform updates, AI-assisted booking, and fully digital tickets.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Customer First</h3>
                <p className="text-gray-600">
                  Everything we build is designed with our users' needs and convenience in mind. Your journey is our priority.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in every aspect of our service, from platform reliability to customer support.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trust & Security</h3>
                <p className="text-gray-600">
                  We maintain the highest standards of security for your data and transactions, earning your trust every day.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Achievements Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">5M+</p>
                <p className="text-gray-700">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">10K+</p>
                <p className="text-gray-700">Daily Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">98%</p>
                <p className="text-gray-700">Customer Satisfaction</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">4.8/5</p>
                <p className="text-gray-700">App Store Rating</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Leadership Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                  <svg className="h-20 w-20 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-1">Rajesh Patel</h3>
                <p className="text-primary font-medium mb-2">CEO & Founder</p>
                <p className="text-gray-600 text-sm">
                  With over 15 years in travel tech, Rajesh leads our vision to revolutionize train travel in India.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                  <svg className="h-20 w-20 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-1">Priya Singh</h3>
                <p className="text-primary font-medium mb-2">CTO</p>
                <p className="text-gray-600 text-sm">
                  Priya drives our technological innovation, ensuring RailYatri Connect stays ahead with cutting-edge solutions.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                  <svg className="h-20 w-20 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-1">Vikas Sharma</h3>
                <p className="text-primary font-medium mb-2">COO</p>
                <p className="text-gray-600 text-sm">
                  Vikas oversees operations, ensuring smooth service delivery and exceptional customer experience.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Experience Hassle-Free Train Travel?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join millions of satisfied travelers who use RailYatri Connect for their railway journey needs.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/auth?tab=register">
                <Button className="bg-white text-primary hover:bg-gray-100">Register Now</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Explore Services
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