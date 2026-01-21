// src/components/layout/DashboardLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../DashboardLayout/Sidebar";
import Topbar from "../DashboardLayout/Topbar";
import Breadcrumb from "../DashboardLayout/Breadcrumb";

const DashboardLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <div className="flex h-screen bg-white ">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {!isDashboard && <Topbar />}
        {!isDashboard && <Breadcrumb />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
