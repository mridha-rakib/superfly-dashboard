import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const legalContentApi = {
  getBySlug: async (slug) => {
    const response = await httpClient.get(`/legal-content/${slug}`);
    return unwrap(response);
  },

  updateBySlug: async (slug, payload) => {
    const response = await httpClient.put(`/legal-content/${slug}`, payload);
    return unwrap(response);
  },
};
