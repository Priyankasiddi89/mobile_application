#!/usr/bin/env python3
"""
Check the specific provider issue
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_provider_login():
    """Test different provider login combinations"""
    
    # Try different possible usernames/emails for the provider
    possible_logins = [
        {"email": "spc@test.com", "password": "password123"},
        {"email": "spc", "password": "password123"},
        {"email": "provider@test.com", "password": "password123"},
        {"email": "provider", "password": "password123"},
    ]
    
    print("🔍 Testing Provider Login Combinations...")
    
    for i, login_data in enumerate(possible_logins, 1):
        print(f"\n{i}. Trying login: {login_data['email']}")
        
        response = requests.post(f"{BASE_URL}/api/auth/login/", login_data)
        
        if response.status_code == 200:
            data = response.json()
            token = data["access"]
            print(f"✅ Login successful!")
            
            # Get user info
            user_response = requests.get(f"{BASE_URL}/api/auth/user/", 
                                       headers={"Authorization": f"Bearer {token}"})
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"   Username: {user_data.get('username')}")
                print(f"   Email: {user_data.get('email')}")
                print(f"   User Type: {user_data.get('user_type')}")
                
                # Check active bookings for this provider
                bookings_response = requests.get(f"{BASE_URL}/api/bookings/provider/?status=active",
                                                headers={"Authorization": f"Bearer {token}"})
                
                if bookings_response.status_code == 200:
                    bookings = bookings_response.json()
                    print(f"   Active Bookings: {len(bookings)}")
                    
                    for booking in bookings:
                        print(f"     - Booking ID: {booking['id']}, Status: {booking['status']}")
                else:
                    print(f"   ❌ Failed to get bookings: {bookings_response.text}")
            
            return token, user_data.get('username')
        else:
            print(f"❌ Login failed: {response.text}")
    
    return None, None

def check_all_bookings():
    """Check all bookings in the system"""
    print("\n🔍 Checking All Bookings in System...")
    
    # This would require admin access or direct database query
    # For now, let's try to get customer bookings to see the booking details
    
    customer_logins = [
        {"email": "customer@test.com", "password": "password123"},
        {"email": "user@test.com", "password": "password123"},
    ]
    
    for login_data in customer_logins:
        print(f"\nTrying customer login: {login_data['email']}")
        
        response = requests.post(f"{BASE_URL}/api/auth/login/", login_data)
        
        if response.status_code == 200:
            token = response.json()["access"]
            print("✅ Customer login successful!")
            
            # Get customer bookings
            bookings_response = requests.get(f"{BASE_URL}/api/bookings/user/",
                                           headers={"Authorization": f"Bearer {token}"})
            
            if bookings_response.status_code == 200:
                bookings = bookings_response.json()
                print(f"Customer has {len(bookings)} bookings:")
                
                for booking in bookings:
                    print(f"  - ID: {booking['id']}")
                    print(f"    Status: {booking['status']}")
                    print(f"    Provider: {booking.get('provider', 'None')}")
                    print(f"    Service: {booking.get('subcategory_name', 'Unknown')}")
                    print(f"    Customer: {booking.get('customer', 'Unknown')}")
                    print()
            break

if __name__ == "__main__":
    print("🧪 Debugging Provider Dashboard Issue")
    print("=" * 50)
    
    # Test provider login
    provider_token, provider_username = test_provider_login()
    
    # Check all bookings
    check_all_bookings()
    
    print("\n🎯 Summary:")
    print("- Check if the provider username in the booking matches the logged-in provider's username")
    print("- The booking should appear in active bookings if provider field matches")
    print("- If provider='spc' but logged-in user has different username, that's the issue")
