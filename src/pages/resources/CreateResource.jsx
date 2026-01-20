import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateResourceMutation } from "../../store/features/api/resourceApiSlice";
import { useGetCategoriesQuery } from "../../store/features/api/categoryApiSlice";
import Button from "../../components/ui/Button";

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

export default function CreateResource() {
  const navigate = useNavigate();
  const [createResource, { isLoading }] = useCreateResourceMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "", // category ID
    location: "",
    servicesAvailable: [""],
    visibleFor: [],
    contactInfo: {
      phoneNumber: "",
      emailAddress: "",
      address: "",
    },
    operatingHours: DAYS.map((day) => ({
      day,
      closed: false,
      openTime: "09:00",
      closeTime: "17:00",
    })),
  });

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
    const newServices = [...form.servicesAvailable];
    newServices.splice(index, 1);
    setForm((prev) => ({ ...prev, servicesAvailable: newServices }));
  };

  const handleOperatingHoursChange = (index, field, value) => {
    const newHours = [...form.operatingHours];
    newHours[index][field] = value;
    setForm((prev) => ({ ...prev, operatingHours: newHours }));
  };

  const toggleVisibleFor = (role) => {
    setForm((prev) => ({
      ...prev,
      visibleFor: prev.visibleFor.includes(role)
        ? prev.visibleFor.filter((r) => r !== role)
        : [...prev.visibleFor, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    try {
      await createResource(form).unwrap();
      navigate("/resources");
    } catch (error) {
      console.error("Failed to create resource:", error);

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
        alert(
          error.data?.message ||
            error.message ||
            "Failed to create resource. Please try again."
        );
      }
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || null;
  };

  const getFieldClassName = (fieldName) => {
    const hasError = getFieldError(fieldName);
    return hasError
      ? "w-full border p-2 rounded border-red-500 focus:ring-red-500 focus:border-red-500"
      : "w-full border p-2 rounded focus:ring-blue-500 focus:border-blue-500";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold">Create Resource</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={getFieldClassName("title")}
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
          {getFieldError("title") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("title")}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className={getFieldClassName("description")}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            required
          />
          {getFieldError("description") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("description")}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          {isCategoriesLoading ? (
            <p>Loading categories...</p>
          ) : (
            <select
              className={getFieldClassName("category")}
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              required
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

        {/* Location */}
        <div>
          <label className="block font-medium mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={getFieldClassName("location")}
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            required
          />
          {getFieldError("location") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("location")}
            </p>
          )}
        </div>

        {/* Services */}
        <div>
          <label className="block font-medium mb-1">Services Available</label>
          {form.servicesAvailable.map((service, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                className="border p-2 rounded flex-1"
                value={service}
                onChange={(e) => handleServiceChange(index, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeService(index)}
                className="text-red-500 font-bold"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="text-blue-500 font-semibold"
          >
            + Add Service
          </button>
        </div>

        {/* Visible For */}
        <div>
          <label className="block font-medium mb-1">Visible For</label>
          <div className="flex gap-4">
            {ROLES.map((role) => (
              <label key={role} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={form.visibleFor.includes(role)}
                  onChange={() => toggleVisibleFor(role)}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={getFieldClassName("contactInfo.phoneNumber")}
              value={form.contactInfo.phoneNumber}
              onChange={(e) =>
                handleContactChange("phoneNumber", e.target.value)
              }
            />
            {getFieldError("contactInfo.phoneNumber") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("contactInfo.phoneNumber")}
              </p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Email Address</label>
            <input
              type="email"
              className={getFieldClassName("contactInfo.emailAddress")}
              value={form.contactInfo.emailAddress}
              onChange={(e) =>
                handleContactChange("emailAddress", e.target.value)
              }
            />
            {getFieldError("contactInfo.emailAddress") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("contactInfo.emailAddress")}
              </p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Address</label>
            <input
              type="text"
              className={getFieldClassName("contactInfo.address")}
              value={form.contactInfo.address}
              onChange={(e) => handleContactChange("address", e.target.value)}
            />
            {getFieldError("contactInfo.address") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("contactInfo.address")}
              </p>
            )}
          </div>
        </div>

        {/* Operating Hours */}
        <div>
          <h2 className="font-medium mb-2">Operating Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.operatingHours.map((day, index) => (
              <div key={day.day} className="flex gap-2 items-center">
                <span className="w-20">{day.day}</span>
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
                  />
                  Closed
                </label>
                {!day.closed && (
                  <>
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
                    />
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
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Resource"}
          </Button>
        </div>
      </form>
    </div>
  );
}
