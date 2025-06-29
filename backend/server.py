from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

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
@api_router.get("/vendors", response_model=List[Vendor])
async def get_vendors():
    """Get all vendors"""
    vendors = await db.vendors.find().to_list(1000)
    for vendor in vendors:
        if "_id" in vendor:
            del vendor["_id"]
    return [Vendor(**vendor) for vendor in vendors]

@api_router.post("/vendors", response_model=Vendor)
async def create_vendor(vendor: VendorCreate):
    """Add a new vendor"""
    vendor_dict = vendor.dict()
    vendor_obj = Vendor(**vendor_dict)
    
    # Check if vendor with same name already exists
    existing_vendor = await db.vendors.find_one({"name": vendor_obj.name})
    if existing_vendor:
        raise HTTPException(status_code=400, detail="Vendor with this name already exists")
    
    await db.vendors.insert_one(vendor_obj.dict())
    return vendor_obj

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
    
    # Initial vendor data
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
        }
    ]
    
    # Add created_at timestamp to each vendor
    for vendor in initial_vendors:
        vendor["created_at"] = datetime.utcnow()
    
    await db.vendors.insert_many(initial_vendors)
    return {"message": f"Seeded {len(initial_vendors)} vendors successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()