import { create } from "zustand";
import { dashboardApi } from "../services/dashboardApi";

const parseError = (error) => {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to complete the request."
  );
};

const initialState = {
  stats: null,
  earnings: {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
  },
  recentBookings: [],
  isLoading: false,
  error: null,
};

export const useDashboardStore = create((set) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getOverview();
      const payload = response?.data || response || {};

      set({
        stats: payload.stats || null,
        earnings: payload.earnings || initialState.earnings,
        recentBookings: payload.recentBookings || [],
        isLoading: false,
      });

      return payload;
    } catch (error) {
      set({ isLoading: false, error: parseError(error) });
      throw error;
    }
  },

  reset: () => set(initialState),
}));
