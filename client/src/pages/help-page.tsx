import { Link } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, HelpCircle, CreditCard, Ticket,
  AlertCircle, Calendar, User, Clock, Phone,
  BookOpen, MessageSquare, Train, Headphones
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">Help & Support</h1>
              <p className="text-xl text-gray-700 mb-8">
                Find answers to common questions or reach out to our support team
              </p>
              
              <div className="relative max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  className="pl-10 pr-4 py-6 rounded-lg text-base"
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </section>
        
        {/* Help Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Popular Help Topics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="#booking">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <Ticket className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-medium">Booking Help</h3>
                </div>
              </Link>
              
              <Link href="#payment">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <CreditCard className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-medium">Payment Issues</h3>
                </div>
              </Link>
              
              <Link href="#cancellation">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-medium">Cancellations & Refunds</h3>
                </div>
              </Link>
              
              <Link href="#account">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-medium">Account Management</h3>
                </div>
              </Link>
            </div>
          </div>
        </section>
        
        {/* FAQs */}
        <section className="py-16 bg-gray-100" id="faqs">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <Card id="booking">
                  <AccordionItem value="item-1" className="border-none">
                    <CardContent className="p-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center text-left">
                          <Ticket className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                          <span className="font-medium">How do I book a train ticket?</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-0 text-gray-600">
                        To book a train ticket:
                        <ol className="list-decimal ml-5 mt-2 space-y-1">
                          <li>Go to the home page and enter your source, destination, and travel date</li>
                          <li>Select a train from the available options</li>
                          <li>Choose your preferred class and seat/berth</li>
                          <li>Enter passenger details</li>
                          <li>Review booking details and proceed to payment</li>
                          <li>Complete payment and receive your e-ticket</li>
                        </ol>
                      </AccordionContent>
                    </CardContent>
                  </AccordionItem>
                </Card>
                
                <Card>
                  <AccordionItem value="item-2" className="border-none">
                    <CardContent className="p-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center text-left">
                          <AlertCircle className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                          <span className="font-medium">What is the Tatkal booking system?</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-0 text-gray-600">
                        Tatkal booking is a facility for passengers who need to travel at short notice. 
                        Tatkal tickets can be booked one day in advance (excluding the day of journey) from 
                        10:00 AM for AC classes and 11:00 AM for non-AC classes. Tatkal bookings have a higher 
                        fare than regular tickets and are available on a first-come, first-served basis.
                      </AccordionContent>
                    </CardContent>
                  </AccordionItem>
                </Card>
                
                <Card id="payment">
                  <AccordionItem value="item-3" className="border-none">
                    <CardContent className="p-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center text-left">
                          <CreditCard className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                          <span className="font-medium">What payment methods are accepted?</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-0 text-gray-600">
                        We accept multiple payment methods including:
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>Credit Cards (Visa, MasterCard, American Express)</li>
                          <li>Debit Cards</li>
                          <li>Net Banking</li>
                          <li>UPI (Google Pay, PhonePe, Paytm)</li>
                          <li>Digital Wallets</li>
                          <li>IRCTC Pay Later</li>
                        </ul>
                      </AccordionContent>
                    </CardContent>
                  </AccordionItem>
                </Card>
                
                <Card>
                  <AccordionItem value="item-4" className="border-none">
                    <CardContent className="p-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center text-left">
                          <Clock className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                          <span className="font-medium">My payment was deducted but I didn't get a ticket</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-0 text-gray-600">
                        If your payment was deducted but you didn't receive a ticket confirmation, don't worry. 
                        Such transactions are usually automatically refunded within 5-7 working days. 
                        You can also check the status in the "Transaction History" section of your account.
                        
                        <p className="mt-2">If the refund doesn't reflect after 7 days, please contact our support 
                        team with your transaction ID and booking details.</p>
                      </AccordionContent>
                    </CardContent>
                  </AccordionItem>
                </Card>
                
                <Card id="cancellation">
                  <AccordionItem value="item-5" className="border-none">
                    <CardContent className="p-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center text-left">
                          <Calendar className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                          <span className="font-medium">How do I cancel my ticket and get a refund?</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-0 text-gray-600">
                        To cancel your ticket:
                        <ol className="list-decimal ml-5 mt-2 space-y-1">
                          <li>Log in to your account</li>
                          <li>Go to "My Bookings"</li>
                          <li>Select the booking you wish to cancel</li>
                          <li>Click on "Cancel Ticket"</li>
                          <li>Confirm cancellation</li>
                        </ol>
                        <p className="mt-2">Refunds are processed according to railway cancellation rules, 
                        with deductions based on the time before departure. The refund amount will be credited 
                        back to your original payment method within 3-7 working days.</p>
                      </AccordionContent>
                    </CardContent>
                  </AccordionItem>
                </Card>
                
                <Card id="account">
                  <AccordionItem value="item-6" className="border-none">
                    <CardContent className="p-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center text-left">
                          <User className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                          <span className="font-medium">How do I reset my password?</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-0 text-gray-600">
                        To reset your password:
                        <ol className="list-decimal ml-5 mt-2 space-y-1">
                          <li>Click on "Login" from the home page</li>
                          <li>Select "Forgot Password"</li>
                          <li>Enter the email address associated with your account</li>
                          <li>Click on "Send Reset Link"</li>
                          <li>Check your email and follow the instructions in the reset link</li>
                          <li>Create a new password and confirm it</li>
                        </ol>
                        <p className="mt-2">Reset links are valid for 1 hour. If you don't receive the email, 
                        check your spam folder or request a new reset link.</p>
                      </AccordionContent>
                    </CardContent>
                  </AccordionItem>
                </Card>
              </Accordion>
            </div>
          </div>
        </section>
        
        {/* Help Guides */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2 text-center">Help Guides</h2>
            <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Step-by-step tutorials to help you navigate our platform
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Booking Your First Ticket</h3>
                  <p className="text-gray-600 mb-4">
                    A complete beginners guide to finding and booking train tickets on RailYatri Connect.
                  </p>
                  <Link href="/guides/booking-first-ticket">
                    <Button variant="outline" className="w-full">Read Guide</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Ticket className="h-12 w-12 text-gray-400" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Managing Your Bookings</h3>
                  <p className="text-gray-600 mb-4">
                    Learn how to view, modify, cancel, and get refunds for your train tickets.
                  </p>
                  <Link href="/guides/managing-bookings">
                    <Button variant="outline" className="w-full">Read Guide</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <MessageSquare className="h-12 w-12 text-gray-400" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Using the AI Assistant</h3>
                  <p className="text-gray-600 mb-4">
                    Get the most out of our AI chatbot with tips for asking questions and quick commands.
                  </p>
                  <Link href="/guides/using-ai-assistant">
                    <Button variant="outline" className="w-full">Read Guide</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Contact Support */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/3 flex flex-col items-center text-center">
                    <Headphones className="h-20 w-20 text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
                    <p className="text-gray-600 mb-4">
                      Our support team is available 24/7 to assist you with any issues.
                    </p>
                  </div>
                  
                  <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/contact">
                      <Button className="w-full flex items-center justify-center gap-2 h-auto py-4">
                        <Phone className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Call Support</div>
                          <div className="text-sm opacity-90">1800-889-8989</div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/contact">
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-auto py-4">
                        <MessageSquare className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Email Support</div>
                          <div className="text-sm opacity-90">support@railyatriconnect.com</div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/chat">
                      <Button variant="secondary" className="w-full flex items-center justify-center gap-2 h-auto py-4">
                        <MessageSquare className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Live Chat</div>
                          <div className="text-sm opacity-90">Available 24/7</div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/feedback">
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-auto py-4 border-dashed">
                        <HelpCircle className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Submit Feedback</div>
                          <div className="text-sm opacity-90">Help us improve</div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
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