#!/usr/bin/env python
"""
Test all API endpoints to ensure they're working
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_public_endpoints():
    """Test endpoints that don't require authentication"""
    print("🔍 Testing Public API Endpoints")
    print("=" * 40)
    
    endpoints = [
        "/services/categories/",
        "/services/subcategories/",
    ]
    
    for endpoint in endpoints:
        url = BASE_URL + endpoint
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint} - Status: {response.status_code}, Items: {len(data)}")
            else:
                print(f"❌ {endpoint} - Status: {response.status_code}")
                print(f"   Response: {response.text[:100]}...")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint} - Network Error: {e}")

def test_auth_endpoints():
    """Test authentication endpoints"""
    print(f"\n🔐 Testing Authentication Endpoints")
    print("=" * 40)
    
    # Test registration
    register_url = BASE_URL + "/auth/register/"
    test_user_data = {
        "username": "test_api_user",
        "password": "testpass123",
        "user_type": "Service Provider",
        "role": "Admin"
    }
    
    try:
        response = requests.post(register_url, json=test_user_data, timeout=5)
        if response.status_code in [200, 201]:
            print(f"✅ Registration - Status: {response.status_code}")
        elif response.status_code == 400 and "already exists" in response.text:
            print(f"✅ Registration - User already exists (expected)")
        else:
            print(f"❌ Registration - Status: {response.status_code}")
            print(f"   Response: {response.text[:100]}...")
    except requests.exceptions.RequestException as e:
        print(f"❌ Registration - Network Error: {e}")
    
    # Test login
    login_url = BASE_URL + "/auth/login/"
    login_data = {
        "username": "test_api_user",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(login_url, json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            print(f"✅ Login - Status: {response.status_code}, Token: {token[:20]}..." if token else "No token")
            return token
        else:
            print(f"❌ Login - Status: {response.status_code}")
            print(f"   Response: {response.text[:100]}...")
    except requests.exceptions.RequestException as e:
        print(f"❌ Login - Network Error: {e}")
    
    return None

def test_protected_endpoints(token):
    """Test endpoints that require authentication"""
    if not token:
        print(f"\n⚠️ Skipping protected endpoints - no token available")
        return
    
    print(f"\n🔒 Testing Protected API Endpoints")
    print("=" * 40)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    endpoints = [
        "/auth/me/",
        "/services/provider/registered/",
        "/services/provider/available/",
        "/bookings/user/",
        "/bookings/provider/",
        "/bookings/provider/requests/",
        "/analytics/provider/dashboard/",
        "/analytics/provider/earnings/",
    ]
    
    for endpoint in endpoints:
        url = BASE_URL + endpoint
        try:
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"✅ {endpoint} - Status: {response.status_code}, Items: {len(data)}")
                else:
                    print(f"✅ {endpoint} - Status: {response.status_code}, Data: {type(data).__name__}")
            else:
                print(f"❌ {endpoint} - Status: {response.status_code}")
                print(f"   Response: {response.text[:100]}...")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint} - Network Error: {e}")

def test_server_connection():
    """Test basic server connectivity"""
    print("🌐 Testing Server Connection")
    print("=" * 40)
    
    try:
        # Test Django admin (should always be available)
        response = requests.get("http://localhost:8000/admin/", timeout=5)
        if response.status_code in [200, 302]:  # 302 is redirect to login
            print("✅ Django server is running")
            return True
        else:
            print(f"❌ Django server issue - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Django server: {e}")
        print("   Make sure to run: python manage.py runserver")
        return False

if __name__ == "__main__":
    print("🧪 API Endpoint Testing")
    print("=" * 50)
    
    # Test server connection first
    if not test_server_connection():
        print(f"\n❌ Server not accessible. Please:")
        print(f"   1. Run: python manage.py runserver")
        print(f"   2. Wait for server to start")
        print(f"   3. Run this script again")
        exit(1)
    
    # Test public endpoints
    test_public_endpoints()
    
    # Test authentication and get token
    token = test_auth_endpoints()
    
    # Test protected endpoints
    test_protected_endpoints(token)
    
    print(f"\n📋 Summary:")
    print(f"   If all tests pass, the API is working correctly")
    print(f"   If any tests fail, those endpoints need to be fixed")
    print(f"\n🚀 Next steps:")
    print(f"   1. Fix any failing endpoints")
    print(f"   2. Restart frontend: cd frontend && npm run dev")
    print(f"   3. Test in browser")
