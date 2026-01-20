import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useGetSingleResourceQuery } from "../../store/features/api/resourceApiSlice";

export default function ViewResource() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: resourceResponse,
    isLoading,
    isError,
    error,
  } = useGetSingleResourceQuery(id, { skip: !id });
  const resourceData = resourceResponse?.data || null;

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading resource details...
      </div>
    );

  if (isError || !resourceData) {
    const backendMessage = error?.data?.message || error?.message || null;
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
        <p className="text-gray-600 mb-4">
          {backendMessage ||
            "The resource you're looking for doesn't exist or couldn't be loaded."}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="primary" onClick={() => navigate("/resources")}>
            Back to Resources
          </Button>
          <Button variant="secondary" onClick={() => navigate(0)}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Normalize id for consistency
  const normalizedResource = { ...resourceData, id: resourceData.id };
  const {
    title,
    description,
    category,
    location,
    servicesAvailable,
    contactInfo,
    operatingHours,
    id: resourceId,
  } = normalizedResource;

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-600 mt-1">
            Category: {category?.name || "N/A"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/resources/${resourceId}/edit`)}
          >
            Edit
          </Button>
          <Button variant="secondary" onClick={() => navigate("/resources")}>
            Back
          </Button>
        </div>
      </div>

      {/* Resource Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {title}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {category?.name || "Uncategorized"}
          </span>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {location || "N/A"}
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {description || "N/A"}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {contactInfo?.phoneNumber || "N/A"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {contactInfo?.emailAddress || "N/A"}
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {contactInfo?.address || "N/A"}
          </p>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Operating Hours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(operatingHours) && operatingHours.length > 0 ? (
            operatingHours.map((dayInfo) => (
              <div
                key={dayInfo.day}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="font-medium capitalize">{dayInfo.day}</div>
                {dayInfo.closed ? (
                  <span className="text-red-600 font-medium">Closed</span>
                ) : (
                  <div className="text-gray-600">
                    {dayInfo.openTime} - {dayInfo.closeTime}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-gray-500">
              Operating hours not available.
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Available Services ({servicesAvailable?.length || 0})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesAvailable?.map((service, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 text-sm">{service}</h3>
            </div>
          )) || (
            <div className="col-span-full text-gray-500">
              No services listed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
