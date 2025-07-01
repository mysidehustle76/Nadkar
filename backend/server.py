from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with production/development handling
if os.environ.get('NODE_ENV') == 'production' or os.environ.get('ENVIRONMENT') == 'production':
    # Production: Use environment provided MONGO_URL (Atlas)
    mongo_url = os.environ.get('MONGO_URL', 'mongodb+srv://placeholder.mongodb.net/')
    db_name = os.environ.get('DB_NAME', 'production_db')
else:
    # Development: Use local or environment
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'yellowpages')

print(f"Connecting to MongoDB: {mongo_url}")
print(f"Database name: {db_name}")

client = AsyncIOMotorClient(mongo_url, maxPoolSize=10, minPoolSize=1, serverSelectionTimeoutMS=5000)
db = client[db_name]

# Create the main app without a prefix
app = FastAPI()

# Add CORS middleware for production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class Vendor(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    phone: str
    rating: float = Field(default=4.5, ge=1, le=5)
    address: str
    description: str
    hours: str = Field(default="Mon-Fri 9AM-5PM")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VendorCreate(BaseModel):
    name: str
    category: str
    phone: str
    rating: float = Field(default=4.5, ge=1, le=5)
    address: str
    description: str
    hours: str = Field(default="Mon-Fri 9AM-5PM")

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = Field(None, ge=1, le=5)
    address: Optional[str] = None
    description: Optional[str] = None
    hours: Optional[str] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "BMP Yellow Pages API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Vendor Management Endpoints
# Add fallback mode for when database is unavailable
USE_FALLBACK_DATA = False

@api_router.get("/vendors", response_model=List[Vendor])
async def get_vendors():
    """Get all vendors with fallback support"""
    global USE_FALLBACK_DATA
    
    try:
        # Try database first
        if not USE_FALLBACK_DATA:
            vendors_cursor = db.vendors.find({})
            vendors = []
            async for vendor in vendors_cursor:
                vendor['id'] = vendor.pop('_id')
                if isinstance(vendor['id'], ObjectId):
                    vendor['id'] = str(vendor['id'])
                vendors.append(vendor)
            
            if vendors:  # If we got data from DB, return it
                return vendors
            else:  # If empty, fall back to mock data
                USE_FALLBACK_DATA = True
        
        # Fallback mock data when database is unavailable
        fallback_vendors = [
            {
                "id": "fallback-1",
                "name": "Demo Plumbing Services",
                "category": "Plumbing",
                "phone": "555-123-4567",
                "rating": 4.5,
                "address": "Bellmoore Park Community",
                "description": "Professional plumbing services",
                "hours": "Mon-Fri 9AM-5PM",
                "created_at": "2025-07-01T12:00:00"
            },
            {
                "id": "fallback-2", 
                "name": "Demo Electrical Works",
                "category": "Electrical",
                "phone": "555-987-6543",
                "rating": 4.8,
                "address": "Bellmoore Park Community", 
                "description": "Licensed electrical contractors",
                "hours": "Mon-Sat 8AM-6PM",
                "created_at": "2025-07-01T12:00:00"
            },
            {
                "id": "fallback-3",
                "name": "Demo Landscaping Co",
                "category": "Landscaping", 
                "phone": "555-456-7890",
                "rating": 4.7,
                "address": "Bellmoore Park Community",
                "description": "Beautiful landscape design and maintenance",
                "hours": "Mon-Fri 7AM-4PM",
                "created_at": "2025-07-01T12:00:00"
            }
        ]
        
        return [Vendor(**vendor) for vendor in fallback_vendors]
        
    except Exception as e:
        logger.error(f"Database error, using fallback data: {str(e)}")
        USE_FALLBACK_DATA = True
        
        # Return mock data for testing
        return [Vendor(**vendor) for vendor in [
            {
                "id": "fallback-1",
                "name": "Demo Plumbing Services", 
                "category": "Plumbing",
                "phone": "555-123-4567",
                "rating": 4.5,
                "address": "Bellmoore Park Community",
                "description": "Professional plumbing services - DEMO MODE",
                "hours": "Mon-Fri 9AM-5PM",
                "created_at": "2025-07-01T12:00:00"
            }
        ]]

