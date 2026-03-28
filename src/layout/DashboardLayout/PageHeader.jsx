import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getErrorMessage } from "@/lib/api-error";
import userPlaceholder from "../../assets/images/user-dummy.png";
import { sidebarLinks } from "../../data/dashboardData";
import { quoteApi } from "../../services/quoteApi";
import { useAuthStore } from "../../state/authStore";

const ADMIN_ROLES = new Set(["admin", "super_admin"]);
const NOTIFICATION_REFRESH_EVENT = "admin-notifications:refresh";

const pageMeta = {
  "/": { title: "Welcome Back, Admin", subtitle: "Today's Overview" },
  "/bookings": { title: "Bookings", subtitle: "Manage all bookings" },
  "/bookings/residential": {
    title: "Residential Bookings",
    subtitle: "Manage residential quotes & bookings",
  },
  "/bookings/commercial": {
    title: "Commercial Bookings",
    subtitle: "Manage commercial quotes & bookings",
  },
  "/bookings/post-construction": {
    title: "Post-Construction Bookings",
    subtitle: "Manage post-construction quotes & bookings",
  },
  "/users": { title: "Cleaners", subtitle: "Team roster" },
  "/clients": { title: "Clients", subtitle: "Authorized and guest clients" },
  "/pricing": { title: "Pricing", subtitle: "Plans & rates" },
  "/job-reports": { title: "Job Reports", subtitle: "Performance overview" },
  "/settings": { title: "Settings", subtitle: "Configure your workspace" },
};

const eventLabelMap = {
  quote_submitted: "New Booking",
  report_submitted: "Job Report",
  booking_completed: "Completed",
};

const parseError = (error) => getErrorMessage(error, "Failed to load notifications.");

const formatRole = (role) =>
  (role || "admin")
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const getPageInfo = (pathname) => {
  if (pathname.startsWith("/bookings/residential")) {
    return pageMeta["/bookings/residential"];
  }
  if (pathname.startsWith("/bookings/commercial")) {
    return pageMeta["/bookings/commercial"];
  }
  if (pathname.startsWith("/bookings/post-construction")) {
    return pageMeta["/bookings/post-construction"];
  }
  if (pageMeta[pathname]) return pageMeta[pathname];
  const exactLink = sidebarLinks.find((link) => link.href === pathname);
  if (exactLink) return { title: exactLink.label, subtitle: "" };

  const basePath = pathname === "/" ? "/" : `/${pathname.split("/")[1] || ""}`;
  if (pageMeta[basePath]) return pageMeta[basePath];

  const linkMatch = sidebarLinks.find((link) => basePath.startsWith(link.href));
  if (linkMatch) return { title: linkMatch.label, subtitle: "" };

  const fallback = basePath.replace("/", "") || "Dashboard";
  return {
    title: fallback.charAt(0).toUpperCase() + fallback.slice(1),
    subtitle: "",
  };
};

const formatNotificationTime = (value) => {
  if (!value) return "Recently";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "Recently";
  }
};

