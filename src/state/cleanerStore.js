import { create } from "zustand";
import { getErrorMessage } from "../lib/api-error";
import { cleanerApi } from "../services/cleanerApi";

const parseError = (error, fallback = "Unable to complete the request.") =>
  getErrorMessage(error, fallback);

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

const normalizeCleanerListResponse = (response, fallbackLimit = 8) => {
  const root = response?.data ?? response ?? {};
  const nestedData = root?.data;

  const items =
    (Array.isArray(root) && root) ||
    (Array.isArray(root?.items) && root.items) ||
    (Array.isArray(root?.data) && root.data) ||
    (Array.isArray(nestedData?.items) && nestedData.items) ||
    (Array.isArray(nestedData?.data) && nestedData.data) ||
    [];

  const paginationCandidate =
    root?.pagination ||
    nestedData?.pagination ||
    {};

  const totalItems =
    Number(paginationCandidate?.totalItems) ||
    Number(root?.totalItems) ||
    Number(nestedData?.totalItems) ||
    items.length;

  const itemsPerPage =
    Number(paginationCandidate?.itemsPerPage) ||
    Number(root?.itemsPerPage) ||
    Number(nestedData?.itemsPerPage) ||
    fallbackLimit;

  return {
    items,
    pagination: {
      currentPage:
        Number(paginationCandidate?.currentPage) ||
        Number(root?.currentPage) ||
        Number(nestedData?.currentPage) ||
        1,
      totalPages:
        Number(paginationCandidate?.totalPages) ||
        Number(root?.totalPages) ||
        Number(root?.pageCount) ||
        Number(nestedData?.totalPages) ||
        Number(nestedData?.pageCount) ||
        Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || fallbackLimit))),
      totalItems,
      itemsPerPage,
      hasNext: Boolean(paginationCandidate?.hasNext),
      hasPrev: Boolean(paginationCandidate?.hasPrev),
      nextPage: paginationCandidate?.nextPage ?? null,
      prevPage: paginationCandidate?.prevPage ?? null,
      slNo: Number(paginationCandidate?.slNo) || 0,
    },
  };
};

export const useCleanerStore = create((set) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  fetchCleaners: async (params = {}) => {
    set({ isLoadingList: true, error: null });
    try {
      const response = await cleanerApi.list(params);
      const normalized = normalizeCleanerListResponse(
        response,
        params?.limit || 8
      );

      set({
        cleaners: normalized.items,
        pagination: normalized.pagination,
        isLoadingList: false,
      });
      return normalized.items;
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
