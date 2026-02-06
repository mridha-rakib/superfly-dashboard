import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
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
    paid: "bg-green-100 text-green-800",
    completed: "bg-emerald-100 text-emerald-800",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

function ServiceRequests() {
  const navigate = useNavigate();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const { quotes, isLoading, error, fetchQuotes } = useQuoteStore();

  useEffect(() => {
    fetchQuotes({ limit: 100 }).catch(() => {});
  }, [fetchQuotes]);

  const requests = (quotes || []).filter((q) =>
    manualTypes.includes(q.serviceType)
  );
  const adminCreatedRequests = requests.filter((q) =>
    adminRoles.has((q.createdByRole || "").toLowerCase())
  );
  const commercialRequests = adminCreatedRequests.filter(
    (q) => q.serviceType === "commercial"
  );
  const postConstructionRequests = adminCreatedRequests.filter(
    (q) => q.serviceType === "post_construction"
  );

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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#C85344] uppercase tracking-wide">
            Bookings
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-sm text-gray-600">
            Admin-created Commercial & Post-Construction bookings.
          </p>
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
      </header>

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
              return (
                <div
                  key={quoteId}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
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
                      Commercial - {quote.serviceDate || "-"} - {quote.preferredTime || "-"}
                    </p>
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
              return (
                <div
                  key={quoteId}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
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
                      Post-Construction - {quote.serviceDate || "-"} - {quote.preferredTime || "-"}
                    </p>
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
