import { 
  Building, 
  Heart, 
  Award, 
  PlusCircle, 
  ListOrdered, 
  Bell, 
  CheckSquare, 
  PieChart, 
  Trash2, 
  ShieldAlert,
  ArrowRightCircle
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName?: string;
  isVerified?: boolean;
}

export default function Sidebar({ role, activeTab, setActiveTab, userName = "Partner Profile", isVerified = false }: SidebarProps) {
  
  // Custom navigation items based on UserRole
  const getNavItems = () => {
    switch (role) {
      case UserRole.DONOR:
        return [
          { id: "active-donations", label: "Surplus Listings", icon: ListOrdered },
          { id: "add-food", label: "Donate Surplus", icon: PlusCircle },
          { id: "manage-requests", label: "NGO Pickup Requests", icon: Heart },
        ];
      case UserRole.NGO:
        return [
          { id: "browse-donations", label: "Browse Surplus Meals", icon: Building },
          { id: "my-pickups", label: "Active Pickup Claims", icon: ArrowRightCircle },
          { id: "pickup-history", label: "Completed Pickups History", icon: CheckSquare },
        ];
      case UserRole.ADMIN:
        return [
          { id: "analytics", label: "Impact Analytics", icon: PieChart },
          { id: "verify-partners", label: "Manage & Approve Partners", icon: ShieldAlert },
          { id: "manage-listings", label: "Moderate Food Listings", icon: Trash2 },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col space-y-6 h-fit shadow-xs" id="dashboard-sidebar-container">
      
      {/* Account Visual Overview */}
      <div className="border-b border-slate-100 pb-4 flex flex-col" id="sidebar-user-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold font-mono text-sm shadow-xs">
            {role.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-800 truncate max-w-[150px]">{userName}</span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              {role}
            </span>
          </div>
        </div>
        
        {/* Verification Card / Pill matched to theme */}
        <div className="mt-4" id="sidebar-approval-status">
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Verified Partner</p>
            <p className="text-xs text-slate-800 font-semibold truncate">{userName}</p>
            <p className="text-[10px] text-green-600 font-medium">Approved Organization</p>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Menu */}
      <nav className="flex flex-col space-y-1" id="sidebar-tab-navigation-list">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-colors cursor-pointer ${
                isActive 
                  ? "bg-orange-50 text-orange-600 font-semibold" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
              id={`sidebar-link-${item.id}`}
            >
              <IconComponent className={`w-4.5 h-4.5 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Impact Tip */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150" id="sidebar-impact-card">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Impact Advisory</h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Ensure surplus food is packed in food-grade eco-containers before NGO pickup. Expired items will trigger partner warnings.
        </p>
      </div>

    </div>
  );
}
