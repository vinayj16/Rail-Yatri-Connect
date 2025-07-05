import { Link } from "wouter";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Train } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(data: ContactFormValues) {
    console.log(data);
    // In a real application, this would send the data to the server
    toast({
      title: "Message sent",
      description: "Thank you for contacting us. We'll respond as soon as possible.",
    });
    form.reset();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
              <p className="text-xl text-gray-700 mb-8">
                Have questions about our services? Our team is here to help.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div>
                <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Call Us</h3>
                      <p className="text-gray-600">Customer Support: 1800-889-8989</p>
                      <p className="text-gray-600">Business Inquiries: +91-11-2354-7890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Email Us</h3>
                      <p className="text-gray-600">Support: support@railyatriconnect.com</p>
                      <p className="text-gray-600">Business: business@railyatriconnect.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Visit Us</h3>
                      <p className="text-gray-600">RailYatri Connect Headquarters</p>
                      <p className="text-gray-600">420 Railway Tech Park, Sector 62</p>
                      <p className="text-gray-600">Noida, Uttar Pradesh 201309, India</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">Working Hours</h3>
                      <p className="text-gray-600">Monday to Friday: 9:00 AM - 8:00 PM</p>
                      <p className="text-gray-600">Saturday: 10:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Customer Support: 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input 
                      id="name"
                      placeholder="Enter your full name" 
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="Enter your email address" 
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject"
                      placeholder="What is your message about?" 
                      {...form.register("subject")}
                    />
                    {form.formState.errors.subject && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message"
                      placeholder="Please describe your query in detail" 
                      rows={5}
                      {...form.register("message")}
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.message.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </div>
            </div>
            
            {/* Office Map */}
            <div className="w-full h-[400px] bg-gray-200 rounded-lg overflow-hidden">
              {/* This would be a Google Map in a real application */}
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">RailYatri Connect Headquarters</p>
                  <p className="text-gray-700">420 Railway Tech Park, Sector 62</p>
                  <p className="text-gray-700">Noida, Uttar Pradesh 201309, India</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-2">What are your customer support hours?</h3>
                  <p className="text-gray-600">
                    Our customer support team is available 24/7 for urgent matters. For general inquiries,
                    we're available Monday to Friday from 9:00 AM to 8:00 PM and Saturday from 10:00 AM to 6:00 PM.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-2">How can I report a technical issue with the app?</h3>
                  <p className="text-gray-600">
                    Technical issues can be reported through the app by navigating to Settings {'->'} Help {'->'} Report a Bug.
                    Alternatively, you can email details of the issue to support@railyatriconnect.com.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-2">Do you offer corporate booking solutions?</h3>
                  <p className="text-gray-600">
                    Yes, we provide corporate booking solutions with custom pricing, centralized billing, and a dedicated
                    account manager. Please contact our business team at business@railyatriconnect.com for details.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-2">How can I partner with RailYatri Connect?</h3>
                  <p className="text-gray-600">
                    For partnership opportunities, please send your proposal to partnerships@railyatriconnect.com with
                    details about your organization and the nature of the partnership you're interested in.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Need Immediate Assistance?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Our customer support team is standing by to help with any urgent matters. Call us now.
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-white text-primary hover:bg-gray-100">
                <Phone className="h-4 w-4 mr-2" /> Call 1800-889-8989
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Mail className="h-4 w-4 mr-2" /> Email Support
              </Button>
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