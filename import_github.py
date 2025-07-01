#!/usr/bin/env python3
"""
GitHub Import Script for Nadkar Yellow Pages App
Imports production code from GitHub repository
"""

import requests
import base64
import os
import shutil
from datetime import datetime

def import_production_code():
    """Import production code from GitHub repository"""
    
    # GitHub repository details
    repo_owner = "mysidehustle76"
    repo_name = "Nadkar"
    branch = "main"
    github_api_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents"
    
    # Files to import from GitHub
    files_to_import = [
        {"github": "frontend/src/App.js", "local": "/app/frontend/src/App.js"},
        {"github": "frontend/package.json", "local": "/app/frontend/package.json"},
        {"github": "backend/server.py", "local": "/app/backend/server.py"},
        {"github": "backend/requirements.txt", "local": "/app/backend/requirements.txt"},
    ]
    
    print(f"🔄 Importing production code from {repo_owner}/{repo_name} (branch: {branch})")
    print("=" * 60)
    
    imported_files = []
    failed_files = []
    
    for file_config in files_to_import:
        github_path = file_config["github"]
        local_path = file_config["local"]
        
        try:
            print(f"📥 Importing {github_path}...")
            
            # Get GitHub file content
            response = requests.get(f"{github_api_url}/{github_path}")
            
            if response.status_code == 200:
                file_data = response.json()
                github_content = base64.b64decode(file_data['content']).decode('utf-8')
                
                # Create backup of existing file
                if os.path.exists(local_path):
                    backup_path = f"{local_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                    shutil.copy2(local_path, backup_path)
                    print(f"   📄 Backed up existing file to {backup_path}")
                
                # Write new content
                with open(local_path, 'w', encoding='utf-8') as f:
                    f.write(github_content)
                
                print(f"   ✅ Successfully imported {github_path} ({len(github_content)} bytes)")
                imported_files.append({
                    "github_path": github_path,
                    "local_path": local_path,
                    "size": len(github_content)
                })
                
            else:
                print(f"   ❌ Failed to fetch {github_path} (HTTP {response.status_code})")
                failed_files.append(github_path)
                
        except Exception as e:
            print(f"   ❌ Error importing {github_path}: {str(e)}")
            failed_files.append(github_path)
    
    print("\n" + "=" * 60)
    print("📊 IMPORT SUMMARY:")
    print(f"✅ Successfully imported: {len(imported_files)} files")
    print(f"❌ Failed to import: {len(failed_files)} files")
    
    if imported_files:
        print("\n📄 Imported files:")
        for file_info in imported_files:
            print(f"   • {file_info['github_path']} → {file_info['local_path']} ({file_info['size']} bytes)")
    
    if failed_files:
        print("\n❌ Failed files:")
        for failed_file in failed_files:
            print(f"   • {failed_file}")
    
    return imported_files, failed_files

def compare_with_github():
    """Compare local files with GitHub repository"""
    
    # GitHub repository details
    repo_owner = "mysidehustle76"
    repo_name = "Nadkar"
    branch = "main"
    github_api_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents"
    
    # Files to compare
    files_to_check = [
        {"github": "frontend/src/App.js", "local": "/app/frontend/src/App.js"},
        {"github": "frontend/package.json", "local": "/app/frontend/package.json"},
        {"github": "backend/server.py", "local": "/app/backend/server.py"},
        {"github": "backend/requirements.txt", "local": "/app/backend/requirements.txt"},
    ]
    
    print(f"🔍 Comparing local files with {repo_owner}/{repo_name} (branch: {branch})")
    print("=" * 80)
    
    for file_config in files_to_check:
        github_path = file_config["github"]
        local_path = file_config["local"]
        
        print(f"\n📁 {github_path}:")
        
        # Get local file content
        local_content = ""
        local_size = 0
        if os.path.exists(local_path):
            with open(local_path, 'r', encoding='utf-8') as f:
                local_content = f.read()
            local_size = len(local_content)
        
        # Get GitHub file content
        github_content = ""
        github_size = 0
        try:
            response = requests.get(f"{github_api_url}/{github_path}")
            if response.status_code == 200:
                file_data = response.json()
                github_content = base64.b64decode(file_data['content']).decode('utf-8')
                github_size = len(github_content)
        except Exception as e:
            print(f"   ❌ Error fetching from GitHub: {str(e)}")
            continue
        
        # Compare files
        if not local_content and github_content:
            status = "🆕 NEW IN GITHUB"
            color = "blue"
        elif local_content and not github_content:
            status = "🚫 MISSING FROM GITHUB"
            color = "red"
        elif local_content == github_content:
            status = "✅ IDENTICAL"
            color = "green"
        else:
            status = "🔄 DIFFERENT"
            color = "yellow"
        
        print(f"   Status: {status}")
        print(f"   Local:  {local_size:,} bytes")
        print(f"   GitHub: {github_size:,} bytes")

if __name__ == "__main__":
    print("🚀 GitHub Import Tool for Nadkar Yellow Pages")
    print("=" * 50)
    
    # First, compare files
    compare_with_github()
    
    # Ask user if they want to import
    print("\n" + "=" * 50)
    user_input = input("Do you want to import production code from GitHub? (y/N): ").strip().lower()
    
    if user_input in ['y', 'yes']:
        imported_files, failed_files = import_production_code()
        
        if imported_files:
            print("\n🎉 Production code import completed!")
            print("💡 You may need to restart the services to apply changes:")
            print("   sudo supervisorctl restart backend")
            print("   sudo supervisorctl restart frontend")
    else:
        print("❌ Import cancelled.")