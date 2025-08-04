#!/usr/bin/env python3
"""
Test script to verify cancellation tracking functionality
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

def test_cancellation_tracking():
    """Test that cancellation tracking works correctly"""
    print("🧪 Testing Cancellation Tracking...")
    
    # Test 1: Provider cancels booking
    print("\n1. Testing Provider Cancellation Tracking...")
    
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
        # Get provider's active bookings
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(f"{BASE_URL}/api/bookings/provider/?status=active", headers=headers)
        
        if response.status_code == 200:
            bookings = response.json()
            cancellable_bookings = [b for b in bookings if b['status'] in ['pending', 'accepted', 'confirmed']]
            
            if cancellable_bookings:
                booking_id = cancellable_bookings[0]['id']
                customer = cancellable_bookings[0]['customer']
                
                print(f"   Found booking {booking_id} for customer {customer}")
                print(f"   Cancelling booking as provider...")
                
                # Cancel the booking
                cancel_response = requests.post(f"{BASE_URL}/api/bookings/{booking_id}/cancel/", headers=headers)
                
                if cancel_response.status_code == 200:
                    result = cancel_response.json()
                    print(f"   ✅ Provider cancellation successful!")
                    print(f"   Message: {result.get('message', 'Success')}")
                    print(f"   Cancelled by: {result.get('cancelled_by', 'Unknown')}")
                    
                    # Now check if customer can see who cancelled
                    print(f"\n2. Checking customer view...")
                    
                    customer_logins = [
                        {"email": "customer@test.com", "password": "password123"},
                        {"email": "user@test.com", "password": "password123"},
                    ]
                    
                    customer_token = None
                    for login_data in customer_logins:
                        token, user_data = login_user(login_data["email"], login_data["password"])
                        if token and user_data.get('username') == customer:
                            customer_token = token
                            print(f"   ✅ Customer logged in: {user_data.get('username', 'Unknown')}")
                            break
                    
                    if customer_token:
                        # Get customer's bookings
                        headers = {"Authorization": f"Bearer {customer_token}"}
                        response = requests.get(f"{BASE_URL}/api/bookings/user/", headers=headers)
                        
                        if response.status_code == 200:
                            customer_bookings = response.json()
                            cancelled_booking = next((b for b in customer_bookings if b['id'] == booking_id), None)
                            
                            if cancelled_booking:
                                print(f"   ✅ Found cancelled booking in customer view")
                                print(f"   Status: {cancelled_booking['status']}")
                                print(f"   Cancelled by: {cancelled_booking.get('cancelled_by', 'Not set')}")
                                
                                if cancelled_booking.get('cancelled_by') == 'provider':
                                    print("   ✅ Cancellation tracking working correctly!")
                                    print("   Customer will see: '❌ This request has been cancelled by service provider'")
                                else:
                                    print("   ❌ Cancellation tracking not working - cancelled_by field not set correctly")
                            else:
                                print("   ❌ Cancelled booking not found in customer view")
                        else:
                            print(f"   ❌ Failed to get customer bookings: {response.text}")
                    else:
                        print("   ❌ Could not login as customer")
                else:
                    print(f"   ❌ Provider cancellation failed: {cancel_response.text}")
            else:
                print("   ℹ️ No cancellable bookings found for provider")
        else:
            print(f"   ❌ Failed to get provider bookings: {response.text}")
    else:
        print("   ❌ Could not login as provider")
    
    print("\n🎯 Summary:")
    print("- When provider cancels: cancelled_by should be 'provider'")
    print("- When customer cancels: cancelled_by should be 'customer'")
    print("- Customer should see different messages based on who cancelled")
    print("- Provider cancellation message: '❌ This request has been cancelled by service provider'")
    print("- Customer cancellation message: '❌ This request has been cancelled by you'")

if __name__ == "__main__":
    test_cancellation_tracking()
