import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useQuoteStore } from "../../state/quoteStore";
import { useCleanerStore } from "../../state/cleanerStore";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Assigned: "bg-indigo-100 text-indigo-800",
  "On Site": "bg-orange-100 text-orange-800",
  "Report Submitted": "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
};

const paymentColors = {
  Paid: "bg-green-50 text-green-800",
  Unpaid: "bg-red-50 text-red-800",
  Manual: "bg-blue-50 text-blue-800",
};

const mapStatusLabel = (quote) => {
  const admin = quote?.adminStatus;
  const normalized = (admin || quote?.status || "").toLowerCase();
  switch (normalized) {
    case "assigned":
      return "Assigned";
    case "on_site":
      return "On Site";
    case "report_submitted":
      return "Report Submitted";
    case "completed":
      return "Completed";
    default:
      return "Pending";
  }
};

const mapServiceLabel = (serviceType) => {
  const normalized = (serviceType || "").toLowerCase();
  if (normalized === "residential") return "Residential";
  if (normalized === "commercial") return "Commercial";
  if (normalized === "post_construction") return "Post-Construction";
  return serviceType || "Unknown";
};

function ViewBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedQuote,
    isLoadingDetail,
    error,
    fetchQuoteById,
    clearError,
  } = useQuoteStore();
  const {
    cleaners,
    fetchCleaners,
    isLoadingList: isLoadingCleaners,
  } = useCleanerStore();

  useEffect(() => {
    fetchQuoteById(id).catch(() => {});
    fetchCleaners({ limit: 200 }).catch(() => {});
    return () => clearError();
  }, [id, fetchQuoteById, fetchCleaners, clearError]);

  const quote =
    selectedQuote && (selectedQuote._id === id || selectedQuote.id === id)
      ? selectedQuote
      : null;

  if (isLoadingDetail) {
    return (
      <div className="p-10">
        <div className="h-6 w-40 bg-gray-200 animate-pulse mb-4 rounded" />
        <div className="h-4 w-64 bg-gray-200 animate-pulse mb-6 rounded" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Booking Not Found
        </h2>
        <Button onClick={() => navigate("/bookings")}>Back to Bookings</Button>
      </div>
    );
  }

  const statusLabel = mapStatusLabel(quote);
  const paymentLabel =
    quote.paymentStatus === "paid"
      ? "Paid"
      : quote.paymentStatus === "manual"
      ? "Manual"
      : "Unpaid";
  const serviceLabel = mapServiceLabel(quote.serviceType);
  const assignedCleanerIds =
    quote.assignedCleanerIds && quote.assignedCleanerIds.length
      ? quote.assignedCleanerIds
      : quote.assignedCleanerId
      ? [quote.assignedCleanerId]
      : [];

  const assignedLabel = (() => {
    if (quote.assignedCleaners && quote.assignedCleaners.length) {
      return quote.assignedCleaners
        .map((c) => c.fullName || c.email || c._id)
        .join(", ");
    }

    const names =
      assignedCleanerIds.map((cid) => {
        const found =
          cleaners.find((c) => c._id === cid || c.id === cid) || undefined;
        return found?.fullName || found?.name || cid;
      }) || [];

    if (names.length) return names.join(", ");
    if (isLoadingCleaners) return "Loading cleaners...";
    return "Unassigned";
  })();
  const totalPrice =
    typeof quote.totalPrice === "number" && !Number.isNaN(quote.totalPrice)
      ? `$${quote.totalPrice}`
      : "-";
  const cleanerPrice =
    typeof quote.cleanerEarningAmount === "number" &&
    !Number.isNaN(quote.cleanerEarningAmount)
      ? `$${quote.cleanerEarningAmount}`
      : "-";
  const squareFoot =
    quote.squareFoot !== undefined && quote.squareFoot !== null
      ? quote.squareFoot
      : "-";
  const cleaningFrequency = quote.cleaningFrequency || "-";

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
          {infoItem("Client", quote.companyName || quote.contactName || "Client")}
          {infoItem("Email", quote.email || "-")}
          {infoItem("Phone", quote.phoneNumber || "-")}
          {infoItem("Address", quote.businessAddress || "-", 2)}
        </div>
      </section>

      {/* Cleaning Details */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Cleaning Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {infoItem("Service Type", serviceLabel)}
          {infoItem("Preferred Time", quote.preferredTime || "-")}
          {infoItem("Notes", quote.notes || "-", 2)}
          {infoItem("Square Footage", squareFoot)}
          {infoItem("Cleaning Frequency", cleaningFrequency)}
        </div>
      </section>

      {/* Scheduling */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Scheduling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {infoItem("Date", quote.serviceDate || "-")}
      {infoItem(
        "Assigned Cleaners",
        assignedLabel
      )}
        </div>
      </section>

      {/* Pricing & Status */}
      <section className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Pricing & Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
          {infoItem("Total Price", totalPrice)}
          {infoItem("Cleaner Price", cleanerPrice)}
          <p>
            <span className="font-bold text-gray-800 tracking-wide">Status:</span>{" "}
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusColors[statusLabel]}`}>
              {statusLabel}
            </span>
          </p>
          <p className="sm:col-span-3">
            <span className="font-bold text-gray-800 tracking-wide">Payment:</span>{" "}
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${paymentColors[paymentLabel]}`}>
              {paymentLabel}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

export default ViewBooking;
