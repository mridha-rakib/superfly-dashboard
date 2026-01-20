import { useNavigate } from "react-router-dom";
import Table from "../../components/ui/Table";
import {
  useGetResourcesQuery,
  useDeleteResourceMutation,
  useGetResourceLocationQuery,
} from "../../store/features/api/resourceApiSlice";
import { useGetCategoriesQuery } from "../../store/features/api/categoryApiSlice";
import { ViewIcon, Edit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Resource() {
  const navigate = useNavigate();

  // --- Filters + pagination state ---
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState("");

  // Debounce search to avoid spamming API on each keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // Reduced from 400ms for better responsiveness
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when search actually changes (after debounce)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // --- Build params for API call ---
  const queryParams = {
    page,
    limit,
    search: debouncedSearch?.trim() || "", // Trim search and always send (empty string clears search)
    location: selectedLocation !== "All" ? selectedLocation : "",
    category: selectedCategory !== "All" ? selectedCategory : "",
  };

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetResourcesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteResource] = useDeleteResourceMutation();
  const { data: locationResponse } = useGetResourceLocationQuery();
  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery();
  const [resources, setResources] = useState([]);

  // Format data for table
  useEffect(() => {
    if (apiResponse?.items) {
      const formatted = apiResponse.items.map((item) => ({
        id: item.id,
        title: item.title || "Untitled",
        category: item.category?.name || "Uncategorized",
        location: item.location || "N/A",
        _raw: item,
      }));
      setResources(formatted);
    } else {
      setResources([]);
    }
  }, [apiResponse]);

  const paginationFromApi = apiResponse?.pagination || {};

  const pagination = {
    currentPage: paginationFromApi.currentPage ?? page,
    totalPages:
      paginationFromApi.pageCount ??
      Math.max(1, Math.ceil((paginationFromApi.totalItems ?? 0) / limit)),
    total: paginationFromApi.totalItems ?? 0,
    itemsPerPage: paginationFromApi.itemsPerPage ?? limit,
  };

  // --- Delete handler ---
  const handleDelete = async (item) => {
    // Note: Optimistic update removed since Table component handles UI updates
    try {
      await deleteResource(item.id).unwrap();
      toast.success("Resource deleted successfully");
      refetch(); // Refetch to update the UI after successful deletion
    } catch (err) {
      console.error(err);
      toast.error(
        err.data?.message || err.message || "Failed to delete resource"
      );
      refetch(); // only refetch on error to rollback optimistic update
    }
  };

  // --- Table actions ---
  const resourceActions = [
    {
      key: "view",
      label: "View",
      icon: ViewIcon,
      onClick: (item) => navigate(`/resources/${item.id}`),
      className:
        "p-1.5 text-purple-500 hover:bg-purple-50 rounded-full border border-purple-200 transition-colors",
    },
    {
      key: "edit",
      label: "Edit",
      icon: Edit01Icon,
      onClick: (item) => navigate(`/resources/${item.id}/edit`),
      className:
        "p-1.5 text-blue-500 hover:bg-blue-50 rounded-full border border-blue-200 transition-colors",
    },
    {
      key: "delete",
      label: "Delete",
      icon: Delete02Icon,
      onClick: (item) => handleDelete(item),
      className:
        "p-1.5 text-red-500 hover:bg-red-50 rounded-full border border-red-200 transition-colors",
    },
  ];

  // --- Filters ---
  const uniqueLocations = locationResponse?.data || [];
  const locationOptions = [
    { value: "All", label: "All" },
    ...uniqueLocations.map((loc) => ({ value: loc, label: loc })),
  ];

  const categories = categoriesResponse?.data || categoriesResponse || [];
  const categoryOptions = [
    { value: "All", label: "All Categories" },
    ...(Array.isArray(categories)
      ? categories.map((cat) => ({
          value: cat.id || cat._id || cat, // Backend expects category ID for filtering
          label: cat.name || cat, // Frontend displays category name
        }))
      : []),
  ];

  const filters = [
    {
      key: "location",
      label: "Location",
      options: locationOptions,
    },
    {
      key: "category",
      label: "Category",
      options: categoryOptions,
    },
  ];

  // --- Loading & error states ---
  if (isLoading || isCategoriesLoading) {
    return (
      <div className="w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mt-4">
            {isCategoriesLoading
              ? "Loading categories..."
              : "Loading resources..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-red-600">
            Error loading resources:{" "}
            {error.data?.message || error.message || "Network error"}
          </p>
          <button
            type="button"
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    console.error("Categories error:", categoriesError);
  }

  // --- Render ---
  return (
    <div className="w-full mx-auto space-y-4">
      <Table
        title="Resources"
        head={["Title", "Category", "Location"]}
        fields={["title", "category", "location"]}
        dataset={resources}
        showCreateButton
        onCreateClick={() => navigate("/resources/add")}
        filters={filters}
        actions={resourceActions}
        onConfirmDelete={handleDelete} // Enable delete confirmation modal
        filterValues={{
          location: selectedLocation,
          category: selectedCategory,
        }} // Pass current filter values to Table component
        emptyMessage="No resources found."
        pagination={pagination}
        onPageChange={(newPage) => {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSearchChange={(q) => {
          setSearch(q);
          setPage(1);
        }}
        searchQuery={search} // Pass current search value to Table component
        onFilterChange={(filterKey, value) => {
          if (filterKey === "location") {
            setSelectedLocation(value === "All" ? "All" : value);
            setPage(1);
          }
          if (filterKey === "category") {
            setSelectedCategory(value === "All" ? "All" : value);
            setPage(1);
          }
        }}
      />
    </div>
  );
}
