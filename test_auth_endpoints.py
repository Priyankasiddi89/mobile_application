#!/usr/bin/env python
"""
Test script to check authentication endpoints
"""
import requests
import json

def test_auth_endpoints():
    """Test authentication and user bookings endpoints"""
    base_url = "http://localhost:8000"
    
    print("🔐 Testing Authentication Endpoints...\n")
    
    # Test data - you may need to adjust these credentials
    test_credentials = {
        "username": "test_customer",  # Change this to your actual username
        "password": "testpass123"     # Change this to your actual password
    }
    
    try:
        # Step 1: Login to get token
        print("1️⃣ Testing login...")
        login_response = requests.post(
            f"{base_url}/api/auth/login/",
            json=test_credentials,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"   Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            access_token = login_data.get('access')
            print(f"   ✅ Login successful!")
            print(f"   Token: {access_token[:50]}...")
            
            # Step 2: Test /api/auth/me/
            print("\n2️⃣ Testing /api/auth/me/...")
            me_response = requests.get(
                f"{base_url}/api/auth/me/",
                headers={'Authorization': f'Bearer {access_token}'}
            )
            print(f"   Status: {me_response.status_code}")
            if me_response.status_code == 200:
                user_data = me_response.json()
                print(f"   ✅ User: {user_data.get('username')} ({user_data.get('user_type')})")
            else:
                print(f"   ❌ Error: {me_response.text}")
            
            # Step 3: Test /api/end_user_dashboard/bookings/
            print("\n3️⃣ Testing /api/end_user_dashboard/bookings/...")
            bookings_response = requests.get(
                f"{base_url}/api/end_user_dashboard/bookings/",
                headers={'Authorization': f'Bearer {access_token}'}
            )
            print(f"   Status: {bookings_response.status_code}")
            if bookings_response.status_code == 200:
                bookings_data = bookings_response.json()
                print(f"   ✅ Found {len(bookings_data)} bookings")
                if len(bookings_data) > 0:
                    print(f"   Sample booking: {bookings_data[0]}")
                else:
                    print("   📝 No bookings found (this is normal if you haven't created any)")
            else:
                print(f"   ❌ Error: {bookings_response.text}")
                
        else:
            print(f"   ❌ Login failed: {login_response.text}")
            print("\n💡 Tips:")
            print("   - Make sure you have created an end user account")
            print("   - Update the test_credentials in this script with your actual username/password")
            print("   - Make sure Django server is running")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        print("\n💡 Make sure Django server is running: python manage.py runserver")

def create_test_user():
    """Create a test user for testing"""
    base_url = "http://localhost:8000"
    
    test_user = {
        "username": "test_customer",
        "email": "test@example.com",
        "password": "testpass123",
        "user_type": "End User"
    }
    
    print("👤 Creating test user...")
    try:
        response = requests.post(
            f"{base_url}/api/auth/register/",
            json=test_user,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            print("✅ Test user created successfully!")
            return True
        elif response.status_code == 400 and "already exists" in response.text:
            print("✅ Test user already exists!")
            return True
        else:
            print(f"❌ Failed to create user: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Authentication Test Script\n")
    
    # First try to create test user
    if create_test_user():
        print()
        # Then test the endpoints
        test_auth_endpoints()
    
    print("\n🎯 Next Steps:")
    print("1. If login fails, create an end user account through the frontend")
    print("2. If bookings endpoint fails, check Django server logs")
    print("3. If everything works, refresh your dashboard - My Requests should show data!")
