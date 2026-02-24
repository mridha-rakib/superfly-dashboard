import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const dashboardApi = {
  getOverview: async () => {
    const response = await httpClient.get("/dashboard/overview");
    return unwrap(response);
  },

  getEarningsAnalytics: async (params = {}) => {
    const response = await httpClient.get("/dashboard/earnings-analytics", {
      params,
    });
    return unwrap(response);
  },
};
