import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data ?? response;

export const cleanerApi = {
  list: async (params) => {
    const response = await httpClient.get("/user/cleaners", { params });
    return unwrap(response);
  },

  getById: async (id) => {
    const response = await httpClient.get(`/user/cleaners/${id}`);
    return unwrap(response)?.data ?? unwrap(response);
  },

  create: async (payload) => {
    const response = await httpClient.post("/user/cleaners", payload);
    return unwrap(response);
  },

  update: async (id, payload) => {
    const response = await httpClient.put(`/user/cleaners/${id}`, payload);
    return unwrap(response);
  },

  delete: async (id) => {
    const response = await httpClient.delete(`/user/cleaners/${id}`);
    return unwrap(response);
  },
};
