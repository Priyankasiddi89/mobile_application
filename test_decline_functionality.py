#!/usr/bin/env python3
"""
Test script to verify decline functionality shows in customer dashboard
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

def test_decline_visibility():
    """Test that declined requests appear in customer dashboard"""
    print("🧪 Testing Decline Request Visibility...")
    
    # Test 1: Provider declines request
    print("\n1. Testing Provider Decline...")
    
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
        # Get provider's incoming requests
        headers = {"Authorization": f"Bearer {provider_token}"}
        response = requests.get(f"{BASE_URL}/api/bookings/provider/requests/", headers=headers)
        
        if response.status_code == 200:
            requests_data = response.json()
            
            if requests_data:
                booking_id = requests_data[0]['id']
                customer = requests_data[0]['customer']
                
                print(f"   Found request {booking_id} from customer {customer}")
                print(f"   Declining request as provider...")
                
                # Decline the request
                decline_response = requests.post(f"{BASE_URL}/api/bookings/{booking_id}/decline/", headers=headers)
                
                if decline_response.status_code == 200:
                    result = decline_response.json()
                    print(f"   ✅ Provider decline successful!")
                    print(f"   Message: {result.get('message', 'Success')}")
                    
                    # Check booking status
                    booking_data = result.get('booking', {})
                    print(f"   New booking status: {booking_data.get('status', 'Unknown')}")
                    print(f"   Provider field: {booking_data.get('provider', 'None')}")
                    
                    # Now check if customer can see the declined request
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
                            declined_booking = next((b for b in customer_bookings if b['id'] == booking_id), None)
                            
                            if declined_booking:
                                print(f"   ✅ Found declined booking in customer view")
                                print(f"   Status: {declined_booking['status']}")
                                print(f"   Provider: {declined_booking.get('provider', 'None')}")
                                
                                if declined_booking.get('status') == 'declined':
                                    print("   ✅ Decline functionality working correctly!")
                                    print("   Customer will see: '❌ This request has been declined by service provider'")
                                else:
                                    print(f"   ❌ Status not updated correctly - expected 'declined', got '{declined_booking.get('status')}'")
                            else:
                                print("   ❌ Declined booking not found in customer view")
                        else:
                            print(f"   ❌ Failed to get customer bookings: {response.text}")
                    else:
                        print("   ❌ Could not login as customer")
                else:
                    print(f"   ❌ Provider decline failed: {decline_response.text}")
            else:
                print("   ℹ️ No incoming requests found for provider")
        else:
            print(f"   ❌ Failed to get provider requests: {response.text}")
    else:
        print("   ❌ Could not login as provider")
    
    print("\n🎯 Summary:")
    print("- When provider declines assigned request: status should change to 'declined'")
    print("- Provider field should be cleared (set to null)")
    print("- Customer should see request with 'declined' status")
    print("- Customer dashboard message: '❌ This request has been declined by service provider'")
    print("- Declined requests should not show cancel button")

if __name__ == "__main__":
    test_decline_visibility()
