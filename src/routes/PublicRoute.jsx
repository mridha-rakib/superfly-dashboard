// src/routes/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../state/authStore";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
