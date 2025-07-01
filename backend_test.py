import requests
import json
import time
import sys

# Use the local backend URL for testing
BACKEND_URL = "http://localhost:8001"
API_URL = f"{BACKEND_URL}/api"

def print_separator():
    print("\n" + "="*80 + "\n")

def test_github_compare():
    """Test the GitHub compare endpoint"""
    print("Testing GitHub Compare Endpoint...")
    
    url = f"{API_URL}/github/compare"
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Repository: {data.get('repository')}")
        print(f"Branch: {data.get('branch')}")
        print(f"Total Files Compared: {data.get('total_files')}")
        
        print("\nComparison Results:")
        for result in data.get('comparison_results', []):
            print(f"  - {result.get('filename')} ({result.get('status')})")
            print(f"    Local Path: {result.get('local_path')}")
            print(f"    GitHub Path: {result.get('github_path')}")
            print(f"    Local Size: {result.get('local_size')} bytes")
            print(f"    GitHub Size: {result.get('github_size')} bytes")
            print()
        
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_github_import():
    """Test the GitHub import endpoint"""
    print("Testing GitHub Import Endpoint...")
    
    url = f"{API_URL}/github/import"
    payload = {
        "repository_url": "https://github.com/mysidehustle76/Nadkar",
        "branch": "main",
        "files_to_import": [
            "frontend/src/App.js",
            "backend/server.py"
        ]
    }
    
    response = requests.post(url, json=payload)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Repository: {data.get('repository')}")
        print(f"Branch: {data.get('branch')}")
        print(f"Total Imported: {data.get('total_imported')}")
        
        print("\nImported Files:")
        for file in data.get('imported_files', []):
            print(f"  - {file.get('filename')} ({file.get('status')})")
            print(f"    Local Path: {file.get('local_path', 'N/A')}")
            print(f"    GitHub Path: {file.get('github_path')}")
            print(f"    Size: {file.get('size', 'N/A')} bytes")
            if file.get('error'):
                print(f"    Error: {file.get('error')}")
            print()
        
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_github_file_content():
    """Test the GitHub file content endpoint"""
    print("Testing GitHub File Content Endpoint...")
    
    # Test with two different files
    files_to_test = [
        "frontend/src/App.js",
        "backend/server.py"
    ]
    
    all_successful = True
    
    for file_path in files_to_test:
        print(f"\nTesting file: {file_path}")
        url = f"{API_URL}/github/file-content?file_path={file_path}"
        
        response = requests.get(url)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Filename: {data.get('filename')}")
            print(f"Path: {data.get('path')}")
            print(f"Size: {data.get('size')} bytes")
            print(f"Last Modified: {data.get('last_modified')}")
            
            # Print first 100 characters of content as preview
            content = data.get('content', '')
            preview = content[:100] + "..." if len(content) > 100 else content
            print(f"Content Preview: {preview}")
        else:
            print(f"Error: {response.text}")
            all_successful = False
    
    return all_successful

def run_all_tests():
    """Run all GitHub API tests"""
    print_separator()
    print("TESTING GITHUB IMPORT FUNCTIONALITY")
    print_separator()
    
    test_results = {
        "GitHub Compare": test_github_compare(),
        "GitHub Import": test_github_import(),
        "GitHub File Content": test_github_file_content()
    }
    
    print_separator()
    print("TEST RESULTS SUMMARY")
    print_separator()
    
    all_passed = True
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        if not result:
            all_passed = False
        print(f"{test_name}: {status}")
    
    print_separator()
    if all_passed:
        print("All GitHub import functionality tests PASSED!")
    else:
        print("Some tests FAILED. Please check the logs above for details.")
    
    return all_passed

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)