import { create } from "zustand";
import { cleaningReportApi } from "../services/cleaningReportApi";

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
  reports: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  selectedReport: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isApproving: false,
  error: null,
};

export const useCleaningReportStore = create((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchReports: async (params = {}) => {
    set({ isLoadingList: true, error: null });
    try {
      const response = await cleaningReportApi.listAdmin(params);
      const items = response?.data || response?.items || response || [];
      const pagination =
        response?.pagination ||
        (response?.totalPages
          ? {
              currentPage: response?.currentPage || params.page || 1,
              totalPages: response?.totalPages,
              totalItems: response?.totalItems ?? items.length,
              itemsPerPage: params.limit || 10,
            }
          : {
              currentPage: params.page || 1,
              totalPages: Math.max(
                1,
                Math.ceil((response?.totalItems || items.length) / (params.limit || 10))
              ),
              totalItems: response?.totalItems || items.length,
              itemsPerPage: params.limit || 10,
            });

      set({
        reports: items,
        pagination,
        isLoadingList: false,
      });
      return items;
    } catch (error) {
      set({ isLoadingList: false, error: parseError(error) });
      throw error;
    }
  },

  fetchReportById: async (id) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await cleaningReportApi.getById(id);
      const report = response?.data || response;
      set({ selectedReport: report, isLoadingDetail: false });
      return report;
    } catch (error) {
      set({ isLoadingDetail: false, error: parseError(error) });
      throw error;
    }
  },

  approveReport: async (id) => {
    set({ isApproving: true, error: null });
    try {
      const response = await cleaningReportApi.approve(id);
      const updated = response?.data || response;
      set((state) => {
        const updateItem = (report) =>
          report && (report._id === id || report.id === id) ? updated : report;
        return {
          reports: (state.reports || []).map(updateItem),
          selectedReport: updateItem(state.selectedReport),
          isApproving: false,
        };
      });
      return updated;
    } catch (error) {
      set({ isApproving: false, error: parseError(error) });
      throw error;
    }
  },

  reset: () => set(initialState),
}));
