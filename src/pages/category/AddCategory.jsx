import React, { useState } from "react";
import Button from "../../components/ui/Button";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../store/features/api/categoryApiSlice";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // API hooks
  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    error,
    refetch,
  } = useGetCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategoryApi, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // Extract categories from API response
  const categories = categoriesResponse || [];

  const handleAddCategory = async () => {
    if (categoryName.trim()) {
      try {
        await createCategory({
          name: categoryName.trim(),
        }).unwrap();
        setCategoryName("");
        toast.success("Category created successfully!");
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error(
          error.data?.message ||
            error.message ||
            "Failed to create category. Please try again."
        );
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddCategory();
    }
  };

  const startEditing = (category) => {
    setEditingId(category._id || category.id);
    setEditingName(category.name);
  };

  const saveEdit = async () => {
    if (editingName.trim()) {
      try {
        await updateCategory({
          id: editingId,
          name: editingName.trim(),
        }).unwrap();
        setEditingId(null);
        setEditingName("");
        toast.success("Category updated successfully!");
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error(
          error.data?.message ||
            error.message ||
            "Failed to update category. Please try again."
        );
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const deleteCategory = (id) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategoryApi(categoryToDelete).unwrap();
        toast.success("Category deleted successfully!");
        refetch();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error(
          error.data?.message ||
            error.message ||
            "Failed to delete category. Please try again."
        );
      }
    }
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleEditKeyPress = (e) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (isLoadingCategories) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center">
          <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-red-700">
                  Error loading categories:{" "}
                  {error.data?.message ||
                    error.message ||
                    "Network error occurred"}
                </p>
                <div className="mt-2">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={refetch}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Category Management
          </h1>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2"></div>
          Add New Category
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter category name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
          <Button
            type="button"
            variant="primary"
            size="medium"
            onClick={handleAddCategory}
            disabled={!categoryName.trim() || isCreating}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            {isCreating ? "Adding..." : "Add Category"}
          </Button>
        </div>
      </div>

      {/* Search Field */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></div>
          Categories
        </h2>

        <div className="mb-4 sm:mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>

        {/* Categories List */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-600">
              {filteredCategories.length} categories
              {categories.length !== filteredCategories.length
                ? ` of ${categories.length}`
                : ""}
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-sm sm:text-base mb-2">
                No categories added yet.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                Add your first category above to get started.
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-sm sm:text-base mb-2">
                No categories match your search.
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                Try adjusting your search term or add new categories.
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredCategories.map((category) => (
                <div
                  key={category._id || category.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 gap-2 sm:gap-4"
                >
                  {editingId === (category._id || category.id) ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleEditKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="small"
                          onClick={saveEdit}
                          disabled={!editingName.trim() || isUpdating}
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={cancelEdit}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium text-sm sm:text-base block sm:inline">
                          {category.name}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 block sm:inline sm:ml-2">
                          {category.createdAt
                            ? new Date(category.createdAt).toLocaleDateString()
                            : "No date"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => startEditing(category)}
                          className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="small"
                          onClick={() =>
                            deleteCategory(category._id || category.id)
                          }
                          disabled={isDeleting}
                          className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Category"
          option1="Delete Category"
          option2="Cancel"
        />
      )}
    </div>
  );
}

export default AddCategory;
