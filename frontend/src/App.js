import React, { useState, useMemo } from 'react';
import './App.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  // Real vendor data from your spreadsheet
  const vendors = [
    {
      id: 1,
      name: "Nina Dalsania (N5 LLC)",
      category: "Accounting & Tax",
      phone: "(202) 710-5489",
      rating: 4.8,
      address: "Personal & Small Business Services",
      description: "Professional accounting and tax services",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 2,
      name: "Casteel",
      category: "AC Repair",
      phone: "(770) 565-5884",
      rating: 4.7,
      address: "Local Service Area",
      description: "Professional AC repair and maintenance",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 3,
      name: "Anjana Kapur",
      category: "Academic Tutoring",
      phone: "(331) 330-5960",
      rating: 4.9,
      address: "Math Tutoring Services",
      description: "Expert math tutoring for all levels",
      hours: "Flexible scheduling"
    },
    {
      id: 4,
      name: "Mathew Jo",
      category: "Auto Repair",
      phone: "(404) 748-3025",
      rating: 4.6,
      address: "Local Auto Service",
      description: "Professional car repair services",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 5,
      name: "Michael Pack",
      category: "Basketball",
      phone: "(678) 457-1760",
      rating: 4.5,
      address: "Local Basketball Training",
      description: "Basketball coaching and training",
      hours: "Flexible scheduling"
    },
    {
      id: 6,
      name: "Gabriela Mejia",
      category: "Cleaning Services",
      phone: "(404) 632-2519",
      rating: 4.7,
      address: "Residential Cleaning",
      description: "Professional house cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    },
    {
      id: 7,
      name: "Lorena",
      category: "Cleaning Services",
      phone: "(770) 895-9381",
      rating: 4.6,
      address: "Home Cleaning",
      description: "Reliable home cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    },
    {
      id: 8,
      name: "Maricelo",
      category: "Cleaning Services",
      phone: "(404) 207-8272",
      rating: 4.5,
      address: "Cleaning Services",
      description: "Professional cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    },
    {
      id: 9,
      name: "MLC Atlanta",
      category: "Cricket",
      phone: "(609) 712-7235",
      rating: 4.4,
      address: "Cricket Training",
      description: "Cricket coaching and training",
      hours: "Weekends & Evenings"
    },
    {
      id: 10,
      name: "GeoSports Cricket Academy",
      category: "Cricket",
      phone: "(404) 429-4656",
      rating: 4.6,
      address: "Cricket Academy",
      description: "Professional cricket academy training",
      hours: "Mon-Sun 4PM-8PM"
    },
    {
      id: 11,
      name: "Ivy Debate",
      category: "Debate",
      phone: "(404) 519-7715",
      rating: 4.8,
      address: "Debate Training",
      description: "Professional debate coaching",
      hours: "After school hours"
    },
    {
      id: 12,
      name: "Sears Home Warranty",
      category: "Appliance Repair",
      phone: "(855) 256-2467",
      rating: 4.2,
      address: "Dishwasher Repair",
      description: "Home appliance repair services",
      hours: "24/7 Service"
    },
    {
      id: 13,
      name: "Parsons Pointe Dental Care",
      category: "Dental",
      phone: "(770) 538-1203",
      rating: 4.9,
      address: "Dental Practice",
      description: "Complete dental care services",
      hours: "Mon-Fri 8AM-5PM"
    },
    {
      id: 14,
      name: "Supriti Dental",
      category: "Dental",
      phone: "(678) 620-5001",
      rating: 4.8,
      address: "Dental Services",
      description: "Professional dental care",
      hours: "Mon-Fri 8AM-5PM"
    },
    {
      id: 15,
      name: "8Thirty Electric",
      category: "Electrical",
      phone: "(678) 208-3575",
      rating: 4.7,
      address: "Electrical Services",
      description: "Professional electrical services",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 16,
      name: "Frank Alvarez",
      category: "Electrical",
      phone: "(770) 815-0029",
      rating: 4.6,
      address: "Electrical Contractor",
      description: "Licensed electrical contractor",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 17,
      name: "Robert - Xclusive Construction",
      category: "Flooring",
      phone: "(404) 304-6156",
      rating: 4.8,
      address: "Epoxy & Polyaspartic Coating",
      description: "Professional flooring solutions",
      hours: "Mon-Fri 8AM-5PM"
    },
    {
      id: 18,
      name: "VJ Gupta - Legacy First LLC",
      category: "Financial Services",
      phone: "(757) 450-2045",
      rating: 4.9,
      address: "Financial Planning",
      description: "Wills, trusts, and life insurance",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 19,
      name: "Ajai Koya",
      category: "Financial Services",
      phone: "(860) 839-8696",
      rating: 4.7,
      address: "Insurance Services",
      description: "Life insurance and financial planning",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 20,
      name: "Muralidhara Rao Seella",
      category: "Financial Services",
      phone: "(470) 604-0555",
      rating: 4.8,
      address: "Notary & Financial Services",
      description: "Notary services, wills, and insurance",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 21,
      name: "Prolift Garage Doors",
      category: "Garage Door",
      phone: "(470) 354-0299",
      rating: 4.5,
      address: "Garage Door Services",
      description: "Garage door repair and tuneup",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 22,
      name: "Rojas Gutter Cleaning",
      category: "Gutter Services",
      phone: "(678) 523-6606",
      rating: 4.6,
      address: "Gutter Maintenance",
      description: "Professional gutter cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    },
    {
      id: 23,
      name: "Charles Handyman",
      category: "Handyman",
      phone: "(913) 710-4108",
      rating: 4.7,
      address: "General Handyman Services",
      description: "Professional handyman services",
      hours: "Mon-Sat 8AM-6PM"
    },
    {
      id: 24,
      name: "Matt Cose",
      category: "Handyman",
      phone: "(770) 826-4074",
      rating: 4.6,
      address: "Handyman Services",
      description: "Reliable handyman services",
      hours: "Mon-Sat 8AM-6PM"
    },
    {
      id: 25,
      name: "Goyo Handyman",
      category: "Handyman",
      phone: "(404) 990-0941",
      rating: 4.5,
      address: "Handyman Services",
      description: "Professional handyman services",
      hours: "Mon-Sat 8AM-6PM"
    },
    {
      id: 26,
      name: "Alejandra Paredes",
      category: "Household Help",
      phone: "(770) 256-8292",
      rating: 4.8,
      address: "Cooking & Household Help",
      description: "Household and cooking assistance",
      hours: "Flexible scheduling"
    },
    {
      id: 27,
      name: "Archana Gupta",
      category: "Jewelry & Decor",
      phone: "(757) 615-2674",
      rating: 4.7,
      address: "Indian Jewelry & Interior Design",
      description: "Costume jewelry and interior decorating",
      hours: "By appointment"
    },
    {
      id: 28,
      name: "Remya (Radha Designs)",
      category: "Jewelry",
      phone: "(404) 421-4595",
      rating: 4.6,
      address: "Indian Imitation Jewelry",
      description: "Beautiful Indian imitation jewelry",
      hours: "By appointment"
    },
    {
      id: 29,
      name: "Roberto Gomez",
      category: "Landscaping",
      phone: "(404) 569-1382",
      rating: 4.7,
      address: "Landscaping Services",
      description: "Professional landscaping services",
      hours: "Mon-Sat 7AM-5PM"
    },
    {
      id: 30,
      name: "Monika Gehani",
      category: "Life Insurance",
      phone: "(678) 525-0830",
      rating: 4.8,
      address: "Insurance Services",
      description: "Life insurance services",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 31,
      name: "Shipra Sharma",
      category: "Catering",
      phone: "(502) 546-4244",
      rating: 4.9,
      address: "Home Cooked Meals",
      description: "Home cooked meal catering",
      hours: "By appointment"
    },
    {
      id: 32,
      name: "Sushma Reddy - Nemali Jewelry",
      category: "Silver Jewelry",
      phone: "(843) 460-7230",
      rating: 4.7,
      address: "Silver Jewelry Designer",
      description: "Custom silver jewelry designs",
      hours: "By appointment"
    },
    {
      id: 33,
      name: "Nimo",
      category: "Painting",
      phone: "(770) 895-2384",
      rating: 4.6,
      address: "Painting Services",
      description: "Professional painting services",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 34,
      name: "Miranda",
      category: "Painting",
      phone: "(770) 912-6739",
      rating: 4.5,
      address: "Painting Services",
      description: "Interior and exterior painting",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 35,
      name: "Carlos",
      category: "Painting",
      phone: "(678) 852-7616",
      rating: 4.4,
      address: "Painting Services",
      description: "Professional painting contractor",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 36,
      name: "Music & Arts, Johns Creek",
      category: "Music Lessons",
      phone: "(770) 495-5877",
      rating: 4.8,
      address: "Piano & Violin Lessons",
      description: "Professional music instruction",
      hours: "Mon-Sat 10AM-8PM"
    },
    {
      id: 37,
      name: "Navya",
      category: "Music Lessons",
      phone: "(609) 832-8070",
      rating: 4.9,
      address: "Violin & Carnatic Vocal",
      description: "Violin and carnatic vocal lessons",
      hours: "Flexible scheduling"
    },
    {
      id: 38,
      name: "Ms Maryna",
      category: "Music Lessons",
      phone: "(770) 317-4768",
      rating: 4.7,
      address: "Violin Lessons",
      description: "Professional violin instruction",
      hours: "After school hours"
    },
    {
      id: 39,
      name: "Cristomar",
      category: "Rug Services",
      phone: "(770) 753-4242",
      rating: 4.5,
      address: "Rug Shop & Cleaning",
      description: "Rug sales and cleaning services",
      hours: "Mon-Sat 9AM-6PM"
    },
    {
      id: 40,
      name: "Big Blue Swim School",
      category: "Swimming",
      phone: "(770) 308-8227",
      rating: 4.8,
      address: "Swimming Lessons",
      description: "Professional swimming instruction",
      hours: "Mon-Sun 9AM-8PM"
    },
    {
      id: 41,
      name: "Victor Chatterjee",
      category: "Tennis",
      phone: "(706) 248-3438",
      rating: 4.7,
      address: "Tennis Coaching",
      description: "Professional tennis coaching",
      hours: "Flexible scheduling"
    },
    {
      id: 42,
      name: "Aryan Patel",
      category: "Tennis",
      phone: "(404) 402-2316",
      rating: 4.6,
      address: "Tennis Instruction",
      description: "Tennis coaching and instruction",
      hours: "After school & weekends"
    },
    {
      id: 43,
      name: "Beau Dorsey",
      category: "Tennis",
      phone: "(404) 242-9199",
      rating: 4.5,
      address: "Tennis Coaching",
      description: "Professional tennis coaching",
      hours: "Flexible scheduling"
    },
    {
      id: 44,
      name: "Nellie Shah",
      category: "Legal Services",
      phone: "nshah@neelishahlaw.com",
      rating: 4.9,
      address: "Will & Insurance Law",
      description: "Legal services for wills and insurance",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 45,
      name: "Priyanka Bansal",
      category: "Yoga",
      phone: "(781) 353-1175",
      rating: 4.8,
      address: "Yoga Instruction",
      description: "Professional yoga lessons",
      hours: "Flexible scheduling"
    },
    {
      id: 46,
      name: "Yash Shah",
      category: "Real Estate",
      phone: "(404) 735-4511",
      rating: 4.7,
      address: "CB Realty",
      description: "Professional real estate services",
      hours: "Mon-Sun 9AM-8PM"
    },
    {
      id: 47,
      name: "Neil Makadia",
      category: "Real Estate",
      phone: "(678) 453-4089",
      rating: 4.6,
      address: "EXP Realty",
      description: "Experienced real estate agent",
      hours: "Mon-Sun 9AM-8PM"
    },
    {
      id: 48,
      name: "Karim Kammruddin",
      category: "Mortgage",
      phone: "(404) 916-1994",
      rating: 4.8,
      address: "Residential Mortgage Loans",
      description: "Residential mortgage loan services",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 49,
      name: "PestDefense Pest Solutions",
      category: "Pest Control",
      phone: "(770) 446-7855",
      rating: 4.5,
      address: "Pest Control Services",
      description: "Professional pest control solutions",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: 50,
      name: "Nina - Omboutique",
      category: "Children's Clothing",
      phone: "Contact via Etsy",
      rating: 4.7,
      address: "Indian Children's Attire",
      description: "Beautiful Indian attire for children",
      hours: "Online orders"
    },
    {
      id: 51,
      name: "Maha Veliventi - Makers Mantra",
      category: "Custom T-Shirts",
      phone: "(470) 222-4658",
      rating: 4.6,
      address: "Custom T-Shirt Design",
      description: "Custom t-shirt printing and design",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 52,
      name: "Nitin Nadkar",
      category: "Business Consulting",
      phone: "(650) 447-4812",
      rating: 4.8,
      address: "Business Consulting",
      description: "Professional business consulting services",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: 53,
      name: "Shan Home Improvements",
      category: "Home Improvement",
      phone: "(770) 291-9445",
      rating: 4.7,
      address: "Basement Finishing",
      description: "Basement finishing and home improvements",
      hours: "Mon-Fri 8AM-6PM"
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
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">BMP Yellow Pages</h1>
                <p className="text-yellow-100">www.bmpyellowpages.com</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">BMP Community Directory</h2>
          <p className="text-xl text-yellow-100 mb-8">Your trusted local business directory</p>
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
          <h3 className="text-xl font-semibold mb-4">BMP Yellow Pages</h3>
          <p className="text-gray-400 mb-4">www.bmpyellowpages.com - Connecting our community since 2025</p>
          <p className="text-sm text-gray-500">© 2025 BMP Yellow Pages. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;