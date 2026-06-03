import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { INDIAN_LOCATIONS } from '../utils/dummyData';
import { User, Mail, MapPin, Phone, Building2, Heart, CheckCircle2, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.DONOR);
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address || !phoneNumber || !password || !confirmPassword) {
      setError("Please fill in all the required input fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const profile = await register(name, email, role, address, phoneNumber, password);
      setSuccess(true);
      setTimeout(() => {
        if (profile.role === UserRole.NGO) {
          navigate('/ngo');
        } else {
          navigate('/donor');
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between" id="register-page-root">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" id="register-main">
        <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl" id="register-container">
          
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
              Join FoodLink Partner Network
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Help us connect surplus food with local communities.
            </p>
          </div>

          {success ? (
            <div className="mt-8 bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-3" id="register-success-pane">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg">Partner Account Registered!</h3>
              <p className="text-xs text-gray-600">
                Loading your customized role-based dashboard. Please wait...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs font-semibold mt-4" id="register-error">
                  {error}
                </div>
              )}

              <form className="mt-6 space-y-5" onSubmit={handleRegister} id="register-partners-interactive-form">
                
                {/* 1. ROLE CHOOSER */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                    Select Partnership Role
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.DONOR)}
                      className={`py-3.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer select-none ${
                        role === UserRole.DONOR 
                          ? "bg-orange-50 border-orange-500 text-orange-800 shadow-xs" 
                          : "bg-white border-gray-100 text-gray-600 hover:bg-slate-50"
                      }`}
                      id="choose-donor"
                    >
                      <Building2 className={`w-4 h-4 ${role === UserRole.DONOR ? "text-orange-600" : "text-gray-400"}`} />
                      Food Donor (Restaurant/Catering)
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole(UserRole.NGO)}
                      className={`py-3.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer select-none ${
                        role === UserRole.NGO 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs" 
                          : "bg-white border-gray-100 text-gray-600 hover:bg-slate-50"
                      }`}
                      id="choose-ngo"
                    >
                      <Heart className={`w-4 h-4 ${role === UserRole.NGO ? "text-emerald-600" : "text-gray-400"}`} />
                      NGO Receiver (Charity/Shelter)
                    </button>
                  </div>
                </div>

                {/* 2. ORGANIZATION NAME */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="org-name" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                     {role === UserRole.DONOR ? "Restaurant / Outlet Name" : "Registered NGO / Shelter Name"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="org-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === UserRole.DONOR ? "Sagar Ratna Café" : "Annapoorna Food Trust"}
                      className="pl-10 pr-4 py-3 bg-slate-50 border border-gray-250 w-full rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                {/* 3. EMAIL ADDRESS */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="reg-email" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                    Professional Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operations@partner.org"
                      className="pl-10 pr-4 py-3 bg-slate-50 border border-gray-250 w-full rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                {/* 4. CONTACT NUMBER */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="reg-phone" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                    WhatsApp/Contact Number (India)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="pl-10 pr-4 py-3 bg-slate-50 border border-gray-250 w-full rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="reg-password" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                    Security Password (Min 6 Characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-4 py-3 bg-slate-50 border border-gray-250 w-full rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="reg-confirm-password" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                    Confirm Security Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-4 py-3 bg-slate-50 border border-gray-250 w-full rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                {/* 5. LOCATION / SELECT MULTIPLE */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="reg-address" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                    Operating Hub Address (Area & City Hub)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      id="reg-address"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10 pr-4 py-3 bg-slate-50 border border-gray-250 w-full rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 transition-colors cursor-pointer appearance-none"
                    >
                      <option value="">Select Local Urban Area Cluster</option>
                      {INDIAN_LOCATIONS.map((loc, ix) => (
                        <option key={ix} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm mt-6"
                  id="submit-partner-registration"
                >
                  {loading ? (
                    <span>Provisioning secure workspace...</span>
                  ) : (
                    <>
                      <span>Register Partner Account</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 pt-1">
                  Already have a registered partner?{' '}
                  <Link to="/login" className="text-emerald-700 hover:underline font-bold">
                    Profile Login
                  </Link>
                </p>

              </form>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
