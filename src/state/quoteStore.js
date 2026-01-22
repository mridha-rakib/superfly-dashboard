import { create } from "zustand";
import { quoteApi } from "../services/quoteApi";

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
  quotes: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  },
  isLoading: false,
  error: null,
};

export const useQuoteStore = create((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchQuotes: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await quoteApi.listAdmin(params);
      const items = response?.data || response?.items || response || [];
      const pagination =
        response?.pagination || {
          currentPage: params.page || 1,
          totalPages:
            response?.totalPages ||
            Math.max(
              1,
              Math.ceil(
                (response?.totalItems || items.length) /
                  (params.limit || 8)
              )
            ),
          totalItems: response?.totalItems || items.length,
          itemsPerPage: params.limit || 8,
        };

      set({
        quotes: items,
        pagination,
        isLoading: false,
      });
      return items;
    } catch (error) {
      set({ isLoading: false, error: parseError(error) });
      throw error;
    }
  },

  reset: () => set(initialState),
}));
