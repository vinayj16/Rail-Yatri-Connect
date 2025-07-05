import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Phone, 
  Mail 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About IRCTC</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-gray-300">About Us</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Corporate Profile</Link></li>
              <li><Link href="#" className="hover:text-gray-300">News & Information</Link></li>
              <li><Link href="#" className="hover:text-gray-300">RTI</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-gray-300">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Feedback & Suggestions</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Advertise with Us</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Agent Registration</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-gray-300">FAQs</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-gray-300">Refund Rules</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect with Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-white hover:text-gray-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <Linkedin size={20} />
              </a>
            </div>
            <div className="text-sm">
              <p>Customer Care:</p>
              <p className="font-medium flex items-center gap-1 mt-1">
                <Phone size={14} />
                1800-XXX-XXXX (Toll Free)
              </p>
              <p className="mt-2">Email:</p>
              <p className="font-medium flex items-center gap-1 mt-1">
                <Mail size={14} />
                care@irctc.co.in
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-center text-gray-400">
          <p>© {new Date().getFullYear()} IRCTC Clone. All Rights Reserved.</p>
          <p className="mt-2">This is a demo project for educational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
