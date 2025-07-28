#!/usr/bin/env python
"""
Test superuser API access and get JWT token
"""
import requests
import json

def test_superuser_api_access():
    print("🔍 Testing Superuser API Access")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api"
    
    # Test 1: Check if server is running
    print("1. Testing server connectivity...")
    try:
        response = requests.get(f"{base_url}/services/categories/", timeout=5)
        if response.status_code == 200:
            print("   ✅ Server is running and API is accessible")
            categories = response.json()
            print(f"   📋 Found {len(categories)} service categories")
        else:
            print(f"   ❌ Server issue - Status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Cannot connect to server: {e}")
        print("   💡 Make sure Django server is running: python manage.py runserver")
        return False
    
    # Test 2: Login as superuser
    print("\n2. Testing superuser login...")
    login_data = {
        "username": "superuser1",
        "password": input("Enter superuser1 password: ")
    }
    
    try:
        response = requests.post(f"{base_url}/auth/login/", json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            user_info = data.get('user', {})
            
            print("   ✅ Login successful!")
            print(f"   👤 User: {user_info.get('username')}")
            print(f"   🔑 Superuser: {user_info.get('is_superuser')}")
            print(f"   🎫 Token: {token[:20]}..." if token else "   ❌ No token received")
            
            if not token:
                print("   ❌ Login successful but no JWT token received")
                return False
                
        else:
            print(f"   ❌ Login failed - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Login request failed: {e}")
        return False
    
    # Test 3: Test protected endpoints with token
    print("\n3. Testing protected API endpoints...")
    headers = {"Authorization": f"Bearer {token}"}
    
    protected_endpoints = [
        ("/auth/me/", "Get current user info"),
        ("/services/provider/registered/", "Get provider's registered services"),
        ("/bookings/user/", "Get user's bookings"),
        ("/analytics/provider/dashboard/", "Get provider dashboard stats"),
    ]
    
    for endpoint, description in protected_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ {endpoint} - {description}")
                if isinstance(data, dict):
                    print(f"      📊 Response keys: {list(data.keys())}")
                elif isinstance(data, list):
                    print(f"      📋 Response items: {len(data)}")
            else:
                print(f"   ❌ {endpoint} - Status: {response.status_code}")
                if response.status_code == 403:
                    print("      🚫 Access forbidden - check user permissions")
                elif response.status_code == 401:
                    print("      🔑 Unauthorized - token might be invalid")
                    
        except requests.exceptions.RequestException as e:
            print(f"   ❌ {endpoint} - Request failed: {e}")
    
    # Test 4: Test Django Admin access
    print("\n4. Testing Django Admin access...")
    try:
        admin_response = requests.get("http://localhost:8000/admin/", timeout=5)
        if admin_response.status_code in [200, 302]:  # 302 is redirect to login
            print("   ✅ Django Admin is accessible")
            print("   🌐 URL: http://localhost:8000/admin/")
        else:
            print(f"   ❌ Django Admin issue - Status: {admin_response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Django Admin not accessible: {e}")
    
    print(f"\n🎯 Summary:")
    print(f"   - APIs are accessible via JWT tokens")
    print(f"   - Superuser can login and get tokens")
    print(f"   - Use the token for API calls in tools like Postman")
    print(f"   - Django Admin is separate from API access")
    
    print(f"\n💡 Next Steps:")
    print(f"   1. Use the JWT token for API testing")
    print(f"   2. Access Django Admin at: http://localhost:8000/admin/")
    print(f"   3. For API development, use the token in Authorization header")
    
    return True

if __name__ == "__main__":
    test_superuser_api_access()
