import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "react-toastify";
import { useCleaningReportStore } from "../../state/cleaningReportStore";

const statusTone = (status) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "approved") return "bg-green-50 text-green-700 border-green-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const mapReportRow = (report) => {
  const quote = report?.quote;
  const cleaner = report?.cleaner;
  const bookingId = quote?._id || report?.quoteId || report?._id;
  const clientName =
    quote?.companyName ||
    quote?.contactName ||
    [quote?.firstName, quote?.lastName].filter(Boolean).join(" ") ||
    "Client";
  return {
    id: report?._id || report?.id,
    bookingId,
    cleaner: cleaner?.fullName || cleaner?.email || "Cleaner",
    client: clientName,
    serviceType: quote?.serviceType || "Residential",
    date: quote?.serviceDate || report?.createdAt,
    status: (report?.status || "").toLowerCase() === "approved" ? "Approved" : "Pending",
  };
};

function JobReports() {
  const navigate = useNavigate();
  const {
    reports,
    pagination,
    isLoadingList,
    error,
    fetchReports,
    clearError,
  } = useCleaningReportStore();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchReports({ page: currentPage, limit: rowsPerPage }).catch(() =>
      toast.error("Failed to load job reports")
    );
    return () => clearError();
  }, [currentPage, rowsPerPage, fetchReports, clearError]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const mapped = useMemo(() => (reports || []).map(mapReportRow), [reports]);

  const statsCards = useMemo(() => {
    const total = pagination?.totalItems || mapped.length;
    const approved = mapped.filter((r) => r.status === "Approved").length;
    const pending = total - approved;
    return [
      { title: "Total Jobs", value: total },
      { title: "Approved", value: approved },
      { title: "Pending", value: pending },
    ];
  }, [mapped, pagination?.totalItems]);

  const totalPages = pagination?.totalPages || 1;

  const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePageClick = (page) => setCurrentPage(page);

  const renderPaginationNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`rounded-lg px-3 py-1 text-sm font-semibold ${
            currentPage === i ? "bg-[#C85344] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="w-full mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-gradient-to-r from-[#fff5f3] via-white to-[#fff7f5] p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-gray-500">Reports</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Reports</h1>
            <p className="text-sm text-gray-500">Monitor bookings, cleaners, and verification status.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statsCards.map((card, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{card.title}</p>
                  <p className="text-xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#C85344]">Overview</p>
            <h2 className="text-lg font-semibold text-gray-900">Jobs Summary</h2>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {pagination?.totalItems || mapped.length} jobs
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoadingList && (
            <div className="px-6 py-3 text-sm text-gray-500">Loading reports...</div>
          )}
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Cleaner</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Service Type</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mapped.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{job.bookingId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{job.cleaner}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{job.client}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                      {job.serviceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(job.date)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/job-reports/${job.id}`)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#C85344]/40 hover:text-[#C85344]"
                    >
                      <HugeiconsIcon icon={ViewIcon} />
                    </button>
                  </td>
                </tr>
              ))}
              {!mapped.length && !isLoadingList && (
                <tr>
                  <td colSpan="7" className="px-6 py-6 text-center text-sm text-gray-500">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-700 sm:flex-row">
        <div>
          Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, pagination?.totalItems || mapped.length)} of{" "}
          {pagination?.totalItems || mapped.length} Results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50"
          >
            Previous
          </button>
          {renderPaginationNumbers()}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobReports;
