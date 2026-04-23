const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

const STATUS_FALLBACKS = {
  400: "Please review the highlighted information and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "We couldn't find what you were looking for.",
  409: "This request conflicts with existing data. Please review and try again.",
  422: "Please correct the highlighted fields and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "We couldn't complete the request right now. Please try again.",
  502: "The service is temporarily unavailable. Please try again soon.",
  503: "The service is temporarily unavailable. Please try again soon.",
  504: "The server took too long to respond. Please try again.",
};

const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";
const TIMEOUT_ERROR_MESSAGE = "The request timed out. Please try again.";
const TECHNICAL_MESSAGE_PATTERN =
  /\b(ecconn|sql|mongo|casterror|traceback|stack|exception|socket hang up|timeout of \d+ms exceeded)\b/i;
const GENERIC_SERVER_MESSAGE_PATTERN = /^internal server error\.?$/i;

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === "[object Object]";

const coerceMessage = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
};

const isHelpfulMessage = (value) => {
  const message = coerceMessage(value);
  return (
    Boolean(message) &&
    message.length <= 240 &&
    !TECHNICAL_MESSAGE_PATTERN.test(message) &&
    !GENERIC_SERVER_MESSAGE_PATTERN.test(message)
  );
};

const appendMessages = (target, value) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => appendMessages(target, entry));
    return;
  }
  if (typeof value === "string") {
    target.push(value);
    return;
  }
  if (isPlainObject(value)) {
    appendMessages(target, value.message);
    appendMessages(target, value.error);
    appendMessages(target, value.detail);
    appendMessages(target, value.details);
  }
};

const readErrorData = (error) => error?.response?.data ?? error?.data ?? null;

export const getErrorStatus = (error) => error?.response?.status ?? error?.status ?? null;

export const getFieldErrors = (error) => {
  const data = readErrorData(error);
  const entries = data?.errors;

  if (Array.isArray(entries)) {
    return entries.reduce((acc, entry, index) => {
      if (!entry) return acc;
      const field = coerceMessage(entry.field || entry.path || `field_${index}`);
      const message = coerceMessage(entry.message || entry.error || entry.detail);
      if (field && message) {
        acc[field.replace(/^body\./, "")] = message;
      }
      return acc;
    }, {});
  }

  if (isPlainObject(entries)) {
    return Object.entries(entries).reduce((acc, [field, value]) => {
      const message = Array.isArray(value)
        ? coerceMessage(value.find(Boolean))
        : coerceMessage(value);
      if (message) {
        acc[field.replace(/^body\./, "")] = message;
      }
      return acc;
    }, {});
  }

  return {};
};

export const getErrorMessage = (error, fallback = DEFAULT_ERROR_MESSAGE) => {
  if (!error) return fallback;
  if (typeof error?.userMessage === "string" && error.userMessage.trim()) {
    return error.userMessage;
  }

  if (error?.code === "ECONNABORTED") {
    return TIMEOUT_ERROR_MESSAGE;
  }

  if (!error?.response && (error?.request || error?.message === "Network Error")) {
    return NETWORK_ERROR_MESSAGE;
  }

  const fieldErrors = getFieldErrors(error);
  const firstFieldError = Object.values(fieldErrors)[0];
  if (isHelpfulMessage(firstFieldError)) {
    return firstFieldError;
  }

  const candidates = [];
  const data = readErrorData(error);
  appendMessages(candidates, data?.message);
  appendMessages(candidates, data?.error);
  appendMessages(candidates, data?.detail);
  appendMessages(candidates, data?.details);
  appendMessages(candidates, error?.message);

  const helpfulMessage = candidates
    .map(coerceMessage)
    .find((message) => isHelpfulMessage(message));

  if (helpfulMessage) {
    return helpfulMessage;
  }

  const status = getErrorStatus(error);
  if (status && STATUS_FALLBACKS[status]) {
    return STATUS_FALLBACKS[status];
  }

  return fallback;
};

export const normalizeError = (error, fallback = DEFAULT_ERROR_MESSAGE) => {
  const fieldErrors = getFieldErrors(error);
  return {
    status: getErrorStatus(error),
    message: getErrorMessage(error, fallback),
    fieldErrors,
    isValidationError: Object.keys(fieldErrors).length > 0,
    isNetworkError: !error?.response && Boolean(error?.request),
  };
};

export const hydrateError = (error, fallback = DEFAULT_ERROR_MESSAGE) => {
  if (!error || typeof error !== "object") {
    return error;
  }

  const normalized = normalizeError(error, fallback);
  error.userMessage = normalized.message;
  error.fieldErrors = normalized.fieldErrors;
  error.statusCode = normalized.status;

  if (
    !error.message ||
    error.message === "Network Error" ||
    error.message.startsWith("Request failed with status code")
  ) {
    error.message = normalized.message;
  }

  return error;
};
