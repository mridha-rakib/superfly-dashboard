import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import { useQuoteStore } from "../../state/quoteStore";
import { useCleanerStore } from "../../state/cleanerStore";
import { getQuoteSchedulePresentation } from "../../lib/quoteSchedule";
import { formatTimeTo12Hour } from "../../lib/time-utils";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Assigned: "bg-indigo-100 text-indigo-800",
  "On Site": "bg-orange-100 text-orange-800",
  "Report Submitted": "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
  Closed: "bg-gray-200 text-gray-800",
};

const paymentColors = {
  Paid: "bg-green-50 text-green-800",
  Unpaid: "bg-red-50 text-red-800",
  Manual: "bg-blue-50 text-blue-800",
};

const sectionCardClass =
  "bg-white p-6 rounded-3xl shadow-[0_12px_28px_rgba(15,23,42,0.08)] border border-gray-200/80";
const statCardClass =
  "rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-white to-gray-50 p-4 shadow-sm";
const chipClass =
  "inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm";

const mapStatusLabel = (quote) => {
  const admin = quote?.adminStatus;
  const normalized = (admin || quote?.status || "").toLowerCase();
  switch (normalized) {
    case "reviewed":
      return "Accepted";
    case "contacted":
      return "Rejected";
    case "assigned":
      return "Assigned";
    case "on_site":
      return "On Site";
    case "report_submitted":
      return "Report Submitted";
    case "closed":
      return "Closed";
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

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `$${Number(value).toLocaleString()}`;
};

const formatDateTimeValue = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const parseActionError = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const mapCleanerProgressLabel = (status) => {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "Completed";
    case "waiting-for-admin-approval":
      return "Awaiting Approval";
    case "ongoing":
      return "On Site";
    default:
      return "Assigned";
  }
};

