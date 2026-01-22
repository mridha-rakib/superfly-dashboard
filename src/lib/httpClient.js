import axios from "axios";


const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "https://lights-integral-allied-sims.trycloudflare.com/api/v1";

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

let getAccessToken;
let refreshAccessToken;
let onUnauthorizedLogout;

let isRefreshing = false;
let refreshQueue = [];

const flushQueue = (error, token) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
};

const isAuthRoute = (request) => {
  const url = request?.url || "";
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/refresh-token") ||
    url.includes("/auth/register")
  );
};

httpClient.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {};
  const token = getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config || {};

    const shouldRefresh =
      status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest) &&
      typeof refreshAccessToken === "function";

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    // Queue concurrent 401s while a refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return httpClient(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      flushQueue(null, newToken);

      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(originalRequest);
      }

      return Promise.reject(error);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      onUnauthorizedLogout?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Configure the auth helpers the client should use.
 * Call this once from the auth store to wire tokens + refresh flow.
 */
export const configureHttpClient = ({
  getAccessTokenFn,
  refreshAccessTokenFn,
  onLogout,
}) => {
  getAccessToken = getAccessTokenFn;
  refreshAccessToken = refreshAccessTokenFn;
  onUnauthorizedLogout = onLogout;
};
