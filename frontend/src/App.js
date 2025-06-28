import React, { useState, useMemo } from 'react';
import './App.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  // Sample vendor data
  const vendors = [
    {
      id: 1,
      name: "Mario's Italian Bistro",
      category: "Restaurants",
      phone: "(555) 123-4567",
      rating: 4.5,
      address: "123 Main St, Downtown",
      description: "Authentic Italian cuisine with family recipes",
      hours: "Mon-Sat 11AM-10PM, Sun 12PM-9PM"
    },
    {
      id: 2,
      name: "Quick Fix Auto Repair",
      category: "Automotive",
      phone: "(555) 234-5678",
      rating: 4.8,
      address: "456 Oak Ave, Westside",
      description: "Fast, reliable auto repair services",
      hours: "Mon-Fri 8AM-6PM, Sat 9AM-4PM"
    },
    {
      id: 3,
      name: "Sunshine Dental Care",
      category: "Healthcare",
      phone: "(555) 345-6789",
      rating: 4.9,
      address: "789 Pine Rd, Northside",
      description: "Complete dental care for the whole family",
      hours: "Mon-Fri 8AM-5PM"
    },
    {
      id: 4,
      name: "The Coffee Corner",
      category: "Restaurants",
      phone: "(555) 456-7890",
      rating: 4.3,
      address: "321 Elm St, Central",
      description: "Freshly roasted coffee and pastries",
      hours: "Daily 6AM-8PM"
    },
    {
      id: 5,
      name: "Green Thumb Landscaping",
      category: "Home Services",
      phone: "(555) 567-8901",
      rating: 4.7,
      address: "654 Birch Ln, Eastside",
      description: "Professional landscaping and lawn care",
      hours: "Mon-Sat 7AM-5PM"
    },
    {
      id: 6,
      name: "Tech Solutions Plus",
      category: "Technology",
      phone: "(555) 678-9012",
      rating: 4.6,
      address: "987 Cedar Dr, Tech District",
      description: "Computer repair and IT support services",
      hours: "Mon-Fri 9AM-6PM, Sat 10AM-3PM"
    },
    {
      id: 7,
      name: "Bella's Hair Salon",
      category: "Beauty & Wellness",
      phone: "(555) 789-0123",
      rating: 4.4,
      address: "246 Maple Ave, Southside",
      description: "Full-service hair salon and spa",
      hours: "Tue-Sat 9AM-7PM"
    },
    {
      id: 8,
      name: "City Plumbing Services",
      category: "Home Services",
      phone: "(555) 890-1234",
      rating: 4.5,
      address: "135 Willow St, Industrial",
      description: "24/7 emergency plumbing services",
      hours: "24/7 Emergency Service"
    },
    {
      id: 9,
      name: "Fresh Market Grocery",
      category: "Shopping",
      phone: "(555) 901-2345",
      rating: 4.2,
      address: "468 Rose Blvd, Suburbs",
      description: "Fresh produce and organic groceries",
      hours: "Daily 7AM-10PM"
    },
    {
      id: 10,
      name: "Elite Fitness Center",
      category: "Fitness",
      phone: "(555) 012-3456",
      rating: 4.6,
      address: "579 Spruce St, Fitness District",
      description: "State-of-the-art gym and fitness classes",
      hours: "Mon-Fri 5AM-11PM, Weekends 6AM-10PM"
    },
    {
      id: 11,
      name: "Johnson & Associates Law",
      category: "Legal Services",
      phone: "(555) 123-5678",
      rating: 4.8,
      address: "801 Cherry Ave, Legal District",
      description: "Experienced attorneys for all legal needs",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 12,
      name: "Panda Express",
      category: "Restaurants",
      phone: "(555) 234-6789",
      rating: 4.1,
      address: "912 Bamboo Rd, Food Court",
      description: "Fast casual Chinese-American cuisine",
      hours: "Daily 11AM-9PM"
    },
    {
      id: 13,
      name: "Speedy Dry Cleaners",
      category: "Services",
      phone: "(555) 345-7890",
      rating: 4.3,
      address: "123 Clean St, Shopping Center",
      description: "Same-day dry cleaning and alterations",
      hours: "Mon-Fri 7AM-7PM, Sat 8AM-5PM"
    },
    {
      id: 14,
      name: "Mountain View Veterinary",
      category: "Pet Services",
      phone: "(555) 456-8901",
      rating: 4.9,
      address: "456 Pet Lane, Residential",
      description: "Compassionate care for your pets",
      hours: "Mon-Fri 8AM-6PM, Sat 9AM-3PM"
    },
    {
      id: 15,
      name: "Royal Insurance Agency",
      category: "Insurance",
      phone: "(555) 567-9012",
      rating: 4.4,
      address: "789 Security Blvd, Business District",
      description: "Auto, home, and business insurance",
      hours: "Mon-Fri 9AM-5PM"
    }
  ];

  const categories = [...new Set(vendors.map(vendor => vendor.category))].sort();

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || vendor.category === selectedCategory;
      const matchesRating = selectedRating === '' || vendor.rating >= parseFloat(selectedRating);
      
      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [searchTerm, selectedCategory, selectedRating]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">½</span>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }
    
    return stars;
  };

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-yellow-400 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Yellow Pages</h1>
                <p className="text-yellow-100">Find Local Businesses</p>
              </div>
            </div>
            <div className="text-right text-white">
              <p className="text-sm">Connecting Communities</p>
              <p className="text-lg font-semibold">{filteredVendors.length} Businesses Listed</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Discover Local Businesses</h2>
          <p className="text-xl text-yellow-100 mb-8">Your trusted directory for quality local services</p>
          <div className="max-w-4xl mx-auto">
            <img 
              src="https://images.pexels.com/photos/14534827/pexels-photo-14534827.jpeg" 
              alt="Business Directory" 
              className="w-full h-64 object-cover rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white py-8 shadow-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>
        </div>
      </section>

      {/* Vendors List */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{vendor.name}</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    {vendor.category}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {renderStars(vendor.rating)}
                    <span className="ml-2 text-gray-600 text-sm">({vendor.rating})</span>
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
                  
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{vendor.hours}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePhoneClick(vendor.phone)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{vendor.phone}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.462.881-6.065 2.328.524.89.999 1.812 1.65 2.672A7.962 7.962 0 0112 19c2.34 0 4.462-.881 6.065-2.328-.524-.89-.999-1.812-1.65-2.672z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No businesses found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or browse all categories</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">Yellow Pages Directory</h3>
          <p className="text-gray-400 mb-4">Connecting you with trusted local businesses since 1886</p>
          <p className="text-sm text-gray-500">© 2025 Yellow Pages. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;