// src/components/layout/Sidebar/Sidebar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../../store/features/api/apiSlice";
import { logout } from "../../store/features/auth/authSlice";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/features/auth/authSlice";

// Role constants for better maintainability
const ROLES = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  USER: "user",
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();
  const [isOpen, setIsOpen] = useState(false);
  const userRole = useSelector(selectUserRole);

  const allMenuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Bookings", path: "/bookings" },
    { name: "Users", path: "/users" },
    { name: "Pricing", path: "/pricing" },
    { name: "Job Reports", path: "/job-reports" },
    { name: "Settings", path: "/settings" },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    // Hide Users section for admin role (but allow SuperAdmin and other roles)
    // if (item.name === "Users" && userRole?.toLowerCase() === ROLES.ADMIN) {
    //   return false;
    // }
    return true;
  });

  const handleMenuClick = (path) => {
    navigate(path);
    if (window.innerWidth < 768) setIsOpen(false); // auto-close on mobile
  };

  const handleSignOut = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Clear Redux state and localStorage regardless of API result
      dispatch(logout());
      navigate("/login", { replace: true });
      if (window.innerWidth < 768) setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-30 transform transition-transform duration-300 ease-in-out bg-white flex flex-col
        ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:relative lg:z-auto`}
      >
        <div className="pt-5 flex items-center justify-center relative px-4 lg:px-5">
          {/* Centered Logo */}
          <img
            src="logo.png"
            alt="Logo"
            className="w-24 h-24 mx-auto"
          />

          {/* Close button on the far right */}
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto min-h-0">
          {menuItems.map((item) => (
            <div key={item.name} onClick={() => handleMenuClick(item.path)}>
              <SidebarItem
                item={item}
                isActive={location.pathname === item.path}
              />
            </div>
          ))}
        </nav>

        {/* Sign Out Button - Positioned at bottom */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
          >
            <HugeiconsIcon icon={Logout01Icon} className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Hamburger button for mobile */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md lg:hidden"
          onClick={() => setIsOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default Sidebar;
