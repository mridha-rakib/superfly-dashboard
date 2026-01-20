import { ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function JobReports() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 30; // 150 results ÷ 5 per page

  const statsCards = [
    { title: "Total Jobs", value: "150", change: "+12%", trend: "up" },
    { title: "Verified", value: "120", change: "+8%", trend: "up" },
    { title: "Pending", value: "25", change: "-5%", trend: "down" },
  ];

  const jobData = [
    {
      id: 1,
      bookingId: "#RES-101",
      cleaner: "John Admin (person)",
      customer: "Rahim Khan",
      serviceType: "Residential",
      date: "05 NOV 2025",
      status: "Pending",
    },
    {
      id: 2,
      bookingId: "#RES-101",
      cleaner: "John Admin (person)",
      customer: "Rahim Khan",
      serviceType: "Residential",
      date: "05 NOV 2025",
      status: "Pending",
    },
    {
      id: 3,
      bookingId: "#RES-101",
      cleaner: "John Admin (person)",
      customer: "Rahim Khan",
      serviceType: "Residential",
      date: "05 NOV 2025",
      status: "Pending",
    },
    {
      id: 4,
      bookingId: "#RES-101",
      cleaner: "John Admin (person)",
      customer: "Rahim Khan",
      serviceType: "Residential",
      date: "05 NOV 2025",
      status: "Verified",
    },
    {
      id: 5,
      bookingId: "#RES-101",
      cleaner: "John Admin (person)",
      customer: "Rahim Khan",
      serviceType: "Residential",
      date: "05 NOV 2025",
      status: "Pending",
    },
  ];

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === "Verified") {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="w-full mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Reports</h1>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-y-2 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 shadow-sm text-center"
          >
            <div className="flex flex-col space-y-2 items-center justify-center">
              <p className="text-lg font-semibold text-gray-600">{card.title}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Cleaner
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Service Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobData.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {job.bookingId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {job.cleaner}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {job.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {job.serviceType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {job.date}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={getStatusBadge(job.status)}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => navigate(`/job-details`)}
                      className="text-blue-600 rounded-full border border-blue-200 hover:bg-blue-50 hover:text-blue-800 p-1"
                    >
                      <HugeiconsIcon icon={ViewIcon} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * 5 + 1}-{Math.min(currentPage * 5, 150)}{" "}
          of 150 Results
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Previous
          </button>

          {renderPaginationNumbers()}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobReports;
