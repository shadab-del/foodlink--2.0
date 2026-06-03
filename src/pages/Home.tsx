import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { REALISTIC_STATS, TESTIMONIALS, HOW_IT_WORKS_STEPS } from '../utils/dummyData';
import { Heart, Building2, TrendingDown, Users, CheckCircle2, PhoneCall, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveActivities, setLiveActivities] = useState<{ id: string; message: string; timestamp: string }[]>([]);

  useEffect(() => {
    // Standard subscription to the live activity ticker feed
    const unsubscribe = dataService.subscribeLiveActivities((acts) => {
      setLiveActivities(acts.slice(0, 5));
    });
    return () => unsubscribe();
  }, []);

  const handleActionRedirect = (targetRole: string) => {
    if (user) {
      if (user.role === targetRole) {
        navigate(`/${targetRole}`);
      } else {
        navigate(`/${user.role}`);
      }
    } else {
      navigate('/login', { state: { preferredRole: targetRole } });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between" id="landing-page-root">
      <Navbar />

      <main className="flex-1" id="landing-page-main-content">
        
        {/* HERO SECTION */}
        <section className="bg-white py-16 sm:py-24 border-b border-gray-100" id="hero-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Pitch */}
              <div className="lg:col-span-7 flex flex-col space-y-6" id="hero-pitch-left">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-mono font-bold border border-emerald-200 w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Indian Zero-Food-Waste Network</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-tight">
                  Connecting <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Surplus Food</span> <br />
                  with <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">Empty Plates.</span>
                </h1>

                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                  FoodLink is a real-time redistribution platform facilitating the immediate transfer of excess fresh food from canteens, hotels, wedding halls, and restaurants directly to verified NGOs operating in local municipal neighborhoods.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4" id="hero-cta-buttons">
                  <button 
                    onClick={() => handleActionRedirect('donor')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                    id="hero-donate-food-btn"
                  >
                    <Building2 className="w-5 h-5" />
                    Donate Surplus Food
                  </button>

                  <button 
                    onClick={() => handleActionRedirect('ngo')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                    id="hero-request-food-btn"
                  >
                    <Heart className="w-5 h-5" />
                    Request Food Pickup
                  </button>
                </div>
              </div>

              {/* Graphical Visual Panel */}
              <div className="lg:col-span-5 relative" id="hero-visual-right">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-100 to-orange-50 rounded-3xl blur-2xl opacity-40 -z-10"></div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col overflow-hidden">
                  
                  {/* Live Activity Stream Header */}
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4 flex items-center gap-2 select-none">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0"></span>
                    Live Dispatch Feed
                  </h4>

                  <div className="space-y-6 overflow-hidden" id="live-activity-stream">
                    {liveActivities.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">Loading live dispatches...</div>
                    ) : (
                      liveActivities.map((act) => (
                        <div key={act.id} className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                          <div>
                            <p className="text-sm text-slate-700 leading-normal" dangerouslySetInnerHTML={{ __html: act.message }} />
                            <p className="text-xs text-slate-400 mt-1 font-mono">{act.timestamp}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                     <p className="text-[11px] text-center text-slate-400">“Connecting Surplus Food with Empty Plates.”</p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* METRICS / STATISTICS SECTION */}
        <section className="bg-slate-50 py-12 border-b border-gray-100" id="stats-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
              
              <div className="flex flex-col items-center text-center p-2">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-2xl sm:text-4xl font-black text-gray-950 font-mono">
                  {REALISTIC_STATS.mealsSaved.toLocaleString()}+
                </span>
                <span className="text-xs sm:text-sm text-gray-600 font-bold mt-1">Meals Checked & Saved</span>
              </div>

              <div className="flex flex-col items-center text-center p-2">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-2xl sm:text-4xl font-black text-gray-950 font-mono">
                  {REALISTIC_STATS.ngosConnected}+
                </span>
                <span className="text-xs sm:text-sm text-gray-600 font-bold mt-1">Registered NGOs Connected</span>
              </div>

              <div className="flex flex-col items-center text-center p-2">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-full mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-2xl sm:text-4xl font-black text-gray-950 font-mono">
                  {REALISTIC_STATS.activeDonors}+
                </span>
                <span className="text-xs sm:text-sm text-gray-600 font-bold mt-1">Active Indian Food Donors</span>
              </div>

              <div className="flex flex-col items-center text-center p-2">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full mb-3">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <span className="text-2xl sm:text-4xl font-black text-gray-950 font-mono">
                  {REALISTIC_STATS.foodWastedReducedTons} Tons
                </span>
                <span className="text-xs sm:text-sm text-gray-600 font-bold mt-1">Food Waste Diverted</span>
              </div>

            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="bg-white py-16 sm:py-20 border-b border-gray-100" id="how-it-works-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
                An Elegant, 4-Step Redistribution Cycle
              </h2>
              <p className="text-gray-500 text-sm mt-3">
                How FoodLink facilitates instant, community-supported food logistics in urban spaces.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {HOW_IT_WORKS_STEPS.map((step) => (
                <div 
                  key={step.step} 
                  className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-6 rounded-2xl relative transition-all"
                >
                  <div className="absolute top-4 right-4 text-3xl font-black text-emerald-200/50 font-mono select-none">
                    0{step.step}
                  </div>
                  <div className="w-10 h-10 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center font-mono mb-4 shadow-xs">
                    {step.step}
                  </div>
                  <h3 className="font-extrabold text-base text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CORE DISTINCTIVE FEATURES */}
        <section className="bg-slate-50 py-16 sm:py-20 border-b border-gray-100" id="features-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-orange-600 font-bold text-xs uppercase tracking-widest font-mono">Robust Infrastructure</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-2">
                Features Engineered For Indian Food Security
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-950 mb-3">Real-time Dashboard Notifications</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  NGOs and donors are connected instantly. When meals are logged, nearby approved charities are alerted on their screens immediately for rapid claims, ensuring no fresh food is left behind.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-950 mb-3">Admin-Vouched Verification</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Both food donors and receiving charities undergo structural admin validation. No spam accounts or malicious food listings can circulate on the live startup environment.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-950 mb-3">Fully Transparent Logistics</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Track dispatch states seamlessly. Statuses transition transparently from Requested, to Out for Pickup, and finally to Completed once meals have been safely shared.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="bg-white py-16 sm:py-20" id="testimonials-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest font-mono">Real Operational Voices</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-2">
                Trusted by Resilient Indian Partners
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((test) => (
                <div 
                  key={test.id} 
                  className="bg-slate-550/10 border border-slate-100 p-8 rounded-3xl flex flex-col justify-between"
                  id={`testimonial-card-${test.id}`}
                >
                  <p className="text-gray-700 italic text-sm leading-relaxed mb-6">
                    “{test.quote}”
                  </p>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-950">{test.author}</h4>
                    <p className="text-xs text-emerald-600">{test.designation}, {test.organization}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
