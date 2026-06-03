import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { FoodDonation, PickupRequest, DonationStatus, FoodCategory } from '../types';
import { INDIAN_LOCATIONS } from '../utils/dummyData';
import { PlusCircle, Calendar, MapPin, Clock, Heart, Trash2, Smartphone, AlertTriangle, CheckSquare, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import DonationCard from '../components/DonationCard';
import LoadingSpinner from '../components/LoadingSpinner';

const IMAGE_PRESETS = [
  { name: "Veg Biryani & Curry", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop" },
  { name: "Plated South Indian Meals", url: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600&auto=format&fit=crop" },
  { name: "Idli & Sambhar Tray", url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop" },
  { name: "Roti & Paneer Curry Combo", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop" },
  { name: "Chicken Dum Biryani Handi", url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format&fit=crop" }
];

export default function DonorDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("active-donations");
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form states
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<FoodCategory>(FoodCategory.VEG);
  const [pickupLocation, setPickupLocation] = useState(user?.address || '');
  const [contactNumber, setContactNumber] = useState(user?.phoneNumber || '');
  const [hoursToExpire, setHoursToExpire] = useState('6');
  const [selectedImagePreset, setSelectedImagePreset] = useState(IMAGE_PRESETS[0].url);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Subscribe to donations
    const unsubscribeDonations = dataService.subscribeDonations((allDonations) => {
      // Filter for current donor
      const donorList = allDonations.filter(d => d.donorId === user.uid);
      setDonations(donorList);
    });

    // Subscribe to pickup requests for this donor
    const unsubscribeRequests = dataService.subscribeRequests((allReqs) => {
      setRequests(allReqs);
    }, user.uid, false);

    setLoading(false);

    return () => {
      unsubscribeDonations();
      unsubscribeRequests();
    };
  }, [user]);

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!foodName || !quantity || !pickupLocation) {
      showToast("Please provide all required fields.", "error");
      return;
    }

    try {
      const preparedTime = new Date().toISOString();
      const expiryDateObj = new Date();
      expiryDateObj.setHours(expiryDateObj.getHours() + parseInt(hoursToExpire));
      const expiryTime = expiryDateObj.toISOString();

      await dataService.addDonation({
        donorId: user.uid,
        donorName: user.name,
        foodName,
        quantity,
        category,
        pickupLocation,
        preparedTime,
        expiryTime,
        imageURL: selectedImagePreset,
        status: DonationStatus.AVAILABLE
      });

      showToast("Surplus food listing uploaded successfully!", "success");
      
      // Reset form variables
      setFoodName('');
      setQuantity('');
      setActiveTab('active-donations');

    } catch (err) {
      showToast("Failed to upload donation: " + String(err), "error");
    }
  };

  const handleUpdateStatus = async (requestId: string, status: DonationStatus, donationId: string) => {
    try {
      await dataService.updateRequestStatus(requestId, status, donationId);
      
      let alertMsg = "Status updated!";
      if (status === DonationStatus.ACCEPTED) alertMsg = "Request Accepted! NGO has been notified.";
      else if (status === DonationStatus.PICKED_UP) alertMsg = "Marked as Picked Up! Delivery in progress.";
      else if (status === DonationStatus.COMPLETED) alertMsg = "Meals marked as completed distribution! Thank you.";

      showToast(alertMsg, "success");
    } catch (err) {
      showToast("Error updating request: " + String(err), "error");
    }
  };

  const handleReject = async (requestId: string, donationId: string, ngoId: string, fName: string) => {
    try {
      await dataService.rejectRequest(requestId, donationId, ngoId, fName);
      showToast("Request rejected. Listing reverted to available.", "info");
    } catch (err) {
      showToast("Error rejecting request: " + String(err), "error");
    }
  };

  const handleDeleteListing = async (donationId: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        await dataService.deleteDonation(donationId);
        showToast("Surplus listing deleted successfully", "info");
      } catch (err) {
        showToast("Error deleting listing: " + String(err), "error");
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between" id="donor-dashboard-root">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="donor-main-sec">
        
        {/* Toast Toast Container */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-white border transition-all ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 
            toast.type === 'error' ? 'bg-red-600 border-red-500' : 'bg-gray-800 border-gray-700'
          }`} id="donor-toast">
            <span>{toast.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Dashboard Menu Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar 
              role={user?.role!} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              userName={user?.name}
              isVerified={user?.verified}
            />
          </div>

          {/* Interactive Work Area */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm" id="donor-work-pane">
            
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <>
                {/* TAB 1: ADD SURPLUS FOOD */}
                {activeTab === "add-food" && (
                  <div className="space-y-6" id="add-food-container">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Donate Surplus Food
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload information about fresh excess meals to alert nearby NGOs.
                      </p>
                    </div>



                    <form onSubmit={handleCreateDonation} className="space-y-5" id="add-surplus-form">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Food Description */}
                        <div className="flex flex-col space-y-1">
                          <label htmlFor="food-name-input" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                            Food Description / Items
                          </label>
                          <input
                            id="food-name-input"
                            type="text"
                            required
                            placeholder="E.g., Paneer Butter Masala with 40 Rotis"
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
                            className="px-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                          />
                        </div>

                        {/* Quantity representation */}
                        <div className="flex flex-col space-y-1">
                          <label htmlFor="quantity-input" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                            Est. Quantity (Meals Counter)
                          </label>
                          <input
                            id="quantity-input"
                            type="text"
                            required
                            placeholder="E.g., 30 Meals, 10 Kgs"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="px-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                          />
                        </div>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Category selection */}
                        <div className="flex flex-col space-y-1">
                          <label htmlFor="veg-option" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                            Category Tag
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              id="veg-option"
                              type="button"
                              onClick={() => setCategory(FoodCategory.VEG)}
                              className={`py-2 px-3 rounded-lg border font-bold text-xs select-none transition cursor-pointer ${
                                category === FoodCategory.VEG
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                                  : "border-gray-200 text-gray-500 hover:bg-slate-50"
                              }`}
                            >
                              Vegetarian
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategory(FoodCategory.NON_VEG)}
                              className={`py-2 px-3 rounded-lg border font-bold text-xs select-none transition cursor-pointer ${
                                category === FoodCategory.NON_VEG
                                  ? "bg-orange-50 border-orange-500 text-orange-850"
                                  : "border-gray-200 text-gray-500 hover:bg-slate-50"
                              }`}
                            >
                              Non-Veg
                            </button>
                          </div>
                        </div>

                        {/* Hours to Expiry */}
                        <div className="flex flex-col space-y-1">
                          <label htmlFor="expiry-hours" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                            Consumption Time Left
                          </label>
                          <select
                            id="expiry-hours"
                            value={hoursToExpire}
                            onChange={(e) => setHoursToExpire(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50/50 border border-gray-200 rounded-xl text-sm focus:border-emerald-600 focus:bg-white cursor-pointer"
                          >
                            <option value="4">4 Hours (Highly Perishable)</option>
                            <option value="6">6 Hours (Standard Hot Meals)</option>
                            <option value="12">12 Hours (Bakery / Sweets)</option>
                            <option value="24">24 Hours (Packed/Dry grains)</option>
                          </select>
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-col space-y-1">
                          <label htmlFor="contact-num" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                            Pickup Helpline
                          </label>
                          <input
                            id="contact-num"
                            type="tel"
                            required
                            placeholder="Helpdesk phone"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            className="px-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                          />
                        </div>

                      </div>

                      {/* Pickup Address */}
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="location-selector" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                          Confirm Pickup Location Cluster
                        </label>
                        <select
                          id="location-selector"
                          required
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          className="px-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
                        >
                          {INDIAN_LOCATIONS.map((loc, ix) => (
                            <option key={ix} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>

                      {/* Cover Image Preset */}
                      <div className="flex flex-col space-y-2 pt-2">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                          Select Food Image Cover Asset
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {IMAGE_PRESETS.map((img, ix) => (
                            <button
                              key={ix}
                              type="button"
                              onClick={() => setSelectedImagePreset(img.url)}
                              className={`rounded-xl overflow-hidden border-2 relative h-16 transition cursor-pointer select-none ${
                                selectedImagePreset === img.url ? 'border-emerald-500 scale-95 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                                <span className="text-[8px] text-white font-bold truncate block w-full">{img.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4 text-sm"
                        id="form-upload-button"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Publish Surplus Food Listing</span>
                      </button>

                    </form>
                  </div>
                )}

                {/* TAB 2: ACTIVE LISTINGS DIRECTORY */}
                {activeTab === "active-donations" && (
                  <div className="space-y-6" id="active-listings-pane">
                    <div className="flex justify-between items-center bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <div>
                        <h2 className="text-base font-bold text-slate-800">
                          Surplus Food Catalog
                        </h2>
                        <p className="text-xs text-slate-500">
                          You have {donations.length} outstanding surplus listings registered.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('add-food')}
                        className="px-4 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-orange-700 cursor-pointer flex items-center gap-1"
                      >
                        <PlusCircle className="w-4 h-4" /> Add Food
                      </button>
                    </div>

                    {donations.length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-3xl p-6" id="donor-empty-state">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                          <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-base text-gray-700">No surplus food listed yet</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                          You can easily catalog fresh food surplus by pressing the "Donate Surplus" tab.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="donor-cards-grid">
                        {donations.map((d) => (
                          <DonationCard
                            key={d.id}
                            donation={d}
                            onDeleteSelect={handleDeleteListing}
                            currentUserRole={user?.role}
                            showControlButtons={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: INCOMING REQUESTS / CLAIMS WORKFLOW */}
                {activeTab === "manage-requests" && (
                  <div className="space-y-6" id="incoming-requests-pane">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                        NGO Pickup Requests
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Evaluate claims lodged by local verified recipients. Approve lockups to schedule safe delivery.
                      </p>
                    </div>

                    {requests.length === 0 ? (
                      <div className="text-center py-16 border border-gray-100 bg-slate-50/30 rounded-3xl p-6" id="requests-empty-state">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 border shadow-xs">
                          <Heart className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="font-extrabold text-base text-gray-700">No pickup claims received yet</h3>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                          When an NGO submits interest in a surplus listing, it will instantly show up in this panel for validation.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4" id="requests-workflow-list">
                        {requests.map((r) => {
                          const associatedDon = donations.find(d => d.id === r.donationId);
                          if (!associatedDon) return null;

                          return (
                            <div 
                              key={r.id} 
                              className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40 hover:bg-white hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                              <div className="space-y-1.5 flex-1 select-text">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-950 text-sm">{r.ngoName}</span>
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md font-mono">
                                    Verified NGO
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  Requested meals of <span className="font-bold text-emerald-700">"{associatedDon.foodName}"</span> ({associatedDon.quantity}) listed in {associatedDon.pickupLocation}.
                                </p>
                                <div className="flex gap-4 text-[10px] text-gray-400 font-mono">
                                  <span>Logged: {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>Donation ID: {r.donationId}</span>
                                </div>
                              </div>

                              {/* Status Action Workflow Controls */}
                              <div className="flex flex-wrap items-center gap-2" id="request-actions-bar">
                                {r.requestStatus === DonationStatus.REQUESTED && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(r.id, DonationStatus.ACCEPTED, r.donationId)}
                                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReject(r.id, r.donationId, r.ngoId, associatedDon.foodName)}
                                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 text-red-600 border border-red-100 font-bold text-xs rounded-lg transition cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}

                                {r.requestStatus === DonationStatus.ACCEPTED && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(r.id, DonationStatus.PICKED_UP, r.donationId)}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Smartphone className="w-3.5 h-3.5" /> Out for Pickup
                                  </button>
                                )}

                                {r.requestStatus === DonationStatus.PICKED_UP && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(r.id, DonationStatus.COMPLETED, r.donationId)}
                                    className="px-3.5 py-1.5 bg-emerald-705 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                                  >
                                    <CheckSquare className="w-3.5 h-3.5" /> Confirm Completed Distribution
                                  </button>
                                )}

                                {r.requestStatus === DonationStatus.COMPLETED && (
                                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-100">
                                    Completed & Distributed
                                  </span>
                                )}
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
