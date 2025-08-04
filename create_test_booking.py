#!/usr/bin/env python3
"""
Create a test booking to test accept functionality
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def create_test_booking():
    """Create a test booking"""
    print("🧪 Creating Test Booking...")
    
    # Login as customer
    customer_logins = [
        {"email": "customer@test.com", "password": "password123"},
        {"email": "user@test.com", "password": "password123"},
        {"email": "test@test.com", "password": "password123"},
    ]
    
    customer_token = None
    
    for login_data in customer_logins:
        print(f"\n1. Trying customer login: {login_data['email']}")
        response = requests.post(f"{BASE_URL}/api/auth/login/", login_data)
        
        if response.status_code == 200:
            customer_token = response.json()["access"]
            print("✅ Customer login successful!")
            break
        else:
            print(f"❌ Login failed: {response.text}")
    
    if not customer_token:
        print("❌ Could not login as customer")
        return
    
    # Get available providers for a service
    print(f"\n2. Getting available providers...")
    headers = {"Authorization": f"Bearer {customer_token}"}
    
    # Try to get providers for service ID 1 (AC Repair)
    service_id = 1
    response = requests.get(f"{BASE_URL}/api/marketplace/service/{service_id}/providers/", headers=headers)
    
    if response.status_code == 200:
        providers_data = response.json()
        providers = providers_data.get('providers', [])
        print(f"✅ Found {len(providers)} providers for service {service_id}")
        
        if len(providers) == 0:
            print("❌ No providers available for this service")
            return
        
        # Use the first provider
        provider = providers[0]
        provider_id = provider['provider_id']
        print(f"   Using provider: {provider['provider_name']} (ID: {provider_id})")
        
        # Create booking
        print(f"\n3. Creating booking...")
        
        # Set service date to tomorrow
        tomorrow = datetime.now() + timedelta(days=1)
        service_date = tomorrow.strftime("%Y-%m-%dT10:00:00Z")
        
        booking_data = {
            "provider_id": provider_id,
            "service_id": service_id,
            "service_date": service_date,
            "notes": "Test booking for accept functionality"
        }
        
        response = requests.post(f"{BASE_URL}/api/marketplace/book-provider/", 
                               headers=headers, 
                               json=booking_data)
        
        if response.status_code == 201:
            booking_result = response.json()
            booking_info = booking_result.get('booking', {})
            print("✅ Test booking created successfully!")
            print(f"   Booking ID: {booking_info.get('id')}")
            print(f"   Status: {booking_info.get('status')}")
            print(f"   Provider: {booking_info.get('provider')}")
            print(f"   Service Date: {booking_info.get('service_date')}")
            
            return booking_info.get('id')
        else:
            print(f"❌ Failed to create booking:")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
    else:
        print(f"❌ Failed to get providers: {response.text}")
    
    return None

if __name__ == "__main__":
    booking_id = create_test_booking()
    if booking_id:
        print(f"\n🎯 Test booking created with ID: {booking_id}")
        print("Now you can test the accept functionality in the provider dashboard!")
    else:
        print("\n❌ Failed to create test booking")
