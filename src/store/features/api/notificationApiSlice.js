import { createApiSlice } from "./createApiSlice";

export const notificationApiSlice = createApiSlice({
  reducerPath: "notificationApi",
  tagTypes: ["notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params) => ({
        url: "/notifications",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response) => {
        if (response.success) {
          return {
            notifications: response.data,
            pagination: response.pagination,
          };
        }
        return { notifications: [], pagination: null };
      },
      providesTags: ["notification"],
      invalidatesTags: ["notification"],
    }),

    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["notification"],
    }),

    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["notification"],
    }),
  }),
});

// Export the auto-generated hooks
export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationApiSlice;
