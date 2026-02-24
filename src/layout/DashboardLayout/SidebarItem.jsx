// src/components/layout/Sidebar/SidebarItem.jsx
import React from "react";
import {
  BadgeDollarSign,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const iconMap = {
  Dashboard: LayoutDashboard,
  Bookings: CalendarCheck,
  "Residential Bookings": CalendarCheck,
  "Commercial Bookings": CalendarCheck,
  "Post-Construction Bookings": CalendarCheck,
  "Service Requests": FileText,
  Cleaners: Users,
  Pricing: BadgeDollarSign,
  "Earnings Analytics": BadgeDollarSign,
  "Job Reports": FileText,
  Settings,
};

const SidebarItem = ({ item, isActive, onClick, exact }) => {
  const Icon = iconMap[item.label] || LayoutDashboard;
  const baseClasses = "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition";
  const activeClasses = "bg-[#C85344]/10 text-[#C85344]";
  const inactiveClasses = "text-gray-700 hover:bg-[#C85344]/5 hover:text-[#C85344]";

  return (
    <NavLink
      to={item.path ?? item.href}
      end={Boolean(exact) || item.path === "/" || item.href === "/"}
      className={() =>
        [baseClasses, isActive ? activeClasses : inactiveClasses].join(" ")
      }
      onClick={onClick}
    >
      <Icon className={`h-5 w-5 ${isActive ? "text-[#C85344]" : "text-gray-500"}`} />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
};

export default SidebarItem;
