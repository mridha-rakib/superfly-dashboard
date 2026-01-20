import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EarningOverview = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("Yearly");

  // Safely use API data or fallback to dummy
  const safeData = data || {};

  // Normalize chart data
  const getChartData = () => {
    switch (selectedPeriod.toLowerCase()) {
      case "yearly":
        return (safeData.yearly || []).map((item) => ({
          date: item.year,
          count: item.newUsers,
        }));
      case "monthly":
        return (safeData.monthly || []).map((item) => ({
          date: item.month,
          count: item.newUsers,
        }));
      case "weekly":
        return (safeData.weekly || []).map((item) => ({
          date: item.week,
          count: item.newUsers,
        }));
      default:
        return [];
    }
  };

  const graphData = getChartData();

  return (
    <div className="mb-12 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row bg-gray-100 w-full rounded-t-lg sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-[24px] w-full p-2 sm:p-4 sm:text-2xl lg:text-3xl font-bold text-gray-900">
          Earning Overview
        </h2>
        <div className="relative p-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm"
          >
            <option value="Yearly">Yearly</option>
            <option value="Monthly">Monthly</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={graphData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={20}
          >

            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="count" fill="#C85344" background={{ fill: "#eee" }} />

          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#C85344] rounded-full"></div>
          <span className="text-sm text-gray-600">New Users</span>
        </div>
      </div>
    </div>
  );
};

export default EarningOverview;