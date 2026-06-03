import { useState, useEffect } from 'react';
import { FoodDonation, FoodCategory, DonationStatus, UserRole } from '../types';
import { Calendar, MapPin, Clock, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface DonationCardProps {
  key?: any;
  donation: FoodDonation;
  onRequestSelect?: (donation: FoodDonation) => void;
  onDeleteSelect?: (donationId: string) => void;
  currentUserRole?: UserRole;
  showControlButtons?: boolean;
}

export default function DonationCard({ 
  donation, 
  onRequestSelect, 
  onDeleteSelect,
  currentUserRole,
  showControlButtons = false
}: DonationCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Dynamic countdown timer for expiry target
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(donation.expiryTime) - +new Date();
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const mins = Math.floor((difference / (1000 * 60)) % 60);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m left`);
      } else {
        setTimeLeft(`${mins}m left - CRITICAL`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update once every minute for performance

    return () => clearInterval(timer);
  }, [donation.expiryTime]);

  const isNgo = currentUserRole === UserRole.NGO;
  const isAdmin = currentUserRole === UserRole.ADMIN;

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow duration-300"
      id={`donation-card-${donation.id}`}
    >
      <div className="relative h-40 bg-slate-200" id="card-image-wrapper">
        {/* Category Indicator Tag overlaid at the top left */}
        <div className="absolute top-3 left-3 z-10 flex gap-2" id="card-category-indicator">
          {donation.category === FoodCategory.VEG ? (
            <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded uppercase shadow-xs">
              Veg
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded uppercase shadow-xs">
              Non-Veg
            </span>
          )}
          <span className="px-2 py-1 bg-white/95 text-slate-800 text-[10px] font-bold rounded uppercase shadow-xs">
            Freshly Prepared
          </span>
        </div>

        {/* Expiry Time Overlay styled elegantly */}
        <div className="absolute bottom-3 right-3 z-10 animate-pulse" id="card-timer-overlay">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${
            isExpired 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-slate-900/80 text-white'
          }`}>
            {timeLeft}
          </span>
        </div>

        {/* Cover Photo */}
        <div className="w-full h-full bg-slate-100 relative">
          <img 
            src={donation.imageURL || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop"} 
            alt={donation.foodName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
          />
          {/* Saffron backdrop indicator */}
          <div className="absolute bottom-3 left-3 text-white bg-slate-950/65 px-2.5 py-1 rounded-md max-w-[180px] truncate backdrop-blur-xs">
            <p className="text-[10px] font-medium opacity-90 truncate">By {donation.donorName}</p>
          </div>
        </div>
      </div>

      {/* Content Area matching the design specifications */}
      <div className="p-5 flex-1 flex flex-col justify-between" id="card-body">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1 leading-snug group-hover:text-orange-650 transition-colors">
            {donation.foodName}
          </h3>

          <div className="grid grid-cols-2 gap-4 my-4 pt-3 border-t border-slate-100" id="card-attributes-grid">
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-extrabold mb-0.5 tracking-wider font-mono">Quantity</p>
              <p className="text-sm font-semibold text-slate-700">{donation.quantity}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-400 font-extrabold mb-0.5 tracking-wider font-mono">Expires In</p>
              <p className={`text-sm font-semibold ${isExpired ? "text-slate-400" : "text-red-650 text-red-600"}`}>{timeLeft}</p>
            </div>
          </div>

          <div className="space-y-1.5 mb-4 border-t border-slate-50 pt-3" id="card-attributes">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate" title={donation.pickupLocation}>{donation.pickupLocation}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Prepared: {new Date(donation.preparedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Dynamic footer status or buttons */}
        <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between gap-4" id="card-action-bar">
          <StatusBadge status={donation.status} />

          {/* Context-aware buttons aligned and formatted precisely */}
          {showControlButtons && (
            <div className="flex items-center gap-1.5">
              {isNgo && donation.status === DonationStatus.AVAILABLE && !isExpired && (
                <button
                  type="button"
                  onClick={() => onRequestSelect && onRequestSelect(donation)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Request Pickup
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onDeleteSelect && onDeleteSelect(donation.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  title="Remove Spam / Reported Listing"
                >
                  Delete Spam
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
