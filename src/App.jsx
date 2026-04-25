// src/App.jsx
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

const DashboardLayout = lazy(() =>
  import("./layout/DashboardLayout/DashboardLayout")
);
const Login = lazy(() => import("./pages/auth/Login"));
const VerifyCode = lazy(() => import("./pages/auth/VerifyCode"));
const SetNewPassword = lazy(() => import("./pages/auth/SetNewPassword"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Successful = lazy(() => import("./pages/auth/Successful"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const EarningsAnalytics = lazy(() =>
  import("./pages/dashboard/EarningsAnalytics")
);
const CleanerEarningsDetail = lazy(() =>
  import("./pages/dashboard/CleanerEarningsDetail")
);
const Booking = lazy(() => import("./pages/booking/Booking"));
const CreateBooking = lazy(() => import("./pages/booking/CreateBooking"));
const ViewBooking = lazy(() => import("./pages/booking/ViewBooking"));
const EditBooking = lazy(() => import("./pages/booking/EditBooking"));
const ServiceRequests = lazy(() => import("./pages/booking/ServiceRequests"));
const Users = lazy(() => import("./pages/users/Users"));
const ViewUser = lazy(() => import("./pages/users/ViewUser"));
const EditUser = lazy(() => import("./pages/users/EditUser"));
const CreateUser = lazy(() => import("./pages/users/CreateUser"));
const Clients = lazy(() => import("./pages/clients/Clients"));
const Pricing = lazy(() => import("./pages/pricing/Pricing"));
const JobReports = lazy(() => import("./pages/jobreports/JobReports"));
const JobReportDetails = lazy(() => import("./pages/jobreports/JobReportDetails"));
const Setting = lazy(() => import("./pages/setting/Setting"));

const routeFallback = (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-black" />
  </div>
);

const renderLazyRoute = (LazyComponent, props = {}) => (
  <Suspense fallback={routeFallback}>
    <LazyComponent {...props} />
  </Suspense>
);

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
              {renderLazyRoute(Login)}
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              {renderLazyRoute(ForgotPassword)}
            </PublicRoute>
          }
        />
        <Route
          path="/verify-code"
          element={
            <PublicRoute>
              {renderLazyRoute(VerifyCode)}
            </PublicRoute>
          }
        />
        <Route
          path="/set-new-password"
          element={
            <PublicRoute>
              {renderLazyRoute(SetNewPassword)}
            </PublicRoute>
          }
        />
        <Route
          path="/successful"
          element={
            <PublicRoute>
              {renderLazyRoute(Successful)}
            </PublicRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {renderLazyRoute(DashboardLayout)}
            </ProtectedRoute>
          }
        >
          <Route index element={renderLazyRoute(Dashboard)} />
          <Route
            path="earnings-analytics"
            element={renderLazyRoute(EarningsAnalytics)}
          />
          <Route
            path="earnings-analytics/cleaners/:cleanerId"
            element={renderLazyRoute(CleanerEarningsDetail)}
          />
          <Route path="bookings" element={renderLazyRoute(Booking)} />
          <Route
            path="bookings/residential"
            element={renderLazyRoute(Booking, { presetService: "Residential" })}
          />
          <Route
            path="bookings/residential/:id"
            element={renderLazyRoute(ViewBooking)}
          />
          <Route
            path="bookings/commercial"
            element={renderLazyRoute(Booking, { presetService: "Commercial" })}
          />
          <Route
            path="bookings/commercial/:id"
            element={renderLazyRoute(ViewBooking)}
          />
          <Route
            path="bookings/post-construction"
            element={renderLazyRoute(Booking, {
              presetService: "Post-Construction",
            })}
          />
          <Route
            path="bookings/post-construction/:id"
            element={renderLazyRoute(ViewBooking)}
          />
          <Route path="bookings/add" element={renderLazyRoute(CreateBooking)} />
          <Route path="bookings/:id" element={renderLazyRoute(ViewBooking)} />
          <Route path="bookings/:id/edit" element={renderLazyRoute(EditBooking)} />
          <Route
            path="service-requests"
            element={renderLazyRoute(ServiceRequests)}
          />
          <Route
            path="service-requests/add"
            element={renderLazyRoute(CreateBooking)}
          />
          <Route
            path="service-requests/:id"
            element={renderLazyRoute(ViewBooking)}
          />
          <Route path="users" element={renderLazyRoute(Users)} />
          <Route path="users/add" element={renderLazyRoute(CreateUser)} />
          <Route path="users/:id" element={renderLazyRoute(ViewUser)} />
          <Route path="users/:id/edit" element={renderLazyRoute(EditUser)} />
          <Route path="clients" element={renderLazyRoute(Clients)} />
          <Route path="pricing" element={renderLazyRoute(Pricing)} />
          <Route path="job-reports" element={renderLazyRoute(JobReports)} />
          <Route
            path="job-reports/:reportId"
            element={renderLazyRoute(JobReportDetails)}
          />
          <Route path="settings" element={renderLazyRoute(Setting)} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
