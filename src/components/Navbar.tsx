import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { UserNotification, UserRole } from '../types';
import { Bell, LogOut, Menu, X, Heart, Building, Award, User, Layers, CheckCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Subscribe to notifications using our real-time listeners
    const unsubscribe = dataService.subscribeNotifications(user.uid, (notifs) => {
      // Sort newest first
      const sorted = [...notifs].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(sorted);
      // Filter unread (we can simulate read/unread status in memory)
      const unread = sorted.filter(n => !n.readStatus).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === UserRole.ADMIN) return '/admin';
    if (user.role === UserRole.NGO) return '/ngo';
    return '/donor';
  };

  const clearNotifications = () => {
    // Soft clear (mark all as read visually)
    const cleared = notifications.map(n => ({ ...n, readStatus: true }));
    setNotifications(cleared);
    setUnreadCount(0);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm" id="main-navigation-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo Brand Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-800 focus:outline-hidden" id="nav-brand-logo">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform hover:scale-105">
                FL
              </div>
              <div className="flex flex-col">
                <span className="text-slate-800 leading-tight font-extrabold text-base sm:text-lg">FoodLink</span>
                <span className="text-[8px] text-orange-600 tracking-wider uppercase font-mono font-bold leading-none">Redistributing Surplus</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6" id="desktop-nav-menu">
            <Link 
              to="/" 
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${location.pathname === '/' ? 'text-orange-600' : 'text-slate-500 hover:text-orange-600'}`}
            >
              Browse Food
            </Link>

            {user ? (
              <>
                <Link 
                  to={getDashboardPath()}
                  className={`text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${location.pathname.includes('dashboard') || location.pathname === '/admin' || location.pathname === '/ngo' || location.pathname === '/donor' ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:text-orange-600'}`}
                >
                  <Layers className="w-4 h-4" />
                  Dashboard ({user.role.toUpperCase()})
                </Link>

                {/* Real-time Notifications Bell Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifDropdown(!showNotifDropdown);
                      if (unreadCount > 0) clearNotifications();
                    }}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-50 hover:text-orange-600 transition-colors focus:outline-hidden relative"
                    aria-label="Toggle notifications"
                    id="nav-bell-button"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-orange-600 ring-2 ring-white animate-pulse"></span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-[400px] overflow-y-auto" id="nav-dropdown-notification">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <span className="font-bold text-xs text-slate-600 uppercase tracking-wider">Alert Feed</span>
                        {unreadCount > 0 && (
                          <span className="bg-orange-100 text-orange-850 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="p-3 hover:bg-orange-50/40 transition-colors text-xs text-slate-600">
                              <p className="font-medium text-slate-800 mb-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Widget */}
                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800">{user.name}</span>
                    <span className="text-[10px] text-slate-450 text-slate-400 uppercase tracking-wider font-mono font-bold flex items-center justify-end gap-1">
                      {user.role === UserRole.DONOR && <Building className="w-2.5 h-2.5 text-orange-500" />}
                      {user.role === UserRole.NGO && <Heart className="w-2.5 h-2.5 text-orange-500" />}
                      {user.role === UserRole.ADMIN && <Award className="w-2.5 h-2.5 text-orange-500" />}
                      {user.role}
                    </span>
                  </div>
                  
                  {/* Avatar circle with matching colors */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white text-slate-800 flex items-center justify-center font-bold text-sm shadow-xs">
                    {user.name.charAt(0)}
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    title="Log Out"
                    id="nav-logout-button"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-orange-600 transition"
                  id="nav-signin-link"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-bold bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition shadow-sm cursor-pointer whitespace-nowrap"
                  id="nav-signup-link"
                >
                  Register Partner
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
              aria-label="Toggle menu"
              id="mobile-nav-toggle-btn"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-2 pt-2 pb-4 space-y-1 shadow-sm" id="mobile-nav-drawer">
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          
          {user ? (
            <>
              <Link 
                to={getDashboardPath()}
                className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-700 bg-emerald-50"
                onClick={() => setIsOpen(false)}
              >
                Dashboard ({user.role.toUpperCase()})
              </Link>
              
              <div className="border-t border-gray-100 my-2 pt-2 px-3">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">My Account</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{user.name}</p>
                <p className="text-xs text-gray-500 mb-3">{user.email}</p>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 px-3">
              <Link 
                to="/login"
                className="text-center py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="text-center py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
