import { useState } from "react";
import { getFieldErrors } from "@/lib/api-error";

export const getFieldErrorId = (fieldName) => `${fieldName}-error`;

const resolveNativeMessage = (element, label) => {
  if (!element?.validity) return "";

  if (element.validity.valueMissing) {
    return `${label || "This field"} is required.`;
  }

  if (element.validity.typeMismatch) {
    if (element.type === "email") {
      return "Enter a valid email address.";
    }
    return `Enter a valid ${label?.toLowerCase() || "value"}.`;
  }

  if (element.validity.patternMismatch) {
    return `Enter a valid ${label?.toLowerCase() || "value"}.`;
  }

  if (element.validity.rangeUnderflow) {
    return `Value must be at least ${element.min}.`;
  }

  if (element.validity.rangeOverflow) {
    return `Value must be ${element.max} or less.`;
  }

  if (element.validity.tooShort) {
    return `${label || "This field"} is too short.`;
  }

  if (element.validity.tooLong) {
    return `${label || "This field"} is too long.`;
  }

  return "";
};

export const useInlineFormErrors = () => {
  const [fieldErrors, setFieldErrors] = useState({});

  const setFieldError = (fieldName, message) => {
    setFieldErrors((prev) => {
      if (!message) {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      }
      return { ...prev, [fieldName]: message };
    });
  };

  const clearAllFieldErrors = () => setFieldErrors({});

  const getFieldError = (fieldName) => fieldErrors[fieldName] || "";

  const getFieldA11yProps = (fieldName) => {
    const message = getFieldError(fieldName);
    return message
      ? {
          "aria-invalid": "true",
          "aria-describedby": getFieldErrorId(fieldName),
        }
      : {};
  };

  const validateField = (fieldName, element, options = {}) => {
    if (!element) return true;

    const customMessage =
      typeof options.customValidator === "function"
        ? options.customValidator(element.value, element)
        : "";
    const message = customMessage || resolveNativeMessage(element, options.label);

    setFieldError(fieldName, message);
    return !message;
  };

  const applyServerErrors = (error, fieldMap = {}) => {
    const errors = getFieldErrors(error);
    const normalized = Object.entries(errors).reduce((acc, [field, message]) => {
      acc[fieldMap[field] || field] = message;
      return acc;
    }, {});

    if (Object.keys(normalized).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...normalized }));
    }

    return normalized;
  };

  return {
    fieldErrors,
    setFieldError,
    clearAllFieldErrors,
    getFieldError,
    getFieldA11yProps,
    validateField,
    applyServerErrors,
  };
};
