import React, { useMemo } from "react";
import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { sidebarLinks } from "../../data/dashboardData";
import { useAuthStore } from "../../state/authStore";
import userPlaceholder from "../../assets/images/user-dummy.png";

const pageMeta = {
  "/": { title: "Welcome Back, Admin", subtitle: "Today's Overview" },
  "/bookings": { title: "Bookings", subtitle: "Manage all bookings" },
  "/users": { title: "Cleaners", subtitle: "Team roster" },
  "/pricing": { title: "Pricing", subtitle: "Plans & rates" },
  "/job-reports": { title: "Job Reports", subtitle: "Performance overview" },
  "/settings": { title: "Settings", subtitle: "Configure your workspace" },
};

const getPageInfo = (pathname) => {
  const basePath = pathname === "/" ? "/" : `/${pathname.split("/")[1] || ""}`;
  if (pageMeta[basePath]) return pageMeta[basePath];

  const linkMatch = sidebarLinks.find((link) => basePath.startsWith(link.href));
  if (linkMatch) return { title: linkMatch.label, subtitle: "" };

  const fallback = basePath.replace("/", "") || "Dashboard";
  return { title: fallback.charAt(0).toUpperCase() + fallback.slice(1), subtitle: "" };
};

const formatRole = (role) =>
  (role || "admin")
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const PageHeader = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { title, subtitle } = getPageInfo(location.pathname);

  const { displayName, displayRole, avatarUrl } = useMemo(() => {
    const name =
      user?.fullName ||
      user?.name ||
      (user?.email ? user.email.split("@")[0] : null) ||
      "Admin";

    const role = formatRole(user?.role);

    const avatar =
      user?.profileImage ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C85344&color=fff`;

    return {
      displayName: name,
      displayRole: role,
      avatarUrl: avatar || userPlaceholder,
    };
  }, [user]);

  const dynamicTitle = location.pathname === "/" ? `Welcome Back, ${displayName}` : title;

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
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:text-[#C85344]"
            aria-label="Notifications"
            type="button"
          >
            <Bell className="h-5 w-5" />
          </button>
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
