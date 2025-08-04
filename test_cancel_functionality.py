#!/usr/bin/env python3
"""
Test script to verify cancel functionality for both customers and providers
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def login_user(email, password):
    """Login and get access token"""
    response = requests.post(f"{BASE_URL}/api/auth/login/", {
        "email": email,
        "password": password
    })
    if response.status_code == 200:
        data = response.json()
        return data["access"], data
    else:
        print(f"Login failed for {email}: {response.text}")
        return None, None

def test_cancel_functionality():
    """Test cancel functionality for both user types"""
    print("🧪 Testing Cancel Functionality for Both User Types...")
    
    # Test customer cancel
    print("\n1. Testing Customer Cancel...")
    customer_logins = [
        {"email": "customer@test.com", "password": "password123"},
        {"email": "user@test.com", "password": "password123"},
    ]
    
    customer_token = None
    for login_data in customer_logins:
        token, user_data = login_user(login_data["email"], login_data["password"])
        if token:
            customer_token = token
            print(f"✅ Customer logged in: {user_data.get('username', 'Unknown')}")
            break
    
    if customer_token:
        # Get customer bookings
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/api/bookings/user/", headers=headers)
        
        if response.status_code == 200:
            bookings = response.json()
            cancellable_bookings = [b for b in bookings if b['status'] in ['pending', 'accepted']]
            print(f"   Customer has {len(cancellable_bookings)} cancellable bookings")
            
            if cancellable_bookings:
                booking_id = cancellable_bookings[0]['id']
                print(f"   Testing cancel on booking {booking_id}...")
                
                cancel_response = requests.post(f"{BASE_URL}/api/bookings/{booking_id}/cancel/", headers=headers)
                
                if cancel_response.status_code == 200:
                    result = cancel_response.json()
                    print(f"   ✅ Customer cancel successful: {result.get('message', 'Success')}")
                else:
                    print(f"   ❌ Customer cancel failed: {cancel_response.text}")
    
    # Test provider cancel
    print("\n2. Testing Provider Cancel...")
    provider_logins = [
        {"email": "spc@test.com", "password": "password123"},
        {"email": "provider@test.com", "password": "password123"},
    ]
    
    provider_token = None
    for login_data in provider_logins:
        token, user_data = login_user(login_data["email"], login_data["password"])
        if token:
            provider_token = token
            print(f"✅ Provider logged in: {user_data.get('username', 'Unknown')}")
            break
    
    if provider_token:
        # Get provider bookings
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(f"{BASE_URL}/api/bookings/provider/?status=active", headers=headers)
        
        if response.status_code == 200:
            bookings = response.json()
            cancellable_bookings = [b for b in bookings if b['status'] in ['pending', 'accepted', 'confirmed']]
            print(f"   Provider has {len(cancellable_bookings)} cancellable bookings")
            
            if cancellable_bookings:
                booking_id = cancellable_bookings[0]['id']
                print(f"   Testing cancel on booking {booking_id}...")
                
                cancel_response = requests.post(f"{BASE_URL}/api/bookings/{booking_id}/cancel/", headers=headers)
                
                if cancel_response.status_code == 200:
                    result = cancel_response.json()
                    print(f"   ✅ Provider cancel successful: {result.get('message', 'Success')}")
                    print(f"   Cancelled by: {result.get('cancelled_by', 'Unknown')}")
                else:
                    print(f"   ❌ Provider cancel failed: {cancel_response.text}")
        else:
            print(f"   ❌ Failed to get provider bookings: {response.text}")
    
    print("\n🎯 Summary:")
    print("- Both customers and providers should be able to cancel bookings")
    print("- Customers can cancel: pending, accepted")
    print("- Providers can cancel: pending, accepted, confirmed")
    print("- The API should return who cancelled the booking")

if __name__ == "__main__":
    test_cancel_functionality()
