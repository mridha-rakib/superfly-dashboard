import {createApiSlice} from "../api/createApiSlice"

export const dashboardApiSlice = createApiSlice({
    reducerPath: "dashboardApi",
    tagTypes: ["Dashboard"],
    endpoints: (builder) => ({
        getDashboardData: builder.query({
            query: () => "/dashboards/overview",
            transformResponse: (response) => {
                // Handle both wrapped and direct responses
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: ["Dashboard"],
        }),
    }),
});

export const { useGetDashboardDataQuery } = dashboardApiSlice;
