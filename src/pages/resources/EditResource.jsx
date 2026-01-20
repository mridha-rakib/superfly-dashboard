import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetSingleResourceQuery,
  useUpdateResourceMutation,
} from "../../store/features/api/resourceApiSlice";
import { useGetCategoriesQuery } from "../../store/features/api/categoryApiSlice";
import Button from "../../components/ui/Button";

// Constants
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const ROLES = ["Supervisor", "Counsellor", "Clinician"];

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // This method is required by React Error Boundaries API
    // The error parameter is automatically passed by React when an error occurs
    console.error("React Error Boundary caught an error:", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in EditResource:", error, errorInfo);
    // Log the error for debugging purposes
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-red-800">
            Something went wrong
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              There was an error loading this resource. Please try again later.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Hooks
  const {
    data: resourceResponse,
    isLoading: isResourceLoading,
    isError: isResourceError,
    error: resourceError,
  } = useGetSingleResourceQuery(id);

  const [updateResource] = useUpdateResourceMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  // Form State
  const [form, setForm] = useState(null);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Format operating hours from API response
  const formatOperatingHours = (hours) => {
    return DAYS.map((day) => {
      const dayData = Array.isArray(hours)
        ? hours.find((h) => h.day.toLowerCase() === day.toLowerCase())
        : null;

      return {
        day,
        closed: dayData ? dayData.closed : true,
        openTime: dayData?.openTime || "09:00",
        closeTime: dayData?.closeTime || "17:00",
      };
    });
  };

  // Initialize form when data is loaded
  useEffect(() => {
    if (resourceResponse?.data) {
      const resource = resourceResponse.data;
      setForm({
        title: resource.title || "",
        description: resource.description || "",
        category: resource.category?.id || resource.category?._id || "",
        location: resource.location || "",
        servicesAvailable: Array.isArray(resource.servicesAvailable)
          ? [...resource.servicesAvailable]
          : [],
        visibleFor: Array.isArray(resource.visibleFor)
          ? [...resource.visibleFor]
          : [],
        contactInfo: {
          phoneNumber: resource.contactInfo?.phoneNumber || "",
          emailAddress: resource.contactInfo?.emailAddress || "",
          address: resource.contactInfo?.address || "",
        },
        operatingHours: formatOperatingHours(resource.operatingHours || []),
      });
    }
  }, [resourceResponse]);

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (form && resourceResponse?.data) {
      const resource = resourceResponse.data;
      const original = {
        title: resource.title || "",
        description: resource.description || "",
        category: resource.category?.id || resource.category?._id || "",
        location: resource.location || "",
        servicesAvailable: [...(resource.servicesAvailable || [])],
        visibleFor: [...(resource.visibleFor || [])],
        contactInfo: {
          phoneNumber: resource.contactInfo?.phoneNumber || "",
          emailAddress: resource.contactInfo?.emailAddress || "",
          address: resource.contactInfo?.address || "",
        },
        operatingHours: formatOperatingHours(resource.operatingHours || []),
      };

      setHasUnsavedChanges(JSON.stringify(form) !== JSON.stringify(original));
    }
  }, [form, resourceResponse]);

  // Handlers
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleContactChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [key]: value },
    }));
  };

  const handleServiceChange = (index, value) => {
    const newServices = [...form.servicesAvailable];
    newServices[index] = value;
    setForm((prev) => ({ ...prev, servicesAvailable: newServices }));
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      servicesAvailable: [...prev.servicesAvailable, ""],
    }));
  };

  const removeService = (index) => {
    const newServices = form.servicesAvailable.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, servicesAvailable: newServices }));
  };

  const toggleVisibleFor = (role) => {
    setForm((prev) => ({
      ...prev,
      visibleFor: prev.visibleFor.includes(role)
        ? prev.visibleFor.filter((r) => r !== role)
        : [...prev.visibleFor, role],
    }));
  };

  const handleOperatingHoursChange = (index, field, value) => {
    const newHours = [...form.operatingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setForm((prev) => ({ ...prev, operatingHours: newHours }));
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate(`/resources/${id}`);
      }
    } else {
      navigate(`/resources/${id}`);
    }
  };

  const validateForm = () => {
    if (!form) return false;
    return (
      form.title.trim() !== "" &&
      form.category &&
      form.location.trim() !== "" &&
      form.contactInfo.phoneNumber.trim() !== "" &&
      form.contactInfo.emailAddress.trim() !== "" &&
      form.contactInfo.address.trim() !== ""
    );
  };

  // Helper functions for validation errors
  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || null;
  };

  const getFieldClassName = (fieldName) => {
    const hasError = getFieldError(fieldName);
    return hasError
      ? "w-full border p-2 rounded border-red-500 focus:ring-red-500 focus:border-red-500"
      : "w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form || !validateForm()) return;

    // Clear previous validation errors
    setValidationErrors({});

    try {
      setIsSubmitting(true);

      // Prepare the payload to match the expected backend structure
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category, // This should be the category ID string
        location: form.location.trim(),
        servicesAvailable: form.servicesAvailable
          .map((service) => service.trim())
          .filter((service) => service !== ""), // Remove empty services
        visibleFor: [...form.visibleFor], // Ensure it's an array
        contactInfo: {
          phoneNumber: form.contactInfo.phoneNumber.trim(),
          emailAddress: form.contactInfo.emailAddress.trim(),
          address: form.contactInfo.address.trim(),
        },
        operatingHours: form.operatingHours.map((day) => {
          // For closed days, only include day and closed status
          if (day.closed) {
            return {
              day: day.day,
              closed: true,
            };
          }
          // For open days, include all time fields
          return {
            day: day.day,
            closed: false,
            openTime: day.openTime,
            closeTime: day.closeTime,
          };
        }),
      };

      // Log the payload for debugging
      console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      await updateResource({ id, ...payload }).unwrap();
      toast.success("Resource updated successfully");
      navigate(`/resources/${id}`);
    } catch (error) {
      console.error("Failed to update resource:", error);

      // Handle validation errors
      if (
        error.status === 400 &&
        error.data?.errors &&
        Array.isArray(error.data.errors)
      ) {
        // Parse validation errors and map them to form fields
        const errors = {};
        error.data.errors.forEach((validationError) => {
          // Convert field path like "body.description" to "description"
          // and "body.contactInfo.phoneNumber" to "contactInfo.phoneNumber"
          const fieldPath = validationError.field.replace("body.", "");
          errors[fieldPath] = validationError.message;
        });
        setValidationErrors(errors);
      } else {
        // Handle other types of errors with a general message
        const errorMessage =
          error.data?.message || "Failed to update resource. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isResourceLoading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (isResourceError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load resource. {resourceError?.data?.message || ""}
            </p>
            <div className="mt-2">
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto space-y-6">
      <h1 className="text-4xl font-bold">Edit Resource</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div>
            <label htmlFor="title" className="block font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={getFieldClassName("title")}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              aria-required="true"
            />
            {getFieldError("title") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("title")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              className={getFieldClassName("description")}
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {getFieldError("description") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("description")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block font-medium mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            {isCategoriesLoading ? (
              <p>Loading categories...</p>
            ) : (
              <select
                id="category"
                className={getFieldClassName("category")}
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                required
                aria-required="true"
              >
                <option value="">Select a category</option>
                {Array.isArray(categoriesData?.data)
                  ? categoriesData.data.map((cat) => (
                      <option key={cat.id || cat._id} value={cat.id || cat._id}>
                        {cat.name}
                      </option>
                    ))
                  : Array.isArray(categoriesData)
                  ? categoriesData.map((cat) => (
                      <option key={cat.id || cat._id} value={cat.id || cat._id}>
                        {cat.name}
                      </option>
                    ))
                  : null}
              </select>
            )}
            {getFieldError("category") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("category")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block font-medium mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              type="text"
              className={getFieldClassName("location")}
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              required
              aria-required="true"
            />
            {getFieldError("location") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("location")}
              </p>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-lg font-semibold">Services Available</h2>

          {form.servicesAvailable.map((service, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 border p-2 rounded"
                value={service}
                onChange={(e) => handleServiceChange(index, e.target.value)}
                placeholder="Service name"
              />
              <button
                type="button"
                onClick={() => removeService(index)}
                className="p-2 text-red-500 hover:text-red-700"
                aria-label={`Remove service ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addService}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            + Add Service
          </button>
        </div>

        {/* Visible For */}
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <h2 className="text-lg font-semibold">Visible For</h2>
          <div className="flex flex-wrap gap-4">
            {ROLES.map((role) => (
              <label
                key={role}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.visibleFor.includes(role)}
                  onChange={() => toggleVisibleFor(role)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-lg font-semibold">Contact Information</h2>

          <div>
            <label htmlFor="phone" className="block font-medium mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              className={getFieldClassName("contactInfo.phoneNumber")}
              value={form.contactInfo.phoneNumber}
              onChange={(e) =>
                handleContactChange("phoneNumber", e.target.value)
              }
              required
              aria-required="true"
            />
            {getFieldError("contactInfo.phoneNumber") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("contactInfo.phoneNumber")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block font-medium mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={getFieldClassName("contactInfo.emailAddress")}
              value={form.contactInfo.emailAddress}
              onChange={(e) =>
                handleContactChange("emailAddress", e.target.value)
              }
              required
              aria-required="true"
            />
            {getFieldError("contactInfo.emailAddress") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("contactInfo.emailAddress")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block font-medium mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              type="text"
              className={getFieldClassName("contactInfo.address")}
              value={form.contactInfo.address}
              onChange={(e) => handleContactChange("address", e.target.value)}
              required
              aria-required="true"
            />
            {getFieldError("contactInfo.address") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("contactInfo.address")}
              </p>
            )}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-lg font-semibold">Operating Hours</h2>

          <div className="space-y-3">
            {form.operatingHours.map((day, index) => (
              <div key={day.day} className="flex flex-wrap items-center gap-2">
                <span className="w-24 font-medium">{day.day}</span>

                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={day.closed}
                    onChange={(e) =>
                      handleOperatingHoursChange(
                        index,
                        "closed",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Closed</span>
                </label>

                {!day.closed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      className="border p-1 rounded"
                      value={day.openTime}
                      onChange={(e) =>
                        handleOperatingHoursChange(
                          index,
                          "openTime",
                          e.target.value
                        )
                      }
                      disabled={day.closed}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      className="border p-1 rounded"
                      value={day.closeTime}
                      onChange={(e) =>
                        handleOperatingHoursChange(
                          index,
                          "closeTime",
                          e.target.value
                        )
                      }
                      disabled={day.closed}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!hasUnsavedChanges || isSubmitting || !validateForm()}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Export with Error Boundary
export default function EditResourceWithBoundary() {
  return (
    <ErrorBoundary>
      <EditResource />
    </ErrorBoundary>
  );
}
