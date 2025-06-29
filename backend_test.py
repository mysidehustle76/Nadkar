import requests
import json
import time
import os
import sys
from dotenv import load_dotenv
import uuid
from datetime import datetime
import random

# Load environment variables from frontend/.env
load_dotenv('/app/frontend/.env')

# Get the backend URL from environment variables
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("Error: REACT_APP_BACKEND_URL not found in environment variables")
    sys.exit(1)

# Ensure the URL ends with /api
API_URL = f"{BACKEND_URL}/api"
print(f"Using API URL: {API_URL}")

# Generate a unique test run ID to avoid duplicate vendor names
TEST_RUN_ID = datetime.now().strftime("%Y%m%d%H%M%S")

# Generate a random phone number base to avoid duplicates
def generate_random_phone():
    return f"{random.randint(1000000000, 9999999999)}"

# Test class for vendor management API
class TestVendorAPI:
    def __init__(self):
        self.vendors_endpoint = f"{API_URL}/vendors"
        self.created_vendors = []
    
    def run_all_tests(self):
        """Run all test cases"""
        test_results = {
            "passed": 0,
            "failed": 0,
            "total": 0
        }
        
        # List of test methods to run
        tests = [
            self.test_valid_vendor_creation,
            self.test_phone_number_validation,
            self.test_required_fields_validation,
            self.test_duplicate_vendor_name,
            self.test_duplicate_phone_number,
            self.test_get_all_vendors,
            self.test_get_specific_vendor
        ]
        
        # Run each test
        for test in tests:
            test_name = test.__name__
            print(f"\n{'='*80}\nRunning test: {test_name}\n{'='*80}")
            try:
                result = test()
                if result:
                    test_results["passed"] += 1
                    print(f"✅ Test {test_name} PASSED")
                else:
                    test_results["failed"] += 1
                    print(f"❌ Test {test_name} FAILED")
            except Exception as e:
                test_results["failed"] += 1
                print(f"❌ Test {test_name} FAILED with exception: {str(e)}")
            
            test_results["total"] += 1
        
        # Print summary
        print(f"\n{'='*80}")
        print(f"TEST SUMMARY: {test_results['passed']}/{test_results['total']} tests passed")
        print(f"Passed: {test_results['passed']}")
        print(f"Failed: {test_results['failed']}")
        print(f"{'='*80}")
        
        return test_results["failed"] == 0
    
    def create_vendor(self, vendor_data):
        """Helper method to create a vendor"""
        response = requests.post(self.vendors_endpoint, json=vendor_data)
        if response.status_code == 200:
            vendor = response.json()
            self.created_vendors.append(vendor)
        return response
    
    def test_valid_vendor_creation(self):
        """Test creating a vendor with valid data"""
        print("Testing valid vendor creation...")
        
        # Test data with unique name and phone
        vendor_data = {
            "vendor_name": f"ABC Corporation {TEST_RUN_ID}",
            "service_provider_name": "John Smith",
            "phone_number": generate_random_phone()
        }
        
        # Send request
        response = self.create_vendor(vendor_data)
        
        # Verify response
        if response.status_code != 200:
            print(f"Failed to create vendor. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Verify response data
        vendor = response.json()
        if not vendor.get("id"):
            print("Vendor ID not found in response")
            return False
        
        if vendor.get("vendor_name") != vendor_data["vendor_name"]:
            print(f"Vendor name mismatch. Expected: {vendor_data['vendor_name']}, Got: {vendor.get('vendor_name')}")
            return False
        
        if vendor.get("service_provider_name") != vendor_data["service_provider_name"]:
            print(f"Service provider name mismatch. Expected: {vendor_data['service_provider_name']}, Got: {vendor.get('service_provider_name')}")
            return False
        
        if vendor.get("phone_number") != vendor_data["phone_number"]:
            print(f"Phone number mismatch. Expected: {vendor_data['phone_number']}, Got: {vendor.get('phone_number')}")
            return False
        
        print("Valid vendor creation test passed")
        return True
    
    def test_phone_number_validation(self):
        """Test phone number validation with various formats"""
        print("Testing phone number validation...")
        
        # Generate base phone numbers for this test
        base_phone1 = generate_random_phone()
        base_phone2 = generate_random_phone()
        base_phone3 = generate_random_phone()
        
        # Test valid phone number formats with unique numbers
        valid_formats = [
            {"format": base_phone1, "expected": base_phone1},
            {"format": f"({base_phone2[:3]}) {base_phone2[3:6]}-{base_phone2[6:]}", "expected": base_phone2},
            {"format": f"{base_phone3[:3]}-{base_phone3[3:6]}-{base_phone3[6:]}", "expected": base_phone3}
        ]
        
        for i, test_case in enumerate(valid_formats):
            vendor_data = {
                "vendor_name": f"Phone Test Company {i} {TEST_RUN_ID}",
                "service_provider_name": f"Phone Test Provider {i}",
                "phone_number": test_case["format"]
            }
            
            response = self.create_vendor(vendor_data)
            
            if response.status_code != 200:
                print(f"Failed to create vendor with valid phone format: {test_case['format']}")
                print(f"Response: {response.text}")
                return False
            
            vendor = response.json()
            if vendor.get("phone_number") != test_case["expected"]:
                print(f"Phone number not cleaned correctly. Expected: {test_case['expected']}, Got: {vendor.get('phone_number')}")
                return False
        
        # Test invalid phone number formats
        invalid_formats = [
            "123abc4567",  # Contains non-numeric characters
            "123",         # Too short
            "12345678901234567890"  # Too long
        ]
        
        for i, invalid_format in enumerate(invalid_formats):
            vendor_data = {
                "vendor_name": f"Invalid Phone Company {i} {TEST_RUN_ID}",
                "service_provider_name": f"Invalid Phone Provider {i}",
                "phone_number": invalid_format
            }
            
            response = self.create_vendor(vendor_data)
            
            if response.status_code == 200:
                print(f"Created vendor with invalid phone format: {invalid_format}")
                return False
            
            # Accept either 400 or 422 status codes for validation errors
            if response.status_code != 400 and response.status_code != 422:
                print(f"Expected status code 400 or 422 for invalid phone format, got {response.status_code}")
                return False
        
        print("Phone number validation test passed")
        return True
    
    def test_required_fields_validation(self):
        """Test validation of required fields"""
        print("Testing required fields validation...")
        
        # Test missing vendor_name
        vendor_data = {
            "vendor_name": "",
            "service_provider_name": "Required Fields Provider",
            "phone_number": "9876543210"
        }
        
        response = self.create_vendor(vendor_data)
        if response.status_code == 200:
            print("Created vendor with empty vendor_name")
            return False
        
        # Test missing service_provider_name
        vendor_data = {
            "vendor_name": "Required Fields Company",
            "service_provider_name": "",
            "phone_number": "9876543210"
        }
        
        response = self.create_vendor(vendor_data)
        if response.status_code == 200:
            print("Created vendor with empty service_provider_name")
            return False
        
        # Test missing phone_number
        vendor_data = {
            "vendor_name": "Required Fields Company",
            "service_provider_name": "Required Fields Provider",
            "phone_number": ""
        }
        
        response = self.create_vendor(vendor_data)
        if response.status_code == 200:
            print("Created vendor with empty phone_number")
            return False
        
        print("Required fields validation test passed")
        return True
    
    def test_duplicate_vendor_name(self):
        """Test creating vendor with same name twice"""
        print("Testing duplicate vendor name validation...")
        
        # Create first vendor with unique name for this test
        vendor_name = f"Duplicate Name Company {TEST_RUN_ID}"
        vendor_data = {
            "vendor_name": vendor_name,
            "service_provider_name": "Duplicate Name Provider",
            "phone_number": generate_random_phone()
        }
        
        response = self.create_vendor(vendor_data)
        if response.status_code != 200:
            print(f"Failed to create first vendor. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Try to create second vendor with same name but different phone
        vendor_data = {
            "vendor_name": vendor_name,
            "service_provider_name": "Different Provider",
            "phone_number": generate_random_phone()
        }
        
        response = self.create_vendor(vendor_data)
        if response.status_code == 200:
            print("Created vendor with duplicate name")
            return False
        
        if response.status_code != 400:
            print(f"Expected status code 400 for duplicate name, got {response.status_code}")
            return False
        
        print("Duplicate vendor name validation test passed")
        return True
    
    def test_duplicate_phone_number(self):
        """Test creating vendor with same phone number twice"""
        print("Testing duplicate phone number validation...")
        
        # Generate a unique phone number for this test
        phone_number = generate_random_phone()
        
        # Create first vendor with unique name and phone for this test
        vendor_data = {
            "vendor_name": f"Duplicate Phone Company {TEST_RUN_ID}",
            "service_provider_name": "Duplicate Phone Provider",
            "phone_number": phone_number
        }
        
        response = self.create_vendor(vendor_data)
        if response.status_code != 200:
            print(f"Failed to create first vendor. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Try to create second vendor with same phone but different name
        vendor_data = {
            "vendor_name": f"Different Phone Company {TEST_RUN_ID}",
            "service_provider_name": "Different Phone Provider",
            "phone_number": phone_number
        }
        
        response = self.create_vendor(vendor_data)
        if response.status_code == 200:
            print("Created vendor with duplicate phone number")
            return False
        
        if response.status_code != 400:
            print(f"Expected status code 400 for duplicate phone, got {response.status_code}")
            return False
        
        print("Duplicate phone number validation test passed")
        return True
    
    def test_get_all_vendors(self):
        """Test retrieving all vendors from the database"""
        print("Testing get all vendors...")
        
        # Create a new vendor to ensure there's at least one
        vendor_data = {
            "vendor_name": f"Get All Test Company {TEST_RUN_ID}",
            "service_provider_name": "Get All Test Provider",
            "phone_number": generate_random_phone()
        }
        
        create_response = self.create_vendor(vendor_data)
        if create_response.status_code != 200:
            print(f"Failed to create test vendor. Status code: {create_response.status_code}")
            print(f"Response: {create_response.text}")
            return False
        
        # Get all vendors
        response = requests.get(self.vendors_endpoint)
        
        # Verify response
        if response.status_code != 200:
            print(f"Failed to get vendors. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Verify response data
        vendors = response.json()
        if not isinstance(vendors, list):
            print(f"Expected list of vendors, got {type(vendors)}")
            return False
        
        if len(vendors) == 0:
            print("No vendors returned")
            return False
        
        # Check if our created vendor is in the list
        created_vendor = create_response.json()
        found = False
        for vendor in vendors:
            if vendor.get("id") == created_vendor.get("id"):
                found = True
                break
        
        if not found:
            print("Created vendor not found in get all vendors response")
            return False
        
        print("Get all vendors test passed")
        return True
    
    def test_get_specific_vendor(self):
        """Test retrieving a vendor by ID"""
        print("Testing get specific vendor...")
        
        # Create a new vendor
        vendor_data = {
            "vendor_name": f"Get Specific Test Company {TEST_RUN_ID}",
            "service_provider_name": "Get Specific Test Provider",
            "phone_number": generate_random_phone()
        }
        
        create_response = self.create_vendor(vendor_data)
        if create_response.status_code != 200:
            print(f"Failed to create test vendor. Status code: {create_response.status_code}")
            print(f"Response: {create_response.text}")
            return False
        
        # Get the vendor ID
        created_vendor = create_response.json()
        vendor_id = created_vendor.get("id")
        
        # Get the specific vendor
        response = requests.get(f"{self.vendors_endpoint}/{vendor_id}")
        
        # Verify response
        if response.status_code != 200:
            print(f"Failed to get vendor by ID. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Verify response data
        vendor = response.json()
        if vendor.get("id") != vendor_id:
            print(f"Vendor ID mismatch. Expected: {vendor_id}, Got: {vendor.get('id')}")
            return False
        
        if vendor.get("vendor_name") != vendor_data["vendor_name"]:
            print(f"Vendor name mismatch. Expected: {vendor_data['vendor_name']}, Got: {vendor.get('vendor_name')}")
            return False
        
        # Test with non-existent ID
        non_existent_id = "non-existent-id"
        response = requests.get(f"{self.vendors_endpoint}/{non_existent_id}")
        
        if response.status_code != 404:
            print(f"Expected status code 404 for non-existent ID, got {response.status_code}")
            return False
        
        print("Get specific vendor test passed")
        return True


if __name__ == "__main__":
    print(f"Starting vendor API tests against {API_URL}")
    
    # Run all tests
    tester = TestVendorAPI()
    all_tests_passed = tester.run_all_tests()
    
    # Exit with appropriate status code
    if all_tests_passed:
        print("\nAll tests passed successfully!")
        sys.exit(0)
    else:
        print("\nSome tests failed. Check the output for details.")
        sys.exit(1)