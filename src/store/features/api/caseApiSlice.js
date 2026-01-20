import { createApiSlice } from "./createApiSlice";

export const caseApiSlice = createApiSlice({
  reducerPath: "caseApi",
  tagTypes: ["Case"],
  endpoints: (builder) => ({
    getCases: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
        const params = { page, limit, search };
        if (status && status !== "All") {
          params.status = status;
        }
        return {
          url: "/cases",
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => {
        if (response.success) {
          return {
            items: response.data || [],
            pagination: response.pagination || {},
          };
        }
        return { items: [], pagination: {} };
      },
      providesTags: ["Case"],
    }),

    getCaseById: builder.query({
      query: (id) => ({
        url: `/cases/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      providesTags: (result, error, id) => [{ type: "Case", id }],
    }),
    createCase: builder.mutation({
      query: (caseData) => ({
        url: "/cases",
        method: "POST",
        body: caseData,
      }),
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ["Case"],
    }),
    updateCase: builder.mutation({
      query: (caseData) => ({
        url: `/cases/${caseData.id}`,
        method: "PUT",
        body: caseData,
      }),
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, caseData) => [
        { type: "Case", id: caseData.id },
      ],
    }),
    deleteCase: builder.mutation({
      query: (id) => ({
        url: `/cases/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Case", id }],
    }),
    addNote: builder.mutation({
      query: (noteData) => ({
        url: "/notes",
        method: "POST",
        body: noteData,
      }),
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ["Case"],
    }),
    getNotes: builder.query({
      query: (id) => ({
        url: `/notes/case/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      providesTags: ["Case"],
    }),
    deleteNote: builder.mutation({
      query: (id) => ({
        url: `/notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Case"],
    }),
  }),
});

export const {
  useGetCasesQuery,
  useGetCaseByIdQuery,
  useCreateCaseMutation,
  useUpdateCaseMutation,
  useDeleteCaseMutation,
  useAddNoteMutation,
  useGetNotesQuery,
  useDeleteNoteMutation,
} = caseApiSlice;
