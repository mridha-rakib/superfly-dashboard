import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const cleaningServiceApi = {
  fetchAll: async () => {
    const response = await httpClient.get("/services/admin");
    return unwrap(response);
  },

  fetchPriceHistory: async (serviceId) => {
    const response = await httpClient.get("/services/price-history", {
      params: serviceId ? { serviceId } : undefined,
    });
    return unwrap(response);
  },

  createService: async ({ name, price }) => {
    const response = await httpClient.post("/services", { name, price });
    return unwrap(response);
  },

  updateServicePrice: async (serviceId, price) => {
    const response = await httpClient.patch(`/services/${serviceId}/price`, {
      price,
    });
    return unwrap(response);
  },

  deleteService: async (serviceId) => {
    const response = await httpClient.delete(`/services/${serviceId}`);
    return unwrap(response);
  },
};
