import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Edit3, Eye, Trash2, UserPlus, ChevronDown, Building2, Loader2, Search } from "lucide-react";
import { useQuoteStore } from "../../state/quoteStore";
import { useCleanerStore } from "../../state/cleanerStore";

const statusStyles = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "On Site": "bg-orange-50 text-orange-700 border-orange-200",
  "Report Submitted": "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
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

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Number.isInteger(value)
    ? `${value}%`
    : `${value.toFixed(2)}%`;
};

const toApiStatus = (filterStatus) => {
  const normalized = (filterStatus || "").toLowerCase();
  // adminStatus filters
  if (normalized === "pending") return "pending";
  if (normalized === "assigned") return "assigned";
  if (normalized === "on site") return "on_site";
  if (normalized === "report submitted") return "report_submitted";
  if (normalized === "completed") return "completed";
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
  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedCleanerIds, setSelectedCleanerIds] = useState([]);
  const [cleanerShare, setCleanerShare] = useState("");
  const [cleanerSearch, setCleanerSearch] = useState("");

  const perPage = 8;
  const {
    quotes,
    pagination,
    isLoading,
    isAssigning,
    isDeleting,
    error,
    fetchQuotes,
    assignCleaner,
    deleteQuote,
    clearError,
  } = useQuoteStore();
  const {
    cleaners,
    isLoadingList: isLoadingCleaners,
    error: cleanerError,
    fetchCleaners,
    clearError: clearCleanerError,
  } = useCleanerStore();
  const cleanerMap = useMemo(() => {
    const map = new Map();
    (cleaners || []).forEach((c) => {
      const id = c._id || c.id;
      if (id) map.set(String(id), c);
    });
    return map;
  }, [cleaners]);

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

  useEffect(() => {
    // Load cleaners once so names are available after refresh
    if (!cleaners || cleaners.length === 0) {
      fetchCleaners({ limit: 100 }).catch(() => {});
    }
  }, [cleaners, fetchCleaners]);

  useEffect(() => {
    if (!assignTarget) return;
    if (cleaners && cleaners.length > 0) return;
    fetchCleaners({ limit: 100 }).catch(() => {
      toast.error("Failed to load cleaners.");
    });
  }, [assignTarget, cleaners.length, fetchCleaners]);

  useEffect(() => {
    const hasAssigned = (quotes || []).some(
      (q) =>
        q.assignedCleanerId ||
        (q.assignedCleanerIds && q.assignedCleanerIds.length > 0)
    );
    if (!hasAssigned) return;
    if (cleaners && cleaners.length > 0) return;
    fetchCleaners({ limit: 100 }).catch(() => {
      toast.error("Failed to load cleaners.");
    });
  }, [quotes, cleaners.length, fetchCleaners]);

  useEffect(() => {
    if (cleanerError) {
      toast.error(cleanerError);
    }
  }, [cleanerError]);

  useEffect(() => {
    return () => clearCleanerError();
  }, [clearCleanerError]);

  const filtered = useMemo(() => {
    return (quotes || [])
      .map((q) => {
        const displayStatus = mapStatusLabel(q);
        const serviceLabel = mapServiceLabel(q.serviceType);
        const paymentStatus = q.paymentStatus === "paid" ? "Paid" : "Unpaid";
        const customerName =
          q.companyName ||
          q.contactName ||
          [q.firstName, q.lastName].filter(Boolean).join(" ") ||
          "Client";
        const assignedIds =
          (q.assignedCleanerIds && q.assignedCleanerIds.length
            ? q.assignedCleanerIds
            : q.assignedCleanerId
            ? [q.assignedCleanerId]
            : []) || [];
        const assignedCount = assignedIds.length;
        const assignedNames = assignedIds
          .map((id) => cleanerMap.get(String(id))?.fullName)
          .filter(Boolean);
        const assigned =
          assignedNames.length > 0
            ? assignedNames.slice(0, 2).join(", ") +
              (assignedNames.length > 2
                ? ` +${assignedNames.length - 2}`
                : "")
            : assignedCount > 1
            ? `${assignedCount} cleaners`
            : assignedCount === 1
            ? "1 cleaner"
            : "";
        const sharePercentage =
          q.cleanerSharePercentage ?? q.cleanerPercentage ?? null;

        return {
          id: q._id || q.id,
          status: displayStatus,
          rawStatus: q.status,
          cleanerSharePercentage: sharePercentage,
          assignedCleanerId: q.assignedCleanerId,
          assignedCleanerIds: q.assignedCleanerIds,
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
            assignedShare: sharePercentage,
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

  const filteredCleaners = useMemo(() => {
    if (!cleanerSearch.trim()) return cleaners || [];
    const term = cleanerSearch.toLowerCase();
    return (cleaners || []).filter(
      (c) =>
        (c.fullName || "").toLowerCase().includes(term) ||
        (c.email || "").toLowerCase().includes(term)
    );
  }, [cleaners, cleanerSearch]);

  const parsedShare = cleanerShare === "" ? undefined : Number(cleanerShare);
  const shareInvalid =
    cleanerShare !== "" &&
    (Number.isNaN(parsedShare) || parsedShare < 0 || parsedShare > 100);
  const shareMissingForMulti =
    selectedCleanerIds.length > 1 && parsedShare === undefined;
  const perCleanerSplit =
    parsedShare !== undefined && selectedCleanerIds.length > 0
      ? parsedShare / selectedCleanerIds.length
      : null;
  const disableAssign =
    !selectedCleanerIds.length || shareMissingForMulti || shareInvalid || isAssigning;

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

  const closeAssignModal = () => {
    setAssignTarget(null);
    setSelectedCleanerIds([]);
    setCleanerShare("");
    setCleanerSearch("");
  };

  const handleAssignCleaner = (booking) => {
    const isResidential = (booking.cleaningDetails?.serviceType || "")
      .toLowerCase()
      .includes("residential");
    if (!isResidential) {
      toast.info("Cleaner assignment is available for residential bookings only.");
      return;
    }
    const existing =
      booking.assignedCleanerIds && booking.assignedCleanerIds.length
        ? booking.assignedCleanerIds
        : booking.assignedCleanerId
          ? [booking.assignedCleanerId]
          : [];
    setAssignTarget(booking);
    setSelectedCleanerIds(existing.map((id) => String(id)));
    const prefilledShare =
      booking.cleanerSharePercentage ?? booking.cleanerPercentage;
    setCleanerShare(
      prefilledShare !== undefined && prefilledShare !== null
        ? String(prefilledShare)
        : ""
    );
    setCleanerSearch("");
  };

  const handleConfirmAssign = async () => {
    if (!assignTarget) return;
    if (!selectedCleanerIds.length) {
      toast.error("Select at least one cleaner to assign.");
      return;
    }
    const shareValueForSubmit =
      cleanerShare === "" ? undefined : Number(cleanerShare);
    if (selectedCleanerIds.length > 1) {
      if (
        shareValueForSubmit === undefined ||
        Number.isNaN(shareValueForSubmit) ||
        shareValueForSubmit < 0 ||
        shareValueForSubmit > 100
      ) {
        toast.error("Enter a share percentage between 0 and 100 for multiple cleaners.");
        return;
      }
    } else if (
      cleanerShare !== "" &&
      (Number.isNaN(shareValueForSubmit) ||
        shareValueForSubmit < 0 ||
        shareValueForSubmit > 100)
    ) {
      toast.error("Cleaner share must be between 0 and 100.");
      return;
    }
    try {
      const payload =
        selectedCleanerIds.length === 1
          ? {
              cleanerId: selectedCleanerIds[0],
              ...(shareValueForSubmit !== undefined
                ? { cleanerSharePercentage: shareValueForSubmit }
                : {}),
            }
          : {
              cleanerIds: selectedCleanerIds,
              cleanerSharePercentage: shareValueForSubmit,
            };
      await assignCleaner(assignTarget.id, payload);
      // Refresh names/data to avoid stale UI and ensure persistence
      fetchCleaners({ limit: 100 }).catch(() => {});
      fetchQuotes({
        page,
        limit: perPage,
        search: search || undefined,
        status: toApiStatus(status),
        serviceType: toApiServiceType(service),
      }).catch(() => {});
      toast.success("Cleaner assigned successfully.");
      closeAssignModal();
    } catch (err) {
      toast.error(err?.message || "Failed to assign cleaner.");
    }
  };

  const handleDelete = async (quoteId) => {
    const confirmed = window.confirm("Delete this booking? This cannot be undone.");
    if (!confirmed) return;
    try {
      await deleteQuote(quoteId);
      toast.success("Booking deleted");
    } catch (err) {
      toast.error(err?.message || "Failed to delete booking");
    }
  };

  const createOptions = [
    { label: "Commercial Cleaning", value: "Commercial Cleaning" },
    { label: "Post-Construction Cleaning", value: "Post-Construction Cleaning" },
    { label: "Residential Cleaning (disabled)", value: "Residential Cleaning", disabled: true },
  ];

  return (
    <div className="space-y-6">
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#C85344]">
                  Residential Booking
                </p>
                <h3 className="text-lg font-semibold text-gray-900">Assign Cleaner</h3>
                  <p className="text-sm text-gray-500">
                    Select one or more cleaners for booking {assignTarget.id}. Shares will be split equally.
                  </p>
              </div>
              <button
                onClick={closeAssignModal}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

              <div className="space-y-4 px-6 py-4">
                <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="text-[11px] uppercase text-gray-500">Booking ID</div>
                    <div className="font-semibold text-gray-900">{assignTarget.id}</div>
                </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="text-[11px] uppercase text-gray-500">Schedule</div>
                    <div className="font-semibold text-gray-900">
                      {formatDateTime(
                        assignTarget.scheduling?.preferredDate,
                      assignTarget.scheduling?.startTime
                    ) || "-"}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase text-gray-500">Selection</div>
                    <div className="font-semibold text-gray-900">
                      {selectedCleanerIds.length || 0} cleaner
                      {selectedCleanerIds.length === 1 ? "" : "s"} selected
                    </div>
                  </div>
                  {selectedCleanerIds.length > 1 ? (
                    <span className="rounded-full bg-[#C85344]/10 px-3 py-1 text-[11px] font-semibold text-[#C85344]">
                      Multi-cleaner split required
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-700">
                      Single cleaner
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      value={cleanerSearch}
                      onChange={(e) => setCleanerSearch(e.target.value)}
                    placeholder="Search cleaners by name or email"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  <span className="text-xs text-gray-500">
                    {(cleaners || []).length} total
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {isLoadingCleaners ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin text-[#C85344]" />
                      Loading cleaners...
                    </div>
                  ) : filteredCleaners.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No cleaners match that search.</div>
                  ) : (
                    filteredCleaners.map((cleaner) => {
                        const id = String(cleaner._id || cleaner.id);
                        const checked = selectedCleanerIds.includes(id);
                        return (
                          <label
                            key={id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              name="selectedCleaners"
                              value={id}
                              checked={checked}
                              onChange={() => {
                                setSelectedCleanerIds((prev) => {
                                  const next = prev.map(String);
                                  return next.includes(id)
                                    ? next.filter((c) => c !== id)
                                    : [...next, id];
                                });
                              }}
                              className="h-4 w-4 accent-[#C85344]"
                            />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {cleaner.fullName || "Cleaner"}
                        </span>
                        <span className="text-xs text-gray-500">{cleaner.email}</span>
                      </div>
                        <span className="ml-auto rounded-full bg-[#C85344]/10 px-2 py-0.5 text-[11px] font-semibold text-[#C85344]">
                          {perCleanerSplit !== null && selectedCleanerIds.length > 1
                            ? `${perCleanerSplit % 1 === 0 ? perCleanerSplit : perCleanerSplit.toFixed(2)}% each`
                            : typeof cleaner.cleanerPercentage === "number"
                            ? `${cleaner.cleanerPercentage}% split`
                            : "Configured split"}
                        </span>
                      </label>
                    );
                    })
                  )}
                </div>
              </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    You can assign multiple cleaners. Provide the portion of the quote to share; it will be divided equally among selected cleaners.
                  </p>
                  {perCleanerSplit !== null && (
                    <div className="text-xs text-gray-700">
                      {parsedShare}% distributed / {selectedCleanerIds.length || 1} cleaner
                      {selectedCleanerIds.length === 1 ? "" : "s"} ={" "}
                      {perCleanerSplit % 1 === 0
                        ? perCleanerSplit
                        : perCleanerSplit.toFixed(2)}
                      % each
                    </div>
                  )}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-xs uppercase text-gray-500">Share %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                      step="1"
                      value={cleanerShare}
                      onChange={(e) => setCleanerShare(e.target.value)}
                      placeholder="e.g., 80"
                      className={`w-24 rounded-lg border px-3 py-1.5 text-sm focus:border-[#C85344] focus:ring-2 focus:ring-[#C85344]/20 ${
                        shareInvalid || shareMissingForMulti
                          ? "border-[#C85344]"
                          : "border-gray-200"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        shareInvalid || shareMissingForMulti
                          ? "text-[#C85344]"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedCleanerIds.length > 1
                        ? "Required when assigning multiple cleaners."
                        : "Optional; defaults to the cleaner's configured split."}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeAssignModal}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAssign}
                    disabled={disableAssign}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-70"
                  >
                  {isAssigning && <Loader2 className="h-4 w-4 animate-spin" />}
                  Assign Cleaner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        {isDeleting && (
          <div className="px-6 py-3 text-sm text-gray-500 border-b border-gray-100">
            Deleting booking...
          </div>
        )}
        {isAssigning && (
          <div className="px-6 py-3 text-sm text-gray-500 border-b border-gray-100">
            Assigning cleaner...
          </div>
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
                const serviceType = (b.cleaningDetails?.serviceType || "").toLowerCase();
                const isResidential = serviceType.includes("residential");
                const isManual = serviceType.includes("commercial") || serviceType.includes("post-construction");
                const paymentStatus = b.paymentStatus || "Unpaid";
                const assignedCount =
                  (b.assignedCleanerIds && b.assignedCleanerIds.length) || 0;
                const perCleaner =
                  b.scheduling?.assignedShare !== null &&
                  b.scheduling?.assignedShare !== undefined &&
                  assignedCount > 0
                    ? b.scheduling.assignedShare / assignedCount
                    : null;
                const totalShare =
                  b.scheduling?.assignedShare !== null &&
                  b.scheduling?.assignedShare !== undefined
                    ? b.scheduling.assignedShare
                    : null;
                const fallbackCleanerPct = (() => {
                  const primaryId =
                    (b.assignedCleanerIds && b.assignedCleanerIds[0]) ||
                    b.assignedCleanerId;
                  const cleaner = primaryId && cleanerMap.get(String(primaryId));
                  return typeof cleaner?.cleanerPercentage === "number"
                    ? cleaner.cleanerPercentage
                    : null;
                })();
                const shareBadge = perCleaner !== null && assignedCount > 1
                  ? `${formatPercent(perCleaner)} each`
                  : totalShare !== null
                  ? `${formatPercent(totalShare)} split`
                  : fallbackCleanerPct !== null
                  ? `${formatPercent(fallbackCleanerPct)} split`
                  : null;
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
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900">
                          {b.scheduling.assignedCleaner}
                        </div>
                        {shareBadge && (
                          <span className="inline-flex items-center rounded-full bg-[#C85344]/10 px-2 py-0.5 text-[11px] font-semibold text-[#C85344]">
                            {shareBadge}
                          </span>
                        )}
                        {isResidential && !isManual && (
                          <div className="flex items-center gap-2 text-xs text-[#C85344]">
                            <button
                              onClick={() => handleAssignCleaner(b)}
                              className="rounded-full border border-[#C85344]/40 px-2 py-0.5 text-[11px] font-semibold text-[#C85344] hover:bg-[#C85344]/5"
                            >
                              Update cleaners
                            </button>
                          </div>
                        )}
                      </div>
                    ) : isManual ? (
                      <span className="text-xs text-gray-500">
                        No cleaner assignment needed for this service type
                      </span>
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#C85344]/40 hover:text-[#C85344]"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/bookings/${b.id}/edit`)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#C85344]/40 hover:text-[#C85344]"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#C85344]/40 hover:text-[#C85344]"
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
            const serviceType = (b.cleaningDetails?.serviceType || "").toLowerCase();
            const isResidential = serviceType.includes("residential");
            const isManual = serviceType.includes("commercial") || serviceType.includes("post-construction");
            const paymentStatus = b.paymentStatus || "Unpaid";
            const assignedCount =
              (b.assignedCleanerIds && b.assignedCleanerIds.length) || 0;
            const perCleaner =
              b.scheduling?.assignedShare !== null &&
              b.scheduling?.assignedShare !== undefined &&
              assignedCount > 0
                ? b.scheduling.assignedShare / assignedCount
                : null;
            const totalShare =
              b.scheduling?.assignedShare !== null &&
              b.scheduling?.assignedShare !== undefined
                ? b.scheduling.assignedShare
                : null;
            const fallbackCleanerPct = (() => {
              const primaryId =
                (b.assignedCleanerIds && b.assignedCleanerIds[0]) ||
                b.assignedCleanerId;
              const cleaner = primaryId && cleanerMap.get(String(primaryId));
              return typeof cleaner?.cleanerPercentage === "number"
                ? cleaner.cleanerPercentage
                : null;
            })();
            const shareBadge = perCleaner !== null && assignedCount > 1
              ? `${formatPercent(perCleaner)} each`
              : totalShare !== null
              ? `${formatPercent(totalShare)} split`
              : fallbackCleanerPct !== null
              ? `${formatPercent(fallbackCleanerPct)} split`
              : null;
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-semibold text-gray-900">Cleaner:</span>{" "}
                      {b.scheduling?.assignedCleaner || "Unassigned"}
                    </div>
                    <div className="flex items-center gap-2">
                      {shareBadge && (
                        <span className="rounded-full bg-[#C85344]/10 px-2 py-0.5 text-[10px] font-semibold text-[#C85344]">
                          {shareBadge}
                        </span>
                      )}
                    {isResidential && !isManual && b.scheduling?.assignedCleaner && (
                      <button
                        onClick={() => handleAssignCleaner(b)}
                        className="rounded-full border border-[#C85344]/40 px-2 py-0.5 text-[11px] font-semibold text-[#C85344]"
                      >
                        Update
                        </button>
                      )}
                    </div>
                  </div>
                  {!b.scheduling?.assignedCleaner && !isManual && (
                    <button
                      onClick={() => handleAssignCleaner(b)}
                      className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#C85344]/40 px-3 py-1 text-xs font-semibold text-[#C85344]"
                    >
                      <UserPlus className="h-4 w-4" />
                      Assign Cleaner
                    </button>
                  )}
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#C85344]/40 hover:text-[#C85344]"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/bookings/${b.id}/edit`)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#C85344]/40 hover:text-[#C85344]"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#C85344]/40 hover:text-[#C85344]"
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