const cleanerProgressTone = (status) => {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "waiting-for-admin-approval":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "ongoing":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const cleanerPaymentTone = (status) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

function ViewBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedQuote,
    isLoadingDetail,
    isUpdatingStatus,
    error,
    fetchQuoteById,
    updateStatus,
    clearError,
  } = useQuoteStore();
  const {
    cleaners,
    fetchCleaners,
    clearError: clearCleanerError,
  } = useCleanerStore();

  useEffect(() => {
    fetchQuoteById(id).catch(() => {});
    fetchCleaners({ limit: 100 }).catch(() => {});
    return () => {
      clearError();
      clearCleanerError();
    };
  }, [id, fetchQuoteById, fetchCleaners, clearError, clearCleanerError]);

  const quote =
    selectedQuote && (selectedQuote._id === id || selectedQuote.id === id)
      ? selectedQuote
      : null;
  const quoteId = quote?._id || quote?.id;

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

  if (!quote) {
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
  const serviceType = (quote.serviceType || "").toLowerCase();
  const isManualService =
    serviceType === "commercial" || serviceType === "post_construction";
  const isClosed = (quote.status || "").toLowerCase() === "closed";
  const canCloseManualBooking =
    isManualService && !isClosed && (quote.status || "").toLowerCase() !== "completed";
  const commercialDecision = (() => {
    const status = (quote.status || "").toLowerCase();
    if (status === "reviewed") return "Accepted";
    if (status === "contacted") return "Rejected";
    if (status === "closed") return "Closed";
    return "Pending";
  })();
  const bookingIdLabel = quote._id || quote.id || "-";
  const preferredDateLabel = quote.serviceDate || quote.preferredDate || "-";
  const preferredTimeLabel =
    formatTimeTo12Hour(
      quote.preferredTime || quote.startTime || quote.serviceTime
    ) || "-";
  const assignedCleanerIds =
    quote.assignedCleanerIds && quote.assignedCleanerIds.length
      ? quote.assignedCleanerIds
      : quote.assignedCleanerId
      ? [quote.assignedCleanerId]
      : [];

  const totalPrice =
    typeof quote.totalPrice === "number" && !Number.isNaN(quote.totalPrice)
      ? `$${quote.totalPrice}`
      : "-";
  const cleanerEarningAmountRaw =
    typeof quote.cleanerEarningAmount === "number" &&
    !Number.isNaN(quote.cleanerEarningAmount)
      ? quote.cleanerEarningAmount
      : typeof quote.cleanerPrice === "number" && !Number.isNaN(quote.cleanerPrice)
      ? quote.cleanerPrice
      : undefined;
  const squareFootRaw =
    quote.squareFoot ??
    quote.totalSquareFootage ??
    quote.buildingSize ??
    quote.squareFootage;
  const squareFoot =
    squareFootRaw === undefined || squareFootRaw === null || squareFootRaw === ""
      ? "-"
      : Number.isNaN(Number(squareFootRaw))
      ? String(squareFootRaw)
      : Number(squareFootRaw).toLocaleString();
  const schedulePresentation = getQuoteSchedulePresentation(quote);
  const cleaningFrequency = schedulePresentation.frequencyLabel || "-";
  const recurringScheduleDetails =
    quote.cleaningSchedule?.frequency &&
    quote.cleaningSchedule.frequency !== "one_time"
      ? schedulePresentation.detailItems
      : [];
  const cleaningServiceItems = (() => {
    if (Array.isArray(quote.cleaningServices) && quote.cleaningServices.length) {
      return quote.cleaningServices.map((s) =>
        s
          .toString()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      );
    }
    if (quote.cleaningServices) {
      return quote.cleaningServices
        .toString()
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  })();
  const cleaningServicesDisplay = cleaningServiceItems.length
    ? cleaningServiceItems.join(", ")
    : "Not specified";

  const infoItem = (label, value, spanCols = 1) => (
    <div
      className={`sm:col-span-${spanCols} rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50 p-3`}
    >
      <p className="text-[11px] uppercase text-gray-500 font-semibold">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );

  const renderScheduleDetailCards = (items, valueClassName = "text-lg font-bold text-gray-900") =>
    items.map((item) => (
      <div
        key={`${item.label}-${item.value}`}
        className={statCardClass}
      >
        <p className="text-xs uppercase text-gray-500 font-semibold">{item.label}</p>
        <p className={`${valueClassName} mt-1`}>{item.value}</p>
      </div>
    ));

  const resolvedCleaners =
    quote.assignedCleaners && quote.assignedCleaners.length
      ? quote.assignedCleaners
      : assignedCleanerIds.map((cid) => {
          const found =
            cleaners.find((c) => c._id === cid || c.id === cid) || undefined;
          return {
            _id: cid,
            fullName: found?.fullName || found?.name || cid,
            email: found?.email,
            phone: found?.phone,
          };
        });

  const cleanerProgressMap = new Map(
    (quote.cleanerProgress || []).map((entry) => [String(entry.cleanerId), entry])
  );
  const resolvedCleanersWithProgress = resolvedCleaners.map((cleaner) => {
    const cleanerId = String(cleaner._id || cleaner.id || "");
    const progress = cleaner.cleanerProgress || cleanerProgressMap.get(cleanerId);
    return {
      ...cleaner,
      cleanerId,
      cleanerProgress: progress,
    };
  });

  const cleanerCount =
    resolvedCleanersWithProgress.length || assignedCleanerIds.length || 0;
  const totalPriceValue =
    typeof quote.totalPrice === "number" && !Number.isNaN(quote.totalPrice)
      ? quote.totalPrice
      : undefined;
  const totalCleanerSharePct =
    typeof quote.cleanerSharePercentage === "number"
      ? quote.cleanerSharePercentage
      : undefined;
  const perCleanerPct =
    typeof quote.cleanerPercentage === "number"
      ? quote.cleanerPercentage
      : totalCleanerSharePct !== undefined && cleanerCount > 0
      ? totalCleanerSharePct / cleanerCount
      : undefined;

  const fallbackPerCleanerPayout = (() => {
    if (cleanerEarningAmountRaw !== undefined) {
      return cleanerEarningAmountRaw;
    }
    if (totalPriceValue !== undefined && perCleanerPct !== undefined) {
      return (totalPriceValue * perCleanerPct) / 100;
    }
    return undefined;
  })();

  const cleanerRows = resolvedCleanersWithProgress.map((cleaner) => {
    const progress = cleaner.cleanerProgress;
    const individualPayout =
      typeof progress?.cleanerEarningAmount === "number" &&
      !Number.isNaN(progress.cleanerEarningAmount)
        ? progress.cleanerEarningAmount
        : fallbackPerCleanerPayout;
    const individualPct =
      typeof progress?.cleanerPercentage === "number" &&
      !Number.isNaN(progress.cleanerPercentage)
        ? progress.cleanerPercentage
        : perCleanerPct;

    return {
      ...cleaner,
      cleanerProgress: progress,
      individualPayout,
      individualPct,
      progressLabel: mapCleanerProgressLabel(progress?.cleanerStatus),
    };
  });

  const perCleanerPayout = cleanerRows[0]?.individualPayout ?? fallbackPerCleanerPayout;
  const totalCleanerPayout = cleanerRows.length
    ? cleanerRows.reduce(
        (sum, cleaner) => sum + Number(cleaner.individualPayout || 0),
        0
      )
    : fallbackPerCleanerPayout !== undefined && cleanerCount > 0
    ? fallbackPerCleanerPayout * cleanerCount
    : cleanerEarningAmountRaw;

  const adminEarning =
    totalPriceValue !== undefined && totalCleanerPayout !== undefined
      ? totalPriceValue - totalCleanerPayout
      : undefined;
  const totalPriceDisplay = formatCurrency(totalPriceValue);
  const cleanerPayoutDisplay = formatCurrency(
    totalCleanerPayout !== undefined ? totalCleanerPayout : cleanerEarningAmountRaw
  );
  const adminEarningDisplay = formatCurrency(adminEarning);
  const paymentAmountValue =
    quote.paymentAmount !== undefined && quote.paymentAmount !== null
      ? quote.serviceType === "residential"
        ? Number(quote.paymentAmount) / 100
        : quote.paymentAmount
      : quote.amountCharged !== undefined && quote.amountCharged !== null
      ? quote.amountCharged
      : totalPriceValue;
  const paymentAmountDisplay = formatCurrency(paymentAmountValue);
  const paidAtDisplay = formatDateTimeValue(quote.paidAt);
  const paymentIntentDisplay = quote.paymentIntentId
    ? `${quote.paymentIntentId.slice(0, 12)}...`
    : "-";
  const specialRequest =
    (quote.specialRequest && quote.specialRequest.trim().length
      ? quote.specialRequest
      : quote.notes && quote.notes.trim().length
      ? quote.notes
      : "") || "None";
  const companyName = quote.companyName || quote.name || quote.contactName || "Client";
  const companyEmail = quote.email || quote.companyEmail || "-";
  const companyPhone = quote.phoneNumber || quote.phone || "-";
  const companyAddress =
    quote.businessAddress ||
    quote.address ||
    quote.siteAddress ||
    quote.clientAddress ||
    quote.city ||
    "-";
  const cleanerProgressSummary = quote.cleanerProgressSummary || {
    totalAssigned: cleanerCount,
    pending: cleanerRows.filter(
      (cleaner) => cleaner.cleanerProgress?.cleanerStatus === "pending"
    ).length,
    inProgress: cleanerRows.filter(
      (cleaner) => cleaner.cleanerProgress?.cleanerStatus === "ongoing"
    ).length,
    reportSubmitted: cleanerRows.filter(
      (cleaner) =>
        cleaner.cleanerProgress?.cleanerStatus === "waiting-for-admin-approval"
    ).length,
    completed: cleanerRows.filter(
      (cleaner) => cleaner.cleanerProgress?.cleanerStatus === "completed"
    ).length,
    paid: cleanerRows.filter(
      (cleaner) => cleaner.cleanerProgress?.paymentStatus === "paid"
    ).length,
    unpaid: cleanerRows.filter(
      (cleaner) => cleaner.cleanerProgress?.paymentStatus !== "paid"
    ).length,
  };

  const handleCloseBooking = async () => {
    if (!quoteId) return;
    const confirmed = window.confirm(
      "Close this booking? Future cleaner reminder emails will stop.",
    );
    if (!confirmed) return;

    try {
      await updateStatus(quoteId, { status: "closed" });
      toast.success("Booking closed. Future reminder emails are stopped.");
    } catch (err) {
      toast.error(parseActionError(err, "Failed to close booking."));
    }
  };

  const CommercialView = () => (
    <div className="space-y-6">
      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Overview
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Booking Overview</h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#C85344]/10 px-3 py-1 text-xs font-semibold text-[#C85344] shadow-sm">
            {serviceLabel} Booking
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Booking ID</p>
            <p className="text-sm font-semibold text-gray-900">{bookingIdLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Preferred Date</p>
            <p className="text-sm font-semibold text-gray-900">{preferredDateLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Preferred Time</p>
            <p className="text-sm font-semibold text-gray-900">{preferredTimeLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Status</p>
            <p className="text-sm font-semibold text-gray-900">{commercialDecision}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Payment</p>
            <p className="text-sm font-semibold text-gray-900">{paymentLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Service Type</p>
            <p className="text-sm font-semibold text-gray-900">{serviceLabel}</p>
          </div>
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Summary
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Company Details</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            {infoItem("Company Name", companyName)}
            {infoItem("Company Email", companyEmail)}
            {infoItem("Company Address", companyAddress)}
          </div>
          <div className="space-y-2">
            {infoItem("Primary Contact", quote.contactName || "Client")}
            {infoItem("Company Phone Number", companyPhone)}
          </div>
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Scope
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Building & Services</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">
              Building Size (sq ft)
            </p>
            <p className="text-lg font-bold text-gray-900">{squareFoot}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Cleaning Frequency</p>
            <p className="text-lg font-bold text-gray-900">{cleaningFrequency}</p>
          </div>
          {renderScheduleDetailCards(recurringScheduleDetails)}
          <div className={`${statCardClass} md:col-span-1`}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Service Types</p>
            {cleaningServiceItems.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {cleaningServiceItems.map((item, index) => (
                  <span key={`${item}-${index}`} className={chipClass}>
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Not specified</p>
            )}
          </div>
        </div>
        <div className={`${statCardClass} mt-4`}>
          <p className="text-xs uppercase text-gray-500 font-semibold">Special Request</p>
          <p className="text-sm text-gray-800 leading-relaxed">{specialRequest}</p>
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Assignment
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Assignment & Payout</h2>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {cleanerCount} cleaner{cleanerCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-[#C85344]/10 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Total Price</p>
            <p className="text-2xl font-bold text-gray-900">{totalPriceDisplay}</p>
            <p className="text-xs text-gray-500 mt-1">Contract value</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-emerald-50 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Cleaner Payout</p>
            <p className="text-2xl font-bold text-gray-900">{cleanerPayoutDisplay}</p>
            <p className="text-xs text-gray-500 mt-1">
              {perCleanerPayout !== undefined
                ? `${cleanerCount} cleaner split`
                : "No payout data"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Admin Earnings</p>
            <p className="text-2xl font-bold text-gray-900">{adminEarningDisplay}</p>
            <p className="text-xs text-gray-500 mt-1">After cleaner payout</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {resolvedCleaners && resolvedCleaners.length ? (
            resolvedCleaners.map((cleaner, idx) => (
              <div
                key={cleaner._id || cleaner.id || cleaner.fullName || idx}
                className={statCardClass}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cleaner.fullName || "Cleaner"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cleaner.email || "No email"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cleaner.phone || "No phone"}
                    </p>
                  </div>
                  {perCleanerPayout !== undefined && (
                    <div className="text-right">
                      <p className="text-[11px] uppercase text-gray-500 font-semibold">
                        Payout
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(perCleanerPayout)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
              No cleaners assigned yet.
            </div>
          )}
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Payment
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Payment & Transactions</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 shadow-sm">
              Status: {commercialDecision}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                paymentLabel === "Paid"
                  ? "bg-green-50 text-green-800"
                  : paymentLabel === "Manual"
                  ? "bg-blue-50 text-blue-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              Payment: {paymentLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Amount Charged</p>
            <p className="text-lg font-bold text-gray-900">{paymentAmountDisplay}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Paid At</p>
            <p className="text-sm font-semibold text-gray-900">{paidAtDisplay}</p>
          </div>
          <div className={`${statCardClass} md:col-span-2`}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Payment Intent</p>
            <p className="text-sm font-semibold text-gray-900">{paymentIntentDisplay}</p>
            <p className="text-xs text-gray-500 mt-1">
              Manual payments will not have an intent id.
            </p>
          </div>
        </div>
      </section>

    </div>
  );

  const PostConstructionView = () => (
    <div className="space-y-8 pb-10">
      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Overview
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Booking Overview</h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {serviceLabel} Booking
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Booking ID</p>
            <p className="text-sm font-semibold text-gray-900">{bookingIdLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Preferred Date</p>
            <p className="text-sm font-semibold text-gray-900">{preferredDateLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Preferred Time</p>
            <p className="text-sm font-semibold text-gray-900">{preferredTimeLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Status</p>
            <p className="text-sm font-semibold text-gray-900">{statusLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Payment</p>
            <p className="text-sm font-semibold text-gray-900">{paymentLabel}</p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Service Type</p>
            <p className="text-sm font-semibold text-gray-900">{serviceLabel}</p>
          </div>
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-gray-800">Project Details</h2>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Post-Construction Booking
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
          {infoItem("Company Name", companyName)}
          {infoItem("Email Address", companyEmail)}
          {infoItem("Phone Number", companyPhone)}
          {infoItem("Site Address", companyAddress, 2)}
          {infoItem("General Contractor", quote.generalContractorName || "-")}
          {infoItem("Contractor Phone", quote.generalContractorPhone || "-")}
        </div>
      </section>

      <section className={sectionCardClass}>
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Scope & Schedule</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {infoItem("Preferred Date", preferredDateLabel)}
          {infoItem("Preferred Time", preferredTimeLabel)}
          {infoItem("Cleaning Frequency", cleaningFrequency)}
          {recurringScheduleDetails.map((item) => infoItem(item.label, item.value))}
          {infoItem("Total Square Footage (sq ft)", squareFoot)}
          {infoItem("Service Types", cleaningServicesDisplay)}
          {infoItem("Special Request", specialRequest, 2)}
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Assignment
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Assignment & Payout</h2>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {cleanerCount} cleaner{cleanerCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-[#C85344]/10 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Total Price</p>
            <p className="text-2xl font-bold text-gray-900">{totalPriceDisplay}</p>
            <p className="text-xs text-gray-500 mt-1">Contract value</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-emerald-50 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Cleaner Payout</p>
            <p className="text-2xl font-bold text-gray-900">{cleanerPayoutDisplay}</p>
            <p className="text-xs text-gray-500 mt-1">
              {perCleanerPayout !== undefined
                ? `${cleanerCount} cleaner split`
                : "No payout data"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Admin Earnings</p>
            <p className="text-2xl font-bold text-gray-900">{adminEarningDisplay}</p>
            <p className="text-xs text-gray-500 mt-1">After cleaner payout</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {resolvedCleaners && resolvedCleaners.length ? (
            resolvedCleaners.map((cleaner, idx) => (
              <div
                key={cleaner._id || cleaner.id || cleaner.fullName || idx}
                className={statCardClass}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cleaner.fullName || "Cleaner"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cleaner.email || "No email"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cleaner.phone || "No phone"}
                    </p>
                  </div>
                  {perCleanerPayout !== undefined && (
                    <div className="text-right">
                      <p className="text-[11px] uppercase text-gray-500 font-semibold">
                        Payout
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(perCleanerPayout)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-600">
              No cleaners assigned yet.
            </div>
          )}
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Payment
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Payment & Transactions</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 shadow-sm">
              Status: {statusLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                paymentLabel === "Paid"
                  ? "bg-green-50 text-green-800"
                  : paymentLabel === "Manual"
                  ? "bg-blue-50 text-blue-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              Payment: {paymentLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Amount Charged</p>
            <p className="text-lg font-bold text-gray-900">{paymentAmountDisplay}</p>
          </div>
          <div className={statCardClass}>
              <p className="text-xs uppercase text-gray-500 font-semibold">Paid At</p>
              <p className="text-sm font-semibold text-gray-900">{paidAtDisplay}</p>
            </div>
          <div className={`${statCardClass} md:col-span-2`}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Payment Intent</p>
            <p className="text-sm font-semibold text-gray-900">{paymentIntentDisplay}</p>
            <p className="text-xs text-gray-500 mt-1">
              Manual payments will not have an intent id.
            </p>
          </div>
        </div>
      </section>
    </div>
  );

  const ResidentialView = () => (
    <div className="space-y-8">
      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-gray-800">Client Details</h2>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Residential Booking
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
          {infoItem("Client", quote.contactName || quote.companyName || "Client")}
          {infoItem("Email", quote.email || "-")}
          {infoItem("Phone", quote.phoneNumber || "-")}
          {infoItem("Address", quote.businessAddress || quote.clientAddress || "-", 2)}
        </div>
      </section>

      <section className={sectionCardClass}>
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Service Items</h2>
        {quote.services && quote.services.length ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quote.services.map((item) => (
                  <tr key={item.key}>
                    <td className="px-4 py-2">{item.label}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      ${Number(item.unitPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${Number(item.subtotal || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-4 py-3 font-semibold text-right" colSpan={3}>
                    Total
                  </td>
                  <td className="px-4 py-3 font-semibold text-right">
                    {totalPrice}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No service items recorded.</p>
        )}
      </section>

      <section className={sectionCardClass}>
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Assigned Cleaner(s)</h2>
        {cleanerRows.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cleanerRows.map((cleaner) => (
              <div
                key={cleaner._id || cleaner.id || cleaner.fullName}
                className={statCardClass}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {cleaner.fullName || "Cleaner"}
                    </p>
                    <p className="text-sm text-gray-600">{cleaner.email || "No email"}</p>
                    <p className="text-sm text-gray-600">{cleaner.phone || "No phone"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${cleanerProgressTone(
                        cleaner.cleanerProgress?.cleanerStatus
                      )}`}
                    >
                      {cleaner.progressLabel}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${cleanerPaymentTone(
                        cleaner.cleanerProgress?.paymentStatus
                      )}`}
                    >
                      {(cleaner.cleanerProgress?.paymentStatus || "pending").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-gray-100 bg-white p-3">
                    <p className="text-[11px] uppercase text-gray-500 font-semibold">
                      Payout
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(cleaner.individualPayout)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-3">
                    <p className="text-[11px] uppercase text-gray-500 font-semibold">
                      Share
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {cleaner.individualPct !== undefined
                        ? `${Number(cleaner.individualPct).toFixed(2)}%`
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-3">
                    <p className="text-[11px] uppercase text-gray-500 font-semibold">
                      Report
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {cleaner.cleanerProgress?.reportStatus
                        ? cleaner.cleanerProgress.reportStatus.replace(/_/g, " ")
                        : "Not submitted"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-3">
                    <p className="text-[11px] uppercase text-gray-500 font-semibold">
                      Approved At
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDateTimeValue(cleaner.cleanerProgress?.reportApprovedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No cleaner assigned.</p>
        )}
      </section>

      <section className={sectionCardClass}>
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Schedule & Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Service Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {quote.serviceDate || "-"}
            </p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Preferred Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatTimeTo12Hour(quote.preferredTime) || "-"}
            </p>
          </div>
          <div className={`${statCardClass} sm:col-span-2`}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Notes</p>
            <p className="text-sm text-gray-700">
              {quote.notes && quote.notes.trim().length ? quote.notes : "None"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 shadow-sm">
            Status: {statusLabel}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              paymentLabel === "Paid"
                ? "bg-green-50 text-green-800"
                : paymentLabel === "Manual"
                ? "bg-blue-50 text-blue-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            Payment: {paymentLabel}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Completed</p>
            <p className="text-lg font-bold text-gray-900">
              {cleanerProgressSummary.completed}/{cleanerProgressSummary.totalAssigned}
            </p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Awaiting Approval</p>
            <p className="text-lg font-bold text-gray-900">
              {cleanerProgressSummary.reportSubmitted}
            </p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">On Site</p>
            <p className="text-lg font-bold text-gray-900">
              {cleanerProgressSummary.inProgress}
            </p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Paid Cleaners</p>
            <p className="text-lg font-bold text-gray-900">
              {cleanerProgressSummary.paid}/{cleanerProgressSummary.totalAssigned}
            </p>
          </div>
        </div>
      </section>

      <section className={sectionCardClass}>
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Payment Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-800">
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Total Paid</p>
            <p className="text-xl font-bold text-gray-900">
              {totalPriceValue !== undefined ? `$${totalPriceValue.toFixed(2)}` : "-"}
            </p>
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Cleaner Total</p>
            <p className="text-xl font-bold text-gray-900">
              {totalCleanerPayout !== undefined
                ? `$${totalCleanerPayout.toFixed(2)}`
                : "-"}
            </p>
            {perCleanerPayout !== undefined && cleanerCount > 1 && (
              <p className="text-xs text-gray-600 mt-1">
                {cleanerCount} cleaners - ${perCleanerPayout.toFixed(2)} each
              </p>
            )}
          </div>
          <div className={statCardClass}>
            <p className="text-xs uppercase text-gray-500 font-semibold">Admin Earnings</p>
            <p className="text-xl font-bold text-gray-900">
              {adminEarning !== undefined ? `$${adminEarning.toFixed(2)}` : "-"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderByService = () => {
    if (serviceType === "commercial") return <CommercialView />;
    if (serviceType === "post_construction") return <PostConstructionView />;
    return <ResidentialView />;
  };

  return (
    <div className="space-y-8">
      {error && quote && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-sm text-gray-500">
            Viewing {serviceLabel} booking #{quote._id || quote.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              statusColors[statusLabel] || "bg-gray-50 text-gray-700"
            }`}
          >
            {statusLabel}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              paymentColors[paymentLabel] || "bg-gray-50 text-gray-700"
            }`}
          >
            {paymentLabel}
          </span>
          {canCloseManualBooking && (
            <button
              onClick={handleCloseBooking}
              disabled={isUpdatingStatus}
              className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              title="Close booking and stop future reminder emails"
            >
              {isUpdatingStatus ? "Closing..." : "Close Booking"}
            </button>
          )}
        </div>
      </div>

      {renderByService()}
    </div>
  );
}

export default ViewBooking;
