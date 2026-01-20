import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryWithReauth";

export const createApiSlice = (config) => {
  const { reducerPath, tagTypes = [], endpoints } = config;

  return createApi({
    reducerPath,
    baseQuery:  baseQueryWithReauth,
    tagTypes,
    endpoints,
  });
};
