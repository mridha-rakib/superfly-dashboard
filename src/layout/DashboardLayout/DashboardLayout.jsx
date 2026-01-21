// src/components/layout/DashboardLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../DashboardLayout/Sidebar";
import Breadcrumb from "../DashboardLayout/Breadcrumb";
import PageHeader from "./PageHeader";

const DashboardLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <div className="flex h-screen bg-white ">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 space-y-6">
          <PageHeader />
          {!isDashboard && <Breadcrumb />}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
