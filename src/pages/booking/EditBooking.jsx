import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { bookingDummyData } from "../../constants/bookingDummyData";

const statusOptions = ["Ongoing", "Pending", "In Progress", "Complete"];
const paymentOptions = ["Paid", "Unpaid"];

function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const booking = bookingDummyData.find((b) => b.id === id);

  const [formData, setFormData] = useState(
    booking || {
      customerInfo: {
        businessName: "",
        email: "",
        phone: "",
        city: "",
        address: "",
      },
      cleaningDetails: {
        serviceType: "",
        squareFoot: "",
        frequency: "",
      },
      scheduling: {
        preferredDate: "",
        startTime: "",
        endTime: "",
        assignedCleaner: "",
        jobNote: "",
      },
      pricing: {
        totalPrice: "",
        cleanerPrice: "",
      },
      status: "",
      payment: "",
    }
  );

  if (!booking) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Booking Not Found
        </h2>
        <Button onClick={() => navigate("/bookings")}>Back to Bookings</Button>
      </div>
    );
  }

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    console.log("Updated Booking Data:", formData);
    alert("Booking updated successfully!");
    navigate("/bookings");
  };

  const infoInput = (label, section, field, type = "text", spanCols = 1) => (
    <div className={`sm:col-span-${spanCols} flex flex-col`}>
      <label className="font-bold text-gray-800 tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={formData[section][field]}
        onChange={(e) => handleChange(section, field, e.target.value)}
        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>

      {/* Customer Info */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Customer Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {infoInput("Business Name", "customerInfo", "businessName")}
          {infoInput("Email", "customerInfo", "email", "email")}
          {infoInput("Phone", "customerInfo", "phone")}
          {infoInput("City", "customerInfo", "city")}
          {infoInput("Address", "customerInfo", "address", "text", 2)}
        </div>
      </section>

      {/* Cleaning Details */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Cleaning Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {infoInput("Service Type", "cleaningDetails", "serviceType")}
          {infoInput("Square Foot", "cleaningDetails", "squareFoot", "number")}
          {infoInput("Frequency", "cleaningDetails", "frequency")}
        </div>
      </section>

      {/* Scheduling */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Scheduling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {infoInput("Date", "scheduling", "preferredDate", "date")}
          {infoInput("Start Time", "scheduling", "startTime", "time")}
          {infoInput("End Time", "scheduling", "endTime", "time")}
          {infoInput("Assigned Cleaner", "scheduling", "assignedCleaner")}
          {infoInput("Job Note", "scheduling", "jobNote", "text", 2)}
        </div>
      </section>

      {/* Pricing & Status */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Pricing & Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {infoInput("Total Price", "pricing", "totalPrice", "number")}
          {infoInput("Cleaner Price", "pricing", "cleanerPrice", "number")}

          <div className="flex flex-col">
            <label className="font-bold text-gray-800 tracking-wide mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex flex-col">
            <label className="font-bold text-gray-800 tracking-wide mb-1">Payment</label>
            <select
              value={formData.payment}
              onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {paymentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <div className="flex gap-4 justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
        <Button onClick={() => navigate("/bookings")} variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default EditBooking;
