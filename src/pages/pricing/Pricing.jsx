import { Delete02Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useCleaningServiceStore } from "../../state/cleaningServiceStore";

function Pricing() {
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    service: "",
    price: "",
  });

  const {
    services,
    priceHistory,
    isLoadingServices,
    isLoadingHistory,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchServices,
    fetchPriceHistory,
    addService,
    updateServicePrice,
    removeService,
    clearError,
  } = useCleaningServiceStore();

  useEffect(() => {
    fetchServices().catch(() => {
      toast.error("Failed to load services");
    });
    fetchPriceHistory().catch(() => {
      toast.error("Failed to load price history");
    });
  }, [fetchPriceHistory, fetchServices]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredPricingData = useMemo(() => {
    if (!services) return [];
    return services.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const handleEdit = (item) => {
    setEditingId(item._id || item.id);
    setEditPrice(item.price.toString());
  };

  const handleSave = async (id) => {
    if (!editPrice || isNaN(editPrice) || parseFloat(editPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      await updateServicePrice(id, parseFloat(editPrice));
      await fetchPriceHistory();
      toast.success("Price updated successfully!");
      setEditingId(null);
      setEditPrice("");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update price";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete._id || itemToDelete.id;
    try {
      await removeService(id);
      toast.success(`${itemToDelete.name} deleted successfully!`);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete service";
      toast.error(message);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleSaveNewItem = async () => {
    if (
      !newItem.service.trim() ||
      !newItem.price ||
      isNaN(newItem.price) ||
      parseFloat(newItem.price) <= 0
    ) {
      toast.error("Please enter valid service name and price");
      return;
    }

    try {
      await addService({
        name: newItem.service.trim(),
        price: parseFloat(newItem.price),
      });
      toast.success("New service added successfully!");
      setNewItem({ service: "", price: "" });
      setShowAddModal(false);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add service";
      toast.error(message);
    }
  };

  const handleCancelAdd = () => {
    setNewItem({ service: "", price: "" });
    setShowAddModal(false);
  };

  if (error && !services?.length) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Failed to load services: {error}
          <button
            onClick={() => {
              clearError();
              fetchServices();
              fetchPriceHistory();
            }}
            className="ml-3 rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-8 p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gradient-to-r from-[#fff5f3] via-white to-[#fff7f5] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Pricing</p>
          <h1 className="text-3xl font-bold text-gray-900">Service Pricing Manager</h1>
          <p className="text-sm text-gray-500">Add new services, adjust rates, and review recent changes.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              className="w-full rounded-lg border border-gray-200 bg-white px-10 py-2 text-sm shadow-inner focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20 sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleAddItem}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            + Add New Service
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Item Pricing */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#C85344]">Services</p>
              <h2 className="text-lg font-semibold text-gray-900">Item Pricing</h2>
            </div>
            <span className="rounded-full bg-[#C85344]/10 px-3 py-1 text-xs font-semibold text-[#C85344]">
              {services?.length ?? 0} items
            </span>
          </div>
          <div className="max-h-[460px] overflow-y-auto pr-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-white shadow-sm">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Price ($)</th>
                  <th className="px-6 py-3">Last Updated</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingServices ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Loading services...
                    </td>
                  </tr>
                ) : filteredPricingData.length > 0 ? (
                  filteredPricingData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingId === item._id ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20"
                            min="0"
                            step="0.01"
                            autoFocus
                          />
                        ) : (
                          `$${item.price}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.updatedAt || item.createdAt
                          ? format(new Date(item.updatedAt || item.createdAt), "dd MMM yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === item._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(item._id)}
                              className="rounded-lg bg-[#C85344] px-3 py-1 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                              disabled={isUpdating}
                            >
                              {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={handleCancel}
                              className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit({ id: item._id, price: item.price })}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <HugeiconsIcon icon={Edit01Icon} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <HugeiconsIcon icon={Delete02Icon} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No services found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Price Changes */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#C85344]">History</p>
              <h2 className="text-lg font-semibold text-gray-900">Recent Price Changes</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Latest {priceHistory?.length ?? 0}
            </span>
          </div>
          <div className="max-h-[460px] overflow-y-auto pr-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-white shadow-sm">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Edited By</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Old</th>
                  <th className="px-6 py-3">New</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Loading history...
                    </td>
                  </tr>
                ) : priceHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No price changes yet.
                    </td>
                  </tr>
                ) : (
                  priceHistory.map((change) => (
                    <tr key={change._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {change.changedAt ? format(new Date(change.changedAt), "dd MMM") : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {change.changedBy?.slice(0, 6) || "Admin"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{change.serviceName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">${change.oldPrice}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${change.newPrice}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Item
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-60"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-50/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Service
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  value={newItem.service}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, service: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewItem}
                className="px-4 py-2 text-sm bg-[#C85344] text-white rounded transition-colors disabled:opacity-60"
                disabled={isCreating}
              >
                {isCreating ? "Adding..." : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pricing;
