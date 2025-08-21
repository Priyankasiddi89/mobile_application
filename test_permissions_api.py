#!/usr/bin/env python
import os
import sys
import django
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def test_permissions_api():
    """Test the permissions API with admin user"""
    
    # Get admin user
    try:
        admin_user = User.objects.get(username='admin', user_type='Platform Provider', role='Admin')
        print(f"Found admin user: {admin_user.username}")
    except User.DoesNotExist:
        print("Admin user not found!")
        return
    
    # Generate token
    refresh = RefreshToken.for_user(admin_user)
    access_token = str(refresh.access_token)
    print(f"Generated token: {access_token[:50]}...")
    
    # Test permissions API
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    print("\n🔍 Testing permissions API...")
    try:
        response = requests.get('http://localhost:8000/api/platform_provider_dashboard/permissions/', headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    
    print("\n🔍 Testing user-type-role-permissions API...")
    try:
        response = requests.get('http://localhost:8000/api/platform_provider_dashboard/user-type-role-permissions/', headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            if isinstance(data, dict):
                for user_type, roles in data.items():
                    print(f"  {user_type}: {list(roles.keys()) if isinstance(roles, dict) else roles}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_permissions_api()