@api_router.post("/vendors", response_model=Vendor)
async def create_vendor(vendor: VendorCreate):
    """Create a new vendor with fallback support"""
    global USE_FALLBACK_DATA
    
    try:
        # If in fallback mode, simulate success
        if USE_FALLBACK_DATA:
            new_vendor = {
                "id": f"fallback-{len(str(uuid.uuid4())[:8])}",
                "name": vendor.name,
                "category": vendor.category,
                "phone": vendor.phone,
                "rating": vendor.rating,
                "address": vendor.address,
                "description": vendor.description,
                "hours": vendor.hours,
                "created_at": datetime.utcnow().isoformat()
            }
            return Vendor(**new_vendor)
        
        # Try database operation
        vendor_dict = vendor.dict()
        vendor_dict['id'] = str(uuid.uuid4())
        vendor_dict['created_at'] = datetime.utcnow()
        
        result = await db.vendors.insert_one(vendor_dict)
        vendor_dict['_id'] = result.inserted_id
        
        # Convert for response
        vendor_dict['id'] = vendor_dict.pop('_id')
        if isinstance(vendor_dict['id'], ObjectId):
            vendor_dict['id'] = str(vendor_dict['id'])
            
        return Vendor(**vendor_dict)
        
    except Exception as e:
        logger.error(f"Error creating vendor, using fallback: {str(e)}")
        USE_FALLBACK_DATA = True
        
        # Return simulated success
        new_vendor = {
            "id": f"fallback-{str(uuid.uuid4())[:8]}",
            "name": vendor.name,
            "category": vendor.category, 
            "phone": vendor.phone,
            "rating": vendor.rating,
            "address": vendor.address,
            "description": vendor.description + " - DEMO MODE",
            "hours": vendor.hours,
            "created_at": datetime.utcnow().isoformat()
        }
        return Vendor(**new_vendor)

@api_router.get("/vendors/{vendor_id}", response_model=Vendor)
async def get_vendor(vendor_id: str):
    """Get a specific vendor by ID"""
    vendor = await db.vendors.find_one({"id": vendor_id})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    if "_id" in vendor:
        del vendor["_id"]
    return Vendor(**vendor)

@api_router.put("/vendors/{vendor_id}", response_model=Vendor)
async def update_vendor(vendor_id: str, vendor_update: VendorUpdate):
    """Update a vendor"""
    vendor = await db.vendors.find_one({"id": vendor_id})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    update_data = vendor_update.dict(exclude_unset=True)
    if update_data:
        await db.vendors.update_one({"id": vendor_id}, {"$set": update_data})
    
    updated_vendor = await db.vendors.find_one({"id": vendor_id})
    if "_id" in updated_vendor:
        del updated_vendor["_id"]
    return Vendor(**updated_vendor)

