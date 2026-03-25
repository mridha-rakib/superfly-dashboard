import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { getQuoteSchedulePresentation } from "../../lib/quoteSchedule";
import { useQuoteStore } from "../../state/quoteStore";

const manualTypes = ["commercial", "post_construction"];
const adminRoles = new Set(["admin", "super_admin"]);

const statusBadge = (status = "pending") => {
  const map = {
    submitted: "bg-yellow-100 text-yellow-800",
    pending: "bg-yellow-100 text-yellow-800",
    admin_notified: "bg-blue-100 text-blue-800",
    reviewed: "bg-indigo-100 text-indigo-800",
    contacted: "bg-purple-100 text-purple-800",
    closed: "bg-gray-200 text-gray-800",
    paid: "bg-green-100 text-green-800",
    completed: "bg-emerald-100 text-emerald-800",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

const isSameIdList = (left = [], right = []) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

function ServiceRequests() {
  const navigate = useNavigate();
  const createMenuRef = useRef(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState([]);
  const {
    quotes,
    isLoading,
    isDeleting,
    error,
    fetchQuotes,
    deleteQuote,
    deleteQuotesBulk,
  } = useQuoteStore();

  useEffect(() => {
    fetchQuotes({ limit: 100 }).catch(() => {});
  }, [fetchQuotes]);

  const adminCreatedRequests = useMemo(
    () =>
      (quotes || []).filter(
        (q) =>
          manualTypes.includes(q.serviceType) &&
          adminRoles.has((q.createdByRole || "").toLowerCase())
      ),
    [quotes]
  );
  const commercialRequests = useMemo(
    () => adminCreatedRequests.filter((q) => q.serviceType === "commercial"),
    [adminCreatedRequests]
  );
  const postConstructionRequests = useMemo(
    () =>
      adminCreatedRequests.filter((q) => q.serviceType === "post_construction"),
    [adminCreatedRequests]
  );
  const allVisibleQuoteIds = useMemo(
    () =>
      adminCreatedRequests
        .map((quote) => String(quote._id || quote.id || ""))
        .filter(Boolean),
    [adminCreatedRequests]
  );

  useEffect(() => {
    const visibleSet = new Set(allVisibleQuoteIds);
    setSelectedQuoteIds((prev) => {
      const next = prev.filter((id) => visibleSet.has(id));
      return isSameIdList(prev, next) ? prev : next;
    });
  }, [allVisibleQuoteIds]);

  useEffect(() => {
    if (!showCreateMenu) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target)
      ) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCreateMenu]);

  const handleCreate = (type) => {
    setShowCreateMenu(false);
    if (type === "Residential Cleaning") {
      toast.warn("Admin cannot create Residential Cleaning bookings.");
      return;
    }
    navigate(`/service-requests/add?type=${encodeURIComponent(type)}`);
  };

  const createOptions = [
    { label: "Commercial Cleaning", value: "Commercial Cleaning" },
    { label: "Post-Construction Cleaning", value: "Post-Construction Cleaning" },
    { label: "Residential Cleaning (disabled)", value: "Residential Cleaning", disabled: true },
  ];
  const allSelected =
    allVisibleQuoteIds.length > 0 &&
    selectedQuoteIds.length === allVisibleQuoteIds.length;

  const toggleQuoteSelection = (quoteId) => {
    setSelectedQuoteIds((prev) =>
      prev.includes(quoteId)
        ? prev.filter((id) => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedQuoteIds(allSelected ? [] : allVisibleQuoteIds);
  };

  const handleDeleteSingle = async (quoteId) => {
    const confirmed = window.confirm(
      "Delete this booking? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      await deleteQuote(quoteId);
      setSelectedQuoteIds((prev) => prev.filter((id) => id !== quoteId));
      toast.success("Booking deleted.");
    } catch (err) {
      toast.error(err?.message || "Failed to delete booking.");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedQuoteIds.length) {
      toast.info("Select at least one booking to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedQuoteIds.length} selected booking(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const result = await deleteQuotesBulk(selectedQuoteIds);
      const deletedCount =
        Number(result?.deletedCount) || selectedQuoteIds.length;
      setSelectedQuoteIds([]);
      toast.success(`${deletedCount} booking(s) deleted.`);
    } catch (err) {
      toast.error(err?.message || "Failed to delete selected bookings.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="relative z-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#C85344] uppercase tracking-wide">
            Bookings
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-sm text-gray-600">
            Admin-created Commercial & Post-Construction bookings.
          </p>
        </div>
        <div ref={createMenuRef} className="relative z-30">
          <button
            type="button"
            aria-expanded={showCreateMenu}
            onClick={() => setShowCreateMenu((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            <Building2 className="h-4 w-4" />
            Create a Booking
            <ChevronDown className="h-4 w-4" />
          </button>
          {showCreateMenu && (
            <div
              className="absolute right-0 top-full z-[70] mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              {createOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  disabled={opt.disabled}
                  onClick={() => handleCreate(opt.value)}
                  className={`flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left text-sm last:border-b-0 ${
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
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-gray-700">
            {selectedQuoteIds.length} booking(s) selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={!allVisibleQuoteIds.length || isDeleting}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allSelected ? "Clear Selection" : "Select All"}
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={!selectedQuoteIds.length || isDeleting}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Commercial Requests</h2>
          {isLoading && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
          {error && (
            <span className="text-sm text-red-500">Error: {error}</span>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {commercialRequests.length === 0 && !isLoading ? (
            <p className="px-6 py-6 text-sm text-gray-600">
              No commercial service requests found.
            </p>
          ) : (
            commercialRequests.map((quote) => {
              const quoteId = quote._id || quote.id;
              const schedulePresentation = getQuoteSchedulePresentation(quote);
              const scheduleSummary =
                schedulePresentation.shortSummary ||
                [quote.serviceDate, quote.preferredTime].filter(Boolean).join(" - ") ||
                "-";
              const scheduleMeta = [
                schedulePresentation.timeRangeLabel
                  ? `Time: ${schedulePresentation.timeRangeLabel}`
                  : null,
                quote.cleaningSchedule?.frequency !== "one_time" &&
                schedulePresentation.primaryDateLabel
                  ? `Next service: ${schedulePresentation.primaryDateLabel}`
                  : null,
              ]
                .filter(Boolean)
                .join(" • ");
              return (
                <div
                  key={quoteId}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedQuoteIds.includes(String(quoteId))}
                      onChange={() => toggleQuoteSelection(String(quoteId))}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#C85344] focus:ring-[#C85344]"
                    />
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                      Booking ID:{" "}
                      <span className="font-semibold text-gray-800">
                        {quoteId}
                      </span>
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {quote.companyName || quote.contactName || "Client"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Commercial • {scheduleSummary}
                      </p>
                      {scheduleMeta && (
                        <p className="text-xs text-gray-400">{scheduleMeta}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                        quote.status
                      )}`}
                    >
                      {quote.status || "pending"}
                    </span>
                    <Link
                      to={`/service-requests/${quoteId}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(String(quoteId))}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Post-Construction Requests</h2>
          {isLoading && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
          {error && (
            <span className="text-sm text-red-500">Error: {error}</span>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {postConstructionRequests.length === 0 && !isLoading ? (
            <p className="px-6 py-6 text-sm text-gray-600">
              No post-construction service requests found.
            </p>
          ) : (
            postConstructionRequests.map((quote) => {
              const quoteId = quote._id || quote.id;
              const schedulePresentation = getQuoteSchedulePresentation(quote);
              const scheduleSummary =
                schedulePresentation.shortSummary ||
                [quote.serviceDate, quote.preferredTime].filter(Boolean).join(" - ") ||
                "-";
              const scheduleMeta = [
                schedulePresentation.timeRangeLabel
                  ? `Time: ${schedulePresentation.timeRangeLabel}`
                  : null,
                quote.cleaningSchedule?.frequency !== "one_time" &&
                schedulePresentation.primaryDateLabel
                  ? `Next service: ${schedulePresentation.primaryDateLabel}`
                  : null,
              ]
                .filter(Boolean)
                .join(" • ");
              return (
                <div
                  key={quoteId}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedQuoteIds.includes(String(quoteId))}
                      onChange={() => toggleQuoteSelection(String(quoteId))}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#C85344] focus:ring-[#C85344]"
                    />
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                      Booking ID:{" "}
                      <span className="font-semibold text-gray-800">
                        {quoteId}
                      </span>
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {quote.companyName || quote.contactName || "Client"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Post-Construction • {scheduleSummary}
                      </p>
                      {scheduleMeta && (
                        <p className="text-xs text-gray-400">{scheduleMeta}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                        quote.status
                      )}`}
                    >
                      {quote.status || "pending"}
                    </span>
                    <Link
                      to={`/service-requests/${quoteId}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(String(quoteId))}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default ServiceRequests;
