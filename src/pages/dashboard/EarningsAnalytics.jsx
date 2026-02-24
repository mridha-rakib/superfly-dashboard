import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useDashboardStore } from "../../state/dashboardStore";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US");

const formatCurrency = (value) =>
  currencyFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);

const formatInteger = (value) =>
  integerFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);

const SummaryCard = ({ title, value, isAmount = true }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-3 text-2xl font-semibold text-gray-900">
      {isAmount ? formatCurrency(value) : formatInteger(value)}
    </p>
  </div>
);

const statusBadgeClass = (value) => {
  const normalized = (value || "").toLowerCase();
  if (normalized === "booking") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (normalized === "paid") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (normalized === "quote") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }
  if (normalized === "manual" || normalized === "unpaid") {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }
  return "bg-[#FFF6F3] text-[#C85344] border-[#C85344]/20";
};

const EarningsAnalytics = () => {
  const {
    earningsAnalytics,
    isEarningsAnalyticsLoading,
    earningsAnalyticsError,
    fetchEarningsAnalytics,
    clearEarningsAnalyticsError,
  } = useDashboardStore();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [serviceType, setServiceType] = useState("all");
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchEarningsAnalytics({
      page,
      limit,
      search: search || undefined,
      serviceType: serviceType !== "all" ? serviceType : undefined,
    }).catch(() => {});

    return () => clearEarningsAnalyticsError();
  }, [
    page,
    limit,
    search,
    serviceType,
    fetchEarningsAnalytics,
    clearEarningsAnalyticsError,
  ]);

  const summary = earningsAnalytics?.summary || null;
  const serviceWise = earningsAnalytics?.serviceWise || [];
  const cleanerWise = earningsAnalytics?.cleanerWise || [];
  const bookingRows = earningsAnalytics?.bookingWise?.rows || [];
  const pagination = earningsAnalytics?.bookingWise?.pagination || {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit,
  };

  const cards = useMemo(
    () => [
      {
        title: "Total Earnings",
        value: summary?.totalEarnings || 0,
        isAmount: true,
      },
      { title: "Paid Earnings", value: summary?.paidEarnings || 0, isAmount: true },
      {
        title: "Outstanding Earnings",
        value: summary?.outstandingEarnings || 0,
        isAmount: true,
      },
      {
        title: "Cleaner Earnings",
        value: summary?.cleanerEarnings || 0,
        isAmount: true,
      },
      { title: "Admin Earnings", value: summary?.adminEarnings || 0, isAmount: true },
      { title: "Total Records", value: summary?.totalRecords || 0, isAmount: false },
      { title: "Bookings", value: summary?.totalBookings || 0, isAmount: false },
      { title: "Quotes", value: summary?.totalQuotes || 0, isAmount: false },
    ],
    [summary],
  );

  return (
    <div className="space-y-6">
      {earningsAnalyticsError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {earningsAnalyticsError}
        </div>
      )}
      {isEarningsAnalyticsLoading && (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          Loading earnings analytics...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            isAmount={card.isAmount}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Service-Wise Earnings</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FFF6F3] text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Jobs</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Cleaner</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serviceWise.map((row) => (
                <tr key={row.serviceType}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.serviceType}</td>
                  <td className="px-4 py-3 text-gray-700">{formatInteger(row.jobs)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(row.totalEarnings)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(row.paidEarnings)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(row.cleanerEarnings)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(row.adminEarnings)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(row.averageEarning)}</td>
                </tr>
              ))}
              {!serviceWise.length && (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                    No service earnings data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Cleaner Earnings</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FFF6F3] text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Cleaner</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Jobs</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cleanerWise.map((row) => (
                <tr key={row.cleanerId}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.cleanerName}</td>
                  <td className="px-4 py-3 text-gray-700">{row.cleanerEmail || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatInteger(row.jobs)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(row.totalEarnings)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(row.averageEarning)}</td>
                </tr>
              ))}
              {!cleanerWise.length && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    No cleaner earnings data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Quote/Booking-Wise Earnings</h3>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                type="text"
                placeholder="Search booking, customer..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 sm:w-64"
              />
            </div>
            <select
              value={serviceType}
              onChange={(event) => {
                setServiceType(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
            >
              <option value="all">All Services</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="post_construction">Post-Construction</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FFF6F3] text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Cleaner</th>
                <th className="px-4 py-3 text-right">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookingRows.map((row) => (
                <tr key={row.rawId}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusBadgeClass(
                        row.recordType,
                      )}`}
                    >
                      {row.recordType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.customer}</td>
                  <td className="px-4 py-3 text-gray-700">{row.service}</td>
                  <td className="px-4 py-3 text-gray-700">{row.frequency}</td>
                  <td className="px-4 py-3 text-gray-700">{row.status}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusBadgeClass(
                        row.paymentStatus,
                      )}`}
                    >
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.date}</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(row.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(row.cleanerAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(row.adminAmount)}
                  </td>
                </tr>
              ))}
              {!bookingRows.length && !isEarningsAnalyticsLoading && (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    No quote/booking earnings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600 sm:flex-row sm:items-center">
          <div>
            Showing{" "}
            {pagination.totalItems
              ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalItems,
                )}`
              : "0"}{" "}
            of {pagination.totalItems}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={pagination.page <= 1 || isEarningsAnalyticsLoading}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-semibold text-gray-800">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))
              }
              disabled={
                pagination.page >= pagination.totalPages || isEarningsAnalyticsLoading
              }
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsAnalytics;
