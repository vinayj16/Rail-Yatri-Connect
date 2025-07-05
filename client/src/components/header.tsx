import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Menu, User, LogOut, Clock, Calendar, Bell, 
  Info, PhoneCall, HelpCircle, Train, ShieldCheck, 
  Clock4 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "PNR Status Updated",
      message: "Your PNR #4323234332 has been confirmed.",
      time: "10 mins ago",
      read: false,
      type: "success",
    },
    {
      id: 2, 
      title: "Platform Change",
      message: "Train #12505 will now arrive at Platform 4 instead of 2.",
      time: "35 mins ago",
      read: false,
      type: "alert"
    },
    {
      id: 3,
      title: "Payment Reminder",
      message: "Complete your payment for Tatkal Booking #TK24953 within 15 minutes.",
      time: "2 hours ago",
      read: true,
      type: "reminder"
    }
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <header className="bg-white shadow-md">
      {/* Live date and time banner */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-1 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {currentDateTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium tabular-nums">
                {currentDateTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <svg 
                  viewBox="0 0 24 24" 
                  className="h-10 w-10 text-primary" 
                  fill="currentColor"
                >
                  <path d="M4 15.25V15.25C2.9 15.25 2 14.35 2 13.25V8.75C2 7.65 2.9 6.75 4 6.75V6.75C5.1 6.75 6 7.65 6 8.75V13.25C6 14.35 5.1 15.25 4 15.25Z" />
                  <path d="M20 15.25V15.25C18.9 15.25 18 14.35 18 13.25V8.75C18 7.65 18.9 6.75 20 6.75V6.75C21.1 6.75 22 7.65 22 8.75V13.25C22 14.35 21.1 15.25 20 15.25Z" />
                  <path d="M12 15.25V15.25C10.9 15.25 10 14.35 10 13.25V8.75C10 7.65 10.9 6.75 12 6.75V6.75C13.1 6.75 14 7.65 14 8.75V13.25C14 14.35 13.1 15.25 12 15.25Z" />
                  <path d="M2 13.25H22" />
                  <path d="M22 19.25H2V16.75H22V19.25Z" />
                </svg>
                <span className="ml-2 text-xl font-semibold text-primary">RailYatri Connect</span>
              </Link>
            </div>
          </div>

          {/* Nav items for desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className={location === "/" ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}>
              Home
            </Link>
            <Link href="/train-schedule" className={location === "/train-schedule" ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}>
              Train Schedule
            </Link>
            <Link href="/pnr-status" className={location === "/pnr-status" ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}>
              PNR Status
            </Link>
            <Link href="/my-bookings" className={location === "/my-bookings" ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}>
              My Bookings
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-700 hover:text-primary flex items-center gap-1 outline-none">
                  More <span className="text-xs mt-1">▼</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/about" className="cursor-pointer flex items-center">
                    <Info className="h-4 w-4 mr-2" /> About Us
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/services" className="cursor-pointer flex items-center">
                    <Train className="h-4 w-4 mr-2" /> Services
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="cursor-pointer flex items-center">
                    <PhoneCall className="h-4 w-4 mr-2" /> Contact Us
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="cursor-pointer flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" /> Help & Support
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-medium">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 px-4 text-center text-muted-foreground">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b hover:bg-muted/30 transition-colors cursor-pointer ${!notification.read ? 'bg-muted/10' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-2">
                          {notification.type === 'success' && (
                            <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          {notification.type === 'alert' && (
                            <Bell className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          )}
                          {notification.type === 'reminder' && (
                            <Clock4 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <span className="text-xs text-muted-foreground mt-1 block">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t text-center">
                  <Button variant="link" className="text-sm h-auto w-full">View All Notifications</Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <span className="font-medium">{user.fullName.split(' ')[0]}</span>
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings" className="cursor-pointer">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-primary">Login</Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button className="bg-primary hover:bg-primary/90">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/" className={location === "/" ? "block text-primary font-medium" : "block text-gray-700"}>
              Home
            </Link>
            <Link href="/train-schedule" className={location === "/train-schedule" ? "block text-primary font-medium" : "block text-gray-700"}>
              Train Schedule
            </Link>
            <Link href="/pnr-status" className={location === "/pnr-status" ? "block text-primary font-medium" : "block text-gray-700"}>
              PNR Status
            </Link>
            <Link href="/my-bookings" className={location === "/my-bookings" ? "block text-primary font-medium" : "block text-gray-700"}>
              My Bookings
            </Link>
            <div className="mt-2 pt-2 border-t">
              <h3 className="text-sm text-muted-foreground mb-2">More</h3>
              <Link href="/about" className="block text-gray-700 py-1">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2" /> About Us
                </div>
              </Link>
              <Link href="/services" className="block text-gray-700 py-1">
                <div className="flex items-center">
                  <Train className="h-4 w-4 mr-2" /> Services
                </div>
              </Link>
              <Link href="/contact" className="block text-gray-700 py-1">
                <div className="flex items-center">
                  <PhoneCall className="h-4 w-4 mr-2" /> Contact Us
                </div>
              </Link>
              <Link href="/help" className="block text-gray-700 py-1">
                <div className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" /> Help & Support
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
