import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const cleaningReportApi = {
  listAdmin: async (params = {}) => {
    const response = await httpClient.get("/reports/admin", { params });
    return unwrap(response);
  },

  getById: async (id) => {
    const response = await httpClient.get(`/reports/${id}`);
    return unwrap(response);
  },

  approve: async (id) => {
    const response = await httpClient.patch(`/reports/${id}/approve`);
    return unwrap(response);
  },
};
