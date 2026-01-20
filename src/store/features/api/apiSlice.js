import { createApiSlice } from "./createApiSlice";

export const apiSlice = createApiSlice({
  reducerPath: "api",
  tagTypes: ["User", "Profile"],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/users/logout",
        method: "POST",
      }),
    }),

    // Password management
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/users/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    verifyResetCode: builder.mutation({
      query: (data) => ({
        url: "/users/verify-reset-code",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/users/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    // Profile endpoints
    getProfile: builder.query({
      query: () => "/users/profile",
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/users/profile",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ["Profile"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/users/profile/change-password",
        method: "PUT",
        body: data,
      }),
    }),
    profileImage: builder.mutation({
      query: (data) => ({
        url: "/users/profile/image-upload",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ["Profile"],
    }),

    // User management (Admin/SuperAdmin only)
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users/create",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
   getAllUsers: builder.query({
  query: (params) => ({
    url: "/users",
    params,
  }),
  transformResponse: (response) => {
    // Your API nests pagination data inside response.pagination.pagination
    if (response.success && response.pagination?.data) {
      return {
        items: response.pagination.data,
        pagination: response.pagination.pagination || {},
      };
    }

    // Fallback for other structures
    if (response.success && Array.isArray(response.data)) {
      return {
        items: response.data,
        pagination: response.pagination || {},
      };
    }

    // As a last resort
    return {
      items: [],
      pagination: {},
    };
  },
  providesTags: ["User"],
}),

    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        // If it's already the direct data, return it
        return response;
      },
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    adminUpdateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response) => {
        // Handle both wrapped and direct responses
        if (response.success && response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useProfileImageMutation,
  useCreateUserMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useAdminUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;
