import React, { useState } from "react";
import Button from "../../components/ui/Button";

function CreateUser() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    userType: "",
    cleanerPercentage: "",
    password: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New User Data:", formData);
    alert("User created successfully!");
    // You can integrate API call here
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create User</h1>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Full Name */}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.fullname}
            onChange={(e) => handleChange("fullname", e.target.value)}
            placeholder="Enter full name"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Enter email"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* User Type */}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800 mb-1">User Type</label>
          <select
            value={formData.userType}
            onChange={(e) => handleChange("userType", e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select user type</option>
            <option value="Admin">Admin</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        {/* Cleaner Percentage (conditional) */}
        {formData.userType === "Cleaner" && (
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">Cleaner Percentage</label>
            <input
              type="number"
              value={formData.cleanerPercentage}
              onChange={(e) => handleChange("cleanerPercentage", e.target.value)}
              placeholder="Enter cleaner percentage"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              min="0"
              max="100"
              required
            />
          </div>
        )}

        {/* Password */}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800 mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Enter password"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full py-3 text-lg">
          Create User
        </Button>
      </form>
    </div>
  );
}

export default CreateUser;
