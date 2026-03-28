import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "@/lib/api-error";
import {
  getFieldErrorId,
  useInlineFormErrors,
} from "@/hooks/useInlineFormErrors";
import { toast } from "@/lib/notify";
import Button from "../../components/ui/Button";
import { useCleanerStore } from "../../state/cleanerStore";

const statusOptions = ["active", "pending", "inactive", "suspended"];

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedCleaner,
    isLoadingDetail,
    isUpdating,
    error,
    fetchCleanerById,
    updateCleaner,
    clearError,
  } = useCleanerStore();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    cleanerPercentage: "",
    accountStatus: "active",
  });
  const { getFieldA11yProps, getFieldError, validateField } = useInlineFormErrors();

  const getFieldClassName = (fieldName) =>
    `p-3 rounded-lg border focus:ring-2 focus:ring-[#C85344]/20 focus:outline-none ${
      getFieldError(fieldName)
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300"
    }`;

  const validateCleanerPercentage = (value) => {
    if (value === "") return "";
    const pct = Number(value);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      return "Cleaner percentage must be between 0 and 100.";
    }
    return "";
  };

  useEffect(() => {
    fetchCleanerById(id).catch(() => {});
    return () => clearError();
  }, [id, fetchCleanerById, clearError]);

  useEffect(() => {
    if (selectedCleaner && (selectedCleaner._id === id || selectedCleaner.id === id)) {
      setFormData({
        fullName: selectedCleaner.fullName || "",
        email: selectedCleaner.email || "",
        phoneNumber: selectedCleaner.phone || selectedCleaner.phoneNumber || "",
        address: selectedCleaner.address || "",
        cleanerPercentage:
          selectedCleaner.cleanerPercentage !== undefined
            ? selectedCleaner.cleanerPercentage
            : "",
        accountStatus: selectedCleaner.accountStatus || "active",
      });
    }
  }, [id, selectedCleaner]);

  const handleChange = (field, value, event) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (event && getFieldError(field)) {
      validateField(field, event.target, {
        label:
          field === "fullName"
            ? "Full name"
            : field === "cleanerPercentage"
            ? "Cleaner percentage"
            : "Email",
        customValidator:
          field === "cleanerPercentage" ? validateCleanerPercentage : undefined,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const isValid = [
      ["fullName", "Full name"],
      ["email", "Email"],
      ["cleanerPercentage", "Cleaner percentage", validateCleanerPercentage],
    ].every(([field, label, customValidator]) =>
      validateField(field, form.elements.namedItem(field), {
        label,
        customValidator,
      })
    );

    if (!isValid) {
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim() || undefined,
      address: formData.address.trim() || undefined,
      accountStatus: formData.accountStatus,
    };

    if (formData.cleanerPercentage !== "") {
      const pct = Number(formData.cleanerPercentage);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        toast.error("Cleaner percentage must be between 0 and 100.");
        return;
      }
      payload.cleanerPercentage = pct;
    }

    try {
      await updateCleaner(id, payload);
      toast.success("Cleaner updated successfully");
      navigate(`/users/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update cleaner."));
    } finally {
      clearError();
    }
  };

  if (isLoadingDetail) {
    return (
      <div className="p-10">
        <div className="h-6 w-48 bg-gray-200 animate-pulse mb-4 rounded" />
        <div className="h-4 w-64 bg-gray-200 animate-pulse mb-6 rounded" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error && !selectedCleaner) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 rounded-xl">
        <h2 className="text-3xl font-semibold text-red-600 mb-6">Cleaner Not Found</h2>
        <Button onClick={() => navigate("/users")}>Back to Cleaners</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Edit Cleaner</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 space-y-6"
      >
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value, e)}
            onBlur={(e) => validateField("fullName", e.target, { label: "Full name" })}
            className={getFieldClassName("fullName")}
            required
            {...getFieldA11yProps("fullName")}
          />
          {getFieldError("fullName") && (
            <p id={getFieldErrorId("fullName")} className="mt-1 text-sm text-red-600">
              {getFieldError("fullName")}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value, e)}
            onBlur={(e) => validateField("email", e.target, { label: "Email" })}
            className={getFieldClassName("email")}
            required
            {...getFieldA11yProps("email")}
          />
          {getFieldError("email") && (
            <p id={getFieldErrorId("email")} className="mt-1 text-sm text-red-600">
              {getFieldError("email")}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Contact</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value, e)}
            className={getFieldClassName("phoneNumber")}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value, e)}
            className={getFieldClassName("address")}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Cleaner Percentage</label>
          <input
            type="number"
            name="cleanerPercentage"
            value={formData.cleanerPercentage}
            onChange={(e) => handleChange("cleanerPercentage", e.target.value, e)}
            onBlur={(e) =>
              validateField("cleanerPercentage", e.target, {
                label: "Cleaner percentage",
                customValidator: validateCleanerPercentage,
              })
            }
            className={getFieldClassName("cleanerPercentage")}
            min={0}
            max={100}
            step="0.1"
            {...getFieldA11yProps("cleanerPercentage")}
          />
          {getFieldError("cleanerPercentage") && (
            <p
              id={getFieldErrorId("cleanerPercentage")}
              className="mt-1 text-sm text-red-600"
            >
              {getFieldError("cleanerPercentage")}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-800">Status</label>
          <select
            name="accountStatus"
            value={formData.accountStatus}
            onChange={(e) => handleChange("accountStatus", e.target.value, e)}
            className={getFieldClassName("accountStatus")}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate(`/users/${id}`)} type="button">
            Cancel
          </Button>
          <Button type="submit" className="px-6 py-3 text-lg" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Update Cleaner"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;

