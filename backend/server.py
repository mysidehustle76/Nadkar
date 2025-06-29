from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import uuid
from datetime import datetime
import re


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

# Vendor Models
class Vendor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_name: str = Field(..., min_length=1, max_length=100)
    service_provider_name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=15)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('vendor_name')
    def validate_vendor_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Vendor name cannot be empty')
        return v.strip()

    @validator('service_provider_name')
    def validate_service_provider_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Service provider name cannot be empty')
        return v.strip()

    @validator('phone_number')
    def validate_phone_number(cls, v):
        if not v or not v.strip():
            raise ValueError('Phone number cannot be empty')
        
        # Remove any spaces, dashes, or parentheses
        cleaned_phone = re.sub(r'[\s\-\(\)]', '', v)
        
        # Check if it contains only digits
        if not cleaned_phone.isdigit():
            raise ValueError('Phone number must contain only numeric characters')
        
        # Check length (10-15 digits is reasonable for international numbers)
        if len(cleaned_phone) < 10:
            raise ValueError('Phone number must be at least 10 digits')
        if len(cleaned_phone) > 15:
            raise ValueError('Phone number cannot be more than 15 digits')
        
        return cleaned_phone

class VendorCreate(BaseModel):
    vendor_name: str = Field(..., min_length=1, max_length=100)
    service_provider_name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=15)

    @validator('vendor_name')
    def validate_vendor_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Vendor name cannot be empty')
        return v.strip()

    @validator('service_provider_name')
    def validate_service_provider_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Service provider name cannot be empty')
        return v.strip()

    @validator('phone_number')
    def validate_phone_number(cls, v):
        if not v or not v.strip():
            raise ValueError('Phone number cannot be empty')
        
        # Remove any spaces, dashes, or parentheses
        cleaned_phone = re.sub(r'[\s\-\(\)]', '', v)
        
        # Check if it contains only digits
        if not cleaned_phone.isdigit():
            raise ValueError('Phone number must contain only numeric characters')
        
        # Check length (10-15 digits is reasonable for international numbers)
        if len(cleaned_phone) < 10:
            raise ValueError('Phone number must be at least 10 digits')
        if len(cleaned_phone) > 15:
            raise ValueError('Phone number cannot be more than 15 digits')
        
        return cleaned_phone

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

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

# Vendor endpoints
@api_router.post("/vendors", response_model=Vendor)
async def create_vendor(vendor_input: VendorCreate):
    try:
        # Check if vendor with same name already exists
        existing_vendor = await db.vendors.find_one({"vendor_name": vendor_input.vendor_name})
        if existing_vendor:
            raise HTTPException(
                status_code=400, 
                detail="A vendor with this name already exists"
            )
        
        # Check if phone number is already registered
        existing_phone = await db.vendors.find_one({"phone_number": vendor_input.phone_number})
        if existing_phone:
            raise HTTPException(
                status_code=400, 
                detail="This phone number is already registered with another vendor"
            )
        
        # Create vendor object
        vendor_dict = vendor_input.dict()
        vendor_obj = Vendor(**vendor_dict)
        
        # Insert into database
        result = await db.vendors.insert_one(vendor_obj.dict())
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create vendor")
        
        return vendor_obj
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating vendor: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/vendors", response_model=List[Vendor])
async def get_vendors():
    try:
        vendors = await db.vendors.find().sort("created_at", -1).to_list(1000)
        return [Vendor(**vendor) for vendor in vendors]
    except Exception as e:
        logger.error(f"Error fetching vendors: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch vendors")

@api_router.get("/vendors/{vendor_id}", response_model=Vendor)
async def get_vendor(vendor_id: str):
    try:
        vendor = await db.vendors.find_one({"id": vendor_id})
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return Vendor(**vendor)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching vendor {vendor_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch vendor")

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
