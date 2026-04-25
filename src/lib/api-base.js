const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const normalizeConfiguredBaseUrl = (value = "") => {
  const trimmed = trimTrailingSlash(value.trim());
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+/, "")}`;
};

export const resolveApiBaseUrl = () => {
  const configured = normalizeConfiguredBaseUrl(import.meta.env.VITE_BASE_URL);
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    if (import.meta.env.PROD) {
      return "/api/v1";
    }

    return `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
  }

  return "http://localhost:8080/api/v1";
};

export const resolveSocketOrigin = () => {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  try {
    return new URL(resolveApiBaseUrl(), window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};
