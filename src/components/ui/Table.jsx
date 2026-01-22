import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, ViewIcon, Flag01Icon } from "@hugeicons/core-free-icons";
import { Pagination } from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import { Search } from "lucide-react";

export default function Table({
  title,
  head,
  fields,
  dataset = [],
  showCreateButton = false,
  createButtonText = "Create",
  onCreateClick,
  filters = [],
  actions = [],
  colorScheme = {},
  onConfirmDelete,
  customTitle,
  customButton,
  hideSearch = false,
  emptyMessage = "No records found.",
  perPage = 8,

  // ✅ new props for server pagination
  pagination = {}, // { total, totalPages, currentPage }
  onPageChange, // (page) => void
  onSearchChange, // optional: for triggering API refetch with search
  onFilterChange, // optional: for triggering API refetch with filters
  searchQuery: initialSearchQuery = "", // current search value to display
  filterValues: initialFilterValues = {}, // current filter values to display
}) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false); // TODO: Implement ban functionality
  const [userToAction, setUserToAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filterValues, setFilterValues] = useState(initialFilterValues);
  const [isMobile, setIsMobile] = useState(false);
  const currentPage = pagination?.currentPage || 1;
  const rowsPerPage =
    pagination?.itemsPerPage || pagination?.perPage || perPage || 8;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || dataset.length;
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Sync screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync search query with prop changes
  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  // Sync filter values with prop changes
  useEffect(() => {
    if (Object.keys(initialFilterValues).length > 0) {
      setFilterValues(initialFilterValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilterValues)]);

  // Initialize filter values with default "All" for each filter
  useEffect(() => {
    if (!filters || filters.length === 0) return;
    const defaultFilterValues = {};
    filters.forEach((filter) => {
      const allOption = filter.options.find((opt) => opt.value === "All");
      defaultFilterValues[filter.key] =
        allOption ? "All" : filter.options[0]?.value || "";
    });

    setFilterValues((prev) => {
      const next = { ...defaultFilterValues, ...prev };
      const changed = Object.keys(next).some((k) => next[k] !== prev[k]);
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.length]);

  // Default action buttons
  const defaultActions = [
    {
      key: "view",
      label: "View",
      icon: ViewIcon,
      onClick: (item) => navigate(`${item._id || item.id}`),
      className:
        "p-1.5 text-purple-500 hover:bg-purple-50 rounded-full border border-purple-200 transition-colors",
    },
    {
      key: "flag",
      label: "Flag",
      icon: Flag01Icon,
      onClick: (item) => {
        setUserToAction(item);
        setShowBanModal(true);
      },
      className:
        "p-1.5 text-orange-500 hover:bg-orange-50 rounded-full border border-orange-200 transition-colors",
    },
    {
      key: "delete",
      label: "Delete",
      icon: Delete02Icon,
      onClick: (item) => {
        setUserToAction(item);
        setShowDeleteModal(true);
      },
      className:
        "p-1.5 text-red-500 hover:bg-red-50 rounded-full border border-red-200 transition-colors",
    },
  ];

  const activeActions = actions.length ? actions : defaultActions;

  const renderStatusBadge = (statusValue, type = "status") => {
    const paymentColors = {
      Paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
      Unpaid: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
      Partial: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    };

    const colors =
      type === "payment"
        ? paymentColors[statusValue] || paymentColors.Unpaid
        : colorScheme[statusValue] || {
            bg: "bg-gray-100",
            text: "text-gray-800",
            dot: "bg-gray-500",
          };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${colors.dot}`} />
        {statusValue}
      </span>
    );
  };

  const renderCellContent = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      if (Array.isArray(value)) return `${value.length} items`;
      return "[Object]";
    }
    return String(value);
  };

  const displayFields =
    fields || (dataset.length ? Object.keys(dataset[0]) : []);

  const handleActionClick = (action, item) => {
    const isDeleteAction = action.key === "delete";
    if (isDeleteAction && onConfirmDelete) {
      setUserToAction(item);
      setShowDeleteModal(true);
      return;
    }
    action.onClick?.(item);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value); // trigger API fetch in parent
  };

  const handleFilterChange = (filterKey, value) => {
    setFilterValues((prev) => ({ ...prev, [filterKey]: value }));
    onFilterChange?.(filterKey, value); // trigger API fetch in parent
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {customTitle ? (
          customTitle
        ) : (
          <h1 className="text-[32px] sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {title}
          </h1>
        )}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {!hideSearch && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-inner focus:ring-2 focus:ring-[#C85344]/20 focus:border-[#C85344]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          )}

          {filters.map((filter) => (
            <select
              key={filter.key}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
              value={filterValues[filter.key] || ""}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}

          {customButton
            ? customButton
            : showCreateButton &&
              !isMobile && (
                <Button variant="primary" size="medium" onClick={onCreateClick}>
                  {createButtonText}
                </Button>
              )}
        </div>
      </div>

      {/* Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#fff4ef] via-white to-white px-6 py-4 border-b border-gray-200">
          <div
            className={`grid gap-6 text-sm font-medium text-gray-700`}
            style={{
              gridTemplateColumns: `repeat(${
                1 + head.length + 1
              }, minmax(0, 1fr))`,
            }}
          >
            <div>No</div>
            {head.map((header, i) => (
              <div key={i} className="uppercase tracking-wide text-[11px] text-gray-500">
                {header}
              </div>
            ))}
            <div className="flex justify-center uppercase tracking-wide text-[11px] text-gray-500">
              Actions
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {dataset.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            dataset.map((item, index) => {
              const rowId = item._id || item.id || index;
              const rowNumber = String(startIndex + index + 1).padStart(2, "0");
              return (
                <div
                  key={rowId}
                  className="px-6 py-4 hover:bg-gray-50/70 transition-all"
                >
                  <div
                    className="grid gap-6 items-start"
                    style={{
                      gridTemplateColumns: `repeat(${
                        1 + head.length + 1
                      }, minmax(0, 1fr))`,
                    }}
                  >
                    <div>{rowNumber}</div>
                    {displayFields.map((key) => (
                      <div key={`${rowId}-${key}`} className="text-sm text-gray-800 space-y-1">
                        {key === "status"
                          ? renderStatusBadge(item[key])
                          : key.toLowerCase().includes("payment")
                          ? renderStatusBadge(item[key], "payment")
                          : renderCellContent(item[key])}
                      </div>
                    ))}
                    <div className="flex justify-center space-x-2">
                      {activeActions.map((action) => (
                        <button
                          key={`${action.key}-${rowId}`}
                          onClick={() => handleActionClick(action, item)}
                          className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#C85344]/50 transition-all duration-150 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                          title={action.label}
                          aria-label={action.label}
                          type="button"
                          role="button"
                          tabIndex={0}
                        >
                          <HugeiconsIcon icon={action.icon} className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="lg:hidden space-y-4">
        {showCreateButton && (
          <div className="flex justify-center sm:justify-start">
            <Button
              variant="primary"
              size="medium"
              onClick={onCreateClick}
            >
              {createButtonText}
            </Button>
          </div>
        )}

        {/* mobile view */}
        {dataset.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-sm text-gray-600">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {dataset.map((item, index) => {
              const rowId = item._id || item.id || index;
              const rowNumber = String(startIndex + index + 1).padStart(2, "0");
              return (
                <div
                  key={rowId}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-400 font-medium">
                      #{rowNumber}
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeActions.map((action) => (
                        <button
                          key={`mobile-${action.key}-${rowId}`}
                          onClick={() => handleActionClick(action, item)}
                          className={action.className.replace("p-1.5", "p-2")}
                          title={action.label}
                        >
                          <HugeiconsIcon icon={action.icon} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-700">
                    {displayFields.map((key, colIndex) => (
                      <div key={`${key}-${colIndex}`}>
                        <span className="font-semibold">
                          {head[colIndex] ||
                            key.charAt(0).toUpperCase() + key.slice(1)}
                          :
                        </span>{" "}
                        {key === "status"
                          ? renderStatusBadge(item[key])
                          : renderCellContent(item[key])}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        setCurrentPage={onPageChange}
        perPage={rowsPerPage}
        totalPages={totalPages}
        totalItems={totalItems}
      />

      {/* Delete Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (userToAction && onConfirmDelete) {
              try {
                await onConfirmDelete(userToAction);
                // Let individual components handle their own success toasts
              } catch (error) {
                // Log error for debugging, but let individual components handle their own error toasts
                console.error("Delete operation failed:", error);
              }
            }
            setShowDeleteModal(false);
          }}
          title="Delete Item"
          option1="Delete"
          option2="Cancel"
          item={userToAction} // Pass the item being deleted
        />
      )}
    </div>
  );
}
