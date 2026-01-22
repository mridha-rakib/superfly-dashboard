import { Filter, Users as UsersIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { splitCleanerPrice } from "../../lib/splitCleanerPrice";
import { useCleanerStore } from "../../state/cleanerStore";

const cardClass =
  "bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6";
const labelClass = "text-sm font-semibold text-gray-800 mb-2";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#C85344] focus:ring-2 focus:ring-[#C85344]/20 transition";
const sectionTitle = "text-xl font-semibold text-gray-900";
const hintClass = "text-xs text-gray-500";

const CreateBooking = () => {
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
    jobNote: "",

    // 4. Pricing & Payment
    totalPrice: "",
    cleanerPrice: "",

    // 5. New: Assigned cleaners (multi-select)
    assignedCleaners: [],
  });

  const [errors, setErrors] = useState({});
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const price = Number(formData.cleanerPrice);

    if (price > 0 && formData.assignedCleaners.length === 0) {
      nextErrors.assignedCleaners =
        "Assign at least one cleaner when a cleaner price is set.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = { ...formData };
    console.log("Final Payload:", payload);
    toast.success("Quote saved!");
  };

  const priceDistribution = splitCleanerPrice(
    Number(formData.cleanerPrice),
    formData.assignedCleaners
  );

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
              <option value="regular">Regular Cleaning</option>
              <option value="deep">Deep Cleaning</option>
              <option value="move-in">Move In Cleaning</option>
              <option value="move-out">Move Out Cleaning</option>
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
              Selected IDs will be sent as <code>assignedCleaners</code> in the payload.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-2">Cleaner Price Split</p>
            {priceDistribution.length === 0 ? (
              <p className="text-sm text-gray-500">Add cleaners to preview distribution.</p>
            ) : (
              <div className="space-y-2">
                {priceDistribution.map((row) => {
                  const cleaner = cleaners.find(
                    (c) => (c._id || c.id) === row.id
                  );
                  return (
                    <div
                      key={row.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-800">
                        {cleaner?.fullName || "Cleaner"} ({row.id.slice(0, 6)})
                      </span>
                      <span className="font-semibold text-gray-900">${row.amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className={hintClass}>
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
