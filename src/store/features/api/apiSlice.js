// Temporary stub to satisfy legacy imports after removing RTK Query.
// Replace with real implementation if the RTK-based data layer is reintroduced.
export const useLoginMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useLogoutMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useForgotPasswordMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useVerifyResetCodeMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useResetPasswordMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useGetProfileQuery = () => ({ data: null, isLoading: false });
export const useUpdateProfileMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useChangePasswordMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useProfileImageMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useCreateCleanerMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useGetCleanersQuery = () => ({ data: { items: [], pagination: {} }, isFetching: false });
export const useGetCleanerByIdQuery = () => ({ data: null, isFetching: false, error: null });
export const useUpdateCleanerMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
export const useDeleteCleanerMutation = () => [() => Promise.reject(new Error("apiSlice removed")), {}];
