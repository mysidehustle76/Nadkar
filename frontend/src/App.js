import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Static vendor data (all 51 vendors) - moved to top for immediate availability
  const staticVendors = [
    {
      id: "1",
      name: "Nina Dalsania (N5 LLC)",
      category: "Accounting & Tax",
      phone: "(202) 710-5489",
      rating: 4.8,
      address: "Personal & Small Business Services",
      description: "Professional accounting and tax services",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "2",
      name: "Anjana Kapur",
      category: "Academic Tutoring",
      phone: "(331) 330-5960",
      rating: 4.9,
      address: "Math Tutoring Services",
      description: "Expert math tutoring for all levels",
      hours: "Flexible scheduling"
    },
    {
      id: "3",
      name: "Mathew Jo",
      category: "Auto Repair",
      phone: "(404) 748-3025",
      rating: 4.6,
      address: "Local Auto Service",
      description: "Professional car repair services",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "4",
      name: "Michael Pack",
      category: "Basketball",
      phone: "(678) 457-1760",
      rating: 4.5,
      address: "Local Basketball Training",
      description: "Basketball coaching and training",
      hours: "Flexible scheduling"
    },
    {
      id: "5",
      name: "Gabriela Mejia",
      category: "Cleaning Services",
      phone: "(404) 632-2519",
      rating: 4.7,
      address: "Residential Cleaning",
      description: "Professional house cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    }
  ];

  const [vendors, setVendors] = useState(staticVendors);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for adding new vendor
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: '',
    phone: '',
    rating: 4.5,
    address: '',
    description: '',
    hours: 'Mon-Fri 9AM-5PM'
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
    try {
      const response = await fetch(`${BACKEND_URL}/api/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVendor),
      });

      if (response.ok) {
        const addedVendor = await response.json();
        setVendors(prev => [...prev, addedVendor]);
        setNewVendor({
          name: '',
          category: '',
          phone: '',
          rating: 4.5,
          address: '',
          description: '',
          hours: 'Mon-Fri 9AM-5PM'
        });
        setShowAddForm(false);
        alert('Vendor added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail}`);
      }
    } catch (err) {
      console.error('Error adding vendor:', err);
      alert('Error adding vendor. Please try again.');
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
    fetchVendors();
  }, []);

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const categories = [...new Set(vendors.map(vendor => vendor.category))].sort();

  // Static vendor data (fallback) - All 51 original vendors
  const staticVendors = [
    {
      id: "1",
      name: "Nina Dalsania (N5 LLC)",
      category: "Accounting & Tax",
      phone: "(202) 710-5489",
      rating: 4.8,
      address: "Personal & Small Business Services",
      description: "Professional accounting and tax services",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "2",
      name: "Anjana Kapur",
      category: "Academic Tutoring",
      phone: "(331) 330-5960",
      rating: 4.9,
      address: "Math Tutoring Services",
      description: "Expert math tutoring for all levels",
      hours: "Flexible scheduling"
    },
    {
      id: "3",
      name: "Mathew Jo",
      category: "Auto Repair",
      phone: "(404) 748-3025",
      rating: 4.6,
      address: "Local Auto Service",
      description: "Professional car repair services",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "4",
      name: "Michael Pack",
      category: "Basketball",
      phone: "(678) 457-1760",
      rating: 4.5,
      address: "Local Basketball Training",
      description: "Basketball coaching and training",
      hours: "Flexible scheduling"
    },
    {
      id: "5",
      name: "Gabriela Mejia",
      category: "Cleaning Services",
      phone: "(404) 632-2519",
      rating: 4.7,
      address: "Residential Cleaning",
      description: "Professional house cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    },
    {
      id: "6",
      name: "Lorena",
      category: "Cleaning Services",
      phone: "(770) 895-9381",
      rating: 4.6,
      address: "Home Cleaning",
      description: "Reliable home cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    },
    {
      id: "7",
      name: "Maricelo",
      category: "Cleaning Services",
      phone: "(404) 207-8272",
      rating: 4.5,
      address: "Cleaning Services",
      description: "Professional cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    },
    {
      id: "8",
      name: "MLC Atlanta",
      category: "Cricket",
      phone: "(609) 712-7235",
      rating: 4.4,
      address: "Cricket Training",
      description: "Cricket coaching and training",
      hours: "Weekends & Evenings"
    },
    {
      id: "9",
      name: "GeoSports Cricket Academy",
      category: "Cricket",
      phone: "(404) 429-4656",
      rating: 4.6,
      address: "Cricket Academy",
      description: "Professional cricket academy training",
      hours: "Mon-Sun 4PM-8PM"
    },
    {
      id: "10",
      name: "Ivy Debate",
      category: "Debate",
      phone: "(404) 519-7715",
      rating: 4.8,
      address: "Debate Training",
      description: "Professional debate coaching",
      hours: "After school hours"
    },
    {
      id: "11",
      name: "Sears Home Warranty",
      category: "Appliance Repair",
      phone: "(855) 256-2467",
      rating: 4.2,
      address: "Dishwasher Repair",
      description: "Home appliance repair services",
      hours: "24/7 Service"
    },
    {
      id: "12",
      name: "Parsons Pointe Dental Care",
      category: "Dental",
      phone: "(770) 538-1203",
      rating: 4.9,
      address: "Dental Practice",
      description: "Complete dental care services",
      hours: "Mon-Fri 8AM-5PM"
    },
    {
      id: "13",
      name: "Supriti Dental",
      category: "Dental",
      phone: "(678) 620-5001",
      rating: 4.8,
      address: "Dental Services",
      description: "Professional dental care",
      hours: "Mon-Fri 8AM-5PM"
    },
    {
      id: "14",
      name: "8Thirty Electric",
      category: "Electrical",
      phone: "(678) 208-3575",
      rating: 4.7,
      address: "Electrical Services",
      description: "Professional electrical services",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "15",
      name: "Frank Alvarez",
      category: "Electrical",
      phone: "(770) 815-0029",
      rating: 4.6,
      address: "Electrical Contractor",
      description: "Licensed electrical contractor",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "16",
      name: "Robert - Xclusive Construction",
      category: "Flooring",
      phone: "(404) 304-6156",
      rating: 4.8,
      address: "Epoxy & Polyaspartic Coating",
      description: "Professional flooring solutions",
      hours: "Mon-Fri 8AM-5PM"
    },
    {
      id: "17",
      name: "VJ Gupta - Legacy First LLC",
      category: "Financial Services",
      phone: "(757) 450-2045",
      rating: 4.9,
      address: "Financial Planning",
      description: "Wills, trusts, and life insurance",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "18",
      name: "Ajai Koya",
      category: "Financial Services",
      phone: "(860) 839-8696",
      rating: 4.7,
      address: "Insurance Services",
      description: "Life insurance and financial planning",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "19",
      name: "Muralidhara Rao Seella",
      category: "Financial Services",
      phone: "(470) 604-0555",
      rating: 4.8,
      address: "Notary & Financial Services",
      description: "Notary services, wills, and insurance",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "20",
      name: "Prolift Garage Doors",
      category: "Garage Door",
      phone: "(470) 354-0299",
      rating: 4.5,
      address: "Garage Door Services",
      description: "Garage door repair and tuneup",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "21",
      name: "Rojas Gutter Cleaning",
      category: "Gutter Services",
      phone: "(678) 523-6606",
      rating: 4.6,
      address: "Gutter Maintenance",
      description: "Professional gutter cleaning services",
      hours: "Mon-Sat 8AM-5PM"
    },
    {
      id: "22",
      name: "Charles Handyman",
      category: "Handyman",
      phone: "(913) 710-4108",
      rating: 4.7,
      address: "General Handyman Services",
      description: "Professional handyman services",
      hours: "Mon-Sat 8AM-6PM"
    },
    {
      id: "23",
      name: "Matt Cose",
      category: "Handyman",
      phone: "(770) 826-4074",
      rating: 4.6,
      address: "Handyman Services",
      description: "Reliable handyman services",
      hours: "Mon-Sat 8AM-6PM"
    },
    {
      id: "24",
      name: "Goyo Handyman",
      category: "Handyman",
      phone: "(404) 990-0941",
      rating: 4.5,
      address: "Handyman Services",
      description: "Professional handyman services",
      hours: "Mon-Sat 8AM-6PM"
    },
    {
      id: "25",
      name: "Alejandra Paredes",
      category: "Household Help",
      phone: "(770) 256-8292",
      rating: 4.8,
      address: "Cooking & Household Help",
      description: "Household and cooking assistance",
      hours: "Flexible scheduling"
    },
    {
      id: "26",
      name: "Archana Gupta",
      category: "Jewelry & Decor",
      phone: "(757) 615-2674",
      rating: 4.7,
      address: "Indian Jewelry & Interior Design",
      description: "Costume jewelry and interior decorating",
      hours: "By appointment"
    },
    {
      id: "27",
      name: "Remya (Radha Designs)",
      category: "Jewelry",
      phone: "(404) 421-4595",
      rating: 4.6,
      address: "Indian Imitation Jewelry",
      description: "Beautiful Indian imitation jewelry",
      hours: "By appointment"
    },
    {
      id: "28",
      name: "Roberto Gomez",
      category: "Landscaping",
      phone: "(404) 569-1382",
      rating: 4.7,
      address: "Landscaping Services",
      description: "Professional landscaping services",
      hours: "Mon-Sat 7AM-5PM"
    },
    {
      id: "29",
      name: "Monika Gehani",
      category: "Life Insurance",
      phone: "(678) 525-0830",
      rating: 4.8,
      address: "Insurance Services",
      description: "Life insurance services",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "30",
      name: "Shipra Sharma",
      category: "Catering",
      phone: "(502) 546-4244",
      rating: 4.9,
      address: "Home Cooked Meals",
      description: "Home cooked meal catering",
      hours: "By appointment"
    },
    {
      id: "31",
      name: "Sushma Reddy - Nemali Jewelry",
      category: "Silver Jewelry",
      phone: "(843) 460-7230",
      rating: 4.7,
      address: "Silver Jewelry Designer",
      description: "Custom silver jewelry designs",
      hours: "By appointment"
    },
    {
      id: "32",
      name: "Nimo",
      category: "Painting",
      phone: "(770) 895-2384",
      rating: 4.6,
      address: "Painting Services",
      description: "Professional painting services",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "33",
      name: "Miranda",
      category: "Painting",
      phone: "(770) 912-6739",
      rating: 4.5,
      address: "Painting Services",
      description: "Interior and exterior painting",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "34",
      name: "Carlos",
      category: "Painting",
      phone: "(678) 852-7616",
      rating: 4.4,
      address: "Painting Services",
      description: "Professional painting contractor",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "35",
      name: "Music & Arts, Johns Creek",
      category: "Music Lessons",
      phone: "(770) 495-5877",
      rating: 4.8,
      address: "Piano & Violin Lessons",
      description: "Professional music instruction",
      hours: "Mon-Sat 10AM-8PM"
    },
    {
      id: "36",
      name: "Navya",
      category: "Music Lessons",
      phone: "(609) 832-8070",
      rating: 4.9,
      address: "Violin & Carnatic Vocal",
      description: "Violin and carnatic vocal lessons",
      hours: "Flexible scheduling"
    },
    {
      id: "37",
      name: "Ms Maryna",
      category: "Music Lessons",
      phone: "(770) 317-4768",
      rating: 4.7,
      address: "Violin Lessons",
      description: "Professional violin instruction",
      hours: "After school hours"
    },
    {
      id: "38",
      name: "Cristomar",
      category: "Rug Services",
      phone: "(770) 753-4242",
      rating: 4.5,
      address: "Rug Shop & Cleaning",
      description: "Rug sales and cleaning services",
      hours: "Mon-Sat 9AM-6PM"
    },
    {
      id: "39",
      name: "Big Blue Swim School",
      category: "Swimming",
      phone: "(770) 308-8227",
      rating: 4.8,
      address: "Swimming Lessons",
      description: "Professional swimming instruction",
      hours: "Mon-Sun 9AM-8PM"
    },
    {
      id: "40",
      name: "Victor Chatterjee",
      category: "Tennis",
      phone: "(706) 248-3438",
      rating: 4.7,
      address: "Tennis Coaching",
      description: "Professional tennis coaching",
      hours: "Flexible scheduling"
    },
    {
      id: "41",
      name: "Aryan Patel",
      category: "Tennis",
      phone: "(404) 402-2316",
      rating: 4.6,
      address: "Tennis Instruction",
      description: "Tennis coaching and instruction",
      hours: "After school & weekends"
    },
    {
      id: "42",
      name: "Beau Dorsey",
      category: "Tennis",
      phone: "(404) 242-9199",
      rating: 4.5,
      address: "Tennis Coaching",
      description: "Professional tennis coaching",
      hours: "Flexible scheduling"
    },
    {
      id: "43",
      name: "Nellie Shah",
      category: "Legal Services",
      phone: "nshah@neelishahlaw.com",
      rating: 4.9,
      address: "Will & Insurance Law",
      description: "Legal services for wills and insurance",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "44",
      name: "Priyanka Bansal",
      category: "Yoga",
      phone: "(781) 353-1175",
      rating: 4.8,
      address: "Yoga Instruction",
      description: "Professional yoga lessons",
      hours: "Flexible scheduling"
    },
    {
      id: "45",
      name: "Yash Shah",
      category: "Real Estate",
      phone: "(404) 735-4511",
      rating: 4.7,
      address: "CB Realty",
      description: "Professional real estate services",
      hours: "Mon-Sun 9AM-8PM"
    },
    {
      id: "46",
      name: "Neil Makadia",
      category: "Real Estate",
      phone: "(678) 453-4089",
      rating: 4.6,
      address: "EXP Realty",
      description: "Experienced real estate agent",
      hours: "Mon-Sun 9AM-8PM"
    },
    {
      id: "47",
      name: "Karim Kammruddin",
      category: "Mortgage",
      phone: "(404) 916-1994",
      rating: 4.8,
      address: "Residential Mortgage Loans",
      description: "Residential mortgage loan services",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "48",
      name: "PestDefense Pest Solutions",
      category: "Pest Control",
      phone: "(770) 446-7855",
      rating: 4.5,
      address: "Pest Control Services",
      description: "Professional pest control solutions",
      hours: "Mon-Fri 8AM-6PM"
    },
    {
      id: "49",
      name: "Nina - Omboutique",
      category: "Children's Clothing",
      phone: "Contact via Etsy",
      rating: 4.7,
      address: "Indian Children's Attire",
      description: "Beautiful Indian attire for children",
      hours: "Online orders"
    },
    {
      id: "50",
      name: "Maha Veliventi - Makers Mantra",
      category: "Custom T-Shirts",
      phone: "(470) 222-4658",
      rating: 4.6,
      address: "Custom T-Shirt Design",
      description: "Custom t-shirt printing and design",
      hours: "Mon-Fri 9AM-6PM"
    },
    {
      id: "51",
      name: "Shan Home Improvements",
      category: "Home Improvement",
      phone: "(770) 291-9445",
      rating: 4.7,
      address: "Basement Finishing",
      description: "Basement finishing and home improvements",
      hours: "Mon-Fri 8AM-6PM"
    }
  ];

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
          src="https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg" 
          alt="Bellmoore Park Community" 
          className="w-full h-48 object-cover"
        />
      </section>

      {/* Admin Panel Toggle */}
      <div className="bg-yellow-400 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">BMP Yellow Pages</h1>
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {showAdminPanel ? 'Hide Admin' : 'Admin Panel'}
          </button>
        </div>
      </div>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="bg-white border-b shadow-md">
          <div className="container mx-auto px-4 py-6">
            <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {showAddForm ? 'Cancel' : 'Add New Vendor'}
              </button>
              <button
                onClick={seedDatabase}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Seed Database
              </button>
              <div className="text-gray-600 flex items-center">
                Total Vendors: <span className="font-bold ml-1">{vendors.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Form */}
      {showAddForm && (
        <div className="bg-gray-100 border-b">
          <div className="container mx-auto px-4 py-6">
            <h3 className="text-lg font-bold mb-4">Add New Vendor</h3>
            <form onSubmit={addVendor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter business name"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({...newVendor, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Business address or area"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="text"
                  value={newVendor.hours}
                  onChange={(e) => setNewVendor({...newVendor, hours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Mon-Fri 9AM-5PM"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={newVendor.description}
                  onChange={(e) => setNewVendor({...newVendor, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of services"
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-yellow-400 text-white px-6 py-3 rounded-lg hover:bg-yellow-500 font-semibold transition-colors"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendors List */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{vendor.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {vendor.category}
                    </span>
                    {showAdminPanel && (
                      <button
                        onClick={() => deleteVendor(vendor.id)}
                        className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition-colors"
                        title="Delete vendor"
                      >
                        ✕
                      </button>
                    )}
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
                  <span>{vendor.phone}</span>
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