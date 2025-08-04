#!/usr/bin/env python3
"""
Debug script to check specific booking details
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
PROVIDER_EMAIL = "spc@test.com"  # Update with actual provider email
PROVIDER_PASSWORD = "password123"  # Update with actual password

def login_user(email, password):
    """Login and get access token"""
    response = requests.post(f"{BASE_URL}/api/auth/login/", {
        "email": email,
        "password": password
    })
    if response.status_code == 200:
        return response.json()["access"]
    else:
        print(f"Login failed: {response.text}")
        return None

def debug_provider_bookings():
    """Debug provider's bookings"""
    print("🔍 Debugging Provider Bookings...")
    
    # Login as provider
    print(f"\n1. Logging in as provider ({PROVIDER_EMAIL})...")
    provider_token = login_user(PROVIDER_EMAIL, PROVIDER_PASSWORD)
    if not provider_token:
        print("❌ Provider login failed")
        return
    print("✅ Provider logged in successfully")
    
    headers = {"Authorization": f"Bearer {provider_token}"}
    
    # Check incoming requests (pending)
    print("\n2. Checking incoming requests (pending)...")
    response = requests.get(f"{BASE_URL}/api/bookings/provider/requests/", headers=headers)
    if response.status_code == 200:
        pending_requests = response.json()
        print(f"✅ Found {len(pending_requests)} pending requests")
        for req in pending_requests:
            print(f"   - ID: {req['id']}, Status: {req['status']}, Provider: {req.get('provider', 'None')}")
    else:
        print(f"❌ Failed to get pending requests: {response.text}")
    
    # Check active bookings
    print("\n3. Checking active bookings...")
    response = requests.get(f"{BASE_URL}/api/bookings/provider/?status=active", headers=headers)
    if response.status_code == 200:
        active_bookings = response.json()
        print(f"✅ Found {len(active_bookings)} active bookings")
        for booking in active_bookings:
            print(f"   - ID: {booking['id']}, Status: {booking['status']}, Provider: {booking.get('provider', 'None')}")
    else:
        print(f"❌ Failed to get active bookings: {response.text}")
    
    # Check all provider bookings
    print("\n4. Checking all provider bookings...")
    response = requests.get(f"{BASE_URL}/api/bookings/provider/", headers=headers)
    if response.status_code == 200:
        all_bookings = response.json()
        print(f"✅ Found {len(all_bookings)} total bookings")
        for booking in all_bookings:
            print(f"   - ID: {booking['id']}, Status: {booking['status']}, Provider: {booking.get('provider', 'None')}, Customer: {booking.get('customer', 'Unknown')}")
    else:
        print(f"❌ Failed to get all bookings: {response.text}")
    
    print("\n🎯 Summary:")
    print("- If the accepted booking appears in 'all bookings' but not 'active bookings', there's a filtering issue")
    print("- If the accepted booking doesn't appear in any provider lists, the provider field might not be set correctly")
    print("- The booking should have provider='spc' and status='accepted' to appear in active bookings")

if __name__ == "__main__":
    debug_provider_bookings()
