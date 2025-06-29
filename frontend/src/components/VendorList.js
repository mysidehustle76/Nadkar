import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmationDialog from './ConfirmationDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VendorList = ({ refreshTrigger }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    vendor: null,
    isLoading: false
  });
  const [deleteMessage, setDeleteMessage] = useState(null);

  // Fetch vendors from API
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/vendors`);
      setVendors(response.data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendors on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchVendors();
  }, [refreshTrigger]);

  // Handle delete vendor
  const handleDeleteClick = (vendor) => {
    setDeleteDialog({
      isOpen: true,
      vendor: vendor,
      isLoading: false
    });
  };

  // Confirm delete vendor
  const handleDeleteConfirm = async () => {
    const vendorToDelete = deleteDialog.vendor;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await axios.delete(`${API}/vendors/${vendorToDelete.id}`);
      
      if (response.status === 200) {
        // Remove vendor from local state
        setVendors(prevVendors => 
          prevVendors.filter(vendor => vendor.id !== vendorToDelete.id)
        );
        
        // Show success message
        setDeleteMessage({
          type: 'success',
          message: `Vendor "${vendorToDelete.vendor_name}" has been successfully deleted.`
        });
        
        // Close dialog
        setDeleteDialog({
          isOpen: false,
          vendor: null,
          isLoading: false
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setDeleteMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error deleting vendor:', err);
      
      let errorMessage = 'Failed to delete vendor. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Vendor not found. It may have already been deleted.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setDeleteMessage({
        type: 'error',
        message: errorMessage
      });
      
      // Close dialog
      setDeleteDialog({
        isOpen: false,
        vendor: null,
        isLoading: false
      });
      
      // Clear error message after 7 seconds
      setTimeout(() => {
        setDeleteMessage(null);
      }, 7000);
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      vendor: null,
      isLoading: false
    });
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // If it's a 10-digit US number, format as (XXX) XXX-XXXX
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    
    // For other lengths, just add spaces every 3-4 digits
    if (phone.length > 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})(\d*)/, '($1) $2-$3 $4').trim();
    }
    
    return phone;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Vendor List</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading vendors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Vendor List</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchVendors}
                className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Vendor List</h2>
        <button
          onClick={fetchVendors}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      {/* Delete Success/Error Message */}
      {deleteMessage && (
        <div className={`mb-6 p-4 rounded-md ${
          deleteMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {deleteMessage.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{deleteMessage.message}</p>
            </div>
          </div>
        </div>
      )}

      {vendors.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0124 24c5.520 0 10 4.480 10 10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new vendor.</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {vendor.vendor_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Service Provider: {vendor.service_provider_name}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {formatPhoneNumber(vendor.phone_number)}
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Added: {formatDate(vendor.created_at)}
                    </p>
                  </div>
                  
                  {/* Delete Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleDeleteClick(vendor)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {vendors.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Total: {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${deleteDialog.vendor?.vendor_name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDestructive={true}
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
};

export default VendorList;