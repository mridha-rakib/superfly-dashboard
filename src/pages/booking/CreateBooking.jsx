import { Filter, PieChart, Users as UsersIcon, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { splitCleanerPrice } from "../../lib/splitCleanerPrice";
import { useCleanerStore } from "../../state/cleanerStore";
import { quoteApi } from "../../services/quoteApi";

const cardClass =
  "bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6";
const labelClass = "text-sm font-semibold text-gray-800 mb-2";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#C85344] focus:ring-2 focus:ring-[#C85344]/20 transition";
const sectionTitle = "text-xl font-semibold text-gray-900";
const hintClass = "text-xs text-gray-500";

const CreateBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // 1. Customer Info
    businessName: "",
    email: "",
    phone: "",
    city: "",
    address: "",

    // 2. Cleaning Details
    serviceType: "",
    squareFoot: "",
    cleaningFrequency: "one-time",

    // 3. Scheduling
    preferredDate: "",
    startTime: "",
    endTime: "",
    assignedCleaner: "",
    jobNote: "",

    // 4. Pricing & Payment
    totalPrice: "",
    cleanerPrice: "",

    // 5. New: Assigned cleaners (multi-select)
    assignedCleaners: [],
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cleanerSearch, setCleanerSearch] = useState("");

  const {
    cleaners,
    isLoadingList,
    fetchCleaners,
    clearError,
    error: cleanerError,
  } = useCleanerStore();

  useEffect(() => {
    fetchCleaners({ limit: 100 }).catch(() => {
      toast.error("Failed to load cleaners.");
    });
    return () => clearError();
  }, [fetchCleaners, clearError]);

  useEffect(() => {
    if (cleanerError) {
      toast.error(cleanerError);
    }
  }, [cleanerError]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const filteredCleaners = useMemo(() => {
    if (!cleanerSearch.trim()) return cleaners;
    const q = cleanerSearch.toLowerCase();
    return cleaners.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [cleaners, cleanerSearch]);

  const toggleCleaner = (id) => {
    setFormData((prev) => {
      const exists = prev.assignedCleaners.includes(id);
      const next = exists
        ? prev.assignedCleaners.filter((c) => c !== id)
        : [...prev.assignedCleaners, id];
      return { ...prev, assignedCleaners: next };
    });
    setErrors((prev) => ({ ...prev, assignedCleaners: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const missingFields = [];
      if (!formData.businessName.trim()) missingFields.push("Business Name");
      if (!formData.email.trim()) missingFields.push("Email");
      if (!formData.phone.trim()) missingFields.push("Phone");
      if (!formData.address.trim()) missingFields.push("Address");
      if (!formData.preferredDate) missingFields.push("Preferred Date");
      if (!formData.startTime) missingFields.push("Preferred Time");

      if (missingFields.length) {
        throw new Error(`Please fill: ${missingFields.join(", ")}`);
      }

      if (!formData.serviceType) {
        throw new Error("Select a service type before submitting.");
      }

      if (
        formData.serviceType !== "commercial" &&
        formData.serviceType !== "post_construction"
      ) {
        throw new Error("Only Commercial and Post-Construction are supported.");
      }

      const businessAddress = [formData.address, formData.city]
        .filter(Boolean)
        .join(", ")
        .trim();

      const payload = {
        serviceType: formData.serviceType,
        name: formData.businessName,
        companyName: formData.businessName,
        email: formData.email,
        phoneNumber: formData.phone,
        businessAddress,
        preferredDate: formData.preferredDate,
        preferredTime: formData.startTime,
        specialRequest: formData.jobNote?.trim() || "N/A",
        squareFoot: formData.squareFoot,
        totalPrice: Number(formData.totalPrice) || undefined,
        cleanerPrice: Number(formData.cleanerPrice) || undefined,
        assignedCleanerIds: formData.assignedCleaners,
        cleaningFrequency: formData.cleaningFrequency,
      };

      payload.preferredDate = payload.preferredDate
        ? new Date(payload.preferredDate).toISOString().slice(0, 10)
        : "";
      payload.totalPrice =
        payload.totalPrice !== undefined && payload.totalPrice !== null
          ? Number(payload.totalPrice)
          : undefined;
      payload.cleanerPrice =
        payload.cleanerPrice !== undefined && payload.cleanerPrice !== null
          ? Number(payload.cleanerPrice)
          : undefined;
      payload.squareFoot =
        payload.squareFoot !== undefined && payload.squareFoot !== ""
          ? Number(payload.squareFoot)
          : undefined;

      await quoteApi.createAdminServiceRequest(payload);

      toast.success("Booking created");
      navigate("/bookings");
    } catch (err) {
      const raw = err?.response?.data;
      const msg =
        Array.isArray(raw?.issues)
          ? raw.issues.map((i) => i.message).join("; ")
          : raw?.message ||
            raw?.error ||
            raw?.errorMessage ||
            (typeof raw === "string" ? raw : null) ||
            err?.message ||
            "Failed to create booking.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceDistribution = splitCleanerPrice(
    Number(formData.cleanerPrice),
    formData.assignedCleaners
  );
  const selectedCount = formData.assignedCleaners.length;
  const totalCleanerPrice = Number(formData.cleanerPrice) || 0;
  const avgCleanerPrice =
    selectedCount > 0 ? (totalCleanerPrice / selectedCount).toFixed(2) : "0.00";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Info */}
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C85344]">
              Customer
            </p>
            <h2 className={sectionTitle}>Customer Information</h2>
            <p className="text-sm text-gray-500">
              Basic contact and location details for this booking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>City / Area</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Cleaning Details */}
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C85344]">
              Cleaning
            </p>
            <h2 className={sectionTitle}>Cleaning Details</h2>
            <p className="text-sm text-gray-500">
              Scope, size, and cadence of the cleaning request.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Service</option>
              <option value="commercial">Commercial Cleaning</option>
              <option value="post_construction">Post-Construction Cleaning</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Square Foot</label>
            <input
              type="number"
              name="squareFoot"
              value={formData.squareFoot}
              onChange={handleChange}
              className={inputClass}
              min="0"
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="block mb-3 font-medium text-gray-900">
            Cleaning Frequency
          </label>
          <div className="flex flex-wrap gap-3">
            {["one-time", "weekly", "bi-weekly", "monthly"].map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "cleaningFrequency", value: freq },
                  })
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                  formData.cleaningFrequency === freq
                    ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {freq.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Scheduling */}
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C85344]">
              Schedule
            </p>
            <h2 className={sectionTitle}>Scheduling</h2>
            <p className="text-sm text-gray-500">
              When and who will handle this booking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Preferred Date</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          <div className="lg:col-span-2">
            <label className={labelClass}>Assigned Cleaners (multi-select)</label>
            <div className="rounded-2xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
                <UsersIcon className="h-4 w-4 text-[#C85344]" />
                <input
                  type="text"
                  placeholder="Search cleaners by name or email"
                  value={cleanerSearch}
                  onChange={(e) => setCleanerSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                {isLoadingList ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Loading cleaners…</div>
                ) : filteredCleaners.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No cleaners found.</div>
                ) : (
                  filteredCleaners.map((cleaner) => {
                    const id = cleaner._id || cleaner.id;
                    const selected = formData.assignedCleaners.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleCleaner(id)}
                          className="h-4 w-4 accent-[#C85344]"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {cleaner.fullName || "Unnamed Cleaner"}
                          </span>
                          <span className="text-xs text-gray-500">{cleaner.email}</span>
                        </div>
                        {cleaner.accountStatus && (
                          <span className="ml-auto text-xs rounded-full px-2 py-1 bg-gray-100 text-gray-600">
                            {cleaner.accountStatus}
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
            {errors.assignedCleaners && (
              <p className="mt-2 text-sm text-red-600">{errors.assignedCleaners}</p>
            )}
            <p className={hintClass}>
              Selected IDs will be sent as <code>assignedCleanerIds</code> in the payload.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#C85344]">
                  Cleaner Price Split
                </p>
                <p className="text-sm text-gray-600">
                  Visualize how the cleaner price is distributed.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#C85344]/10 px-3 py-1 text-[11px] font-semibold text-[#C85344]">
                  <Wallet className="h-3.5 w-3.5" />
                  ${totalCleanerPrice.toFixed(2)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700">
                  <UsersIcon className="h-3.5 w-3.5" />
                  {selectedCount} selected
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                  <PieChart className="h-5 w-5 text-[#C85344]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Even split preview</p>
                  <p className="text-[11px] text-gray-500">
                    Remainder is added to the first cleaner automatically.
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Avg / cleaner</p>
                  <p className="text-sm font-semibold text-gray-900">${avgCleanerPrice}</p>
                </div>
              </div>
            </div>

            {priceDistribution.length === 0 ? (
              <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center">
                <p className="text-sm text-gray-600">Add cleaners to preview distribution.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {priceDistribution.map((row, idx) => {
                  const cleaner = cleaners.find(
                    (c) => (c._id || c.id) === row.id
                  );
                  return (
                    <div
                      key={row.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-500">#{idx + 1}</span>
                        <span className="text-gray-800">
                          {cleaner?.fullName || "Cleaner"} ({(row.id || "").slice(0, 6)})
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">${row.amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-[11px] text-gray-500">
              Even split with remainder added to the first cleaner.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Job Note</label>
          <textarea
            name="jobNote"
            value={formData.jobNote}
            onChange={handleChange}
            rows={4}
            className={`${inputClass} min-h-[120px]`}
          />
        </div>
      </section>

      {/* Pricing */}
      <section className={cardClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C85344]">
              Pricing
            </p>
            <h2 className={sectionTitle}>Pricing & Payment</h2>
            <p className="text-sm text-gray-500">
              Keep cleaner price intact; distribution is computed automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Total Price</label>
            <input
              type="number"
              name="totalPrice"
              value={formData.totalPrice}
              onChange={handleChange}
              className={inputClass}
              min="0"
            />
          </div>

          <div>
            <label className={labelClass}>Cleaner Price</label>
            <input
              type="number"
              name="cleanerPrice"
              value={formData.cleanerPrice}
              onChange={handleChange}
              className={inputClass}
              min="0"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-2">
        <button
          type="button"
          className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#C85344] text-white font-semibold shadow-sm hover:brightness-95 transition"
        >
          Assign & Confirm Booking
        </button>
      </div>
    </form>
  );
};

export default CreateBooking;
