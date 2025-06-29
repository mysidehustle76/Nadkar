import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VendorForm = ({ onVendorAdded }) => {
  const [formData, setFormData] = useState({
    vendor_name: '',
    service_provider_name: '',
    phone_number: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Real-time validation functions
  const validateVendorName = (value) => {
    if (!value.trim()) {
      return 'Vendor name is required';
    }
    if (value.length > 100) {
      return 'Vendor name cannot exceed 100 characters';
    }
    return '';
  };

  const validateServiceProviderName = (value) => {
    if (!value.trim()) {
      return 'Service provider name is required';
    }
    if (value.length > 100) {
      return 'Service provider name cannot exceed 100 characters';
    }
    return '';
  };

  const validatePhoneNumber = (value) => {
    if (!value.trim()) {
      return 'Phone number is required';
    }
    
    // Remove any non-digit characters for validation
    const cleanedPhone = value.replace(/[\s\-\(\)]/g, '');
    
    if (!/^\d+$/.test(cleanedPhone)) {
      return 'Phone number must contain only numbers';
    }
    
    if (cleanedPhone.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    
    if (cleanedPhone.length > 15) {
      return 'Phone number cannot exceed 15 digits';
    }
    
    return '';
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow numeric input
    if (name === 'phone_number') {
      // Allow only digits, spaces, dashes, and parentheses
      const cleanedValue = value.replace(/[^0-9\s\-\(\)]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
      
      // Validate phone number
      const error = validatePhoneNumber(cleanedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Validate other fields
      let error = '';
      if (name === 'vendor_name') {
        error = validateVendorName(value);
      } else if (name === 'service_provider_name') {
        error = validateServiceProviderName(value);
      }
      
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      vendor_name: validateVendorName(formData.vendor_name),
      service_provider_name: validateServiceProviderName(formData.service_provider_name),
      phone_number: validatePhoneNumber(formData.phone_number)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Please fix the validation errors before submitting.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(`${API}/vendors`, formData);
      
      if (response.status === 200) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Vendor added successfully!' 
        });
        
        // Reset form
        setFormData({
          vendor_name: '',
          service_provider_name: '',
          phone_number: ''
        });
        setErrors({});
        
        // Notify parent component
        if (onVendorAdded) {
          onVendorAdded(response.data);
        }
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      
      let errorMessage = 'Failed to add vendor. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your inputs.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setSubmitStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      vendor_name: '',
      service_provider_name: '',
      phone_number: ''
    });
    setErrors({});
    setSubmitStatus(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Vendor</h2>
      
      {submitStatus && (
        <div className={`mb-4 p-4 rounded-md ${
          submitStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vendor Name */}
        <div>
          <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">
            Vendor/Business Name *
          </label>
          <input
            type="text"
            id="vendor_name"
            name="vendor_name"
            value={formData.vendor_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.vendor_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter vendor or business name"
            maxLength={100}
          />
          {errors.vendor_name && (
            <p className="mt-1 text-sm text-red-600">{errors.vendor_name}</p>
          )}
        </div>

        {/* Service Provider Name */}
        <div>
          <label htmlFor="service_provider_name" className="block text-sm font-medium text-gray-700 mb-1">
            Service Provider Name *
          </label>
          <input
            type="text"
            id="service_provider_name"
            name="service_provider_name"
            value={formData.service_provider_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.service_provider_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter service provider name"
            maxLength={100}
          />
          {errors.service_provider_name && (
            <p className="mt-1 text-sm text-red-600">{errors.service_provider_name}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone_number ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter phone number (numbers only)"
            maxLength={20}
          />
          {errors.phone_number && (
            <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Enter 10-15 digits. Spaces, dashes, and parentheses are allowed.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Adding...' : 'Add Vendor'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;