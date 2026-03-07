import { httpClient, refreshClient } from "../lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const authApi = {
  login: async (credentials) => {
    const response = await httpClient.post("/auth/login", credentials);
    const data = unwrap(response);
    return {
      user: data?.user,
      accessToken: data?.accessToken,
      expiresIn: data?.expiresIn,
      raw: data,
      message: response?.data?.message,
    };
  },

  logout: async () => {
    const response = await httpClient.post("/auth/logout");
    return unwrap(response);
  },

  refreshAccessToken: async () => {
    const response = await refreshClient.post("/auth/refresh-token");
    const data = unwrap(response);
    return data?.accessToken;
  },

  fetchProfile: async () => {
    const response = await httpClient.get("/user/profile");
    return unwrap(response);
  },

  changePassword: async (payload) => {
    const response = await httpClient.put("/auth/change-password", payload);
    return unwrap(response);
  },
};
