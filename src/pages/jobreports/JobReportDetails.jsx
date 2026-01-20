import React from 'react';

function JobReportDetails() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Report Details - #CL-1042</h1>
      </div>

      <div className="space-y-8">
        {/* Job Overview Table */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Overview</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">2016.5 (Receiptable/APC)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-700 w-1/3">Job</td>
                <td className="px-6 py-4 text-sm text-gray-900">CL-1042</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Object</td>
                <td className="px-6 py-4 text-sm text-gray-900">3D of a New</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Custom Auto</td>
                <td className="px-6 py-4 text-sm text-gray-900">Subscaled 100%</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Customer</td>
                <td className="px-6 py-4 text-sm text-gray-900">Adam Rahman</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Date</td>
                <td className="px-6 py-4 text-sm text-gray-900">9 May 2020, 500 AM</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Service Type</td>
                <td className="px-6 py-4 text-sm text-gray-900">Residential Cleaning</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Address</td>
                <td className="px-6 py-4 text-sm text-gray-900">21 Like Road, Dinkie</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Before & After Photos */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Before & After Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-gray-200 border border-gray-300 rounded-lg h-64 flex items-center justify-center mb-2">
                <span className="text-gray-600 text-lg">Before Cleaning</span>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-200 border border-gray-300 rounded-lg h-64 flex items-center justify-center mb-2">
                <span className="text-gray-600 text-lg">After Cleaning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-8"></div>

        {/* Job Report Details */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Report Details</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-gray-700">Start Time:</span>
              <span className="text-sm text-gray-900 ml-2">10:00 AM</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Date Time:</span>
              <span className="text-sm text-gray-900 ml-2">10:15 AM</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">End Time:</span>
              <span className="text-sm text-gray-900 ml-2">1:30 PM</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Total Duration:</span>
              <span className="text-sm text-gray-900 ml-2">3 hrs 15 mins</span>
            </div>
          </div>
        </div>

        {/* Notes from Cleaner */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes from Cleaner:</h4>
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <p className="text-sm text-gray-700 italic">
              "Kitchen and windows required deep cleaning. Customer was very satisfied with the service. All areas cleaned thoroughly including hard-to-reach spots."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobReportDetails;