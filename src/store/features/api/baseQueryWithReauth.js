import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the accessToken using the refresh cookie
    const refreshResult = await baseQuery(
      { url: "/users/refresh-token", method: "POST" },
      api,
      extraOptions
    );
    console.log(refreshResult);
    if (refreshResult) {
      api.dispatch(
        setCredentials({
          accessToken: refreshResult.data.data.accessToken,
          refreshToken: refreshResult.data.data.refreshToken, // important
          user: api.getState().auth.user,
        })
      );
    } else {
      console.log("Refresh token failed, logging out...");
      api.dispatch(logout());
    }
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};
