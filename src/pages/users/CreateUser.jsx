import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create cleaner. Please try again.";
      toast.error(errorMessage);
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
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter full name"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]/20 focus:border-[#C85344]"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="cleaner@email.com"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]/20 focus:border-[#C85344]"
              required
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="01XXXXXXXXX"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]/20 focus:border-[#C85344]"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">
              Address (optional)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Street, city"
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]/20 focus:border-[#C85344]"
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
                value={formData.cleanerPercentage}
                onChange={(e) => handleChange("cleanerPercentage", e.target.value)}
                placeholder="0 - 100"
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85344]/20 focus:border-[#C85344] w-full"
                min="0"
                max="100"
                required
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
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
