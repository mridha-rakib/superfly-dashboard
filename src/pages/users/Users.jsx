import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Edit01Icon, Delete02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { Sparkles, UserPlus } from "lucide-react";
import Table from "../../components/ui/Table";
import { useCleanerStore } from "../../state/cleanerStore";

function Users() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "All"
  );

  const perPage = 8;

  const {
    cleaners,
    pagination,
    isLoadingList,
    isDeleting,
    error,
    fetchCleaners,
    deleteCleaner,
    clearError,
  } = useCleanerStore();

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);
    if (statusFilter && statusFilter !== "All") {
      params.set("status", statusFilter);
    }
    setSearchParams(params, { replace: true });
  }, [page, search, statusFilter, setSearchParams]);

  useEffect(() => {
    fetchCleaners({
      page,
      limit: perPage,
      search: search || undefined,
      status: statusFilter === "All" ? undefined : statusFilter,
    }).catch(() => {});
  }, [page, perPage, search, statusFilter, fetchCleaners]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const totalItems =
    pagination?.totalItems ??
    pagination?.total ??
    pagination?.items?.length ??
    cleaners.length;
  const totalPages =
    pagination?.totalPages ||
    pagination?.pageCount ||
    Math.max(1, Math.ceil((totalItems || 0) / perPage));

  const fields = ["fullName", "email", "phone", "accountStatus", "cleanerPercentage"];
  const head = ["Name", "Email", "Contact", "Status", "Split %"];

  const statusColors = {
    active: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
    pending: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
    inactive: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
    suspended: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
  };

  const actions = [
    {
      key: "view",
      label: "View",
      icon: ViewIcon,
      onClick: (item) => navigate(`/users/${item._id}`),
      className:
        "p-1.5 text-purple-500 hover:bg-purple-50 rounded-full border border-purple-200",
    },
    {
      key: "edit",
      label: "Edit",
      icon: Edit01Icon,
      onClick: (item) => navigate(`/users/${item._id}/edit`),
      className:
        "p-1.5 text-blue-500 hover:bg-blue-50 rounded-full border border-blue-200",
    },
    {
      key: "delete",
      label: "Delete",
      icon: Delete02Icon,
      onClick: (item) => item,
      className:
        "p-1.5 text-red-500 hover:bg-red-50 rounded-full border border-red-200",
    },
  ];

  const dataset = cleaners.map((cleaner) => ({
    ...cleaner,
    phone: cleaner.phone || cleaner.phoneNumber || "-",
    cleanerPercentage:
      cleaner.cleanerPercentage !== undefined
        ? `${cleaner.cleanerPercentage}%`
        : "-",
  }));

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All", value: "All" },
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ],
    },
  ];

  const handleDelete = async (item) => {
    try {
      await deleteCleaner(item._id);
      toast.success("Cleaner deleted successfully");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete cleaner. Please try again.";
      toast.error(message);
    } finally {
      clearError();
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#C85344]">
              <Sparkles className="h-4 w-4 text-[#C85344]" /> Cleaners
            </p>
            <h2 className="text-2xl font-semibold text-gray-900">Team Directory</h2>
            <p className="text-sm text-gray-500">
              Search, view, and manage your cleaning team.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={() => navigate("/users/add")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              <UserPlus className="h-4 w-4" />
              Add Cleaner
            </button>
          </div>
        </div>
      </div>

      <Table
        title="Cleaners"
        head={head}
        fields={fields}
        dataset={dataset}
        showCreateButton={false}
        hideSearch={false}
        pagination={{
          currentPage: pagination.currentPage || page,
          totalPages: totalPages || 1,
          total: totalItems,
          itemsPerPage: perPage,
        }}
        onPageChange={(nextPage) => setPage(nextPage || 1)}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        searchQuery={search}
        filters={filters}
        filterValues={{ status: statusFilter }}
        onFilterChange={(key, value) => {
          if (key === "status") {
            setStatusFilter(value);
            setPage(1);
          }
        }}
        actions={actions}
        colorScheme={statusColors}
        onConfirmDelete={handleDelete}
        customTitle={
          isLoadingList ? (
            <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
          ) : null
        }
      />
      {isDeleting && (
        <p className="text-sm text-gray-500">Deleting cleaner...</p>
      )}
    </div>
  );
}

export default Users;
