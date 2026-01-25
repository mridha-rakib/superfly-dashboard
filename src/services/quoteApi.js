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
    // API returns { data: quote, message: string }
    return response?.data?.data ?? unwrap(response);
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

  createAdminServiceRequest: async (payload) => {
    const response = await httpClient.post("/quotes/admin/service-request", payload);
    return unwrap(response);
  },

  createCommercial: async (payload) => {
    const response = await httpClient.post("/quotes/commercial", payload);
    return unwrap(response);
  },

  createPostConstruction: async (payload) => {
    const response = await httpClient.post("/quotes/post-construction", payload);
    return unwrap(response);
  },
};
