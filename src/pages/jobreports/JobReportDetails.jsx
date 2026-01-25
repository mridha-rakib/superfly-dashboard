import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCleaningReportStore } from "../../state/cleaningReportStore";

const fmtDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const duration = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return "-";
  const diffMs = e.getTime() - s.getTime();
  const minutes = Math.round(diffMs / 60000);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs ? `${hrs} hr${hrs > 1 ? "s" : ""}` : ""}${hrs && mins ? " " : ""}${mins ? `${mins} min${mins > 1 ? "s" : ""}` : ""}` || "0 min";
};

const PhotoGrid = ({ title, photos }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
    {photos && photos.length ? (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((url, idx) => (
          <div key={idx} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img src={url} alt={`${title}-${idx}`} className="h-36 w-full object-cover" />
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        No photos provided.
      </div>
    )}
  </div>
);

function JobReportDetails() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const {
    selectedReport,
    isLoadingDetail,
    isApproving,
    error,
    fetchReportById,
    approveReport,
    clearError,
  } = useCleaningReportStore();

  useEffect(() => {
    if (!reportId) return;
    fetchReportById(reportId).catch(() => toast.error("Failed to load report"));
    return () => clearError();
  }, [reportId, fetchReportById, clearError]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const report = useMemo(() => {
    if (selectedReport && (selectedReport._id === reportId || selectedReport.id === reportId)) {
      return selectedReport;
    }
    return null;
  }, [selectedReport, reportId]);

  const quote = report?.quote;
  const cleaner = report?.cleaner;

  const clientName =
    quote?.companyName ||
    quote?.contactName ||
    [quote?.firstName, quote?.lastName].filter(Boolean).join(" ") ||
    "Client";

  const handleApprove = async () => {
    if (!reportId) return;
    try {
      await approveReport(reportId);
      toast.success("Report approved");
    } catch (err) {
      toast.error(err?.message || "Failed to approve report");
    }
  };

  if (isLoadingDetail) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="h-40 w-full bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-red-600">Report not found</h2>
        <button
          onClick={() => navigate("/job-reports")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Back to reports
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#C85344]">Job Report</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Report #{report._id}</h1>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                report.status === "approved"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {report.status === "approved" ? "Approved" : "Pending"}
            </span>
            {quote?.serviceType && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700">
                {quote.serviceType}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/job-reports")}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Back to list
          </button>
          {report.status !== "approved" && (
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-70"
            >
              {isApproving ? "Approving..." : "Approve Report"}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
        </div>
        <div className="grid gap-4 px-6 py-4 md:grid-cols-2">
          <InfoRow label="Booking ID" value={quote?._id || report.quoteId} />
          <InfoRow label="Client" value={clientName} />
          <InfoRow label="Cleaner" value={cleaner?.fullName || cleaner?.email || report.cleanerId} />
          <InfoRow label="Service Type" value={quote?.serviceType || "Residential"} />
          <InfoRow label="Date" value={fmtDateTime(quote?.serviceDate || report.createdAt)} />
          <InfoRow label="Status" value={report.status === "approved" ? "Approved" : "Pending"} />
          <InfoRow label="Address" value={quote?.businessAddress || "-"} span />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Timing</h2>
        </div>
        <div className="grid gap-4 px-6 py-4 md:grid-cols-2">
          <InfoRow label="Arrival Time" value={fmtDateTime(report.arrivalTime)} />
          <InfoRow label="Start Time" value={fmtDateTime(report.startTime)} />
          <InfoRow label="End Time" value={fmtDateTime(report.endTime)} />
          <InfoRow label="Duration" value={duration(report.startTime, report.endTime)} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PhotoGrid title="Before Photos" photos={report.beforePhotos} />
        <PhotoGrid title="After Photos" photos={report.afterPhotos} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Cleaner Notes</h2>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {report.notes || "No notes provided."}
          </p>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value, span = false }) => (
  <div className={span ? "md:col-span-2" : ""}>
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value || "-"}</p>
  </div>
);

export default JobReportDetails;
