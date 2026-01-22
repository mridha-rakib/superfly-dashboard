import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useCleanerStore } from "../../state/cleanerStore";

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedCleaner,
    isLoadingDetail,
    error,
    fetchCleanerById,
    clearError,
  } = useCleanerStore();

  useEffect(() => {
    fetchCleanerById(id).catch(() => {});
    return () => clearError();
  }, [id, fetchCleanerById, clearError]);

  const cleaner =
    selectedCleaner && (selectedCleaner._id === id || selectedCleaner.id === id)
      ? selectedCleaner
      : null;

  if (isLoadingDetail) {
    return (
      <div className="p-10">
        <div className="h-6 w-40 bg-gray-200 animate-pulse mb-4 rounded" />
        <div className="h-4 w-64 bg-gray-200 animate-pulse mb-6 rounded" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !cleaner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 rounded-xl">
        <h2 className="text-3xl font-semibold text-red-600 mb-6">
          Cleaner Not Found
        </h2>
        <Button onClick={() => navigate("/users")}>Back to Cleaners</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10  min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {cleaner.fullName}
          </h1>
          <p className="text-sm text-gray-500">Cleaner Profile</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate("/users")}>
            Back
          </Button>
          <Button onClick={() => navigate(`/users/${cleaner._id}/edit`)}>
            Edit
          </Button>
        </div>
      </div>

      <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-gray-200">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
          <p className="text-lg">
            <span className="font-medium text-gray-900">Full Name:</span>{" "}
            {cleaner.fullName}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-900">Email:</span>{" "}
            {cleaner.email}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-900">Contact:</span>{" "}
            {cleaner.phone || cleaner.phoneNumber || "-"}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-900">Status:</span>{" "}
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[cleaner.accountStatus] || "bg-gray-100 text-gray-800"
              }`}
            >
              {cleaner.accountStatus}
            </span>
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-900">Split %:</span>{" "}
            {cleaner.cleanerPercentage ?? "-"}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-900">Address:</span>{" "}
            {cleaner.address || "N/A"}
          </p>
        </div>
      </section>
    </div>
  );
}

export default ViewUser;
