import { create } from "zustand";
import { cleaningServiceApi } from "../services/cleaningServiceApi";

const parseError = (error) => {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;
  return message || "Unable to complete the request.";
};

const initialState = {
  services: [],
  priceHistory: [],
  isLoadingServices: false,
  isLoadingHistory: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

export const useCleaningServiceStore = create((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchServices: async () => {
    set({ isLoadingServices: true, error: null });
    try {
      const services = await cleaningServiceApi.fetchAll();
      set({ services, isLoadingServices: false });
      return services;
    } catch (error) {
      set({ isLoadingServices: false, error: parseError(error) });
      throw error;
    }
  },

  fetchPriceHistory: async (serviceId) => {
    set({ isLoadingHistory: true, error: null });
    try {
      const history = await cleaningServiceApi.fetchPriceHistory(serviceId);
      set({ priceHistory: history, isLoadingHistory: false });
      return history;
    } catch (error) {
      set({ isLoadingHistory: false, error: parseError(error) });
      throw error;
    }
  },

  addService: async ({ name, price, inputType = "BOOLEAN", quantityLabel }) => {
    set({ isCreating: true, error: null });
    try {
      const service = await cleaningServiceApi.createService({
        name,
        price,
        inputType,
        quantityLabel,
      });
      set((state) => ({
        services: [service, ...(state.services || [])],
        isCreating: false,
      }));
      return service;
    } catch (error) {
      set({ isCreating: false, error: parseError(error) });
      throw error;
    }
  },

  updateServicePrice: async (serviceId, price) => {
    set({ isUpdating: true, error: null });
    try {
      const updated = await cleaningServiceApi.updateServicePrice(
        serviceId,
        price
      );
      set((state) => ({
        services: (state.services || []).map((svc) =>
          (svc._id || svc.id) === serviceId ? { ...svc, ...updated } : svc
        ),
        isUpdating: false,
      }));
      return updated;
    } catch (error) {
      set({ isUpdating: false, error: parseError(error) });
      throw error;
    }
  },

  removeService: async (serviceId) => {
    set({ isDeleting: true, error: null });
    try {
      await cleaningServiceApi.deleteService(serviceId);
      set((state) => ({
        services: (state.services || []).filter(
          (svc) => (svc._id || svc.id) !== serviceId
        ),
        isDeleting: false,
      }));
      return true;
    } catch (error) {
      set({ isDeleting: false, error: parseError(error) });
      throw error;
    }
  },

  reset: () => set(initialState),
}));