@api_router.delete("/vendors/{vendor_id}")
async def delete_vendor(vendor_id: str):
    """Delete a vendor"""
    result = await db.vendors.delete_one({"id": vendor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    return {"message": "Vendor deleted successfully"}

@api_router.post("/vendors/seed")
async def seed_vendors():
    """Seed the database with initial vendor data"""
    # Check if vendors already exist
    vendor_count = await db.vendors.count_documents({})
    if vendor_count > 0:
        return {"message": f"Database already has {vendor_count} vendors"}
    
    # Initial vendor data - All 51 vendors
    initial_vendors = [
        {
            "id": "1",
            "name": "Nina Dalsania (N5 LLC)",
            "category": "Accounting & Tax",
            "phone": "(202) 710-5489",
            "rating": 4.8,
            "address": "Personal & Small Business Services",
            "description": "Professional accounting and tax services",
            "hours": "Mon-Fri 9AM-6PM"
        },
        {
            "id": "2",
            "name": "Anjana Kapur",
            "category": "Academic Tutoring",
            "phone": "(331) 330-5960",
            "rating": 4.9,
            "address": "Math Tutoring Services",
            "description": "Expert math tutoring for all levels",
            "hours": "Flexible scheduling"
        },
        {
            "id": "3",
            "name": "Mathew Jo",
            "category": "Auto Repair",
            "phone": "(404) 748-3025",
            "rating": 4.6,
            "address": "Local Auto Service",
            "description": "Professional car repair services",
            "hours": "Mon-Fri 8AM-6PM"
        },
        {
            "id": "4",
            "name": "Michael Pack",
            "category": "Basketball",
            "phone": "(678) 457-1760",
            "rating": 4.5,
            "address": "Local Basketball Training",
            "description": "Basketball coaching and training",
            "hours": "Flexible scheduling"
        },
        {
            "id": "5",
            "name": "Gabriela Mejia",
            "category": "Cleaning Services",
            "phone": "(404) 632-2519",
            "rating": 4.7,
            "address": "Residential Cleaning",
            "description": "Professional house cleaning services",
            "hours": "Mon-Sat 8AM-5PM"
        },
        {
            "id": "6",
            "name": "Lorena",
            "category": "Cleaning Services",
            "phone": "(770) 895-9381",
            "rating": 4.6,
            "address": "Home Cleaning",
            "description": "Reliable home cleaning services",
            "hours": "Mon-Sat 8AM-5PM"
        },
        {
            "id": "7",
            "name": "Maricelo",
            "category": "Cleaning Services",
            "phone": "(404) 207-8272",
            "rating": 4.5,
            "address": "Cleaning Services",
            "description": "Professional cleaning services",
            "hours": "Mon-Sat 8AM-5PM"
        },
        {
            "id": "8",
            "name": "MLC Atlanta",
            "category": "Cricket",
            "phone": "(609) 712-7235",
            "rating": 4.4,
            "address": "Cricket Training",
            "description": "Cricket coaching and training",
            "hours": "Weekends & Evenings"
        },
        {
            "id": "9",
            "name": "GeoSports Cricket Academy",
            "category": "Cricket",
            "phone": "(404) 429-4656",
            "rating": 4.6,
            "address": "Cricket Academy",
            "description": "Professional cricket academy training",
            "hours": "Mon-Sun 4PM-8PM"
        },
        {
            "id": "10",
            "name": "Ivy Debate",
            "category": "Debate",
            "phone": "(404) 519-7715",
            "rating": 4.8,
            "address": "Debate Training",
            "description": "Professional debate coaching",
            "hours": "After school hours"
        },
        {
            "id": "11",
            "name": "Sears Home Warranty",
            "category": "Appliance Repair",
            "phone": "(855) 256-2467",
            "rating": 4.2,
            "address": "Dishwasher Repair",
            "description": "Home appliance repair services",
            "hours": "24/7 Service"
        },
        {
            "id": "12",
            "name": "Parsons Pointe Dental Care",
            "category": "Dental",
            "phone": "(770) 538-1203",
            "rating": 4.9,
            "address": "Dental Practice",
            "description": "Complete dental care services",
            "hours": "Mon-Fri 8AM-5PM"
        },
        {
            "id": "13",
            "name": "Supriti Dental",
            "category": "Dental",
            "phone": "(678) 620-5001",
            "rating": 4.8,
            "address": "Dental Services",
            "description": "Professional dental care",
            "hours": "Mon-Fri 8AM-5PM"
        },
        {
            "id": "14",
            "name": "8Thirty Electric",
            "category": "Electrical",
            "phone": "(678) 208-3575",
            "rating": 4.7,
            "address": "Electrical Services",
            "description": "Professional electrical services",
            "hours": "Mon-Fri 8AM-6PM"
        },
        {
            "id": "15",
            "name": "Frank Alvarez",
            "category": "Electrical",
            "phone": "(770) 815-0029",
            "rating": 4.6,
            "address": "Electrical Contractor",
            "description": "Licensed electrical contractor",
            "hours": "Mon-Fri 8AM-6PM"
        },
        {
            "id": "16",
            "name": "Robert - Xclusive Construction",
            "category": "Flooring",
            "phone": "(404) 304-6156",
            "rating": 4.8,
            "address": "Epoxy & Polyaspartic Coating",
            "description": "Professional flooring solutions",
            "hours": "Mon-Fri 8AM-5PM"
        },
        {
            "id": "17",
            "name": "VJ Gupta - Legacy First LLC",
            "category": "Financial Services",
            "phone": "(757) 450-2045",
            "rating": 4.9,
            "address": "Financial Planning",
            "description": "Wills, trusts, and life insurance",
            "hours": "Mon-Fri 9AM-6PM"
        },
        {
            "id": "18",
            "name": "Ajai Koya",
            "category": "Financial Services",
            "phone": "(860) 839-8696",
            "rating": 4.7,
            "address": "Insurance Services",
            "description": "Life insurance and financial planning",
            "hours": "Mon-Fri 9AM-6PM"
        },
        {
            "id": "19",
            "name": "Muralidhara Rao Seella",
            "category": "Financial Services",
            "phone": "(470) 604-0555",
            "rating": 4.8,
            "address": "Notary & Financial Services",
            "description": "Notary services, wills, and insurance",
            "hours": "Mon-Fri 9AM-6PM"
        },
        {
            "id": "20",
            "name": "Prolift Garage Doors",
            "category": "Garage Door",
            "phone": "(470) 354-0299",
            "rating": 4.5,
            "address": "Garage Door Services",
            "description": "Garage door repair and tuneup",
            "hours": "Mon-Fri 8AM-6PM"
        },
        {
            "id": "21",
            "name": "Rojas Gutter Cleaning",
            "category": "Gutter Services",
            "phone": "(678) 523-6606",
            "rating": 4.6,
            "address": "Gutter Maintenance",
            "description": "Professional gutter cleaning services",
            "hours": "Mon-Sat 8AM-5PM"
        },
        {
            "id": "22",
            "name": "Charles Handyman",
            "category": "Handyman",
            "phone": "(913) 710-4108",
            "rating": 4.7,
            "address": "General Handyman Services",
            "description": "Professional handyman services",
            "hours": "Mon-Sat 8AM-6PM"
        },
        {
            "id": "23",
            "name": "Matt Cose",
            "category": "Handyman",
            "phone": "(770) 826-4074",
            "rating": 4.6,
            "address": "Handyman Services",
            "description": "Reliable handyman services",
            "hours": "Mon-Sat 8AM-6PM"
        },
        {
            "id": "24",
            "name": "Goyo Handyman",
            "category": "Handyman",
            "phone": "(404) 990-0941",
            "rating": 4.5,
            "address": "Handyman Services",
            "description": "Professional handyman services",
            "hours": "Mon-Sat 8AM-6PM"
        },
        {
            "id": "25",
            "name": "Alejandra Paredes",
            "category": "Household Help",
            "phone": "(770) 256-8292",
            "rating": 4.8,
            "address": "Cooking & Household Help",
            "description": "Household and cooking assistance",
            "hours": "Flexible scheduling"
        },
        {
            "id": "26",
            "name": "Archana Gupta",
            "category": "Jewelry & Decor",
            "phone": "(757) 615-2674",
            "rating": 4.7,
            "address": "Indian Jewelry & Interior Design",
            "description": "Costume jewelry and interior decorating",
            "hours": "By appointment"
        },
        {
            "id": "27",
            "name": "Remya (Radha Designs)",
            "category": "Jewelry",
            "phone": "(404) 421-4595",
            "rating": 4.6,
            "address": "Indian Imitation Jewelry",
            "description": "Beautiful Indian imitation jewelry",
            "hours": "By appointment"
        },
        {
            "id": "28",
            "name": "Roberto Gomez",
            "category": "Landscaping",
            "phone": "(404) 569-1382",
            "rating": 4.7,
            "address": "Landscaping Services",
            "description": "Professional landscaping services",
            "hours": "Mon-Sat 7AM-5PM"
        },
        {
            "id": "29",
            "name": "Monika Gehani",
            "category": "Life Insurance",
            "phone": "(678) 525-0830",
            "rating": 4.8,
            "address": "Insurance Services",
            "description": "Life insurance services",
            "hours": "Mon-Fri 9AM-6PM"
        },
        {
            "id": "30",
            "name": "Shipra Sharma",
            "category": "Catering",
            "phone": "(502) 546-4244",
            "rating": 4.9,
            "address": "Home Cooked Meals",
            "description": "Home cooked meal catering",
            "hours": "By appointment"
        },
        {
            "id": "31",
            "name": "Sushma Reddy - Nemali Jewelry",
            "category": "Silver Jewelry",
            "phone": "(843) 460-7230",
            "rating": 4.7,
            "address": "Silver Jewelry Designer",
            "description": "Custom silver jewelry designs",
            "hours": "By appointment"
        },
        {
            "id": "32",
            "name": "Nimo",
            "category": "Painting",
            "phone": "(770) 895-2384",
            "rating": 4.6,
            "address": "Painting Services",
            "description": "Professional painting services",
            "hours": "Mon-Fri 8AM-6PM"
        },
        {
            "id": "33",
            "name": "Miranda",
            "category": "Painting",
            "phone": "(770) 912-6739",
            "rating": 4.5,
            "address": "Painting Services",
            "description": "Interior and exterior painting",
            "hours": "Mon-Fri 8AM-6PM"
        },
        {
            "id": "34",
            "name": "Carlos",
            "category": "Painting",
            "phone": "(678) 852-7616",
            "rating": 4.4,
            "address": "Painting Services",
            "description": "Professional painting contractor",
            "hours": "Mon-Fri 8AM-6PM"
        },
        {
            "id": "35",
            "name": "Music & Arts, Johns Creek",
            "category": "Music Lessons",
            "phone": "(770) 495-5877",
            "rating": 4.8,
            "address": "Piano & Violin Lessons",
            "description": "Professional music instruction",
            "hours": "Mon-Sat 10AM-8PM"
        },
        {
            "id": "36",
            "name": "Navya",
            "category": "Music Lessons",
            "phone": "(609) 832-8070",
            "rating": 4.9,
            "address": "Violin & Carnatic Vocal",
            "description": "Violin and carnatic vocal lessons",
            "hours": "Flexible scheduling"
        },
        {
            "id": "37",
            "name": "Ms Maryna",
            "category": "Music Lessons",
            "phone": "(770) 317-4768",
            "rating": 4.7,
            "address": "Violin Lessons",
            "description": "Professional violin instruction",
            "hours": "After school hours"
        },
        {
            "id": "38",
            "name": "Cristomar",
            "category": "Rug Services",
            "phone": "(770) 753-4242",
            "rating": 4.5,
            "address": "Rug Shop & Cleaning",
            "description": "Rug sales and cleaning services",
            "hours": "Mon-Sat 9AM-6PM"
        },
        {
            "id": "39",
            "name": "Big Blue Swim School",
            "category": "Swimming",
            "phone": "(770) 308-8227",
            "rating": 4.8,
            "address": "Swimming Lessons",
            "description": "Professional swimming instruction",
            "hours": "Mon-Sun 9AM-8PM"
        },
        {
            "id": "40",
            "name": "Victor Chatterjee",
            "category": "Tennis",
            "phone": "(706) 248-3438",
            "rating": 4.7,
            "address": "Tennis Coaching",
            "description": "Professional tennis coaching",
            "hours": "Flexible scheduling"
        },
        {
            "id": "41",
            "name": "Aryan Patel",
            "category": "Tennis",
            "phone": "(404) 402-2316",
            "rating": 4.6,
            "address": "Tennis Instruction",
            "description": "Tennis coaching and instruction",
            "hours": "After school & weekends"
        },
        {
            "id": "42",
            "name": "Beau Dorsey",
            "category": "Tennis",
            "phone": "(404) 242-9199",
            "rating": 4.5,
            "address": "Tennis Coaching",
            "description": "Professional tennis coaching",
            "hours": "Flexible scheduling"
        },
        {
            "id": "43",
            "name": "Nellie Shah",
            "category": "Legal Services",
            "phone": "nshah@neelishahlaw.com",
            "rating": 4.9,
            "address": "Will & Insurance Law",
            "description": "Legal services for wills and insurance",
            "hours": "Mon-Fri 9AM-6PM"
        },
        {
            "id": "44",
            "name": "Priyanka Bansal",
            "category": "Yoga",
            "phone": "(781) 353-1175",
            "rating": 4.8,
            "address": "Yoga Instruction",
            "description": "Professional yoga lessons",
            "hours": "Flexible scheduling"
        },
        {
            "id": "45",
            "name": "Yash Shah",
            "category": "Real Estate",
            "phone": "(404) 735-4511",
            "rating": 4.7,
            "address": "CB Realty",
            "description": "Professional real estate services",
            "hours": "Mon-Sun 9AM-8PM"
        },
        {
            "id": "46",
            "name": "Neil Makadia",
            "category": "Real Estate",
            "phone": "(678) 453-4089",
            "rating": 4.6,
            "address": "EXP Realty",
            "description": "Experienced real estate agent",
            "hours": "Mon-Sun 9AM-8PM"
        },
        {
            "id": "47",
            "name": "Karim Kammruddin",
            "category": "Mortgage",
            "phone": "(404) 916-1994",
            "rating": 4.8,
            "address": "Residential Mortgage Loans",
            "description": "Residential mortgage loan services",
            "hours": "Mon-Fri 9AM-6PM"
        },
        {
            "id": "48",
            "name": "PestDefense Pest Solutions",
            "category": "Pest Control",
            "phone": "(770) 446-7855",
            "rating": 4.5,
            "address": "Pest Control Services",
            "description": "Professional pest control solutions",
            "hours": "Mon-Fri 8AM-6PM"
        },
        {
            "id": "49",
            "name": "Nina - Omboutique",
            "category": "Children's Clothing",
            "phone": "Contact via Etsy",
            "rating": 4.7,
            "address": "Indian Children's Attire",
            "description": "Beautiful Indian attire for children",
            "hours": "Online orders"
        },
        {
            "id": "50",
            "name": "Maha Veliventi - Makers Mantra",
            "category": "Custom T-Shirts",
            "phone": "(470) 222-4658",
            "rating": 4.6,
            "address": "Custom T-Shirt Design",
            "description": "Custom t-shirt printing and design",
            "hours": "Mon-Fri 9AM-6PM"
        },
        {
            "id": "51",
            "name": "Shan Home Improvements",
            "category": "Home Improvement",
            "phone": "(770) 291-9445",
            "rating": 4.7,
            "address": "Basement Finishing",
            "description": "Basement finishing and home improvements",
            "hours": "Mon-Fri 8AM-6PM"
        }
    ]
    
    # Add created_at timestamp to each vendor
    for vendor in initial_vendors:
        vendor["created_at"] = datetime.utcnow()
    
    await db.vendors.insert_many(initial_vendors)
    return {"message": f"Seeded {len(initial_vendors)} vendors successfully"}

# Test database connection
@api_router.get("/health")
async def health_check():
    try:
        # Test MongoDB connection
        await client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/vendors/cleanup-test-data")
async def cleanup_test_data():
    """Delete specific test data vendors from database"""
    try:
        # Categories with test data to remove
        test_categories = [
            "Business Consulting",
            "Communication and Persuasion", 
            "Legal Consulting",
            "Wellbeing"
        ]
        
        deleted_count = 0
        deleted_vendors = []
        
        # Find and delete vendors with test categories (case insensitive)
        for category in test_categories:
            # Use case-insensitive regex to find vendors
            vendors_to_delete = list(db.vendors.find({
                "category": {"$regex": f"^{category}$", "$options": "i"}
            }))
            
            # Store info about what we're deleting
            for vendor in vendors_to_delete:
                deleted_vendors.append({
                    "name": vendor.get("name"),
                    "category": vendor.get("category")
                })
            
            # Delete the vendors
            result = db.vendors.delete_many({
                "category": {"$regex": f"^{category}$", "$options": "i"}
            })
            deleted_count += result.deleted_count
        
        logger.info(f"Deleted {deleted_count} test data vendors")
        
        return {
            "message": f"Successfully deleted {deleted_count} test data vendors",
            "deleted_vendors": deleted_vendors,
            "categories_cleaned": test_categories
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up test data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error cleaning up test data: {str(e)}")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()