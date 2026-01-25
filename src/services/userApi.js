import { httpClient } from "../lib/httpClient";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? null;

export const userApi = {
  getProfile: async () => {
    const res = await httpClient.get("/user/profile");
    return unwrap(res);
  },

  updateProfile: async (payload) => {
    const res = await httpClient.put("/user/profile", payload);
    return unwrap(res);
  },

  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const candidates = [
      "/user/profile/photo",
      "/users/profile/photo",
      "/user/profile-photo",
      "/users/profile-photo",
      "/user/profile/photo/",
      "/users/profile/photo/",
      "/user/profile-photo/",
      "/users/profile-photo/",
    ];
    let lastError;
    for (const path of candidates) {
      try {
        const res = await httpClient.post(path, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return unwrap(res);
      } catch (err) {
        lastError = err;
        if (err?.response?.status !== 404) {
          throw err;
        }
      }
    }
    throw lastError;
  },
};
