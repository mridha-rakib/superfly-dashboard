import { create } from "zustand";
import { getErrorMessage } from "../lib/api-error";
import { dashboardApi } from "../services/dashboardApi";

const parseError = (error, fallback = "Unable to complete the request.") =>
  getErrorMessage(error, fallback);

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
  earningsAnalytics: {
    summary: null,
    serviceWise: [],
    cleanerWise: [],
    bookingWise: {
      rows: [],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      },
    },
  },
  isEarningsAnalyticsLoading: false,
  earningsAnalyticsError: null,
};

export const useDashboardStore = create((set) => ({
  ...initialState,

  clearError: () => set({ error: null }),
  clearEarningsAnalyticsError: () => set({ earningsAnalyticsError: null }),

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

  fetchEarningsAnalytics: async (params = {}) => {
    set({ isEarningsAnalyticsLoading: true, earningsAnalyticsError: null });

    try {
      const response = await dashboardApi.getEarningsAnalytics(params);
      const payload = response?.data || response || {};

      set({
        earningsAnalytics: {
          summary: payload.summary || null,
          serviceWise: payload.serviceWise || [],
          cleanerWise: payload.cleanerWise || [],
          bookingWise: {
            rows: payload.bookingWise?.rows || [],
            pagination: {
              page: payload.bookingWise?.pagination?.page || 1,
              limit: payload.bookingWise?.pagination?.limit || 10,
              totalItems: payload.bookingWise?.pagination?.totalItems || 0,
              totalPages: payload.bookingWise?.pagination?.totalPages || 1,
            },
          },
        },
        isEarningsAnalyticsLoading: false,
      });

      return payload;
    } catch (error) {
      set({
        isEarningsAnalyticsLoading: false,
        earningsAnalyticsError: parseError(error),
      });
      throw error;
    }
  },

  reset: () => set(initialState),
}));
