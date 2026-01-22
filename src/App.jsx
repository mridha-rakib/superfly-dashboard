// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

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
      {/* If NotificationProvider is reinstated later, wrap Routes with it */}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-code"
          element={
            <PublicRoute>
              <VerifyCode />
            </PublicRoute>
          }
        />
        <Route
          path="/set-new-password"
          element={
            <PublicRoute>
              <SetNewPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/successful"
          element={
            <PublicRoute>
              <Successful />
            </PublicRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
