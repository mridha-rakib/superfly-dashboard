import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({
  currentPage = 1,
  setCurrentPage,
  perPage = 8,
  totalPages = 1,
  totalItems = 0,
}) => {
  const getPageInfoText = () => {
    if (totalItems === 0) return "No results";
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalItems);
    return `Showing ${start}–${end} of ${totalItems}`;
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="text-sm text-gray-700">{getPageInfoText()}</div>

      <div className="flex items-center space-x-2 overflow-x-auto">
        <button
          className="p-2 text-gray-500 rounded-full border border-gray-300 hover:text-gray-700 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = currentPage === pageNumber;
            const showPage =
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 &&
                pageNumber <= currentPage + 1);

            if (
              !showPage &&
              (pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2)
            ) {
              return (
                <span key={pageNumber} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            if (!showPage) return null;

            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isCurrentPage
                    ? "bg-[#C85344] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          className="p-2 text-gray-500 rounded-full border border-gray-300 hover:text-gray-700 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
