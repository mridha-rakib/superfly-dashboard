import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { usersDummyData } from "../../constants/usersDummyData";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = usersDummyData.find((u) => u.id === id);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    role: "Staff",
    jobCompleted: 0,
    rating: 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email || "",
        contact: user.contact,
        role: user.role,
        jobCompleted: user.jobCompleted || 0,
        rating: user.rating || 0,
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 rounded-xl">
        <h2 className="text-3xl font-semibold text-red-600 mb-6">User Not Found</h2>
        <Button onClick={() => navigate("/users")}>Back to Users</Button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated user data:", formData);
    navigate("/users");
  };

  return (
    <div className="space-y-10 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900  mb-6">
        Edit User
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 space-y-6"
      >
        {/* Name */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        {/* Contact */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        {/* Role */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="Cleaner">Cleaner</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
          </select>
        </div>

        {/* Jobs Completed (only if role is Cleaner) */}
        {formData.role === "Cleaner" && (
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-800">Jobs Completed</label>
            <input
              type="number"
              name="jobCompleted"
              value={formData.jobCompleted}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              min={0}
            />
          </div>
        )}

        {/* Rating (only if role is Cleaner) */}
        {formData.role === "Cleaner" && (
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-800">Rating</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              min={0}
              max={5}
              step={0.1}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" className="px-6 py-3 text-lg">
            Update User
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;
