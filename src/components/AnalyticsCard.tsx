import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color?: "orange" | "green" | "blue" | "indigo";
}

export default function AnalyticsCard({ 
  title, 
  value, 
  description, 
  icon: IconComponent, 
  color = "green" 
}: AnalyticsCardProps) {
  
  const colorStyles = {
    orange: {
      bg: "bg-orange-50 border-orange-100",
      text: "text-orange-800",
      iconBg: "bg-orange-100 text-orange-600",
      badge: "bg-orange-100 text-orange-800"
    },
    green: {
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-900",
      iconBg: "bg-emerald-100 text-emerald-600",
      badge: "bg-emerald-100 text-emerald-800"
    },
    blue: {
      bg: "bg-blue-50 border-blue-100",
      text: "text-blue-900",
      iconBg: "bg-blue-100 text-blue-600",
      badge: "bg-blue-100 text-blue-800"
    },
    indigo: {
      bg: "bg-indigo-50/60 border-indigo-100",
      text: "text-indigo-900",
      iconBg: "bg-indigo-100 text-indigo-600",
      badge: "bg-indigo-100/50 text-indigo-800"
    }
  };

  const currentStyles = colorStyles[color] || colorStyles.green;

  return (
    <div 
      className={`border rounded-3xl p-6 flex items-start gap-4 transition-all hover:shadow-xs ${currentStyles.bg}`}
      id={`analytics-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`p-3.5 rounded-2xl shrink-0 ${currentStyles.iconBg}`} id="analytics-card-icon-container">
        <IconComponent className="w-6 h-6" />
      </div>

      <div className="flex-1 flex flex-col justify-between" id="analytics-card-data-section">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono select-none">
          {title}
        </span>
        <span className="text-2xl sm:text-3xl font-extrabold text-gray-950 mt-1 leading-none">
          {value}
        </span>
        <span className="text-[11px] text-gray-600 mt-2 font-medium">
          {description}
        </span>
      </div>
    </div>
  );
}
