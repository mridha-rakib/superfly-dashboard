import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Edit3, Eye, Trash2, UserPlus, ChevronDown, Building2 } from "lucide-react";
import { useQuoteStore } from "../../state/quoteStore";

const statusStyles = {
  Ongoing: "bg-orange-50 text-orange-700 border-orange-200",
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Complete: "bg-green-50 text-green-700 border-green-200",
};

const paymentStyles = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Unpaid: "bg-gray-50 text-gray-700 border-gray-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
};

const formatDateTime = (date, time) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${time || ""}`;
};

const mapStatusLabel = (status) => {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
    case "submitted":
      return "Pending";
    case "admin_notified":
      return "Ongoing";
    case "reviewed":
    case "contacted":
      return "In Progress";
    case "paid":
    case "completed":
      return "Complete";
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

const toApiStatus = (filterStatus) => {
  const normalized = (filterStatus || "").toLowerCase();
  if (normalized === "pending") return "submitted";
  if (normalized === "ongoing") return "admin_notified";
  if (normalized === "in progress") return "reviewed";
  if (normalized === "complete") return "completed";
  return undefined;
};

const toApiServiceType = (filterService) => {
  const normalized = (filterService || "").toLowerCase();
  if (normalized === "residential") return "residential";
  if (normalized === "commercial") return "commercial";
  if (normalized === "post-construction") return "post_construction";
  return undefined;
};

function Booking() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [service, setService] = useState(searchParams.get("service") || "All");
  const [payment, setPayment] = useState(searchParams.get("payment") || "All");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const perPage = 8;
  const { quotes, pagination, isLoading, error, fetchQuotes, clearError } = useQuoteStore();

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (service !== "All") params.set("service", service);
    if (payment !== "All") params.set("payment", payment);
    if (search) params.set("search", search);
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  }, [status, service, payment, search, page, setSearchParams]);

  useEffect(() => {
    fetchQuotes({
      page,
      limit: perPage,
      search: search || undefined,
      status: toApiStatus(status),
      serviceType: toApiServiceType(service),
    }).catch(() => {
      toast.error("Failed to load bookings.");
    });
    return () => clearError();
  }, [page, perPage, search, status, service, fetchQuotes, clearError]);

  const filtered = useMemo(() => {
    return (quotes || [])
      .map((q) => {
        const displayStatus = mapStatusLabel(q.status);
        const serviceLabel = mapServiceLabel(q.serviceType);
        const paymentStatus = q.paymentStatus === "paid" ? "Paid" : "Unpaid";
        const customerName =
          q.companyName ||
          q.contactName ||
          [q.firstName, q.lastName].filter(Boolean).join(" ") ||
          "Client";
        const assignedCount = (q.assignedCleanerIds && q.assignedCleanerIds.length) || 0;
        const assigned =
          assignedCount > 1
            ? `${assignedCount} cleaners`
            : assignedCount === 1 || q.assignedCleanerId
            ? "1 cleaner"
            : "";

        return {
          id: q._id || q.id,
          status: displayStatus,
          rawStatus: q.status,
          serviceLabel,
          paymentStatus,
          customerInfo: {
            businessName: customerName,
            phone: q.phoneNumber,
            email: q.email,
            address: q.businessAddress,
          },
          cleaningDetails: {
            serviceType: serviceLabel,
          },
          scheduling: {
            preferredDate: q.serviceDate,
            startTime: q.preferredTime,
            endTime: "",
            assignedCleaner: assigned,
          },
          pricing: {
            totalPrice: q.totalPrice,
          },
        };
      })
      .filter((b) =>
        status === "All" ? true : (b.status || "").toLowerCase() === status.toLowerCase()
      )
      .filter((b) =>
        service === "All"
          ? true
          : (b.cleaningDetails?.serviceType || "").toLowerCase().includes(service.toLowerCase())
      )
      .filter((b) =>
        payment === "All" ? true : (b.paymentStatus || "").toLowerCase() === payment.toLowerCase()
      )
      .filter((b) => {
        if (!search) return true;
        const haystack = `${b.id} ${b.customerInfo?.businessName} ${b.customerInfo?.phone}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      });
  }, [quotes, status, service, payment, search]);

  const totalPages =
    pagination?.totalPages || Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleCreate = (type) => {
    setShowCreateMenu(false);
    if (type === "Residential Cleaning") {
      toast.warn("Admin cannot create Residential Cleaning bookings.");
      return;
    }
    navigate(`/bookings/add?type=${encodeURIComponent(type)}`);
  };

  const handleAssignCleaner = (booking) => {
    toast.info(`Open cleaner assignment for ${booking.id}`);
  };

  const createOptions = [
    { label: "Commercial Cleaning", value: "Commercial Cleaning" },
    { label: "Post-Construction Cleaning", value: "Post-Construction Cleaning" },
    { label: "Residential Cleaning (disabled)", value: "Residential Cleaning", disabled: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500">View and manage all cleaning bookings.</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            <Building2 className="h-4 w-4" />
            Create a Booking
            <ChevronDown className="h-4 w-4" />
          </button>
          {showCreateMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg">
              {createOptions.map((opt) => (
                <button
                  key={opt.value}
                  disabled={opt.disabled}
                  onClick={() => handleCreate(opt.value)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                    opt.disabled
                      ? "cursor-not-allowed text-gray-400"
                      : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  {opt.label}
                  {opt.disabled && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      Blocked
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs font-semibold text-gray-500">Search</label>
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Search by ID, client, phone"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {["All", "Ongoing", "Pending", "In Progress", "Complete"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Service Type</label>
            <select
              value={service}
              onChange={(e) => {
                setPage(1);
                setService(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {["All", "Residential", "Commercial", "Post-Construction"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Payment</label>
            <select
              value={payment}
              onChange={(e) => {
                setPage(1);
                setPayment(e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {["All", "Paid", "Unpaid", "Partial"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="px-6 py-4 text-sm text-gray-500">Loading bookings...</div>
        )}
        <div className="hidden lg:block">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FFF6F3] text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Date &amp; Time</th>
                <th className="px-6 py-3">Client / Contact</th>
                <th className="px-6 py-3">Service Type</th>
                <th className="px-6 py-3">Cleaner Assign</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((b) => {
                const isResidential = (b.cleaningDetails?.serviceType || "").toLowerCase().includes("residential");
                const paymentStatus = b.paymentStatus || "Unpaid";
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{b.id}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <div>{formatDateTime(b.scheduling?.preferredDate, b.scheduling?.startTime)}</div>
                      <div className="text-xs text-gray-500">{b.scheduling?.endTime ? `Ends ${b.scheduling.endTime}` : ""}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="font-medium text-gray-900">{b.customerInfo?.businessName}</div>
                      <div className="text-xs text-gray-500">
                        {b.customerInfo?.phone} | {b.customerInfo?.email}
                      </div>
                      <div className="text-xs text-gray-400">Address: {b.customerInfo?.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                        {b.cleaningDetails?.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {b.scheduling?.assignedCleaner ? (
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">{b.scheduling.assignedCleaner}</div>
                          {isResidential && (
                            <div className="text-xs text-[#C85344]">Single cleaner enforced</div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAssignCleaner(b)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#C85344]/40 px-3 py-1 text-xs font-semibold text-[#C85344] hover:bg-[#C85344]/5"
                        >
                          <UserPlus className="h-4 w-4" />
                          Assign Cleaner
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusStyles[b.status] || "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {b.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                          paymentStyles[paymentStatus] || "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {paymentStatus}
                        <span className="text-gray-800">
                          ${b.pricing?.totalPrice ? b.pricing.totalPrice.toLocaleString() : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 text-gray-500">
                        <button
                          onClick={() => navigate(`/bookings/${b.id}`)}
                          className="rounded-full border border-gray-200 p-2 hover:text-[#C85344]"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/bookings/${b.id}/edit`)}
                          className="rounded-full border border-gray-200 p-2 hover:text-[#C85344]"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast.info(`Delete flow for ${b.id}`)}
                          className="rounded-full border border-gray-200 p-2 hover:text-[#C85344]"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!paginated.length && !isLoading && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No bookings match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {paginated.map((b) => {
            const isResidential = (b.cleaningDetails?.serviceType || "").toLowerCase().includes("residential");
            const paymentStatus = b.paymentStatus || "Unpaid";
            return (
              <div key={b.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.id}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(b.scheduling?.preferredDate, b.scheduling?.startTime)}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${
                      statusStyles[b.status] || "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {b.status || "Pending"}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div>
                    <span className="font-semibold text-gray-900">Client:</span> {b.customerInfo?.businessName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {b.customerInfo?.phone} | {b.customerInfo?.email}
                  </div>
                  <div className="text-xs text-gray-400">Address: {b.customerInfo?.address}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-800">
                      {b.cleaningDetails?.serviceType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <span className="font-semibold text-gray-900">Cleaner:</span>{" "}
                      {b.scheduling?.assignedCleaner || "Unassigned"}
                    </div>
                    {isResidential && b.scheduling?.assignedCleaner && (
                      <span className="text-[10px] text-[#C85344]">Single cleaner enforced</span>
                    )}
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[11px] font-semibold ${
                      paymentStyles[paymentStatus] || "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {paymentStatus} | ${b.pricing?.totalPrice ? b.pricing.totalPrice.toLocaleString() : "-"}
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2 text-gray-500">
                  <button
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    className="rounded-full border border-gray-200 p-2 hover:text-[#C85344]"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/bookings/${b.id}/edit`)}
                    className="rounded-full border border-gray-200 p-2 hover:text-[#C85344]"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toast.info(`Delete flow for ${b.id}`)}
                    className="rounded-full border border-gray-200 p-2 hover:text-[#C85344]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {!paginated.length && !isLoading && (
            <div className="rounded-xl border border-gray-200 p-4 text-center text-gray-500">
              No bookings match these filters.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {(currentPage - 1) * perPage + 1}-
          {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} bookings
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="font-semibold">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Booking;
