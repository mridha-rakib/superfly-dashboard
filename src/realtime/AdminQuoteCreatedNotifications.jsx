import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "@/lib/notify";
import { useAuthStore } from "../state/authStore";

const ADMIN_ROLES = new Set(["admin", "super_admin"]);
const NOTIFICATION_REFRESH_EVENT = "admin-notifications:refresh";

const resolveSocketBaseUrl = () => {
  const configured = (import.meta.env.VITE_BASE_URL || "").trim();
  const fallback =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/v1`
      : "http://localhost:3000/api/v1";

  try {
    const url = new URL(
      configured || fallback,
      typeof window !== "undefined" ? window.location.origin : undefined,
    );
    return url.origin;
  } catch {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  }
};

const emitRefreshEvent = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATION_REFRESH_EVENT));
  }
};

const AdminQuoteCreatedNotifications = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role || state.user?.userType);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !ADMIN_ROLES.has(role || "")) {
      return undefined;
    }

    const socket = io(resolveSocketBaseUrl(), {
      path: "/ws",
      auth: { token: accessToken },
    });

    const onAdminQuoteCreated = (payload = {}) => {
      const service = payload.serviceType || "Booking";
      const clientName = payload.clientName || "Client";
      const message = `New ${service} quote/booking from ${clientName} (#${payload.quoteId || "N/A"})`;

      toast.info(message, {
        toastId: [
          "admin-quote-created",
          payload.quoteId || "unknown",
          payload.createdAt || Date.now(),
        ].join(":"),
      });
      emitRefreshEvent();
    };

    const onAdminReportSubmitted = (payload = {}) => {
      const service = payload.serviceType || "Booking";
      const message = `Job report submitted for ${service} (#${payload.quoteId || "N/A"})`;

      toast.info(message, {
        toastId: [
          "admin-report-submitted",
          payload.reportId || "unknown",
          payload.submittedAt || Date.now(),
        ].join(":"),
      });
      emitRefreshEvent();
    };

    const onAdminBookingCompleted = (payload = {}) => {
      const service = payload.serviceType || "Booking";
      const message = `${service} booking completed (#${payload.quoteId || "N/A"})`;

      toast.success(message, {
        toastId: [
          "admin-booking-completed",
          payload.quoteId || "unknown",
          payload.completedAt || Date.now(),
        ].join(":"),
      });
      emitRefreshEvent();
    };

    socket.on("admin:quote-created", onAdminQuoteCreated);
    socket.on("admin:report-submitted", onAdminReportSubmitted);
    socket.on("admin:booking-completed", onAdminBookingCompleted);

    return () => {
      socket.off("admin:quote-created", onAdminQuoteCreated);
      socket.off("admin:report-submitted", onAdminReportSubmitted);
      socket.off("admin:booking-completed", onAdminBookingCompleted);
      socket.disconnect();
    };
  }, [accessToken, isAuthenticated, role]);

  return null;
};

export default AdminQuoteCreatedNotifications;

