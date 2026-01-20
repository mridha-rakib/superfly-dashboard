import React from "react";

function Card({ title, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm w-full justify-center items-center text-center">
      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
        {title}
      </h3>
      <p className="text-[24px] sm:text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default Card;
