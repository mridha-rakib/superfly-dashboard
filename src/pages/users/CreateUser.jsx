import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/api-error";
import { toast } from "@/lib/notify";
import {
  getFieldErrorId,
  useInlineFormErrors,
} from "@/hooks/useInlineFormErrors";
import { ShieldCheck, UserPlus } from "lucide-react";
import Button from "../../components/ui/Button";
import { useCleanerStore } from "../../state/cleanerStore";

function CreateUser() {
  const navigate = useNavigate();
  const { createCleaner, isCreating, clearError } = useCleanerStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cleanerPercentage: 50,
    phoneNumber: "",
    address: "",
  });
  const { getFieldA11yProps, getFieldError, validateField } = useInlineFormErrors();

  const getFieldClassName = (fieldName) =>
    `p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]/20 ${
      getFieldError(fieldName)
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300 focus:border-[#C85344]"
    }`;

  const validateCleanerPercentage = (value) => {
    const percentage = Number(value);
    if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
      return "Cleaner percentage must be between 0 and 100.";
    }
    return "";
  };

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
      cleanerPercentage: Number(formData.cleanerPercentage),
      phoneNumber: formData.phoneNumber.trim() || undefined,
      address: formData.address.trim() || undefined,
    };

    if (
      Number.isNaN(payload.cleanerPercentage) ||
      payload.cleanerPercentage < 0 ||
      payload.cleanerPercentage > 100
    ) {
      toast.error("Cleaner percentage must be between 0 and 100.");
      return;
    }

    try {
      const response = await createCleaner(payload);
      const result = response?.data || response || {};
      const message =
        response?.message || "Cleaner created and credentials emailed.";

      toast.success(message);

      if (!result.emailSent && result.emailWarning) {
        const warning = result.temporaryPassword
          ? `${result.emailWarning} Temporary password: ${result.temporaryPassword}`
          : result.emailWarning;
        toast.warn(warning);
      }

      setTimeout(() => navigate("/users"), 400);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create cleaner. Please try again."));
    } finally {
      clearError();
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-[#C85344]/10 flex items-center justify-center text-[#C85344]">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase font-semibold text-[#C85344] tracking-wide">
            Cleaners
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Create Cleaner</h1>
          <p className="text-sm text-gray-500">
            Add a new cleaner. We will generate a secure password and email it to them.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value, e)}
              onBlur={(e) => validateField("fullName", e.target, { label: "Full name" })}
              placeholder="Enter full name"
              className={getFieldClassName("fullName")}
              required
              {...getFieldA11yProps("fullName")}
            />
            {getFieldError("fullName") && (
              <p
                id={getFieldErrorId("fullName")}
                className="mt-1 text-sm text-red-600"
              >
                {getFieldError("fullName")}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value, e)}
              onBlur={(e) => validateField("email", e.target, { label: "Email" })}
              placeholder="cleaner@email.com"
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

          {/* Phone */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value, e)}
              placeholder="01XXXXXXXXX"
              className={getFieldClassName("phoneNumber")}
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">
              Address (optional)
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value, e)}
              placeholder="Street, city"
              className={getFieldClassName("address")}
            />
          </div>

          {/* Cleaner Percentage */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">
              Cleaner Percentage
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="cleanerPercentage"
                value={formData.cleanerPercentage}
                onChange={(e) =>
                  handleChange("cleanerPercentage", e.target.value, e)
                }
                onBlur={(e) =>
                  validateField("cleanerPercentage", e.target, {
                    label: "Cleaner percentage",
                    customValidator: validateCleanerPercentage,
                  })
                }
                placeholder="0 - 100"
                className={`${getFieldClassName("cleanerPercentage")} w-full`}
                min="0"
                max="100"
                required
                {...getFieldA11yProps("cleanerPercentage")}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            {getFieldError("cleanerPercentage") && (
              <p
                id={getFieldErrorId("cleanerPercentage")}
                className="mt-1 text-sm text-red-600"
              >
                {getFieldError("cleanerPercentage")}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              The percentage this cleaner will earn from each job.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-dashed border-gray-300 p-3 text-sm text-gray-700">
            <ShieldCheck className="h-4 w-4 text-[#C85344]" />
            <span>
              A strong temporary password will be generated and emailed to the cleaner.
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Cleaner"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;

