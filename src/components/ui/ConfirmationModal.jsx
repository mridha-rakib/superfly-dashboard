import React from 'react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure, you want to delete?",
  option1 = "Delete",
  option2 = "Cancel",
  item // Add item prop to show specific item being deleted
}) => {
  if (!isOpen) return null;

  // Generate specific title based on item
  const getTitle = () => {
    if (item && item.title) {
      return `Delete "${item.title}"?`;
    }
    if (item && item.name) {
      return `Delete "${item.name}"?`;
    }
    return title;
  };

  const getDescription = () => {
    if (item && (item.title || item.name)) {
      return "This action cannot be undone.";
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-gray-50/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4 shadow-xl">
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal content */}
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            {getTitle()}
          </h2>
          {getDescription() && (
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
              {getDescription()}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              {option1}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              {option2}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
