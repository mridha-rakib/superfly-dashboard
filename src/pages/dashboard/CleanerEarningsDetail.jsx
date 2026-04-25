import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft } from "lucide-react";
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

const DetailCard = ({ title, value, isAmount = true }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-3 text-2xl font-semibold text-gray-900">
      {isAmount ? formatCurrency(value) : formatInteger(value)}
    </p>
  </div>
);

const EarningsHistoryChart = ({ title, data, emptyMessage }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
    <div className="mt-4 h-72">
      {data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              cursor={{ fill: "#F9FAFB" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            />
            <Bar dataKey="amount" fill="#C85344" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  </div>
);

function CleanerEarningsDetail() {
  const navigate = useNavigate();
  const { cleanerId } = useParams();
  const {
    earningsAnalytics,
    isEarningsAnalyticsLoading,
    earningsAnalyticsError,
    fetchEarningsAnalytics,
    clearEarningsAnalyticsError,
  } = useDashboardStore();

  useEffect(() => {
    if (!cleanerId) {
      return undefined;
    }

    fetchEarningsAnalytics({ cleanerId, page: 1, limit: 10 }).catch(() => {});
    return () => clearEarningsAnalyticsError();
  }, [cleanerId, fetchEarningsAnalytics, clearEarningsAnalyticsError]);

  const cleanerDetail = earningsAnalytics?.cleanerDetail || null;

  const cards = useMemo(
    () => [
      {
        title: "Total Cleaner Earnings",
        value: cleanerDetail?.totalEarnings || 0,
        isAmount: true,
      },
      {
        title: "Paid Earnings",
        value: cleanerDetail?.paidAmount || 0,
        isAmount: true,
      },
      {
        title: "Pending Earnings",
        value: cleanerDetail?.pendingAmount || 0,
        isAmount: true,
      },
      {
        title: "Total Jobs",
        value: cleanerDetail?.totalJobs || 0,
        isAmount: false,
      },
      {
        title: "Average Per Job",
        value: cleanerDetail?.averageEarning || 0,
        isAmount: true,
      },
    ],
    [cleanerDetail],
  );

  if (isEarningsAnalyticsLoading && !cleanerDetail) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (earningsAnalyticsError || !cleanerDetail) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-red-600">Cleaner earnings not found</h2>
        <p className="mt-3 text-sm text-gray-500">
          {earningsAnalyticsError || "No earning history is available for this cleaner."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/earnings-analytics")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#C85344]/40 hover:text-[#C85344]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Earnings Analytics
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#C85344]">
            Cleaner Earnings
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">{cleanerDetail.cleanerName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {cleanerDetail.cleanerEmail || "No email available"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/earnings-analytics")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#C85344]/40 hover:text-[#C85344]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Earnings Analytics
        </button>
      </div>

      {isEarningsAnalyticsLoading && (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          Refreshing cleaner earnings...
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <DetailCard
            key={card.title}
            title={card.title}
            value={card.value}
            isAmount={card.isAmount}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <EarningsHistoryChart
          title="Weekly Earnings"
          data={cleanerDetail.weekly || []}
          emptyMessage="No weekly earnings found for this cleaner."
        />
        <EarningsHistoryChart
          title="Monthly Earnings"
          data={cleanerDetail.monthly || []}
          emptyMessage="No monthly earnings found for this cleaner."
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Cleaner Earning History</h2>
          <p className="text-sm text-gray-500">
            Booking and quote rows that contribute to this cleaner&apos;s earnings.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FFF6F3] text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Cleaner Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(cleanerDetail.historyRows || []).map((row) => (
                <tr key={`${row.rawId}-${row.date}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.id}</td>
                  <td className="px-4 py-3 text-gray-700">{row.customer}</td>
                  <td className="px-4 py-3 text-gray-700">{row.service}</td>
                  <td className="px-4 py-3 text-gray-700">{row.frequency}</td>
                  <td className="px-4 py-3 text-gray-700">{row.status}</td>
                  <td className="px-4 py-3 text-gray-700">{row.paymentStatus}</td>
                  <td className="px-4 py-3 text-gray-700">{row.date}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(row.earnedAmount)}
                  </td>
                </tr>
              ))}
              {!cleanerDetail.historyRows?.length && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No earnings history found for this cleaner.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CleanerEarningsDetail;
