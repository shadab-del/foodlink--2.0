import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { FoodDonation, PickupRequest, DonationStatus, UserRole } from '../types';
import { Building2, Heart, Calendar, MapPin, Clock, ShieldAlert, CheckSquare, Phone, Inbox } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import DonationCard from '../components/DonationCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NgoDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("browse-donations");
  const [allDonations, setAllDonations] = useState<FoodDonation[]>([]);
  const [myRequests, setMyRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Subscribe to ALL available food donations
    const unsubscribeDonations = dataService.subscribeDonations((donations) => {
      setAllDonations(donations);
    });

    // Subscribe to pickup requests created by THIS NGO
    const unsubscribeRequests = dataService.subscribeRequests((reqs) => {
      setMyRequests(reqs);
    }, user.uid, true);

    setLoading(false);

    return () => {
      unsubscribeDonations();
      unsubscribeRequests();
    };
  }, [user]);

  const handleClaimPickup = async (donation: FoodDonation) => {
    if (!user) return;

    try {
      await dataService.requestPickup(user.uid, user.name, donation);
      showToast(`Food Claimed! A pickup Request was successfully logged for: ${donation.foodName}`, "success");
      setActiveTab('my-pickups');
    } catch (err) {
      showToast("Claim request failed: " + String(err), "error");
    }
  };

  // Filter listings
  const availableDonations = allDonations.filter(d => d.status === DonationStatus.AVAILABLE || d.status === DonationStatus.REQUESTED);
  
  // Filter claims
  const activeClaims = myRequests.filter(r => r.requestStatus !== DonationStatus.COMPLETED);
  const completedClaims = myRequests.filter(r => r.requestStatus === DonationStatus.COMPLETED);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between" id="ngo-dashboard-root">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="ngo-main-view">
        
        {/* Toast Container */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-white border transition-all ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 
            toast.type === 'error' ? 'bg-red-650 bg-red-600 border-red-500' : 'bg-gray-800 border-gray-700'
          }`} id="ngo-toast">
            <span>{toast.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Dashboard Left Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar 
              role={user?.role!} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              userName={user?.name}
              isVerified={user?.verified}
            />
          </div>

          {/* Interactive Workspace Panel */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm" id="ngo-work-area">
            
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <>
                {/* TAB 1: BROWSE SURPLUS FOOD */}
                {activeTab === "browse-donations" && (
                  <div className="space-y-6" id="browse-surplus-pane">
                    
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Browse Surplus Meals
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Dispatched locally. Look at quantities, locations, and expiry countdown indicators before logging a pickup request.
                      </p>
                    </div>



                    {availableDonations.length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-gray-150 rounded-3xl p-6" id="ngo-browse-empty">
                        <div className="w-12 h-12 bg-slate-50 border rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-xs">
                          <Inbox className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="font-extrabold text-base text-gray-700">No surplus donations available nearby</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 leading-relaxed">
                          All fresh surplus listings in your urban vicinity are currently claimed or completed. We will alert you immediately when new hospitality batches are registered!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="ngo-listings-grid">
                        {availableDonations.map((donation) => (
                          <DonationCard
                            key={donation.id}
                            donation={donation}
                            onRequestSelect={handleClaimPickup}
                            currentUserRole={user?.role}
                            showControlButtons={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: ACTIVE PICKUP CLAIMS */}
                {activeTab === "my-pickups" && (
                  <div className="space-y-6" id="my-pickups-pane">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-950">
                        Active Pickup Claims
                      </h2>
                      <p className="text-xs text-gray-450 text-gray-400 mt-1">
                        Coordinate active surplus collection and dispatcher logs. Contact numbers are displayed for rapid support.
                      </p>
                    </div>

                    {activeClaims.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50/50 border border-slate-100 rounded-3xl p-6" id="claims-empty">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-xs border">
                          <Heart className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="font-extrabold text-base text-gray-700">No active claimed requests</h3>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                          You haven't claimed any active listings. Use the "Browse Surplus" menu tab to claim available food.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4" id="claims-list">
                        {activeClaims.map((r) => {
                          const associatedDon = allDonations.find(d => d.id === r.donationId);
                          if (!associatedDon) return null;

                          return (
                            <div 
                              key={r.id} 
                              className="border border-slate-150 rounded-2xl p-5 bg-white shadow-xs flex flex-col space-y-4 select-text"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-50 pb-3">
                                <div>
                                  <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                                    {associatedDon.foodName}
                                  </h3>
                                  <span className="text-[10px] text-gray-400 font-mono">Claim ID: {r.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg">
                                    {associatedDon.quantity}
                                  </span>
                                  <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-250 rounded-full font-mono uppercase">
                                    {r.requestStatus}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-2 text-gray-600">
                                  <p className="flex items-center gap-1.5 font-semibold text-orange-650 text-orange-600">
                                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                                    Donor: {associatedDon.donorName}
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                    Address: {associatedDon.pickupLocation}
                                  </p>
                                </div>

                                <div className="space-y-2 text-gray-600">
                                  <p className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                    Expiry Target: {new Date(associatedDon.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Today)
                                  </p>
                                  <p className="flex items-center gap-2 font-mono font-semibold bg-slate-50 p-2 rounded-lg border w-fit">
                                    <Phone className="w-4 h-4 text-emerald-600" />
                                    Logistics Contact: +91 90055 22110
                                  </p>
                                </div>
                              </div>

                              {r.requestStatus === DonationStatus.ACCEPTED && (
                                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs space-y-1 font-semibold border border-emerald-150">
                                  <p>✓ Claim Lockup Approved!</p>
                                  <p className="font-normal text-gray-650 text-gray-600 leading-relaxed">
                                    Please coordinate with {associatedDon.donorName} on the number displayed above to schedule pickup immediately before expiration.
                                  </p>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: COMPLETED HISTORY LOG */}
                {activeTab === "pickup-history" && (
                  <div className="space-y-6" id="pickup-history-pane">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-950">
                        Completed Pickups History
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Chronological listings ledger of nutritional surplus meals successfully claiming and sharing.
                      </p>
                    </div>

                    {completedClaims.length === 0 ? (
                      <div className="text-center py-16 border border-gray-100 bg-slate-50/50 rounded-3xl p-6" id="history-empty">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 border shadow-xs">
                          <CheckSquare className="w-5 h-5 text-gray-400 font-medium" />
                        </div>
                        <h3 className="font-extrabold text-base text-gray-700">No history logged yet</h3>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                          Completed deliveries and distributions verified by you or donor restaurants will record in this ledger.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3" id="completed-ledger">
                        {completedClaims.map((r) => {
                          const associatedDon = allDonations.find(d => d.id === r.donationId);
                          if (!associatedDon) return null;

                          return (
                            <div 
                              key={r.id} 
                              className="border border-emerald-150 rounded-2xl p-4.5 bg-emerald-50/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1 text-gray-650">
                                <p className="font-extrabold text-emerald-900 text-sm">{associatedDon.foodName}</p>
                                <p className="text-gray-500">
                                  Delivered {associatedDon.quantity} from {associatedDon.donorName} located in {associatedDon.pickupLocation}.
                                </p>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                <span className="bg-emerald-100 border border-emerald-250 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-lg select-none uppercase font-mono tracking-wider">
                                  ✓ SHared & Saved
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
