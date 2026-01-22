// src/components/layout/Sidebar/Sidebar.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { sidebarLinks } from "../../data/dashboardData";
import SidebarItem from "./SidebarItem";
import { useAuthStore } from "../../state/authStore";
import { toast } from "react-toastify";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();

  const allMenuItems = sidebarLinks.map((link) => ({
    label: link.label,
    path: link.href,
  }));

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    return true;
  });

  const handleMenuClick = (path) => {
    navigate(path);
    if (window.innerWidth < 768) setIsOpen(false); // auto-close on mobile
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("You have been signed out");
    } catch (error) {
      toast.error("Sign out failed. Please try again.");
    }

    navigate("/login", { replace: true });
    if (window.innerWidth < 768) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 flex h-full w-64 transform flex-col border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:relative lg:z-auto`}
      >
        <div className="relative flex items-center justify-between px-5 py-6">
          <span className="text-lg font-semibold text-gray-900">Dashboard</span>
          <button
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <SidebarItem
                key={item.path}
                item={item}
                isActive={isActive}
                onClick={() => handleMenuClick(item.path)}
              />
            );
          })}
        </nav>

        {/* Sign Out Button - Positioned at bottom */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#C85344]/30 px-4 py-3 text-sm font-medium text-[#C85344] transition hover:bg-[#C85344]/10"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Hamburger button for mobile */}
      {!isOpen && (
        <button
          className="fixed left-4 top-4 z-40 rounded-md bg-white p-2 shadow-md lg:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
