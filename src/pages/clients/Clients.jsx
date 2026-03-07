import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Search, Sparkles, Users } from "lucide-react";
import { Pagination } from "../../components/ui/Pagination";
import { quoteApi } from "../../services/quoteApi";

const PER_PAGE = 8;
const MAX_PAGES_TO_SCAN = 30;

const toTimestamp = (value) => {
  const parsed = new Date(value || 0).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getClientName = (quote) =>
  quote?.contactName ||
  quote?.companyName ||
  [quote?.firstName, quote?.lastName].filter(Boolean).join(" ") ||
  "Client";

const getClientKey = (quote) => {
  const userId = quote?.userId ? String(quote.userId) : "";
  const email = quote?.email ? quote.email.trim().toLowerCase() : "";
  const phone = quote?.phoneNumber ? String(quote.phoneNumber).trim() : "";
  const quoteId = quote?._id || quote?.id ? String(quote._id || quote.id) : "";
  const fallbackName = getClientName(quote);
  const fallbackDate = quote?.createdAt ? String(quote.createdAt) : "";

  if (userId) return `uid:${userId}`;
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return `quote:${quoteId || `${fallbackName}|${fallbackDate}`}`;
};

const aggregateClients = (quotes) => {
  const authorized = new Map();
  const guest = new Map();

  (quotes || []).forEach((quote) => {
    const role = (quote?.createdByRole || "").toLowerCase();
    const isAuthorized = role === "client" || Boolean(quote?.userId);
    const targetMap = isAuthorized ? authorized : guest;
    const key = getClientKey(quote);

    const next = targetMap.get(key) || {
      id: key,
      fullName: getClientName(quote),
      email: quote?.email || "-",
      phone: quote?.phoneNumber || "-",
      totalRequests: 0,
      lastRequestAt: quote?.createdAt || null,
      createdByRole: role || (isAuthorized ? "client" : "guest"),
    };

    const quoteCreatedAt = quote?.createdAt || null;
    if (
      quoteCreatedAt &&
      toTimestamp(quoteCreatedAt) >= toTimestamp(next.lastRequestAt)
    ) {
      next.lastRequestAt = quoteCreatedAt;
      next.fullName = getClientName(quote);
      next.email = quote?.email || next.email || "-";
      next.phone = quote?.phoneNumber || next.phone || "-";
    }

    next.totalRequests += 1;
    targetMap.set(key, next);
  });

  const sortByRecent = (a, b) => toTimestamp(b.lastRequestAt) - toTimestamp(a.lastRequestAt);

  return {
    authorizedClients: Array.from(authorized.values()).sort(sortByRecent),
    guestClients: Array.from(guest.values()).sort(sortByRecent),
  };
};

const formatDate = (dateLike) => {
  if (!dateLike) return "-";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function Clients() {
  const [activeTab, setActiveTab] = useState("authorized");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [authorizedClients, setAuthorizedClients] = useState([]);
  const [guestClients, setGuestClients] = useState([]);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const allQuotes = [];
      let page = 1;
      let keepFetching = true;

      while (keepFetching && page <= MAX_PAGES_TO_SCAN) {
        const response = await quoteApi.listAdmin({ page, limit: 100 });
        const items = response?.data || response?.items || [];
        const pagination = response?.pagination;

        allQuotes.push(...items);

        if (!pagination) {
          keepFetching = false;
          break;
        }

        const totalPages = pagination?.totalPages || pagination?.pageCount || 1;
        if (page >= totalPages) {
          keepFetching = false;
          break;
        }

        page += 1;
      }

      const { authorizedClients, guestClients } = aggregateClients(allQuotes);
      setAuthorizedClients(authorizedClients);
      setGuestClients(guestClients);
    } catch (fetchError) {
      const message =
        fetchError?.response?.data?.message ||
        fetchError?.message ||
        "Failed to load clients.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const activeClients = activeTab === "authorized" ? authorizedClients : guestClients;

  const filteredClients = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return activeClients;

    return activeClients.filter((client) => {
      const haystack = `${client.fullName} ${client.email} ${client.phone}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [activeClients, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedClients = filteredClients.slice(
    (effectivePage - 1) * PER_PAGE,
    effectivePage * PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#C85344]">
              <Sparkles className="h-4 w-4 text-[#C85344]" /> Clients
            </p>
            <h2 className="text-2xl font-semibold text-gray-900">Client Directory</h2>
            <p className="text-sm text-gray-500">
              Manage authorized and guest clients from one place.
            </p>
          </div>
          <button
            onClick={loadClients}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#C85344]/40 hover:text-[#C85344]"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex w-full flex-wrap gap-2 rounded-xl bg-[#f7f3f2] p-1 md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("authorized")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "authorized"
                  ? "bg-white text-[#C85344] shadow-sm"
                  : "text-gray-600 hover:text-[#C85344]"
              }`}
            >
              Authorized Clients ({authorizedClients.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guest")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "guest"
                  ? "bg-white text-[#C85344] shadow-sm"
                  : "text-gray-600 hover:text-[#C85344]"
              }`}
            >
              Guest Clients ({guestClients.length})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20"
              placeholder={`Search ${activeTab === "authorized" ? "authorized" : "guest"} clients...`}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 px-5 py-10 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#C85344]" />
            Loading clients...
          </div>
        ) : paginatedClients.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            {activeTab === "authorized"
              ? "No authorized clients found."
              : "No guest clients found."}
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-6 gap-4 border-b border-gray-200 bg-[#FFF6F3] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
              <p>No</p>
              <p>Name</p>
              <p>Email</p>
              <p>Contact</p>
              <p>Requests</p>
              <p>Last Request</p>
            </div>
            <div className="divide-y divide-gray-100">
              {paginatedClients.map((client, index) => (
                <div
                  key={client.id}
                  className="grid grid-cols-1 gap-2 px-5 py-4 text-sm text-gray-700 md:grid-cols-6 md:gap-4"
                >
                  <p className="font-medium text-gray-900">
                    {String((effectivePage - 1) * PER_PAGE + index + 1).padStart(2, "0")}
                  </p>
                  <p className="font-medium text-gray-900">{client.fullName || "Client"}</p>
                  <p className="break-all">{client.email || "-"}</p>
                  <p>{client.phone || "-"}</p>
                  <p>{client.totalRequests}</p>
                  <p>{formatDate(client.lastRequestAt)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination
        currentPage={effectivePage}
        setCurrentPage={setCurrentPage}
        perPage={PER_PAGE}
        totalPages={totalPages}
        totalItems={filteredClients.length}
      />
    </div>
  );
}

export default Clients;
