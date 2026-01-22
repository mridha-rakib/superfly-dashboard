import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { configureHttpClient } from "../lib/httpClient";
import { authApi } from "../services/authApi";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: "idle", // idle | loading | success | error
  error: null,
  hydrated: false,
};

const parseError = (error) => {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  const apiMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;
  return apiMessage || "Unable to complete the request.";
};

export const useAuthStore = create(
  persist(
    (set, _get) => ({
      ...initialState,

      setHydrated: (value) => set({ hydrated: value }),
      clearError: () => set({ error: null }),

      login: async (credentials) => {
        set({ status: "loading", error: null });
        try {
          const result = await authApi.login(credentials);

          if (!result?.accessToken || !result?.user) {
            throw new Error("Invalid login response from server.");
          }

          const role = result.user.role;
          const isAdmin = role === "admin" || role === "super_admin";
          if (!isAdmin) {
            throw new Error("Only admin users can access this dashboard.");
          }

          set({
            user: result.user,
            accessToken: result.accessToken,
            isAuthenticated: true,
            status: "success",
            error: null,
          });

          return { success: true, user: result.user };
        } catch (error) {
          const message = parseError(error);
          set({
            ...initialState,
            hydrated: true,
            status: "error",
            error: message,
          });
          return { success: false, error: message };
        }
      },

      refreshAccessToken: async () => {
        try {
          const accessToken = await authApi.refreshAccessToken();
          if (accessToken) {
            set({ accessToken, isAuthenticated: true });
          } else {
            set({ ...initialState, hydrated: true });
          }
          return accessToken;
        } catch (error) {
          set({ ...initialState, hydrated: true });
          throw error;
        }
      },

      fetchProfile: async () => {
        const profile = await authApi.fetchProfile();
        if (profile) {
          set({ user: profile, isAuthenticated: true });
        }
        return profile;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Best-effort logout; ignore API failures so the UI can still clear state
          console.warn("Logout request failed, clearing local state only.", error);
        } finally {
          set({ ...initialState, hydrated: true });
        }
      },

      forceLogout: () => set({ ...initialState, hydrated: true }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        state?.setHydrated?.(true);
        if (error) {
          console.error("Error rehydrating auth store", error);
        }
      },
    }
  )
);

// Wire the HTTP client to the auth store once it is defined.
configureHttpClient({
  getAccessTokenFn: () => useAuthStore.getState().accessToken,
  refreshAccessTokenFn: () => useAuthStore.getState().refreshAccessToken(),
  onLogout: () => useAuthStore.getState().forceLogout(),
});

