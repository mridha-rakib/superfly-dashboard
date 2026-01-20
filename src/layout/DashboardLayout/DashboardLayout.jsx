// src/components/layout/DashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../DashboardLayout/Sidebar";
import Topbar from "../DashboardLayout/Topbar";
import Breadcrumb from "../DashboardLayout/Breadcrumb";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-white ">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <Breadcrumb />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
