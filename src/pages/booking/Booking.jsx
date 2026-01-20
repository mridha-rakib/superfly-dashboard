import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Table from "../../components/ui/Table";
import { toast } from "react-toastify";
import { ViewIcon, Edit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { bookingDummyData } from "../../constants/bookingDummyData";

function Booking() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination & Filters
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "All");

  // Dummy Booking Data
  const data = bookingDummyData;

  // Simulate pagination
  const perPage = 8;
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const paginatedData = data.slice((page - 1) * perPage, page * perPage);

  // Update URL when filtering
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);
    if (status !== "All") params.set("status", status);
    setSearchParams(params, { replace: true });
  }, [page, search, status, setSearchParams]);

  // Filter handler
  const handleFilterChange = (key, value) => {
    if (key === "status") {
      setStatus(value);
      setPage(1);
    }
  };

  // Format data for Table
  const formattedBookings = paginatedData.map((booking, index) => ({
    id: booking.id,
    bookingId: booking.id,
    bookingDate: booking.scheduling.preferredDate,
    customer: booking.customerInfo.businessName,
    type: booking.cleaningDetails.serviceType,
    cleaner: booking.scheduling.assignedCleaner,
    status: booking.status || "Pending", // fallback status
    payment: booking.pricing.totalPrice,
  }));

  const head = [
    "Booking Id",
    "Booking Date",
    "Customer",
    "Type",
    "Cleaner",
    "Status",
    "Payment",
  ];

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "All", label: "All Statuses" },
        { value: "Ongoing", label: "Ongoing" },
        { value: "Pending", label: "Pending" },
        { value: "In Progress", label: "In Progress" },
        { value: "Complete", label: "Complete" },
      ],
    },
  ];

  const bookingActions = [
    {
      key: "view",
      label: "View",
      icon: ViewIcon,
      onClick: (item) => navigate(`/bookings/${item.id}`),
      className:
        "p-1.5 text-purple-500 hover:bg-purple-50 rounded-full border border-purple-200",
    },
    {
      key: "edit",
      label: "Edit",
      icon: Edit01Icon,
      onClick: (item) => navigate(`/bookings/${item.id}/edit`),
      className:
        "p-1.5 text-blue-500 hover:bg-blue-50 rounded-full border border-blue-200",
    },
    {
      key: "delete",
      label: "Delete",
      icon: Delete02Icon,
      onClick: (item, confirmDelete) => confirmDelete(item),
      className:
        "p-1.5 text-red-500 hover:bg-red-50 rounded-full border border-red-200",
    },
  ];

  const bookingColorScheme = {
    Ongoing: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
    Pending: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
    "In Progress": { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    Complete: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  };

  return (
    <div className="w-full mx-auto">
      <Table
        title="Bookings"
        head={head}
        fields={[
          "bookingId",
          "bookingDate",
          "customer",
          "type",
          "cleaner",
          "status",
          "payment",
        ]}
        dataset={formattedBookings}
        showCreateButton={true}
        createButtonText="Add Booking"
        onCreateClick={() => navigate("/bookings/add")}
        filters={filters}
        actions={bookingActions}
        colorScheme={bookingColorScheme}
        onFilterChange={handleFilterChange}
        filterValues={{ status }}
        pagination={{
          currentPage: page,
          totalPages,
          total: totalItems,
        }}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onConfirmDelete={async (item) => {
          toast.info(`Simulate delete for ${item.bookingId}`);
        }}
      />
    </div>
  );
}

export default Booking;
