import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const dashboardApi = {
  getOverview: async () => {
    const response = await httpClient.get("/dashboard/overview");
    return unwrap(response);
  },
};
