import { useEffect } from "react";
import { toast } from "@/lib/notify";
import { resolveSocketOrigin } from "@/lib/api-base";
import { useAuthStore } from "../state/authStore";

const ADMIN_ROLES = new Set(["admin", "super_admin"]);
const NOTIFICATION_REFRESH_EVENT = "admin-notifications:refresh";

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

    let isActive = true;
    let socket;

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

    const connect = async () => {
      try {
        const { io } = await import("socket.io-client");
        if (!isActive) {
          return;
        }

        socket = io(resolveSocketOrigin(), {
          path: "/ws",
          auth: { token: accessToken },
        });

        socket.on("admin:quote-created", onAdminQuoteCreated);
        socket.on("admin:report-submitted", onAdminReportSubmitted);
        socket.on("admin:booking-completed", onAdminBookingCompleted);
      } catch (error) {
        console.error("Failed to initialize admin realtime notifications", error);
      }
    };

    void connect();

    return () => {
      isActive = false;
      if (!socket) {
        return;
      }
      socket.off("admin:quote-created", onAdminQuoteCreated);
      socket.off("admin:report-submitted", onAdminReportSubmitted);
      socket.off("admin:booking-completed", onAdminBookingCompleted);
      socket.disconnect();
    };
  }, [accessToken, isAuthenticated, role]);

  return null;
};

export default AdminQuoteCreatedNotifications;
