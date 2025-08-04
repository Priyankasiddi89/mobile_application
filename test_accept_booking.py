#!/usr/bin/env python3
"""
Test script to debug accept booking functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_accept_booking():
    """Test the accept booking functionality"""
    print("🧪 Testing Accept Booking Functionality...")
    
    # Try to login as provider
    provider_logins = [
        {"email": "spc@test.com", "password": "password123"},
        {"email": "spc", "password": "password123"},
        {"email": "provider@test.com", "password": "password123"},
    ]
    
    provider_token = None
    provider_username = None
    
    for login_data in provider_logins:
        print(f"\n1. Trying provider login: {login_data['email']}")
        response = requests.post(f"{BASE_URL}/api/auth/login/", login_data)
        
        if response.status_code == 200:
            data = response.json()
            provider_token = data["access"]
            
            # Get user info
            user_response = requests.get(f"{BASE_URL}/api/auth/user/", 
                                       headers={"Authorization": f"Bearer {provider_token}"})
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                provider_username = user_data.get('username')
                print(f"✅ Provider login successful!")
                print(f"   Username: {provider_username}")
                print(f"   Email: {user_data.get('email')}")
                print(f"   User Type: {user_data.get('user_type')}")
                break
        else:
            print(f"❌ Login failed: {response.text}")
    
    if not provider_token:
        print("❌ Could not login as provider")
        return
    
    # Get incoming requests
    print(f"\n2. Getting incoming requests...")
    headers = {"Authorization": f"Bearer {provider_token}"}
    response = requests.get(f"{BASE_URL}/api/bookings/provider/requests/", headers=headers)
    
    if response.status_code == 200:
        requests_data = response.json()
        print(f"✅ Found {len(requests_data)} incoming requests")
        
        if len(requests_data) == 0:
            print("ℹ️ No incoming requests to test with")
            return
        
        # Try to accept the first request
        first_request = requests_data[0]
        booking_id = first_request['id']
        
        print(f"\n3. Attempting to accept booking ID: {booking_id}")
        print(f"   Service: {first_request.get('subcategory', {}).get('name', 'Unknown')}")
        print(f"   Customer: {first_request.get('customer', 'Unknown')}")
        print(f"   Status: {first_request.get('status', 'Unknown')}")
        print(f"   Current Provider: {first_request.get('provider', 'None')}")
        
        # Try to accept
        accept_response = requests.post(f"{BASE_URL}/api/bookings/{booking_id}/accept/", headers=headers)
        
        if accept_response.status_code == 200:
            print("✅ Booking accepted successfully!")
            accepted_data = accept_response.json()
            print(f"   New Status: {accepted_data.get('status', 'Unknown')}")
            print(f"   Provider: {accepted_data.get('provider', 'Unknown')}")
        else:
            print(f"❌ Failed to accept booking:")
            print(f"   Status Code: {accept_response.status_code}")
            print(f"   Response: {accept_response.text}")
            
            # Try to get more details about the error
            try:
                error_data = accept_response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                pass
    else:
        print(f"❌ Failed to get incoming requests: {response.text}")

if __name__ == "__main__":
    test_accept_booking()
