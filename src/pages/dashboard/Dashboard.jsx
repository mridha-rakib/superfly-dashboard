import React from "react";
import Card from "../../components/dashboard-components/Card";
import { earningOverviewData } from "../../constants/earningOverviewData";
import EarningOverview from "../../components/dashboard-components/EarningOverview";

function Dashboard() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Dashboard Stats (Static for now)
  const dashboardStats = React.useMemo(() => {
    return [
      { title: "Total Bookings", value: 100 },
      { title: "Active Cleaners", value: 10 },
      { title: "Total Revenue", value: 1000 },
    ];
  }, []);

  // Recent Activities Mock
  const recentActivities = React.useMemo(() => {
    const activities = [
      { user: "John Doe", activity: "Activity performed", timestamp: "2023-01-01T00:00:00Z" },
      { user: "Jane Doe", activity: "Activity performed", timestamp: "2023-01-02T00:00:00Z" },
      { user: "John Doe", activity: "Activity performed", timestamp: "2023-01-03T00:00:00Z" },
      { user: "Jane Doe", activity: "Activity performed", timestamp: "2023-01-04T00:00:00Z" },
      { user: "John Doe", activity: "Activity performed", timestamp: "2023-01-05T00:00:00Z" },
    ];

    if (!Array.isArray(activities)) return [];

    return activities
      .slice() // avoid read-only issues
      .sort((a, b) => {
        const timeA = new Date(a.timestamp);
        const timeB = new Date(b.timestamp);
        return timeB - timeA; // most recent first
      })
      .slice(0, 5)
      .map((item, index) => ({
        id: index,
        user: item.user || "Unknown",
        activity: item.activity || "Activity performed",
        type: "system",
        status: "completed",
        timestamp: new Date(item.timestamp).toLocaleString(),
      }));
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-2 lg:gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">
              Error loading dashboard data: {error?.message || "Network error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="w-full mx-auto">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-2 lg:gap-3">
          {dashboardStats.map((item, index) => (
            <Card key={index} title={item.title} value={item.value} />
          ))}
        </div>

        <EarningOverview data={earningOverviewData} />

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Latest 5 activities
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.length ? (
                  recentActivities.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-center">{item.user}</td>
                      <td className="px-6 py-4 text-sm text-center">{item.activity}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {item.timestamp}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No recent activities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
