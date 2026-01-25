import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuoteStore } from "../../state/quoteStore";

const manualTypes = ["commercial", "post_construction"];

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
  const { quotes, isLoading, error, fetchQuotes } = useQuoteStore();

  useEffect(() => {
    fetchQuotes({ limit: 100 }).catch(() => {});
  }, [fetchQuotes]);

  const requests = (quotes || []).filter((q) =>
    manualTypes.includes(q.serviceType)
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#C85344] uppercase tracking-wide">
            Bookings
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-sm text-gray-600">
            Admin-created Commercial & Post-Construction bookings.
          </p>
        </div>
      </header>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Requests</h2>
          {isLoading && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
          {error && (
            <span className="text-sm text-red-500">Error: {error}</span>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {requests.length === 0 && !isLoading ? (
            <p className="px-6 py-6 text-sm text-gray-600">
              No service requests found.
            </p>
          ) : (
            requests.map((quote) => (
              <div
                key={quote._id}
                className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Booking ID:{" "}
                    <span className="font-semibold text-gray-800">
                      {quote._id}
                    </span>
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {quote.companyName || quote.contactName || "Client"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {quote.serviceType === "commercial"
                      ? "Commercial"
                      : "Post-Construction"}{" "}
                    • {quote.serviceDate || "-"} • {quote.preferredTime || "-"}
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
                    to={`/bookings/${quote._id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default ServiceRequests;
