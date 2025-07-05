import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PnrStatusPage from "@/pages/pnr-status-page";
import TrainSchedulePage from "@/pages/train-schedule-page";
import AboutPage from "@/pages/about-page";
import ServicesPage from "@/pages/services-page";
import ContactPage from "@/pages/contact-page";
import HelpPage from "@/pages/help-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { FloatingChatbot } from "@/components/chatbot";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/pnr-status" component={PnrStatusPage} />
      <Route path="/train-schedule" component={TrainSchedulePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/help" component={HelpPage} />
      <ProtectedRoute path="/my-bookings" component={() => <div>My Bookings</div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <FloatingChatbot />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
