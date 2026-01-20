import { createApiSlice } from "./createApiSlice";

export const categoryApiSlice = createApiSlice({
    reducerPath: "categoryApi",
    tagTypes: ["Category"],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => ({
                url: "/categories",
                method: "GET",
            }),
            transformResponse: (response) => {
                // Handle both wrapped and direct responses
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            providesTags: ["Category"],
        }),
        createCategory: builder.mutation({
            query: (categoryData) => ({
                url: "/categories",
                method: "POST",
                body: categoryData,
            }),
            transformResponse: (response) => {
                // Handle both wrapped and direct responses
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: ["Category"],
        }),
        updateCategory: builder.mutation({
            query: ({ id, ...categoryData }) => ({
                url: `/categories/${id}`,
                method: "PUT",
                body: categoryData,
            }),
            transformResponse: (response) => {
                // Handle both wrapped and direct responses
                if (response.success && response.data) {
                    return response.data;
                }
                return response;
            },
            invalidatesTags: (result, error, { id }) => [{ type: "Category", id }],
        }),
        deleteCategory: builder.mutation({
            query: (categoryId) => ({
                url: `/categories/${categoryId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, categoryId) => [{ type: "Category", id: categoryId }],
        }),
    })
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApiSlice;
