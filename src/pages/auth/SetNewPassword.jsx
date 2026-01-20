// src/pages/auth/SetNewPassword.jsx
import React, { useState } from "react";
import { useNavigate  } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";

const SetNewPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate("/successful");

    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <img src="logo.png" alt="Superfly Logo" className="w-24 h-24" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
              Set New Password
            </h2>
            <p className="text-center text-gray-600">
              Set a new password to secure your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                name="newPassword"
                type="password"
                id="newPassword"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#FFD1E8] focus:border-[#FFD1E8]"
                required
              />

              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1 mt-4"
              >
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#FFD1E8] focus:border-[#FFD1E8]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[#C85344] hover:bg-[#C85344] text-white px-4 rounded-lg cursor-pointer font-medium transition-colors disabled:opacity-50"
            >
              Set Password
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 flex items-center justify-center gap-2 cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} />
              <span className="font-medium">Back to Login</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetNewPassword;
