import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { FoodDonation, UserProfile, UserRole, DonationStatus } from '../types';
import { INITIAL_USERS } from '../utils/dummyData';
import { PieChart as ReChartsPie, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Users, Building, Heart, Trash2, PieChart, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import AnalyticsCard from '../components/AnalyticsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CHART_MONTHLY_SAVED = [
  { month: 'Jan', meals: 2400 },
  { month: 'Feb', meals: 3800 },
  { month: 'Mar', meals: 5100 },
  { month: 'Apr', meals: 6900 },
  { month: 'May (Est)', meals: 8250 }
];

const COLORS_PIE = ['#10b981', '#f97316']; // Emerald vs Saffron

export default function AdminDashboard() {
  const { user, updateUserVerification } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>("analytics");
  const [allDonations, setAllDonations] = useState<FoodDonation[]>([]);
  const [partners, setPartners] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to all food donations
    const unsubscribeDonations = dataService.subscribeDonations((donations) => {
      setAllDonations(donations);
    });

    // Subscriptions to local database users mirror
    const handleUsersUpdate = () => {
      const stored = localStorage.getItem('foodlink_users');
      if (stored) {
        setPartners(JSON.parse(stored));
      } else {
        setPartners(INITIAL_USERS);
      }
    };

    handleUsersUpdate();
    const interval = setInterval(handleUsersUpdate, 3000); // Poll users list for instant local admin updates

    setLoading(false);

    return () => {
      unsubscribeDonations();
      clearInterval(interval);
    };
  }, []);

  const handleApprovePartner = (uid: string, name: string) => {
    updateUserVerification(uid, true);
    showToast(`Approved partnership credentials for: ${name}`, "success");
  };

  const handleModerateDelete = async (donationId: string) => {
    if (confirm("Are you sure you want to moderate and permanently delete this food listing? This will immediately remove it from all NGO views.")) {
      try {
        await dataService.deleteDonation(donationId);
        showToast("Spam food listing intercepted and deleted by Admin", "info");
      } catch (err) {
        showToast("Failed to delete: " + String(err), "info");
      }
    }
  };

  // Calculate high quality analytics indicators
  const totalDonationsCount = allDonations.length;
  const activeDonationsCount = allDonations.filter(d => d.status === DonationStatus.AVAILABLE).length;
  const completedCount = allDonations.filter(d => d.status === DonationStatus.COMPLETED).length;
  
  const donorCount = partners.filter(p => p.role === UserRole.DONOR).length;
  const ngoCount = partners.filter(p => p.role === UserRole.NGO).length;

  const vegCount = allDonations.filter(d => d.category === "veg").length;
  const nonVegCount = allDonations.filter(d => d.category === "non-veg").length;

  const categoryPieData = [
    { name: 'Vegetarian surplus', value: vegCount || 5 },
    { name: 'Non-Vegetarian surplus', value: nonVegCount || 3 }
  ];

  const pendingPartnersList = partners.filter(p => !p.verified && p.role !== UserRole.ADMIN);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between" id="admin-dashboard-root">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-main-view">
        
        {/* Toast alerts */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-white transition-all anim">
            <span>{toast.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Admin Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Sidebar 
              role={user?.role!} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              userName={user?.name}
              isVerified={user?.verified}
            />
          </div>

          {/* Core Panel */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm" id="admin-work-pane">
            
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <>
                {/* TAB 1: PLATFORM IMPACT ANALYTICS */}
                {activeTab === "analytics" && (
                  <div className="space-y-8" id="admin-analytics-view">
                    
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Impact Analytics Dashboard
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Consolidated telemetry tracker monitors active canteens and distribution centers.
                      </p>
                    </div>

                    {/* Numeric Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <AnalyticsCard 
                        title="Meals Redistribution" 
                        value="24.8K" 
                        description="Cumulative checked meals saved" 
                        icon={Heart} 
                        color="green" 
                      />

                      <AnalyticsCard 
                        title="Active Food Donors" 
                        value={donorCount} 
                        description="Registered food entities" 
                        icon={Building} 
                        color="orange" 
                      />

                      <AnalyticsCard 
                        title="Active Receiver NGOs" 
                        value={ngoCount} 
                        description="Charitable partners connected" 
                        icon={Users} 
                        color="indigo" 
                      />
                    </div>

                    {/* Recharts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                      
                      {/* Left Area Chart */}
                      <div className="md:col-span-8 border border-gray-100 rounded-2xl p-5" id="monthly-chart-box">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-gray-400">
                            Monthly Meals Redistribution Flow
                          </h3>
                        </div>

                        <div className="h-64" id="recharts-area-wrapper">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_MONTHLY_SAVED}>
                              <defs>
                                <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                              <YAxis stroke="#94a3b8" fontSize={11} />
                              <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
                              <Area type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMeals)" name="Meals Saved" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Right Pie Chart */}
                      <div className="md:col-span-4 border border-gray-100 rounded-2xl p-5 flex flex-col justify-between" id="category-pie-box">
                        <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-gray-400 mb-4 text-center">
                          Surplus Category Breakdown
                        </h3>

                        <div className="h-44 relative" id="recharts-pie-wrapper">
                          <ResponsiveContainer width="100%" height="100%">
                            <ReChartsPie>
                              <Pie
                                data={categoryPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={60}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {categoryPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </ReChartsPie>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex justify-center gap-4 text-[10px] mt-2 font-semibold">
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
                            <span>Veg: {vegCount || 5}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-orange-500 rounded-xs"></span>
                            <span>Non-Veg: {nonVegCount || 3}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* TAB 2: VERIFY PARTNERS */}
                {activeTab === "verify-partners" && (
                  <div className="space-y-6" id="verify-partners-view">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-950">
                        Approve Partnership Credentials
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Mandated review panel for standard Food Donors and Receiver and NGO validation lists.
                      </p>
                    </div>

                    {pendingPartnersList.length === 0 ? (
                      <div className="text-center py-16 border border-gray-100 rounded-3xl" id="no-pending-partners">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-xs">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-extrabold text-base text-gray-700">All registered partners verified!</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                          No pending verification tickets are outstanding. Your redistributive pipeline is fully secured and safe.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4" id="partners-verify-grid">
                        {pendingPartnersList.map((p) => (
                          <div 
                            key={p.uid} 
                            className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40 hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-950">{p.name}</span>
                                <span className={`text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 rounded-lg ${
                                  p.role === UserRole.NGO ? 'bg-emerald-150 text-emerald-800' : 'bg-orange-100 text-orange-850 text-orange-800'
                                }`}>
                                  {p.role}
                                </span>
                              </div>
                              <p className="text-xs text-gray-505 text-gray-500">Contact Email: {p.email} | Address Hub: {p.address}</p>
                              <p className="text-xs text-gray-500 font-mono">WhatsApp Helpline: {p.phoneNumber}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApprovePartner(p.uid, p.name)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition"
                            >
                              Approve Partner
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: MODERATE MEALS LISTINGS */}
                {activeTab === "manage-listings" && (
                  <div className="space-y-6" id="manage-listings-view">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-950">
                        Moderate Food Listings
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Monitor active excess food uploads. Delete spam, inaccurate quantities, or obsolete files immediately to protect network integrity.
                      </p>
                    </div>

                    {allDonations.length === 0 ? (
                      <div className="text-center py-12 text-gray-400" id="moderate-listings-empty">
                        No active food listings exist in the system catalog records.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="moderate-listings-grid">
                        {allDonations.map((d) => (
                          <div 
                            key={d.id} 
                            className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm"
                          >
                            <div className="h-28 relative">
                              <img src={d.imageURL} alt={d.foodName} className="w-full h-full object-cover" />
                              <div className="absolute top-2 right-2 bg-slate-900/80 text-white px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold">
                                {d.status}
                              </div>
                            </div>
                            <div className="p-4 flex justify-between items-start gap-2">
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{d.foodName}</h4>
                                <p className="text-[11px] text-orange-650 font-bold uppercase tracking-wide font-mono leading-none">By: {d.donorName}</p>
                                <p className="text-xs text-gray-500">{d.quantity} | {d.pickupLocation}</p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleModerateDelete(d.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-650 text-red-600 rounded-lg border border-red-200 transition shrink-0 cursor-pointer"
                                title="Delete Listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
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
