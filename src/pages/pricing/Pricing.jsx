import { Delete02Icon, Edit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React, { useState } from 'react';
import { toast } from "react-toastify";

function Pricing() {
  const [pricingData, setPricingData] = useState([
    { id: 1, service: "Bedroom", price: 10, lastUpdated: "05 Nov 2025" },
    { id: 2, service: "Bathroom", price: 15, lastUpdated: "05 Nov 2025" },
    { id: 3, service: "Kitchen", price: 20, lastUpdated: "05 Nov 2025" },
    { id: 4, service: "Window", price: 10, lastUpdated: "05 Nov 2025" },
    { id: 5, service: "Living Room", price: 25, lastUpdated: "04 Nov 2025" }
  ]);

  const [priceChanges, setPriceChanges] = useState([
    { id: 1, date: "06 Nov", editedBy: "Admin", service: "Kitchen", oldPrice: 18, newPrice: 20 },
    { id: 2, date: "06 Nov", editedBy: "Admin", service: "Kitchen", oldPrice: 18, newPrice: 20 },
    { id: 3, date: "06 Nov", editedBy: "Admin", service: "Kitchen", oldPrice: 18, newPrice: 20 },
    { id: 4, date: "06 Nov", editedBy: "Admin", service: "Kitchen", oldPrice: 18, newPrice: 20 },
    { id: 5, date: "06 Nov", editedBy: "Admin", service: "Kitchen", oldPrice: 18, newPrice: 20 }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    service: "",
    price: ""
  });

  // Filter pricing data based on search term
  const filteredPricingData = pricingData.filter(item =>
    item.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditPrice(item.price.toString());
  };

  const handleSave = (id) => {
    if (!editPrice || isNaN(editPrice) || parseFloat(editPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const newPrice = parseFloat(editPrice);
    const item = pricingData.find(item => item.id === id);
    
    if (item && item.price !== newPrice) {
      // Add to price changes history
      const newChange = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        editedBy: "Admin",
        service: item.service,
        oldPrice: item.price,
        newPrice: newPrice
      };
      setPriceChanges(prev => [newChange, ...prev.slice(0, 4)]); // Keep only 5 most recent
    }

    setPricingData(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, price: newPrice, lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
          : item
      )
    );

    setEditingId(null);
    setEditPrice("");
    toast.success("Price updated successfully!");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setPricingData(prev => prev.filter(item => item.id !== itemToDelete.id));
      toast.success(`${itemToDelete.service} deleted successfully!`);
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleSaveNewItem = () => {
    if (!newItem.service.trim() || !newItem.price || isNaN(newItem.price) || parseFloat(newItem.price) <= 0) {
      toast.error("Please enter valid service name and price");
      return;
    }

    const newItemData = {
      id: Date.now(),
      service: newItem.service.trim(),
      price: parseFloat(newItem.price),
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setPricingData(prev => [...prev, newItemData]);
    setNewItem({ service: "", price: "" });
    setShowAddModal(false);
    toast.success("New service added successfully!");
  };

  const handleCancelAdd = () => {
    setNewItem({ service: "", price: "" });
    setShowAddModal(false);
  };

  return (
    <div className="w-full mx-auto space-y-8 p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Add Item Button */}
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-[#C85344] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add New Item
          </button>
        </div>
      </div>

      {/* Residential Pricing Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-200 text-gray-900 px-6 py-4">   
          <h2 className="text-2xl text-center font-semibold">Item Pricing</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className='font-semibold'>
                <th className="px-6 py-4 text-left text-sm">Service Item</th>
                <th className="px-6 py-4 text-left text-sm">Price ($)</th>
                <th className="px-6 py-4 text-left text-sm">Last Updated</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPricingData.length > 0 ? (
                filteredPricingData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.service}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                          autoFocus
                        />
                      ) : (
                        item.price
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.lastUpdated}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === item.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(item.id)}
                            className="px-3 py-1 text-sm bg-[#C85344] text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 justify-center items-center rounded-full text-blue-600 border border-blue-600"
                          >
                           <HugeiconsIcon icon={Edit01Icon} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 justify-center items-center rounded-full text-red-600 border border-red-600"
                          >
                            <HugeiconsIcon icon={Delete02Icon} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No services found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Price Changes Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-200 text-gray-900 px-6 py-4">
          <h2 className="text-2xl text-center font-semibold">Recent Price Changes</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className='font-semibold'>
                <th className="px-6 py-4 text-left text-sm">Date</th>
                <th className="px-6 py-4 text-left text-sm">Edited By</th>
                <th className="px-6 py-4 text-left text-sm">Service</th>
                <th className="px-6 py-4 text-left text-sm">Old Price</th>
                <th className="px-6 py-4 text-left text-sm">New Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {priceChanges.map((change) => (
                <tr key={change.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{change.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{change.editedBy}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{change.service}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">${change.oldPrice}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${change.newPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Item
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete?.service}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-50/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Item
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItem.service}
                  onChange={(e) => setNewItem(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewItem}
                className="px-4 py-2 text-sm bg-[#C85344] text-white rounded  transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pricing;