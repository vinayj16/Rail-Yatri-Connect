import Header from "@/components/header";
import Footer from "@/components/footer";
import PnrChecker from "@/components/pnr-checker";

export default function PnrStatusPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">PNR Status</h1>
            <p className="text-lg mb-6">Check the status of your train ticket booking</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <PnrChecker />
            
            <div className="mt-10 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">About PNR Status</h2>
              
              <div className="prose max-w-none">
                <p>
                  The Passenger Name Record (PNR) is a unique 10-digit number assigned to every 
                  ticket booked through IRCTC. By checking your PNR status, you can track:
                </p>
                
                <ul className="mt-4 list-disc list-inside">
                  <li>Current booking status (Confirmed, RAC, Waitlist)</li>
                  <li>Coach and berth/seat number (if allocated)</li>
                  <li>Train details like departure and arrival time</li>
                  <li>Date of journey and class of travel</li>
                </ul>
                
                <h3 className="text-lg font-medium mt-6 mb-2">What do different status codes mean?</h3>
                
                <p><strong>CNF/Confirmed:</strong> Your ticket is confirmed with a coach and berth assignment.</p>
                <p><strong>RAC (Reservation Against Cancellation):</strong> You have a shared berth and will be given a full berth if available.</p>
                <p><strong>WL (Waitlist):</strong> Your ticket is on a waiting list and will be confirmed if seats become available.</p>
                <p><strong>CAN/Cancelled:</strong> The ticket has been cancelled.</p>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-md border border-amber-200">
                  <p className="text-sm">
                    <strong>Note:</strong> PNR status may change as the journey date approaches due to 
                    cancellations and chart preparation. It's recommended to check your PNR status regularly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
