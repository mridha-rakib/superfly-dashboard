// src/components/layout/Sidebar/SidebarItem.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserMultipleIcon,
  Settings01Icon,
  AnalyticsUpIcon,
  CreditCardPosIcon,
  Appointment02Icon,
} from "@hugeicons/core-free-icons";

const SidebarItem = ({ item, isActive, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = () => {
    if (item.hasView) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleViewClick = (e, viewPath) => {
    e.stopPropagation();
    navigate(viewPath);
  };

  // Icon mapping
  const iconMap = {
    Dashboard: <HugeiconsIcon icon={DashboardSquare01Icon} />,
    Bookings: <HugeiconsIcon icon={Appointment02Icon} />,
    Users: <HugeiconsIcon icon={UserMultipleIcon} />,
    Pricing: <HugeiconsIcon icon={CreditCardPosIcon} />,
    "Job Reports": <HugeiconsIcon icon={AnalyticsUpIcon} />,
    Settings: <HugeiconsIcon icon={Settings01Icon} />,
  };

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
          isActive ? " text-[#FF69B4] font-medium" : " hover:text-[#FF69B4]"
        }`}
        onClick={handleItemClick}
      >
        <div className="flex items-center">
          <span className="mr-3">{iconMap[item.name]}</span>
          <span className="text-sm">{item.name}</span>
        </div>
        {/* {item.hasView && (
          <span>
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </span>
        )} */}
      </div>

      {/* {item.hasView && isExpanded && (
        <div className="ml-6 mt-1">
          <div
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
              location.pathname === item.viewPath
                ? 'bg-[#9D4C1D] text-white font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={(e) => handleViewClick(e, item.viewPath)}
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">View {item.name}</span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SidebarItem;
