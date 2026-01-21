// src/components/layout/Sidebar/SidebarItem.jsx
import React from "react";
import { BadgeDollarSign, CalendarCheck, FileText, LayoutDashboard, Settings, Users } from "lucide-react";

const iconMap = {
  Dashboard: LayoutDashboard,
  Bookings: CalendarCheck,
  Cleaners: Users,
  Pricing: BadgeDollarSign,
  "Job Reports": FileText,
  Settings,
};

const SidebarItem = ({ item, isActive, onClick }) => {
  const Icon = iconMap[item.label] || LayoutDashboard;
  const baseClasses = "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition";
  const activeClasses = "bg-[#C85344]/10 text-[#C85344]";
  const inactiveClasses = "text-gray-700 hover:bg-[#C85344]/5 hover:text-[#C85344]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className={`h-5 w-5 ${isActive ? "text-[#C85344]" : "text-gray-500"}`} />
      <span className="truncate">{item.label}</span>
    </button>
  );
};

export default SidebarItem;
