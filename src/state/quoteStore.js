import { create } from "zustand";
import { getErrorMessage } from "../lib/api-error";
import { quoteApi } from "../services/quoteApi";

const parseError = (error, fallback = "Unable to complete the request.") =>
  getErrorMessage(error, fallback);

const initialState = {
  quotes: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  },
  selectedQuote: null,
  isLoading: false,
  isDeleting: false,
  isAssigning: false,
  isUpdatingStatus: false,
  isLoadingDetail: false,
  error: null,
};

export const useQuoteStore = create((set) => ({
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

  fetchQuoteById: async (id) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await quoteApi.getById(id);
      const quote = response?.data || response;
      set({ selectedQuote: quote, isLoadingDetail: false });
      return quote;
    } catch (error) {
      set({ isLoadingDetail: false, error: parseError(error) });
      throw error;
    }
  },

  clearSelected: () => set({ selectedQuote: null }),

  assignCleaner: async (id, payload) => {
    set({ isAssigning: true, error: null });
    try {
      const updatedRaw = await quoteApi.assignCleaners(id, payload);
      const updated =
        (updatedRaw && updatedRaw.data) || updatedRaw || {};
      set((state) => {
        const targetId = String(id);
        const normalizeQuote = (quote) => {
          if (!quote) return quote;
          const quoteId = String(quote._id || quote.id || "");
          if (!quoteId || quoteId !== targetId) return quote;
          const assignedCleanerId =
            updated.assignedCleanerId ||
            updated.assignedCleanerIds?.[0] ||
            quote.assignedCleanerId ||
            quote.assignedCleanerIds?.[0];
          const assignedCleanerIds =
            updated.assignedCleanerIds ||
            (assignedCleanerId ? [assignedCleanerId] : quote.assignedCleanerIds);

          return {
            ...quote,
            ...updated,
            assignedCleanerId,
            assignedCleanerIds,
          };
        };

        return {
          quotes: (state.quotes || []).map(normalizeQuote),
          selectedQuote: normalizeQuote(state.selectedQuote),
          isAssigning: false,
        };
      });
      return updated;
    } catch (error) {
      set({ isAssigning: false, error: parseError(error) });
      throw error;
    }
  },

  deleteQuote: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await quoteApi.deleteQuote(id);
      set((state) => {
        const remaining = (state.quotes || []).filter(
          (q) => (q._id || q.id) !== id
        );
        const totalItems = Math.max(0, (state.pagination.totalItems || 1) - 1);
        return {
          quotes: remaining,
          pagination: {
            ...state.pagination,
            totalItems,
          },
          isDeleting: false,
        };
      });
      return true;
    } catch (error) {
      set({ isDeleting: false, error: parseError(error) });
      throw error;
    }
  },

  deleteQuotesBulk: async (ids = []) => {
    set({ isDeleting: true, error: null });
    try {
      const normalizedIds = Array.from(
        new Set(
          (Array.isArray(ids) ? ids : [])
            .map((id) => String(id || "").trim())
            .filter(Boolean)
        )
      );

      if (!normalizedIds.length) {
        set({ isDeleting: false });
        return { deletedCount: 0, skippedIds: [] };
      }

      const response = await quoteApi.bulkDeleteQuotes(normalizedIds);
      const data = response?.data || response || {};
      const deletedCount = Number(data.deletedCount) || normalizedIds.length;
      const idSet = new Set(normalizedIds);

      set((state) => {
        const remaining = (state.quotes || []).filter(
          (q) => !idSet.has(String(q._id || q.id))
        );
        const selectedId = String(
          state.selectedQuote?._id || state.selectedQuote?.id || ""
        );

        return {
          quotes: remaining,
          pagination: {
            ...state.pagination,
            totalItems: Math.max(
              0,
              Number(state.pagination?.totalItems || 0) - deletedCount
            ),
          },
          selectedQuote: idSet.has(selectedId) ? null : state.selectedQuote,
          isDeleting: false,
        };
      });

      return data;
    } catch (error) {
      set({ isDeleting: false, error: parseError(error) });
      throw error;
    }
  },

  updateStatus: async (id, payload) => {
    set({ isUpdatingStatus: true, error: null });
    try {
      const updatedRaw = await quoteApi.updateStatus(id, payload);
      const updated = updatedRaw?.data || updatedRaw || {};

      set((state) => {
        const targetId = String(id);
        const normalizeQuote = (quote) => {
          if (!quote) return quote;
          const quoteId = String(quote._id || quote.id || "");
          if (!quoteId || quoteId !== targetId) return quote;
          return { ...quote, ...updated };
        };

        return {
          quotes: (state.quotes || []).map(normalizeQuote),
          selectedQuote: normalizeQuote(state.selectedQuote),
          isUpdatingStatus: false,
        };
      });
      return updated;
    } catch (error) {
      set({ isUpdatingStatus: false, error: parseError(error) });
      throw error;
    }
  },

  reset: () => set(initialState),
}));
