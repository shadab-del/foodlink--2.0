import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { UserRole } from './types';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: UserRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center" id="protected-clearance-retrieving">
          <div className="w-10 h-10 border-4 border-t-emerald-600 border-r-transparent border-b-orange-500 border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Retrieving clearance...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === UserRole.NGO) return <Navigate to="/ngo" replace />;
    return <Navigate to="/donor" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/donor" 
            element={
              <ProtectedRoute allowedRole={UserRole.DONOR}>
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ngo" 
            element={
              <ProtectedRoute allowedRole={UserRole.NGO}>
                <NgoDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole={UserRole.ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
