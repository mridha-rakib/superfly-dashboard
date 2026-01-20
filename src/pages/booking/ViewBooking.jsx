import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { bookingDummyData } from "../../constants/bookingDummyData";

const statusColors = {
  Ongoing: "bg-red-100 text-red-800",
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Complete: "bg-green-100 text-green-800",
};

const paymentColors = {
  Paid: "bg-green-50 text-green-800",
  Unpaid: "bg-red-50 text-red-800",
};

function ViewBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const booking = bookingDummyData.find((b) => b.id === id);

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

  const { customerInfo, cleaningDetails, scheduling, pricing, status, payment } = booking;

  const infoItem = (label, value, spanCols = 1) => (
    <p className={`sm:col-span-${spanCols} text-gray-900`}>
      <span className="font-bold text-gray-800 tracking-wide">{label}:</span>{" "}
      <span className="ml-1 text-gray-700">{value}</span>
    </p>
  );

  return (
    <div className=" space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>

      {/* Customer Info */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Customer Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {infoItem("Business Name", customerInfo.businessName)}
          {infoItem("Email", customerInfo.email)}
          {infoItem("Phone", customerInfo.phone)}
          {infoItem("City", customerInfo.city)}
          {infoItem("Address", customerInfo.address, 2)}
        </div>
      </section>

      {/* Cleaning Details */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Cleaning Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {infoItem("Service Type", cleaningDetails.serviceType)}
          {infoItem("Square Foot", `${cleaningDetails.squareFoot} sq ft`)}
          {infoItem("Frequency", cleaningDetails.frequency)}
        </div>
      </section>

      {/* Scheduling */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Scheduling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {infoItem("Date", scheduling.preferredDate)}
          {infoItem("Time", `${scheduling.startTime} - ${scheduling.endTime}`)}
          {infoItem("Assigned Cleaner", scheduling.assignedCleaner)}
          {infoItem("Job Note", scheduling.jobNote, 2)}
        </div>
      </section>

      {/* Pricing & Status */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Pricing & Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
          {infoItem("Total Price", `$${pricing.totalPrice}`)}
          {infoItem("Cleaner Price", `$${pricing.cleanerPrice}`)}
          <p>
            <span className="font-bold text-gray-800 tracking-wide">Status:</span>{" "}
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusColors[status]}`}>
              {status}
            </span>
          </p>
          <p className="sm:col-span-3">
            <span className="font-bold text-gray-800 tracking-wide">Payment:</span>{" "}
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${paymentColors[payment]}`}>
              {payment}
            </span>
          </p>
        </div>
      </section>

    </div>
  );
}

export default ViewBooking;
