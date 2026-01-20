import { createApiSlice } from "./createApiSlice";

export const resourceApiSlice = createApiSlice({
  reducerPath: "resourceApi",
  tagTypes: ["Resource"],
  endpoints: (builder) => ({
    getResources: builder.query({
      query: ({ page = 1, limit = 8, search = "", location = "", category = "" } = {}) => {
        const params = { page, limit, search };
        if (location && location !== "All") {
          params.location = location;
        }
        if (category && category !== "All") {
          params.category = category;
        }
        return {
          url: "/resources",
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => {
        // Your backend returns { success, data: [...], pagination: {...} }
        if (response.success && Array.isArray(response.data)) {
          return {
            items: response.data,
            pagination: response.pagination || {},
          };
        }
        // fallback if backend changes
        return { items: [], pagination: {} };
      },
      providesTags: ["Resource"],
    }),
    getResourceLocation: builder.query({
      query: () => `/resources/locations`,
      transformResponse: (response) => {
        // Return the entire response object so components can access response.data
        return response;
      },
      providesTags: ["Resource"],
    }),
    createResource: builder.mutation({
      query: (resourceData) => ({
        url: "/resources",
        method: "POST",
        body: resourceData,
      }),
      transformResponse: (response) => {
        // Return the entire response object so components can access response.data
        return response;
      },
      invalidatesTags: ["Resource"],
    }),
    getSingleResource: builder.query({
      query: (id) => `/resources/${id}`,
      transformResponse: (response) => {
        // Return the entire response object so components can access response.data
        return response;
      },
      providesTags: ["Resource"],
    }),
    updateResource: builder.mutation({
      query: ({ id, ...resourceData }) => ({
        url: `/resources/${id}`,
        method: "PUT",
        body: resourceData,
      }),
      transformResponse: (response) => {
        // Return the entire response object so components can access response.data
        return response;
      },
      invalidatesTags: ["Resource"],
    }),
    deleteResource: builder.mutation({
      query: (id) => ({ url: `/resources/${id}`, method: "DELETE" }),
      invalidatesTags: ["Resource"],
    }),
  }),
});

export const {
  useGetResourcesQuery,
  useGetResourceLocationQuery,
  useCreateResourceMutation,
  useGetSingleResourceQuery,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} = resourceApiSlice;