const PageHeader = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { title, subtitle } = getPageInfo(location.pathname);
  const notificationRef = useRef(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const isAdminUser = useMemo(
    () => ADMIN_ROLES.has((user?.role || user?.userType || "").toLowerCase()),
    [user?.role, user?.userType],
  );

  const { displayName, displayRole, avatarUrl } = useMemo(() => {
    const name =
      user?.fullName ||
      user?.name ||
      (user?.email ? user.email.split("@")[0] : null) ||
      "Admin";

    const avatar =
      user?.profileImage ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C85344&color=fff`;

    return {
      displayName: name,
      displayRole: formatRole(user?.role),
      avatarUrl: avatar || userPlaceholder,
    };
  }, [user]);

  const loadNotifications = useCallback(
    async (showLoader = false) => {
      if (!isAdminUser) return;

      if (showLoader) {
        setIsLoadingNotifications(true);
      }
      setNotificationError("");

      try {
        const response = await quoteApi.listAdminNotifications({
          page: 1,
          limit: 20,
        });
        const payload = response?.data || response || {};
        const items = Array.isArray(payload.items) ? payload.items : [];
        const totalUnread =
          Number(payload.unreadCount) ||
          items.filter((item) => !item?.isRead).length;

        setNotifications(items);
        setUnreadCount(Math.max(0, totalUnread));
      } catch (error) {
        setNotificationError(parseError(error));
      } finally {
        if (showLoader) {
          setIsLoadingNotifications(false);
        }
      }
    },
    [isAdminUser],
  );

  useEffect(() => {
    if (!isAdminUser) {
      return;
    }

    loadNotifications(true);
  }, [isAdminUser, loadNotifications]);

  useEffect(() => {
    if (!isNotificationOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    if (!isAdminUser || typeof window === "undefined") {
      return undefined;
    }

    const handleRealtimeRefresh = () => {
      loadNotifications(false);
    };

    window.addEventListener(NOTIFICATION_REFRESH_EVENT, handleRealtimeRefresh);
    return () => {
      window.removeEventListener(
        NOTIFICATION_REFRESH_EVENT,
        handleRealtimeRefresh,
      );
    };
  }, [isAdminUser, loadNotifications]);

  const handleBellClick = async () => {
    const nextOpen = !isNotificationOpen;
    setIsNotificationOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications(true);
    }
  };

  const handleNotificationClick = async (notification) => {
    const notificationId = notification?._id;
    if (!notificationId || notification.isRead) {
      return;
    }

    setNotifications((prev) =>
      prev.map((item) =>
        item?._id === notificationId
          ? { ...item, isRead: true, readAt: new Date().toISOString() }
          : item,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await quoteApi.markAdminNotificationAsRead(notificationId);
    } catch {
      await loadNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount || isMarkingAll) {
      return;
    }

    setIsMarkingAll(true);
    setNotifications((prev) =>
      prev.map((item) =>
        item?.isRead ? item : { ...item, isRead: true, readAt: new Date().toISOString() },
      ),
    );
    setUnreadCount(0);

    try {
      await quoteApi.markAllAdminNotificationsAsRead();
    } catch {
      await loadNotifications(false);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const dynamicTitle =
    location.pathname === "/" ? `Welcome Back, ${displayName}` : title;

  return (
    <div className="sticky top-0 z-20 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
            {dynamicTitle} {location.pathname === "/" ? "👋" : ""}
          </h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div ref={notificationRef} className="relative">
            <button
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:text-[#C85344]"
              aria-label="Notifications"
              type="button"
              onClick={handleBellClick}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#C85344] px-1 text-[11px] font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-full z-[120] mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Notifications
                  </p>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={!unreadCount || isMarkingAll}
                    className="text-xs font-semibold text-[#C85344] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isMarkingAll ? "Marking..." : "Mark all read"}
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isLoadingNotifications ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notificationError ? (
                    <div className="px-4 py-6 text-center text-sm text-red-500">
                      {notificationError}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const isRead = Boolean(notification?.isRead);
                      const eventLabel =
                        eventLabelMap[notification?.event] || "Update";

                      return (
                        <button
                          key={notification?._id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 ${
                            isRead ? "bg-white hover:bg-gray-50" : "bg-[#FFF4F2] hover:bg-[#FFEDE9]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                isRead ? "bg-gray-300" : "bg-[#C85344]"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {notification?.title || "Notification"}
                              </p>
                              <p className="mt-1 text-xs text-gray-600">
                                {notification?.message || "You have a new update."}
                              </p>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                                  {eventLabel}
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  {formatNotificationTime(notification?.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <img
              src={avatarUrl || userPlaceholder}
              alt={displayName}
              className="h-11 w-11 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = userPlaceholder;
              }}
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{displayRole}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
