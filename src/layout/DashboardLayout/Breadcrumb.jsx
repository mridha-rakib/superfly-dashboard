import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length <= 1) return null;

  const displayPathnames = pathnames.slice(0, 2);

  const pathMap = {
    "": "Dashboard",
    users: "Users",
    view: "View",
    "content-moderation": "Content Moderation",
    analytics: "Analytics",
    products: "Products",
    "affiliated-data": "Affiliated Data",
    feedback: "Feedback",
    "data-management": "Data Management",
  };

  const formatBreadcrumb = (segment) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {displayPathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === displayPathnames.length - 1;

          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="w-4 h-4" />
              {isLast ? (
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {formatBreadcrumb(pathMap[value] || value)}
                </span>
              ) : (
                <Link
                  to={to}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {formatBreadcrumb(pathMap[value] || value)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
