import { create } from "zustand";
import { cleanerApi } from "../services/cleanerApi";

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
  cleaners: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  },
  selectedCleaner: null,
  isLoadingList: false,
  isLoadingDetail: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

export const useCleanerStore = create((set, get) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchCleaners: async (params = {}) => {
    set({ isLoadingList: true, error: null });
    try {
      const response = await cleanerApi.list(params);
      const items = response?.data || response?.items || [];
      const pagination =
        response?.pagination || {
          currentPage: response?.currentPage || params?.page || 1,
          totalPages:
            response?.totalPages ||
            response?.pageCount ||
            Math.max(
              1,
              Math.ceil((response?.totalItems ?? items.length) / (params?.limit || 8))
            ),
          totalItems: response?.totalItems ?? items.length,
          itemsPerPage: response?.itemsPerPage || params?.limit || 8,
        };

      set({
        cleaners: items,
        pagination,
        isLoadingList: false,
      });
      return items;
    } catch (error) {
      set({ isLoadingList: false, error: parseError(error) });
      throw error;
    }
  },

  fetchCleanerById: async (id) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const cleaner = await cleanerApi.getById(id);
      set({ selectedCleaner: cleaner, isLoadingDetail: false });
      return cleaner;
    } catch (error) {
      set({ isLoadingDetail: false, selectedCleaner: null, error: parseError(error) });
      throw error;
    }
  },

  createCleaner: async (payload) => {
    set({ isCreating: true, error: null });
    try {
      const response = await cleanerApi.create(payload);
      const created =
        response?.data?.cleaner || response?.cleaner || response?.data || response;
      if (created?._id) {
        set((state) => ({
          cleaners: [created, ...(state.cleaners || [])],
          pagination: {
            ...state.pagination,
            totalItems: (state.pagination.totalItems || 0) + 1,
          },
        }));
      }
      set({ isCreating: false });
      return response;
    } catch (error) {
      set({ isCreating: false, error: parseError(error) });
      throw error;
    }
  },

  updateCleaner: async (id, payload) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await cleanerApi.update(id, payload);
      const updated = response?.data || response;
      set((state) => ({
        cleaners: (state.cleaners || []).map((c) =>
          (c._id || c.id) === id ? { ...c, ...updated } : c
        ),
        selectedCleaner:
          state.selectedCleaner && (state.selectedCleaner._id || state.selectedCleaner.id) === id
            ? { ...state.selectedCleaner, ...updated }
            : state.selectedCleaner,
        isUpdating: false,
      }));
      return updated;
    } catch (error) {
      set({ isUpdating: false, error: parseError(error) });
      throw error;
    }
  },

  deleteCleaner: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await cleanerApi.delete(id);
      set((state) => ({
        cleaners: (state.cleaners || []).filter((c) => (c._id || c.id) !== id),
        pagination: {
          ...state.pagination,
          totalItems: Math.max(0, (state.pagination.totalItems || 0) - 1),
        },
        selectedCleaner:
          state.selectedCleaner && (state.selectedCleaner._id || state.selectedCleaner.id) === id
            ? null
            : state.selectedCleaner,
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
