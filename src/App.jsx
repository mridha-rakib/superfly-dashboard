// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";

import DashboardLayout from "./layout/DashboardLayout/DashboardLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import VerifyCode from "./pages/auth/VerifyCode";
import SetNewPassword from "./pages/auth/SetNewPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Successful from "./pages/auth/Successful";
import Dashboard from "./pages/dashboard/Dashboard";
import Booking from "./pages/booking/Booking";
import CreateBooking from "./pages/booking/CreateBooking";
import ViewBooking from "./pages/booking/ViewBooking";
import EditBooking from "./pages/booking/EditBooking";
import Users from "./pages/users/Users";
import ViewUser from "./pages/users/ViewUser";
import EditUser from "./pages/users/EditUser";
import CreateUser from "./pages/users/CreateUser";
import Pricing from "./pages/pricing/Pricing";
import JobReports from "./pages/jobreports/JobReports";
import JobReportDetails from "./pages/jobreports/JobReportDetails";
import Setting from "./pages/setting/Setting";
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
        <Route path="/successful" element={<Successful />} />

        {/* Private Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Booking />} />
          <Route path="bookings/add" element={<CreateBooking />} />
          <Route path="bookings/:id" element={<ViewBooking />} />
          <Route path="bookings/:id/edit" element={<EditBooking />} />
          <Route path="users" element={<Users />} />
          <Route path="users/add" element={<CreateUser />} />
          <Route path="users/:id" element={<ViewUser />} />
          <Route path="users/:id/edit" element={<EditUser />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="job-reports" element={<JobReports />} />
          <Route path="job-details" element={<JobReportDetails />} />
          <Route path="settings" element={<Setting />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
