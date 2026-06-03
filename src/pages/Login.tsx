import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Building2, Heart, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Suggested initial role callback or state routing
  const targetRedirect = location.state?.preferredRole || 'donor';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password fields.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email, password);
      // Route appropriately
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'ngo') navigate('/ngo');
      else navigate('/donor');
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please attempt again.");
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick login helper (major point for outstanding classroom experience)
  const triggerQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login(demoEmail, 'password123');
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'ngo') navigate('/ngo');
      else navigate('/donor');
    } catch (err: any) {
      setError("Demo shortcut failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between" id="login-page-root">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" id="login-form-main">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl" id="login-card-container">
          
          {/* Header Title */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">
              Sign In To FoodLink
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Access your role-based logistics dashboard.
            </p>
          </div>

          {/* Diagnostic Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs font-semibold" id="login-error-banner">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="mt-6 flex flex-col space-y-5" onSubmit={handleLogin} id="signin-interactive-form">
            
            <div className="flex flex-col space-y-1">
              <label htmlFor="email-address" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="spicegarden@gmail.com"
                  className="pl-10 pr-4 py-3 bg-slate-50 border border-gray-250 w-full rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="password-field" className="text-xs font-bold text-gray-600 uppercase tracking-widest font-mono">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-field"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-4 py-3 bg-slate-50 border border-gray-250 w-full rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
              id="login-submit-button"
            >
              {loading ? (
                <span>Verifying details...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 pt-1">
              New partner?{' '}
              <Link to="/register" className="text-emerald-700 hover:underline font-bold">
                Register a new profile here
              </Link>
            </p>
          </form>

          {/* Quick-Access Demo Accounts Selection Pane */}
          <div className="border-t border-gray-150 pt-6 mt-6" id="quick-demo-access-panel">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono block text-center mb-3.5">
              🎓 Demo Presentation Accounts
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => triggerQuickLogin('spicegarden@gmail.com')}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-850 text-xs font-semibold rounded-xl border border-orange-150 transition-colors text-left"
                id="demo-login-donor"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>Food Donor (Spice Garden)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
              </button>

              <button
                type="button"
                onClick={() => triggerQuickLogin('hope@gmail.com')}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 text-xs font-semibold rounded-xl border border-emerald-150 transition-colors text-left"
                id="demo-login-ngo"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>NGO Receiver (Hope Foundation)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
              </button>

              <button
                type="button"
                onClick={() => triggerQuickLogin('admin@foodlink.org')}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors text-left"
                id="demo-login-admin"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <span>System Admin (Dr. Anirudh)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-550" />
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
