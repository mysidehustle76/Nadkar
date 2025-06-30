import React, { useState, useEffect } from 'react';
import './App.css';
import { staticVendors } from './vendors';

const App = () => {
  const [vendors, setVendors] = useState(staticVendors);
  console.log('Current vendors count:', vendors.length); // Debug line
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Form state for adding new vendor
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: '',
    phone: '',
    rating: 4.5,
    address: 'Bellmoore Park Community',
    description: 'Community business',
    hours: 'Contact for hours'
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Fetch vendors from backend
  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Always start with static vendors as fallback
      setVendors(staticVendors);
      
      const response = await fetch(`${BACKEND_URL}/api/vendors`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setVendors(data);
        }
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      // Ensure we always have static vendors
      setVendors(staticVendors);
    } finally {
      setLoading(false);
    }
  };

  // Add new vendor
  const addVendor = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newVendor.name || !newVendor.category || !newVendor.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Format phone number before saving
    const formattedVendor = {
      ...newVendor,
      phone: formatPhoneNumber(newVendor.phone)
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
        const addedVendor = await response.json();
        setVendors(prev => [...prev, addedVendor]);
        setNewVendor({
          name: '',
          category: '',
          phone: '',
          rating: 4.5,
          address: 'Bellmoore Park Community',
          description: 'Community business',
          hours: 'Contact for hours'
        });
        setShowAddForm(false);
        alert('Vendor added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail}`);
      }
    } catch (err) {
      console.error('Error adding vendor:', err);
      // Fallback: Add directly to local state if API fails
      const newVendorWithId = {
        ...formattedVendor,
        id: Date.now().toString() // Simple ID generation
      };
      setVendors(prev => [...prev, newVendorWithId]);
      setNewVendor({
        name: '',
        category: '',
        phone: '',
        rating: 4.5,
        address: 'Bellmoore Park Community',
        description: 'Community business',
        hours: 'Contact for hours'
      });
      setShowAddForm(false);
      alert('Vendor added successfully!');
    }
  };

  // Delete vendor
  const deleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
        alert('Vendor deleted successfully!');
      } else {
        alert('Error deleting vendor');
      }
    } catch (err) {
      console.error('Error deleting vendor:', err);
      alert('Error deleting vendor. Please try again.');
    }
  };

  // Seed database with initial data
  const seedDatabase = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/vendors/seed`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchVendors(); // Refresh the list
      }
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  };

  useEffect(() => {
    // Just use static vendors - don't fetch from API
    setLoading(false);
  }, []);

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // Format phone number to XXX-XXX-XXXX format
  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if we have 10 digits
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

  const categories = [...new Set(vendors.map(vendor => vendor.category))].sort();



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
      {/* Community Banner */}
      <section className="relative">
        <img 
          src="https://media.theprovidencegroup.com/259/2020/9/29/gMs1W.jpeg?width=1920&height=1168&fit=bounds&ois=2c7ddaf" 
          alt="Bellmoore Park Community" 
          className="w-full h-80 object-cover"
        />
      </section>

      {/* Add Vendor Form */}
      {showAddForm && (
        <div className="bg-gray-100 border-b">
          <div className="container mx-auto px-4 py-6">
            <h3 className="text-lg font-bold mb-4">Add New Vendor</h3>
            <form onSubmit={addVendor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name / Contact *</label>
                <input
                  type="text"
                  required
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter business name or contact person"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={newVendor.category}
                  onChange={(e) => setNewVendor({...newVendor, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={newVendor.rating}
                  onChange={(e) => setNewVendor({...newVendor, rating: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value={5.0}>5.0 - Excellent</option>
                  <option value={4.9}>4.9 - Outstanding</option>
                  <option value={4.8}>4.8 - Very Good</option>
                  <option value={4.7}>4.7 - Very Good</option>
                  <option value={4.6}>4.6 - Good</option>
                  <option value={4.5}>4.5 - Good</option>
                  <option value={4.0}>4.0 - Average</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-yellow-400 text-white px-6 py-3 rounded-lg hover:bg-yellow-500 font-semibold transition-colors mr-4"
                >
                  Add Vendor
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
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
        {/* Category Filter */}
        <div className="mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Group vendors by category and sort them */}
          {(selectedCategory === '' ? 
            vendors.sort((a, b) => {
              // First sort by category, then by name within category
              if (a.category === b.category) {
                return a.name.localeCompare(b.name);
              }
              return a.category.localeCompare(b.category);
            }) : 
            vendors.filter(vendor => vendor.category === selectedCategory).sort((a, b) => a.name.localeCompare(b.name))
          ).map(vendor => (
            <div key={vendor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{vendor.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {vendor.category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-3">{vendor.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{vendor.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePhoneClick(vendor.phone)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{formatPhoneNumber(vendor.phone)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {vendors.length === 0 && !loading && (
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
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">BMP Yellow Pages</h3>
          <p className="text-gray-400 mb-4">www.bmpyellowpages.com - Connecting our community since 2025</p>
          <p className="text-sm text-gray-500">© 2025 BMP Yellow Pages. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;