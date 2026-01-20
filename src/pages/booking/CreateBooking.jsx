import React, { useState } from "react";

const CreateBooking = () => {
  const [formData, setFormData] = useState({
    // 1. Customer Info
    businessName: "",
    email: "",
    phone: "",
    city: "",
    address: "",

    // 2. Cleaning Details
    serviceType: "",
    squareFoot: "",
    cleaningFrequency: "one-time",

    // 3. Scheduling
    preferredDate: "",
    startTime: "",
    endTime: "",
    assignedCleaner: "",
    jobNote: "",

    // 4. Pricing & Payment
    totalPrice: "",
    cleanerPrice: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final Payload:", formData);
    // API call here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* 1. CUSTOMER INFO */}
      <section className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2">City / Area</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </section>

      {/* 2. CLEANING DETAILS */}
      <section className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Cleaning Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Type */}
          <div>
            <label className="block mb-2">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Service</option>
              <option value="regular">Regular Cleaning</option>
              <option value="deep">Deep Cleaning</option>
              <option value="move-in">Move In Cleaning</option>
              <option value="move-out">Move Out Cleaning</option>
            </select>
          </div>

          {/* Square Foot */}
          <div>
            <label className="block mb-2">Square Foot</label>
            <input
              type="number"
              name="squareFoot"
              value={formData.squareFoot}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Cleaning Frequency */}
        <div className="mt-6">
          <label className="block mb-3 font-medium">Cleaning Frequency</label>

          <div className="flex flex-wrap gap-6">
            {["one-time", "weekly", "bi-weekly", "monthly"].map((freq) => (
              <label key={freq} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cleaningFrequency"
                  value={freq}
                  checked={formData.cleaningFrequency === freq}
                  onChange={handleChange}
                />
                <span className="capitalize">{freq}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SCHEDULING */}
      <section className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Scheduling</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Preferred Date</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2">Assign Cleaner</label>
            <select
              name="assignedCleaner"
              value={formData.assignedCleaner}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Cleaner</option>
              <option value="cleaner1">Cleaner 1</option>
              <option value="cleaner2">Cleaner 2</option>
              <option value="cleaner3">Cleaner 3</option>
            </select>
          </div>
        </div>

        {/* Job Note */}
        <div className="mt-4">
          <label className="block mb-2">Job Note</label>
          <textarea
            name="jobNote"
            value={formData.jobNote}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
          ></textarea>
        </div>
      </section>

      {/* 4. PRICING & PAYMENT */}
      <section className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Pricing & Payment</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Total Price</label>
            <input
              type="number"
              name="totalPrice"
              value={formData.totalPrice}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2">Cleaner Price</label>
            <input
              type="number"
              name="cleanerPrice"
              value={formData.cleanerPrice}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </section>

      {/* 5. BUTTONS */}
      <div className="flex gap-4 justify-end pt-4">
        <button
          type="button"
          className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-6 py-3 bg-[#C85344] text-white rounded-lg hover:bg-[#C85344]/80"
        >
          Assign & Confirm Booking
        </button>
      </div>
    </form>
  );
};

export default CreateBooking;
