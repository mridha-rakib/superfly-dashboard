import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const quoteApi = {
  listAdmin: async (params) => {
    const response = await httpClient.get("/quotes/admin", { params });
    return unwrap(response);
  },

  getById: async (id) => {
    const response = await httpClient.get(`/quotes/${id}`);
    return unwrap(response);
  },

  assignCleaners: async (quoteId, payload) => {
    const response = await httpClient.patch(
      `/quotes/${quoteId}/assign-cleaner`,
      payload
    );
    return unwrap(response);
  },

  updateStatus: async (quoteId, payload) => {
    const response = await httpClient.patch(
      `/quotes/${quoteId}/status`,
      payload
    );
    return unwrap(response);
  },

  deleteQuote: async (quoteId) => {
    const response = await httpClient.delete(`/quotes/${quoteId}`);
    return unwrap(response);
  },
};
