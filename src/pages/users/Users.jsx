import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { toast } from "react-toastify";
import { ViewIcon, Edit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { usersDummyData } from "../../constants/usersDummyData";

function Users() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination & Filters
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "All");

  const perPage = 8;
  const filteredData = usersDummyData.filter((user) =>
    (role === "All" || user.role === role) &&
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

  // Update URL when filtering/searching
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);
    if (role !== "All") params.set("role", role);
    setSearchParams(params, { replace: true });
  }, [page, search, role, setSearchParams]);

  // Table fields & headers
  const fields = ["name", "contact", "role", "jobCompleted", "rating"];
  const head = ["Name", "Contact", "Role", "Jobs Completed", "Rating"];

  // Color scheme for roles
  const colorScheme = {
    Cleaner: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    Admin: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
    Staff: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
  };

  // Actions
  const actions = [
    {
      key: "view",
      label: "View",
      icon: ViewIcon,
      onClick: (item) => navigate(`/users/${item.id}`),
      className: "p-1.5 text-purple-500 hover:bg-purple-50 rounded-full border border-purple-200",
    },
    {
      key: "edit",
      label: "Edit",
      icon: Edit01Icon,
      onClick: (item) => navigate(`/users/${item.id}/edit`),
      className: "p-1.5 text-blue-500 hover:bg-blue-50 rounded-full border border-blue-200",
    },
    {
      key: "delete",
      label: "Delete",
      icon: Delete02Icon,
      onClick: (item, confirmDelete) => {
        if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
          toast.success(`${item.name} deleted!`);
        }
      },
      className: "p-1.5 text-red-500 hover:bg-red-50 rounded-full border border-red-200",
    },
  ];

  // Format dataset for table
  const dataset = paginatedData.map((user) => ({
    ...user,
    jobCompleted: user.role === "Cleaner" ? user.jobCompleted : "-",
    rating: user.role === "Cleaner" ? user.rating : "-",
  }));

  // Filters
  const filters = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "All", label: "All Roles" },
        { value: "Cleaner", label: "Cleaner" },
        { value: "Admin", label: "Admin" },
        { value: "Staff", label: "Staff" },
      ],
    },
  ];

  const handleFilterChange = (key, value) => {
    if (key === "role") {
      setRole(value);
      setPage(1);
    }
  };

  return (
    <div className="w-full mx-auto">
      <Table
        title="Users"
        head={head}
        fields={fields}
        dataset={dataset}
        showCreateButton={true}
        createButtonText="Add User"
        onCreateClick={() => navigate("/users/add")}
        filters={filters}
        filterValues={{ role }}
        onFilterChange={handleFilterChange}
        pagination={{ currentPage: page, totalPages, total: totalItems }}
        onPageChange={setPage}
        onSearchChange={setSearch}
        actions={actions}
        colorScheme={colorScheme}
        onConfirmDelete={async (item) => {
          toast.info(`Simulate delete for ${item.name}`);
        }}
      />
    </div>
  );
}

export default Users;
