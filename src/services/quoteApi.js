import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const quoteApi = {
  listAdmin: async (params) => {
    const response = await httpClient.get("/quotes/admin", { params });
    return unwrap(response);
  },

  getById: async (id, params = {}) => {
    const response = await httpClient.get(`/quotes/${id}`, { params });
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

  bulkDeleteQuotes: async (quoteIds) => {
    const response = await httpClient.delete("/quotes/bulk", {
      data: { quoteIds },
    });
    return unwrap(response);
  },

  listAdminNotifications: async (params = {}) => {
    const response = await httpClient.get("/quotes/admin/notifications", {
      params,
    });
    return unwrap(response);
  },

  markAdminNotificationAsRead: async (notificationId) => {
    const response = await httpClient.patch(
      `/quotes/admin/notifications/${notificationId}/read`
    );
    return unwrap(response);
  },

  markAllAdminNotificationsAsRead: async () => {
    const response = await httpClient.patch("/quotes/admin/notifications/read-all");
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
