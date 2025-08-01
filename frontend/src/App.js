import React, { useState, useEffect, useMemo, memo } from 'react';
import './App.css';
import { staticVendors } from './vendors';

// Backend URL configuration for different environments
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://bmp-directory.emergent.host' 
    : 'http://localhost:8000');

console.log('Backend URL:', BACKEND_URL);

// Memoized vendor card component for performance
const VendorCard = memo(({ vendor, onPhoneClick, onDeleteClick, formatBusinessName, formatPhoneNumber }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative">
    {/* Delete button in top-right corner - black trash icon */}
    <button
      onClick={() => onDeleteClick(vendor)}
      className="absolute top-3 right-3 text-black hover:text-red-500 p-1 rounded transition-colors duration-200 z-10 hover:bg-gray-100"
      title="Delete vendor"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>

    <div className="p-6">
      <div className="flex justify-between items-start mb-3 pr-8">
        <h3 className="text-xl font-semibold text-gray-800">{formatBusinessName(vendor.name)}</h3>
        <div className="flex items-center space-x-2">
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            {vendor.category}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{vendor.description}</p>

      <button
        onClick={() => onPhoneClick(vendor.phone)}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>{formatPhoneNumber(vendor.phone)}</span>
      </button>
    </div>
  </div>
));

const App = () => {
  const [vendors, setVendors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for adding new vendor
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: '',
    phone: '',
    rating: 4.5,
    address: 'Bellmoore Park Community',
    description: '',
    hours: 'Contact for hours'
  });

  // Fetch vendors from backend with better error handling
  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${BACKEND_URL}/api/vendors`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=300', // Cache for 5 minutes
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else {
        // Fallback to static vendors if API fails
        console.log('API failed, using static vendors');
        setVendors(staticVendors);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      // Always fallback to static vendors for reliability
      setVendors(staticVendors);
    } finally {
      setLoading(false);
    }
  };

  // Add new vendor with proper validation and formatting
  const addVendor = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Validate required fields
    if (!newVendor.name || !newVendor.category || !newVendor.phone || !newVendor.description) {
      setShowValidationError(true);
      setValidationMessage('Please fill in all required fields');
      setIsSubmitting(false);
      setTimeout(() => setShowValidationError(false), 3000);
      return;
    }
    
    // Validate phone number (numbers only)
    if (!validatePhoneNumber(newVendor.phone)) {
      setShowValidationError(true);
      setValidationMessage('Phone number must contain exactly 10 digits');
      setIsSubmitting(false);
      setTimeout(() => setShowValidationError(false), 3000);
      return;
    }
    
    // Check if category already exists (case-insensitive)
    const existingCategories = [...new Set(filteredVendors.map(vendor => vendor.category.toLowerCase()))];
    const isNewCategory = !existingCategories.includes(newVendor.category.toLowerCase());
    
    // Format fields based on whether category is new or existing
    const formattedVendor = {
      name: isNewCategory ? formatToSentenceCase(newVendor.name) : formatToTitleCase(newVendor.name),
      category: isNewCategory ? formatToSentenceCase(newVendor.category) : formatToTitleCase(newVendor.category),
      phone: formatPhoneNumber(newVendor.phone),
      description: isNewCategory ? formatToSentenceCase(newVendor.description) : newVendor.description,
      rating: newVendor.rating,
      address: newVendor.address,
      hours: newVendor.hours
    };
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedVendor),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add to local state immediately for instant display
        setVendors(prev => [...prev, result]);
        
        // Reset form
        setNewVendor({
          name: '',
          category: '',
          phone: '',
          rating: 4.5,
          address: 'Bellmoore Park Community',
          description: '',
          hours: 'Contact for hours'
        });
        setShowAddForm(false);
        
      } else {
        const errorData = await response.json();
        setShowValidationError(true);
        setValidationMessage(`Error: ${errorData.detail}`);
        setTimeout(() => setShowValidationError(false), 3000);
      }
    } catch (err) {
      setShowValidationError(true);
      setValidationMessage('Network error. Please try again.');
      setTimeout(() => setShowValidationError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete vendor
  const deleteVendor = async (vendor) => {
    // Show custom confirmation dialog
    setVendorToDelete(vendor);
    setShowDeleteConfirm(true);
  };

  // Confirm delete vendor
  const confirmDeleteVendor = async () => {
    if (!vendorToDelete) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/vendors/${vendorToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove vendor from local state immediately
        setVendors(prev => prev.filter(v => v.id !== vendorToDelete.id));
        // No success message needed - deletion is visually confirmed by vendor disappearing
      } else {
        const errorData = await response.json();
        alert(`❌ Error deleting vendor: ${errorData.detail}`);
      }
    } catch (err) {
      console.error('Error deleting vendor:', err);
      alert('❌ Error deleting vendor. Please try again.');
    } finally {
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setVendorToDelete(null);
    }
  };

  // Cancel delete
  const cancelDeleteVendor = () => {
    setShowDeleteConfirm(false);
    setVendorToDelete(null);
  };

  // Seed database with initial data
  const seedDatabase = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/vendors/seed`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        // Silently handle the result without showing alert
        console.log('Seed result:', result.message);
        fetchVendors(); // Refresh the list
      }
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  };

  // Cleanup test data from database
  const cleanupTestData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/vendors/cleanup-test-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Cleanup result:', result);
        // Refresh vendors after cleanup
        await fetchVendors();
        return result;
      } else {
        console.error('Cleanup failed:', response.statusText);
      }
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  };

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${BACKEND_URL}/api/vendors`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'max-age=300' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setVendors(data);
        } else {
          // Fallback to static if API fails
          setVendors(staticVendors);
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setVendors(staticVendors);
      } finally {
        setLoading(false);
      }
    };
    
    loadVendors();
  }, []);

  useEffect(() => {
    // Show scroll to top button when user scrolls down
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // Format phone number to XXX-XXX-XXXX format (3-3-4 digits)
  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if we have exactly 10 digits
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Check if we have 11 digits (with country code)
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if not standard format
    return phone;
  };

  // Format category name to Title Case for consistency
  const formatCategoryName = (category) => {
    if (!category) return category;
    
    return category
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format business name to proper Title Case (Sentence Case)
  const formatBusinessName = (name) => {
    if (!name) return name;
    
    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        
        // Handle special cases like O'Connor, McDonald, etc.
        if (word.includes("'")) {
          return word.split("'").map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join("'");
        }
        
        // Handle prefixes like Mc, Mac
        if (word.startsWith('mc') && word.length > 2) {
          return 'Mc' + word.charAt(2).toUpperCase() + word.slice(3);
        }
        
        if (word.startsWith('mac') && word.length > 3) {
          return 'Mac' + word.charAt(3).toUpperCase() + word.slice(4);
        }
        
        // Standard title case
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ')
      .trim();
  };

  // Validate phone number (numbers only, 10 digits)
  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  // Format to Title Case (Initial Capitals) for names and categories
  const formatToTitleCase = (text) => {
    if (!text) return text;
    return text
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ')
      .trim();
  };

  // Format to Sentence Case (only first word capitalized) for new categories
  const formatToSentenceCase = (text) => {
    if (!text) return text;
    const trimmed = text.trim().toLowerCase();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // Get all unique categories from vendors + standard categories
  const standardCategories = [
    "Academic Tutoring", "Accounting & Tax", "Air Conditioning & Heating", "Appliance Repair",
    "Auto Dealers", "Auto Repair", "Banks & Credit Unions", "Barbers & Hair Salons",
    "Beauty & Wellness", "Bicycle Sales & Service", "Building Materials", "Catering",
    "Childcare & Preschools", "Children's Clothing", "Cleaning Services", "Computer Services",
    "Construction & Contractors", "Custom T-Shirts", "Dance & Music Lessons", "Dental",
    "Dry Cleaners", "Electrical", "Electronics", "Emergency Services", "Employment Services",
    "Entertainment", "Event Planning", "Executive Coaching", "Financial Services", "Fitness & Gyms", "Flooring",
    "Florists", "Funeral Homes", "Furniture Stores", "Garage Door", "Garden Centers",
    "Gas Stations", "Grocery Stores", "Gutter Services", "Handyman", "Hardware Stores",
    "Health & Medical", "Home Improvement", "Home Security", "Hotels & Lodging",
    "Household Help", "Insurance", "Internet Services", "Jewelry", "Landscaping",
    "Laundry Services", "Legal Services", "Libraries", "Locksmiths", "Medical Equipment",
    "Mortgage", "Moving & Storage", "Music Lessons", "Optometrists", "Painting",
    "Pediatricians", "Pest Control", "Pet Services", "Pharmacies", "Photography",
    "Physical Therapy", "Plumbing", "Printing Services", "Real Estate", "Restaurants",
    "Roofing", "Schools", "Security Systems", "Shoe Repair", "Shopping Centers",
    "Sports & Recreation", "Storage Facilities", "Tax Services", "Taxi & Transportation",
    "Telecommunications", "Travel Agencies", "Tree Services", "Upholstery", "Utilities",
    "Veterinarians", "Water Treatment", "Wedding Services", "Yoga & Wellness"
  ];

  // Memoize filtered vendors for performance  
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      // Words to filter out from names, categories, descriptions, and phone numbers
      const blockedWords = ['demo', 'test', 'testing', 'example'];
      
      const name = vendor.name.toLowerCase().trim();
      const category = vendor.category.toLowerCase().trim();
      const description = vendor.description.toLowerCase().trim();
      const phone = vendor.phone.toLowerCase().trim();
      
      // Check if any blocked word appears in any field
      const hasBlockedWord = blockedWords.some(word => 
        name.includes(word) || 
        category.includes(word) || 
        description.includes(word) || 
        phone.includes(word)
      );
      
      return !hasBlockedWord;
    });
  }, [vendors]);

  // Memoize categories for performance
  const { allCategories, allCategoriesForForm } = useMemo(() => {
    // Only show categories that have associated vendors (after filtering), but keep standard categories for new additions
    const vendorCategories = [...new Set(filteredVendors.map(vendor => vendor.category))];
    // For the dropdown, only show categories that actually have vendors
    const categories = vendorCategories.sort();
    // For the form datalist, include standard categories to allow new additions
    const categoriesForForm = [...new Set([...vendorCategories, ...standardCategories])].sort();
    
    // Ensure we always have categories even during loading
    const finalCategories = categories.length > 0 ? categories : standardCategories.slice(0, 10);
    
    return {
      allCategories: finalCategories,
      allCategoriesForForm: categoriesForForm.length > 0 ? categoriesForForm : standardCategories
    };
  }, [filteredVendors]);

  // Reset category selection if selected category no longer exists
  useEffect(() => {
    if (selectedCategory && !allCategories.includes(selectedCategory)) {
      setSelectedCategory(''); // Reset to "All Categories"
    }
  }, [allCategories, selectedCategory]);

  // Memoize sorted vendors for performance
  const sortedVendors = useMemo(() => {
    if (selectedCategory === '') {
      return filteredVendors.sort((a, b) => {
        // First sort by category, then by name within category
        if (a.category === b.category) {
          return a.name.localeCompare(b.name);
        }
        return a.category.localeCompare(b.category);
      });
    } else {
      return filteredVendors
        .filter(vendor => vendor.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim())
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filteredVendors, selectedCategory]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Community Banner - Clean image only */}
      <section className="relative">
        <div 
          className="w-full h-32 bg-cover bg-center bg-no-repeat"
          style={{ 
            height: '125px',
            backgroundImage: `url('https://media.theprovidencegroup.com/259/2020/9/29/gMs1W.jpeg?width=800&height=250&fit=bounds&ois=2c7ddaf')`,
            backgroundColor: '#fef3c7' // Fallback color while loading
          }}
        >
        </div>
      </section>

      {/* Add Vendor Form */}
      {showAddForm && (
        <div className="bg-gray-100 border-b">
          <div className="container mx-auto px-4 py-6">
            <h3 className="text-lg font-bold mb-4">Add New Vendor</h3>
            
            {/* Validation Error Message */}
            {showValidationError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ❌ {validationMessage}
              </div>
            )}
            
            <form onSubmit={addVendor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter contact name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Description *</label>
                <input
                  type="text"
                  required
                  value={newVendor.description}
                  onChange={(e) => setNewVendor({...newVendor, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter business description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  list="categories"
                  required
                  value={newVendor.category}
                  onChange={(e) => setNewVendor({...newVendor, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Select existing category or type new one"
                />
                <datalist id="categories">
                  {allCategoriesForForm.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">Choose from dropdown or type a new category</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newVendor.phone}
                  onChange={(e) => {
                    // Only allow numbers, remove any non-digit characters
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setNewVendor({...newVendor, phone: numericValue});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="1234567890 (numbers only)"
                  maxLength="10"
                />
                <p className="text-xs text-gray-500 mt-1">Enter 10 digits only (no spaces or dashes)</p>
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors mr-4 ${
                    isSubmitting 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-yellow-400 text-white hover:bg-yellow-500'
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Vendor'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={isSubmitting}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendors List */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Filter and Add Vendor Button */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Only show category dropdown when form is not open */}
          {!showAddForm && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          )}
          
          {/* Only show Add Vendor button when form is not open */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add a new vendor</span>
            </button>
          )}
        </div>

        {/* Vendor Grid - Only show when form is not open */}
        {!showAddForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Group vendors by category and sort them - optimized */}
            {sortedVendors.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onPhoneClick={handlePhoneClick}
                onDeleteClick={deleteVendor}
                formatBusinessName={formatBusinessName}
                formatPhoneNumber={formatPhoneNumber}
              />
            ))}
          </div>
        )}

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteConfirm && vendorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-600 mb-4">Are you sure you want to delete this vendor?</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm break-words"><strong>Name:</strong> {vendorToDelete.name}</p>
              <p className="text-sm break-words"><strong>Category:</strong> {vendorToDelete.category}</p>
              <p className="text-sm break-words"><strong>Phone:</strong> {vendorToDelete.phone}</p>
            </div>
            
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-end">
              <button
                onClick={cancelDeleteVendor}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteVendor}
                className="w-full sm:w-auto px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors order-1 sm:order-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no vendors found and form is not open */}
      {!showAddForm && filteredVendors.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 10-4 0v5m0 0H7" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-4">Start by adding your first vendor to the directory</p>
            {showAdminPanel && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-yellow-400 text-white px-6 py-3 rounded-lg hover:bg-yellow-500 font-semibold transition-colors"
              >
                Add First Vendor
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mb-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-white">© 2025 Designed for residents of Bellmoore Park.</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 bg-yellow-400 hover:bg-yellow-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 md:hidden"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;