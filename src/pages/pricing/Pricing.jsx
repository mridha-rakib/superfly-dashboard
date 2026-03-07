import { Delete02Icon, Edit01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useCleaningServiceStore } from "../../state/cleaningServiceStore";

const EMPTY_NEW_ITEM = {
  service: "",
  price: "",
  inputType: "BOOLEAN",
  quantityLabel: "",
};

const getId = (item) => item?._id || item?.id;

function Pricing() {
  const [activeTab, setActiveTab] = useState("services");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState(EMPTY_NEW_ITEM);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    inputType: "BOOLEAN",
    quantityLabel: "",
    isActive: true,
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
    updateServiceDetails,
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
    if (error) toast.error(error);
  }, [error]);

  const filteredServices = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return services || [];
    return (services || []).filter((item) =>
      `${item.name} ${item.inputType} ${item.quantityLabel || ""}`
        .toLowerCase()
        .includes(needle)
    );
  }, [services, searchTerm]);

  const filteredHistory = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return priceHistory || [];
    return (priceHistory || []).filter((entry) => {
      const haystack = `${entry.serviceName} ${entry.changedBy} ${entry.oldPrice} ${entry.newPrice}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [priceHistory, searchTerm]);

  const selectedServiceHistory = useMemo(() => {
    if (!viewItem) return [];
    const viewId = String(getId(viewItem) || "");
    return (priceHistory || [])
      .filter((entry) => {
        const entryServiceId = String(entry.serviceId || "");
        if (viewId && entryServiceId) return entryServiceId === viewId;
        return (entry.serviceName || "").toLowerCase() === (viewItem.name || "").toLowerCase();
      })
      .slice(0, 8);
  }, [priceHistory, viewItem]);

  const openEditDialog = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name || "",
      price: item.price?.toString?.() || "",
      inputType: item.inputType || "BOOLEAN",
      quantityLabel: item.quantityLabel || "",
      isActive: item.isActive !== false,
    });
  };

  const closeEditDialog = () => {
    setEditItem(null);
    setEditForm({
      name: "",
      price: "",
      inputType: "BOOLEAN",
      quantityLabel: "",
      isActive: true,
    });
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const id = getId(itemToDelete);
    try {
      await removeService(id);
      toast.success(`${itemToDelete.name} deleted successfully.`);
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

  const handleSaveEdit = async () => {
    if (!editItem) return;

    const id = getId(editItem);
    const name = editForm.name.trim();
    const price = Number(editForm.price);

    if (!name || Number.isNaN(price) || price <= 0) {
      toast.error("Please provide a valid name and price.");
      return;
    }

    if (editForm.inputType === "QUANTITY" && !editForm.quantityLabel.trim()) {
      toast.error("Quantity label is required for quantity-based services.");
      return;
    }

    const updatePayload = {};
    if (name !== (editItem.name || "")) updatePayload.name = name;
    if ((editForm.inputType || "BOOLEAN") !== (editItem.inputType || "BOOLEAN")) {
      updatePayload.inputType = editForm.inputType;
    }
    if (editForm.inputType === "QUANTITY") {
      const label = editForm.quantityLabel.trim();
      if (label !== (editItem.quantityLabel || "")) {
        updatePayload.quantityLabel = label;
      }
    }
    if (editForm.isActive !== (editItem.isActive !== false)) {
      updatePayload.isActive = editForm.isActive;
    }

    const originalPrice = Number(editItem.price);
    const isPriceChanged = price !== originalPrice;

    if (!Object.keys(updatePayload).length && !isPriceChanged) {
      toast.info("No changes to save.");
      return;
    }

    try {
      if (Object.keys(updatePayload).length) {
        await updateServiceDetails(id, updatePayload);
      }
      if (isPriceChanged) {
        await updateServicePrice(id, price);
        await fetchPriceHistory();
      }
      toast.success("Service updated successfully.");
      closeEditDialog();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update service";
      toast.error(message);
    }
  };

  const handleSaveNewItem = async () => {
    if (
      !newItem.service.trim() ||
      !newItem.price ||
      Number.isNaN(Number(newItem.price)) ||
      Number(newItem.price) <= 0
    ) {
      toast.error("Please enter valid service name and price.");
      return;
    }

    if (newItem.inputType === "QUANTITY" && !newItem.quantityLabel.trim()) {
      toast.error("Please enter a quantity label for quantity-based services.");
      return;
    }

    try {
      await addService({
        name: newItem.service.trim(),
        price: Number(newItem.price),
        inputType: newItem.inputType,
        quantityLabel:
          newItem.inputType === "QUANTITY"
            ? newItem.quantityLabel.trim()
            : undefined,
      });
      toast.success("New service added successfully.");
      setShowAddModal(false);
      setNewItem(EMPTY_NEW_ITEM);
      setActiveTab("services");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add service";
      toast.error(message);
    }
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
    <div className="mx-auto w-full space-y-6 p-6">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-[#fff5f3] via-white to-[#fff7f5] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Pricing</p>
            <h1 className="text-3xl font-bold text-gray-900">Service Pricing Manager</h1>
            <p className="text-sm text-gray-500">
              Switch between service list and change history, then view or edit each service in detail.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  activeTab === "services" ? "Search services..." : "Search history..."
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-10 py-2 text-sm shadow-inner focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20 sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            {activeTab === "services" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
              >
                + Add New Service
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="services">
              Item Pricing ({services?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="history">
              Recent Price Changes ({priceHistory?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="max-h-[520px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#fff8f6] shadow-sm">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-3">Service</th>
                      <th className="px-6 py-3">Price ($)</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Last Updated</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingServices ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          Loading services...
                        </td>
                      </tr>
                    ) : filteredServices.length ? (
                      filteredServices.map((item) => (
                        <tr key={getId(item)} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">${item.price}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.inputType === "QUANTITY" ? "Check + number" : "Check only"}
                            {item.inputType === "QUANTITY" && item.quantityLabel
                              ? ` · ${item.quantityLabel}`
                              : ""}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.updatedAt || item.createdAt
                              ? format(
                                  new Date(item.updatedAt || item.createdAt),
                                  "dd MMM yyyy"
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setViewItem(item)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100"
                                title="View service details"
                              >
                                <HugeiconsIcon icon={ViewIcon} />
                              </button>
                              <button
                                onClick={() => openEditDialog(item)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50"
                                title="Edit service"
                              >
                                <HugeiconsIcon icon={Edit01Icon} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(item)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                                title="Delete service"
                              >
                                <HugeiconsIcon icon={Delete02Icon} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No services found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="max-h-[520px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#fff8f6] shadow-sm">
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
                    ) : filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No price changes yet.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((change) => (
                        <tr key={change._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {change.changedAt
                              ? format(new Date(change.changedAt), "dd MMM yyyy")
                              : "-"}
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={Boolean(viewItem)} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>
              Full details and recent price updates for this service.
            </DialogDescription>
          </DialogHeader>

          {viewItem && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs uppercase text-gray-500">Service Name</p>
                  <p className="text-sm font-semibold text-gray-900">{viewItem.name}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs uppercase text-gray-500">Current Price</p>
                  <p className="text-sm font-semibold text-gray-900">${viewItem.price}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs uppercase text-gray-500">Selection Type</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {viewItem.inputType === "QUANTITY" ? "Check + number" : "Check only"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs uppercase text-gray-500">Quantity Label</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {viewItem.inputType === "QUANTITY"
                      ? viewItem.quantityLabel || "-"
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">
                  Recent Price Changes
                </h4>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-[#fff8f6] text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Old</th>
                        <th className="px-3 py-2">New</th>
                        <th className="px-3 py-2">Editor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedServiceHistory.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-3 py-4 text-center text-xs text-gray-500">
                            No history for this service yet.
                          </td>
                        </tr>
                      ) : (
                        selectedServiceHistory.map((entry) => (
                          <tr key={entry._id}>
                            <td className="px-3 py-2 text-xs text-gray-700">
                              {entry.changedAt
                                ? format(new Date(entry.changedAt), "dd MMM yyyy")
                                : "-"}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-700">${entry.oldPrice}</td>
                            <td className="px-3 py-2 text-xs font-semibold text-gray-900">
                              ${entry.newPrice}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-700">
                              {entry.changedBy?.slice(0, 6) || "Admin"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setViewItem(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (viewItem) openEditDialog(viewItem);
                setViewItem(null);
              }}
              className="rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              Edit Service
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editItem)} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details and pricing for this item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Service Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                value={editForm.price}
                min="0"
                step="0.01"
                onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Selection Type
              </label>
              <div className="flex gap-4 rounded-lg border border-gray-200 p-3">
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="editInputType"
                    value="BOOLEAN"
                    checked={editForm.inputType === "BOOLEAN"}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, inputType: e.target.value }))
                    }
                  />
                  Check only
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="editInputType"
                    value="QUANTITY"
                    checked={editForm.inputType === "QUANTITY"}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, inputType: e.target.value }))
                    }
                  />
                  Check + number
                </label>
              </div>
            </div>

            {editForm.inputType === "QUANTITY" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity Label
                </label>
                <input
                  type="text"
                  value={editForm.quantityLabel}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, quantityLabel: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20"
                  placeholder="e.g., Bedrooms"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 accent-[#C85344]"
              />
              Active service
            </label>
          </div>

          <DialogFooter>
            <button
              onClick={closeEditDialog}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setItemToDelete(null);
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a service and configure how clients select it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Service Name
              </label>
              <input
                type="text"
                value={newItem.service}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, service: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20"
                placeholder="Enter service name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                value={newItem.price}
                min="0"
                step="0.01"
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, price: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20"
                placeholder="Enter price"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Selection Type
              </label>
              <div className="flex gap-4 rounded-lg border border-gray-200 p-3">
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="newInputType"
                    value="BOOLEAN"
                    checked={newItem.inputType === "BOOLEAN"}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, inputType: e.target.value }))
                    }
                  />
                  Check only
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="newInputType"
                    value="QUANTITY"
                    checked={newItem.inputType === "QUANTITY"}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, inputType: e.target.value }))
                    }
                  />
                  Check + number
                </label>
              </div>
            </div>
            {newItem.inputType === "QUANTITY" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity Label
                </label>
                <input
                  type="text"
                  value={newItem.quantityLabel}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, quantityLabel: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C85344] focus:outline-none focus:ring-2 focus:ring-[#C85344]/20"
                  placeholder="Enter label shown to clients"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewItem(EMPTY_NEW_ITEM);
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewItem}
              className="rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
              disabled={isCreating}
            >
              {isCreating ? "Adding..." : "Add Service"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Pricing;
