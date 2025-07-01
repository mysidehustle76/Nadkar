import requests
import json
import time
import sys
import os
import base64

# Use the local backend URL for testing
BACKEND_URL = "http://localhost:8001"
API_URL = f"{BACKEND_URL}/api"

def print_separator():
    print("\n" + "="*80 + "\n")

def compare_with_github():
    """Compare local files with GitHub repository"""
    print("Testing GitHub Compare Functionality...")
    
    # GitHub repository details
    repo_owner = "mysidehustle76"
    repo_name = "Nadkar"
    branch = "main"
    
    # GitHub API URL
    github_api_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents"
    
    comparison_results = []
    
    # Files to compare
    files_to_check = [
        {"local": "/app/frontend/src/App.js", "github": "frontend/src/App.js"},
        {"local": "/app/frontend/package.json", "github": "frontend/package.json"},
        {"local": "/app/backend/server.py", "github": "backend/server.py"},
        {"local": "/app/backend/requirements.txt", "github": "backend/requirements.txt"},
    ]
    
    for file_config in files_to_check:
        local_path = file_config["local"]
        github_path = file_config["github"]
        
        # Get local file content
        local_content = ""
        if os.path.exists(local_path):
            with open(local_path, 'r', encoding='utf-8') as f:
                local_content = f.read()
        
        # Get GitHub file content
        github_content = ""
        try:
            response = requests.get(f"{github_api_url}/{github_path}")
            if response.status_code == 200:
                file_data = response.json()
                github_content = base64.b64decode(file_data['content']).decode('utf-8')
        except Exception as e:
            print(f"Error fetching GitHub file {github_path}: {str(e)}")
        
        # Compare files
        status = "unchanged"
        if not local_content and github_content:
            status = "added_to_github"
        elif local_content and not github_content:
            status = "missing_from_github"
        elif local_content != github_content:
            status = "modified"
        
        comparison_results.append({
            "filename": os.path.basename(local_path),
            "local_path": local_path,
            "github_path": github_path,
            "status": status,
            "local_size": len(local_content),
            "github_size": len(github_content)
        })
    
    print(f"Repository: {repo_owner}/{repo_name}")
    print(f"Branch: {branch}")
    print(f"Total Files Compared: {len(comparison_results)}")
    
    print("\nComparison Results:")
    for result in comparison_results:
        print(f"  - {result.get('filename')} ({result.get('status')})")
        print(f"    Local Path: {result.get('local_path')}")
        print(f"    GitHub Path: {result.get('github_path')}")
        print(f"    Local Size: {result.get('local_size')} bytes")
        print(f"    GitHub Size: {result.get('github_size')} bytes")
        print()
    
    return len(comparison_results) > 0

def import_from_github():
    """Import files from GitHub repository"""
    print("Testing GitHub Import Functionality...")
    
    # GitHub repository details
    repo_url = "https://github.com/mysidehustle76/Nadkar"
    repo_owner = "mysidehustle76"
    repo_name = "Nadkar"
    branch = "main"
    
    # GitHub API URL
    github_api_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents"
    
    imported_files = []
    
    # Files to import
    files_to_import = [
        "frontend/src/App.js",
        "backend/server.py"
    ]
    
    for github_path in files_to_import:
        try:
            # Get GitHub file content
            response = requests.get(f"{github_api_url}/{github_path}")
            if response.status_code == 200:
                file_data = response.json()
                github_content = base64.b64decode(file_data['content']).decode('utf-8')
                
                # Determine local path
                local_path = f"/app/{github_path}"
                
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                
                # Backup existing file if it exists
                if os.path.exists(local_path):
                    backup_path = f"{local_path}.backup"
                    os.rename(local_path, backup_path)
                
                # Write new content
                with open(local_path, 'w', encoding='utf-8') as f:
                    f.write(github_content)
                
                imported_files.append({
                    "filename": os.path.basename(local_path),
                    "local_path": local_path,
                    "github_path": github_path,
                    "status": "imported",
                    "size": len(github_content)
                })
                
            else:
                imported_files.append({
                    "filename": os.path.basename(github_path),
                    "github_path": github_path,
                    "status": "failed",
                    "error": f"HTTP {response.status_code}"
                })
                
        except Exception as e:
            imported_files.append({
                "filename": os.path.basename(github_path),
                "github_path": github_path,
                "status": "failed",
                "error": str(e)
            })
    
    print(f"Repository: {repo_owner}/{repo_name}")
    print(f"Branch: {branch}")
    print(f"Total Imported: {len([f for f in imported_files if f.get('status') == 'imported'])}")
    
    print("\nImported Files:")
    for file in imported_files:
        print(f"  - {file.get('filename')} ({file.get('status')})")
        print(f"    Local Path: {file.get('local_path', 'N/A')}")
        print(f"    GitHub Path: {file.get('github_path')}")
        print(f"    Size: {file.get('size', 'N/A')} bytes")
        if file.get('error'):
            print(f"    Error: {file.get('error')}")
        print()
    
    return len([f for f in imported_files if f.get('status') == 'imported']) > 0

def get_github_file_content():
    """Get specific file content from GitHub"""
    print("Testing GitHub File Content Functionality...")
    
    # GitHub repository details
    repo_owner = "mysidehustle76"
    repo_name = "Nadkar"
    
    # GitHub API URL
    github_api_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents"
    
    # Files to test
    files_to_test = [
        "frontend/src/App.js",
        "backend/server.py"
    ]
    
    all_successful = True
    
    for file_path in files_to_test:
        print(f"\nTesting file: {file_path}")
        
        try:
            response = requests.get(f"{github_api_url}/{file_path}")
            if response.status_code == 200:
                file_data = response.json()
                github_content = base64.b64decode(file_data['content']).decode('utf-8')
                
                print(f"Filename: {os.path.basename(file_path)}")
                print(f"Path: {file_path}")
                print(f"Size: {len(github_content)} bytes")
                print(f"Last Modified: {file_data.get('sha', 'unknown')}")
                
                # Print first 100 characters of content as preview
                preview = github_content[:100] + "..." if len(github_content) > 100 else github_content
                print(f"Content Preview: {preview}")
            else:
                print(f"Error: HTTP {response.status_code}")
                all_successful = False
                
        except Exception as e:
            print(f"Error: {str(e)}")
            all_successful = False
    
    return all_successful

def run_all_tests():
    """Run all GitHub API tests"""
    print_separator()
    print("TESTING GITHUB IMPORT FUNCTIONALITY")
    print_separator()
    
    test_results = {
        "GitHub Compare": compare_with_github(),
        "GitHub Import": import_from_github(),
        "GitHub File Content": get_github_file_content()
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