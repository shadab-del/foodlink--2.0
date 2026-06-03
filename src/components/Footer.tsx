import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Shield, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800" id="global-application-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand/Pitch */}
          <div className="md:col-span-1.5 flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-mono font-bold text-sm">
                FL
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">FoodLink</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              Connecting surplus fresh food with hungry mouths in urban India. Helping restaurants, caterers, and bakeries avoid direct waste disposal by supporting local orphanages and shelter charities securely.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-900/40 w-fit">
              <Shield className="w-3.5 h-3.5" />
              <span>Certified Indian Social StartUp Initiative</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-mono text-orange-500">
              Platform Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Sign In Dashboard</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Register as Donor / NGO</Link>
              </li>
              <li>
                <span className="text-gray-500">Corporate Backing (Coming soon)</span>
              </li>
            </ul>
          </div>

          {/* Urban India Hubs */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-mono text-emerald-500">
              Active Regional Hubs
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                Bengaluru (Koramangala, Whitefield)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                Hyderabad (Gachibowli, Jubilee Hills)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                Chennai (Adyar, T. Nagar)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                Mumbai & Pune Core
              </li>
            </ul>
          </div>

          {/* Contact details */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-mono text-gray-400">
              Emergency Logistics
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-mono text-gray-300 font-semibold">+91 1800 419 6220</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-gray-300 hover:text-white transition-colors">logistics@foodlink.org.in</span>
              </li>
              <li className="text-[11px] text-gray-500 border-t border-gray-800 pt-3 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>College Tech Major Research Project</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500" id="footer-bottom-banner">
          <p>© {new Date().getFullYear()} FoodLink Technologies. All rights reserved across partner Indian municipalities.</p>
          <p className="flex items-center gap-1 bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
            Designed with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Social Welfare & Food Security.
          </p>
        </div>
      </div>
    </footer>
  );
}
