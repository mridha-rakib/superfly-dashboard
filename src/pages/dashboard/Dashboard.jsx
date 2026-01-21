import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BadgeDollarSign, Bell, CalendarCheck, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import { bookingRows, earningsBreakdown, headerUser, sidebarLinks, statCards } from "../../data/dashboardData";

const ACCENT = "#C85344";

const iconRegistry = {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BadgeDollarSign,
  FileText,
  Settings,
};

const statIconRegistry = {
  CalendarCheck,
  Users,
  BadgeDollarSign,
};

const StatusBadge = ({ status }) => {
  const styles = {
    Complete: "bg-green-100 text-green-700 border-green-200",
    "In Progress": "bg-orange-50 text-orange-700 border-orange-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  }[status] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
};

const StatCard = ({ title, value, prefix, helper, icon }) => {
  const Icon = statIconRegistry[icon] || CalendarCheck;
  const formattedValue = prefix ? `${prefix}${value.toLocaleString()}` : value.toLocaleString();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-[#C85344]/10 p-3 text-[#C85344]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 space-y-1">
        <div className="text-3xl font-semibold text-gray-900">{formattedValue}</div>
        <div className="text-sm text-gray-500">{title}</div>
        {helper && <p className="text-xs text-gray-400">{helper}</p>}
      </div>
    </div>
  );
};

const EarningsOverview = () => {
  const [period, setPeriod] = React.useState("daily");
  const chartData = earningsBreakdown[period] || [];

  const periods = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
          <p className="text-sm text-gray-500">Earnings ($)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                period === p.key
                  ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barSize={period === "yearly" ? 40 : 36}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} />
            <Tooltip
              cursor={{ fill: "#F3F4F6" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill={ACCENT} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const RecentBookings = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Bookings</h3>
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-[#FFF6F3] text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3">Booking ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Service</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {bookingRows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{row.id}</td>
                <td className="px-6 py-4 text-gray-700">{row.customer}</td>
                <td className="px-6 py-4 text-gray-700">{row.service}</td>
                <td className="px-6 py-4 text-gray-500">{row.date}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">${row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {bookingRows.map((row) => (
          <div key={row.id} className="rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{row.id}</p>
                <p className="text-xs text-gray-500">{row.date}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-medium">{row.customer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-medium">{row.service}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-semibold text-gray-900">${row.amount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Header = () => (
  <div className="sticky top-0 z-20 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">Welcome Back, Admin 👋</h1>
        <p className="text-sm text-gray-500">Today&apos;s Overview</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:text-[#C85344]">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <img src={headerUser.avatar} alt={headerUser.name} className="h-11 w-11 rounded-full object-cover" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">{headerUser.name}</p>
            <p className="text-xs text-gray-500">{headerUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SidebarPreview = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:hidden">
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
      <LayoutDashboard className="h-4 w-4 text-[#C85344]" />
      Quick Navigation
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3">
      {sidebarLinks.map((item) => {
        const Icon = iconRegistry[item.icon] || LayoutDashboard;
        return (
          <div key={item.href} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700">
            <Icon className="h-4 w-4 text-[#C85344]" />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <Header />
      <SidebarPreview />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>
      <EarningsOverview />
      <RecentBookings />
    </div>
  );
};

export default Dashboard;


