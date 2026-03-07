import { Filter, PieChart, Users as UsersIcon, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import CleaningScheduleFields from "../../components/booking/CleaningScheduleFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  SCHEDULE_ERROR_KEYS,
  buildCleaningSchedulePayload,
  createInitialCleaningScheduleState,
  validateCleaningSchedule,
} from "../../lib/cleaningSchedule";
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
const commercialServiceOptions = [
  { label: "Janitorial Services", value: "janitorial_services" },
  { label: "Carpet Cleaning", value: "carpet_cleaning" },
  { label: "Window Cleaning", value: "window_cleaning" },
  { label: "Pressure Washing", value: "pressure_washing" },
  { label: "Floor Cleaning", value: "floor_cleaning" },
];
const commercialServiceValues = new Set(
  commercialServiceOptions.map((opt) => opt.value)
);
const BOOKING_FORM_STEPS = [
  {
    id: "customer",
    label: "Customer Info",
    description: "Company and contact details",
  },
  {
    id: "cleaning",
    label: "Cleaning Details",
    description: "Service scope and category",
  },
  {
    id: "scheduling",
    label: "Scheduling",
    description: "Frequency and timing setup",
  },
  {
    id: "pricing",
    label: "Pricing & Payment",
    description: "Cost details, cleaners and confirmation",
  },
];
const STEP_ERROR_KEYS = {
  customer: ["businessName", "email", "phone", "city", "address"],
  cleaning: [
    "serviceType",
    "cleaningServices",
    "generalContractorName",
    "generalContractorPhone",
  ],
  scheduling: [...SCHEDULE_ERROR_KEYS],
  pricing: ["totalPrice", "cleanerPrice", "assignedCleaners"],
};

const normalizeCleaningServices = (services) => {
  if (!services || services.length === 0) return [];
  const normalized = services
    .map((service) => {
      if (!service) return null;
      const matchByValue = commercialServiceOptions.find(
        (opt) => opt.value === service
      );
      if (matchByValue) return matchByValue.value;
      const matchByLabel = commercialServiceOptions.find(
        (opt) => opt.label === service
      );
      if (matchByLabel) return matchByLabel.value;
      const normalizedValue = service
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
      return commercialServiceValues.has(normalizedValue)
        ? normalizedValue
        : null;
    })
    .filter(Boolean);
  return Array.from(new Set(normalized));
};

const CreateBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    cleaningSchedule: createInitialCleaningScheduleState(),
    cleaningServices: [],
    generalContractorName: "",
    generalContractorPhone: "",

    // 3. Scheduling
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
  const [activeStep, setActiveStep] = useState(BOOKING_FORM_STEPS[0].id);
  const [completedSteps, setCompletedSteps] = useState(
    BOOKING_FORM_STEPS.reduce((acc, step) => ({ ...acc, [step.id]: false }), {})
  );
  const isCommercial = formData.serviceType === "commercial";
  const isPostConstruction = formData.serviceType === "post_construction";

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
    const typeParam = searchParams.get("type");
    if (!typeParam) return;
    const normalized = typeParam.toLowerCase();
    let nextType = null;
    if (normalized.includes("commercial")) nextType = "commercial";
    if (normalized.includes("post")) nextType = "post_construction";
    if (!nextType) return;
    setFormData((prev) =>
      prev.serviceType ? prev : { ...prev, serviceType: nextType }
    );
  }, [searchParams]);

  useEffect(() => {
    if (!formData.cleaningServices.length) return;
    const normalized = normalizeCleaningServices(formData.cleaningServices);
    if (normalized.length === 0) return;
    if (
      normalized.length !== formData.cleaningServices.length ||
      normalized.some((value) => !formData.cleaningServices.includes(value))
    ) {
      setFormData((prev) => ({ ...prev, cleaningServices: normalized }));
    }
  }, [formData.cleaningServices]);

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

  const clearErrorsByKeys = (keys) => {
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  const handleFrequencyChange = (frequency) => {
    setFormData((prev) => ({
      ...prev,
      cleaningFrequency: frequency,
    }));
    clearErrorsByKeys(SCHEDULE_ERROR_KEYS);
  };

  const handleScheduleChange = (updater) => {
    setFormData((prev) => ({
      ...prev,
      cleaningSchedule:
        typeof updater === "function"
          ? updater(prev.cleaningSchedule)
          : updater,
    }));
    clearErrorsByKeys(SCHEDULE_ERROR_KEYS);
  };

  const toggleCleaningService = (service) => {
    setFormData((prev) => {
      const next = prev.cleaningServices.includes(service)
        ? prev.cleaningServices.filter((s) => s !== service)
        : [...prev.cleaningServices, service];
      return { ...prev, cleaningServices: next };
    });
    setErrors((prev) => ({ ...prev, cleaningServices: null }));
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

  const validateCustomerStep = () => {
    const stepErrors = {};
    if (!formData.businessName.trim()) {
      stepErrors.businessName =
        isCommercial || isPostConstruction
          ? "Company name is required."
          : "Business name is required.";
    }
    if (!formData.email.trim()) {
      stepErrors.email = isCommercial
        ? "Company email is required."
        : "Email address is required.";
    }
    if (!formData.phone.trim()) {
      stepErrors.phone = isCommercial
        ? "Company phone number is required."
        : "Phone number is required.";
    }
    if (isPostConstruction) {
      if (!formData.city.trim()) {
        stepErrors.city = "Site address is required.";
      }
    } else if (!formData.address.trim()) {
      stepErrors.address = isCommercial
        ? "Company address is required."
        : "Address is required.";
    }
    const message = Object.values(stepErrors)[0];
    return {
      isValid: Object.keys(stepErrors).length === 0,
      errors: stepErrors,
      message,
    };
  };

  const validateCleaningStep = () => {
    const stepErrors = {};
    if (!formData.serviceType) {
      stepErrors.serviceType = "Select a service type.";
    } else if (
      formData.serviceType !== "commercial" &&
      formData.serviceType !== "post_construction"
    ) {
      stepErrors.serviceType = "Only Commercial and Post-Construction are supported.";
    }

    const normalizedCleaningServices = normalizeCleaningServices(
      formData.cleaningServices
    );
    if (formData.serviceType === "commercial" && !normalizedCleaningServices.length) {
      stepErrors.cleaningServices = "Select at least one cleaning service.";
    }

    if (isPostConstruction && !formData.generalContractorName.trim()) {
      stepErrors.generalContractorName = "General contractor name is required.";
    }
    if (isPostConstruction && !formData.generalContractorPhone.trim()) {
      stepErrors.generalContractorPhone =
        "General contractor contact number is required.";
    }

    const message = Object.values(stepErrors)[0];
    return {
      isValid: Object.keys(stepErrors).length === 0,
      errors: stepErrors,
      message,
    };
  };

  const validateSchedulingStep = () => {
    const scheduleValidation = validateCleaningSchedule(
      formData.cleaningFrequency,
      formData.cleaningSchedule
    );
    return {
      isValid: scheduleValidation.isValid,
      errors: scheduleValidation.errors,
      message: scheduleValidation.firstError || "Invalid schedule.",
    };
  };

  const validatePricingStep = () => {
    const stepErrors = {};
    if (formData.totalPrice === "") {
      stepErrors.totalPrice = "Total price is required.";
    }
    if (
      formData.totalPrice !== "" &&
      (Number.isNaN(Number(formData.totalPrice)) || Number(formData.totalPrice) < 0)
    ) {
      stepErrors.totalPrice = "Total price must be zero or a positive number.";
    }
    if (formData.cleanerPrice === "") {
      stepErrors.cleanerPrice = "Cleaner price is required.";
    }
    if (
      formData.cleanerPrice !== "" &&
      (Number.isNaN(Number(formData.cleanerPrice)) || Number(formData.cleanerPrice) < 0)
    ) {
      stepErrors.cleanerPrice = "Cleaner price must be zero or a positive number.";
    }
    if (
      formData.totalPrice !== "" &&
      formData.cleanerPrice !== "" &&
      !Number.isNaN(Number(formData.totalPrice)) &&
      !Number.isNaN(Number(formData.cleanerPrice)) &&
      Number(formData.cleanerPrice) > Number(formData.totalPrice)
    ) {
      stepErrors.cleanerPrice = "Cleaner price cannot be greater than total price.";
    }
    if (!Array.isArray(formData.assignedCleaners) || formData.assignedCleaners.length === 0) {
      stepErrors.assignedCleaners = "Assign at least one cleaner.";
    }
    const message = Object.values(stepErrors)[0];
    return {
      isValid: Object.keys(stepErrors).length === 0,
      errors: stepErrors,
      message,
    };
  };

  const getStepValidation = (stepId) => {
    if (stepId === "customer") return validateCustomerStep();
    if (stepId === "cleaning") return validateCleaningStep();
    if (stepId === "scheduling") return validateSchedulingStep();
    if (stepId === "pricing") return validatePricingStep();
    return { isValid: true, errors: {}, message: "" };
  };

  const runStepValidation = (stepId, showToast = true) => {
    const validation = getStepValidation(stepId);
    if (!validation.isValid) {
      setErrors((prev) => ({ ...prev, ...validation.errors }));
      if (showToast && validation.message) {
        toast.error(validation.message);
      }
      return false;
    }
    clearErrorsByKeys(STEP_ERROR_KEYS[stepId] || []);
    return true;
  };

  const isStepUnlocked = (stepId) => {
    const targetIndex = BOOKING_FORM_STEPS.findIndex((step) => step.id === stepId);
    if (targetIndex <= 0) return true;
    return BOOKING_FORM_STEPS.slice(0, targetIndex).every(
      (step) => completedSteps[step.id]
    );
  };

  const markStepCompleted = (stepId) => {
    setCompletedSteps((prev) => ({ ...prev, [stepId]: true }));
  };

  const handleStepChange = (nextStepId) => {
    if (!isStepUnlocked(nextStepId)) {
      toast.info("Complete previous tab before moving to this one.");
      return;
    }
    setActiveStep(nextStepId);
  };

  const handleNextStep = () => {
    const currentIndex = BOOKING_FORM_STEPS.findIndex((step) => step.id === activeStep);
    if (currentIndex === -1) return;
    const currentStepId = BOOKING_FORM_STEPS[currentIndex].id;
    if (!runStepValidation(currentStepId)) return;
    markStepCompleted(currentStepId);
    const nextStep = BOOKING_FORM_STEPS[currentIndex + 1];
    if (nextStep) {
      setActiveStep(nextStep.id);
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = BOOKING_FORM_STEPS.findIndex((step) => step.id === activeStep);
    if (currentIndex <= 0) return;
    setActiveStep(BOOKING_FORM_STEPS[currentIndex - 1].id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const activeIndex = BOOKING_FORM_STEPS.findIndex((step) => step.id === activeStep);
    const isLastStep = activeIndex === BOOKING_FORM_STEPS.length - 1;

    if (!isLastStep) {
      handleNextStep();
      return;
    }

    if (isSubmitting) return;

    let firstInvalidStep = null;
    for (const step of BOOKING_FORM_STEPS) {
      const validation = getStepValidation(step.id);
      if (!validation.isValid) {
        setErrors((prev) => ({ ...prev, ...validation.errors }));
        firstInvalidStep = {
          id: step.id,
          message: validation.message,
        };
        break;
      }
      clearErrorsByKeys(STEP_ERROR_KEYS[step.id] || []);
    }

    if (firstInvalidStep) {
      setActiveStep(firstInvalidStep.id);
      toast.error(firstInvalidStep.message || "Please complete the required fields.");
      return;
    }

    setCompletedSteps(
      BOOKING_FORM_STEPS.reduce(
        (acc, step) => ({ ...acc, [step.id]: true }),
        {}
      )
    );

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const normalizedCleaningServices = normalizeCleaningServices(
        formData.cleaningServices
      );
      const cleaningSchedule = buildCleaningSchedulePayload(
        formData.cleaningFrequency,
        formData.cleaningSchedule
      );
      if (!cleaningSchedule) {
        throw new Error("Invalid cleaning schedule payload.");
      }

      const businessAddress = isPostConstruction
        ? formData.city.trim()
        : [formData.address, formData.city].filter(Boolean).join(", ").trim();

      const payload = {
        serviceType: formData.serviceType,
        name: formData.businessName,
        companyName: formData.businessName,
        email: formData.email,
        phoneNumber: formData.phone,
        businessAddress,
        preferredDate:
          cleaningSchedule.frequency === "one_time"
            ? cleaningSchedule.schedule.date
            : undefined,
        preferredTime:
          cleaningSchedule.frequency === "one_time"
            ? cleaningSchedule.schedule.start_time
            : undefined,
        specialRequest: formData.jobNote?.trim() || "N/A",
        squareFoot: formData.squareFoot,
        totalPrice: Number(formData.totalPrice) || undefined,
        cleanerPrice: Number(formData.cleanerPrice) || undefined,
        assignedCleanerIds: formData.assignedCleaners,
        cleaningFrequency:
          cleaningSchedule.frequency === "one_time"
            ? "one-time"
            : cleaningSchedule.frequency,
        cleaningSchedule,
        cleaningServices: normalizedCleaningServices.length
          ? normalizedCleaningServices
          : undefined,
        generalContractorName: formData.generalContractorName?.trim() || undefined,
        generalContractorPhone: formData.generalContractorPhone?.trim() || undefined,
      };

      payload.preferredDate = payload.preferredDate
        ? new Date(payload.preferredDate).toISOString().slice(0, 10)
        : undefined;
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
      const isManualRequest =
        formData.serviceType === "commercial" ||
        formData.serviceType === "post_construction";
      navigate(isManualRequest ? "/service-requests" : "/bookings");
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
  const activeStepIndex = BOOKING_FORM_STEPS.findIndex(
    (step) => step.id === activeStep
  );
  const isFirstStep = activeStepIndex <= 0;
  const isLastStep = activeStepIndex === BOOKING_FORM_STEPS.length - 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C85344]">
              Service Request Wizard
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              Complete each tab before moving forward
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#C85344]/10 px-3 py-1 text-xs font-semibold text-[#C85344]">
            Step {activeStepIndex + 1} of {BOOKING_FORM_STEPS.length}
          </span>
        </div>

        <Tabs value={activeStep} onValueChange={handleStepChange}>
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-[#f7f3f2] p-1.5 sm:grid-cols-2 lg:grid-cols-4">
            {BOOKING_FORM_STEPS.map((step, index) => {
              const unlocked = isStepUnlocked(step.id);
              const completed = completedSteps[step.id];
              return (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  disabled={!unlocked}
                  className="w-full items-start justify-start px-3 py-2 text-left"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wide text-gray-500">
                      {completed ? "Completed" : `Step ${index + 1}`}
                    </span>
                    <span className="text-sm font-semibold">{step.label}</span>
                    <span className="text-[11px] text-gray-500">{step.description}</span>
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="customer" className="mt-6">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    {isCommercial || isPostConstruction ? "Company Name" : "Business Name"}
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    {isCommercial ? "Company Email" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className={labelClass}>
                    {isCommercial ? "Company Phone Number" : "Phone Number"}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
                <div>
                  <label className={labelClass}>
                    {isPostConstruction ? "Site Address" : "City / Area"}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>
                {!isPostConstruction && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      {isCommercial ? "Company Address" : "Address"}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="cleaning" className="mt-6">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  {errors.serviceType && (
                    <p className="mt-1 text-xs text-red-600">{errors.serviceType}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    {isPostConstruction
                      ? "Total Square Footage (sq ft)"
                      : "Building Size (sq ft)"}
                  </label>
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

              {formData.serviceType === "commercial" && (
                <div className="mt-6">
                  <label className="mb-3 block font-medium text-gray-900">
                    Type of Cleaning Services
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {commercialServiceOptions.map((serviceOption) => {
                      const checked = formData.cleaningServices.includes(
                        serviceOption.value
                      );
                      return (
                        <label
                          key={serviceOption.value}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            checked
                              ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCleaningService(serviceOption.value)}
                            className="h-4 w-4 accent-[#C85344]"
                          />
                          {serviceOption.label}
                        </label>
                      );
                    })}
                  </div>
                  {errors.cleaningServices && (
                    <p className="mt-2 text-xs text-red-600">{errors.cleaningServices}</p>
                  )}
                </div>
              )}

              {isPostConstruction && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>General Contractor Name</label>
                    <input
                      type="text"
                      name="generalContractorName"
                      value={formData.generalContractorName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    {errors.generalContractorName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.generalContractorName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      General Contractor Contact Number
                    </label>
                    <input
                      type="text"
                      name="generalContractorPhone"
                      value={formData.generalContractorPhone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    {errors.generalContractorPhone && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.generalContractorPhone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="scheduling" className="mt-6">
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

              {(isCommercial || isPostConstruction) && (
                <div className="mt-2">
                  <label className="mb-3 block font-medium text-gray-900">
                    Cleaning Frequency
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["one-time", "weekly", "monthly"].map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => handleFrequencyChange(freq)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
              )}

              <CleaningScheduleFields
                frequency={formData.cleaningFrequency}
                schedule={formData.cleaningSchedule}
                errors={errors}
                onScheduleChange={handleScheduleChange}
              />

              <div className="mt-4">
                <label className={labelClass}>
                  {isCommercial || isPostConstruction ? "Special Request" : "Job Note"}
                </label>
                <textarea
                  name="jobNote"
                  value={formData.jobNote}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputClass} min-h-[120px]`}
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  {errors.totalPrice && (
                    <p className="mt-1 text-xs text-red-600">{errors.totalPrice}</p>
                  )}
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
                  {errors.cleanerPrice && (
                    <p className="mt-1 text-xs text-red-600">{errors.cleanerPrice}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-3">
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
                    <div className="max-h-52 divide-y divide-gray-100 overflow-y-auto">
                      {isLoadingList ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Loading cleaners...</div>
                      ) : filteredCleaners.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No cleaners found.</div>
                      ) : (
                        filteredCleaners.map((cleaner) => {
                          const id = cleaner._id || cleaner.id;
                          const selected = formData.assignedCleaners.includes(id);
                          return (
                            <label
                              key={id}
                              className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-white"
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
                                <span className="ml-auto rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
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
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Avg / cleaner
                        </p>
                        <p className="text-sm font-semibold text-gray-900">${avgCleanerPrice}</p>
                      </div>
                    </div>
                  </div>

                  {priceDistribution.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center">
                      <p className="text-sm text-gray-600">
                        Add cleaners to preview distribution.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {priceDistribution.map((row, idx) => {
                        const cleaner = cleaners.find((c) => (c._id || c.id) === row.id);
                        return (
                          <div
                            key={row.id}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-gray-500">
                                #{idx + 1}
                              </span>
                              <span className="text-gray-800">
                                {cleaner?.fullName || "Cleaner"} ({(row.id || "").slice(0, 6)})
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              ${row.amount.toFixed(2)}
                            </span>
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
            </section>
          </TabsContent>
        </Tabs>
      </section>

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate("/service-requests")}
          className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100"
        >
          Cancel
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={isFirstStep}
            className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          {isLastStep ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#C85344] px-6 py-3 font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Assign & Confirm Booking"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              className="rounded-xl bg-[#C85344] px-6 py-3 font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              Save & Continue
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateBooking;
