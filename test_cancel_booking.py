#!/usr/bin/env python3
"""
Test script to verify booking cancellation functionality
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
CUSTOMER_EMAIL = "customer@test.com"
CUSTOMER_PASSWORD = "password123"
PROVIDER_EMAIL = "provider@test.com"
PROVIDER_PASSWORD = "password123"

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

def test_cancel_booking():
    """Test the booking cancellation flow"""
    print("🧪 Testing Booking Cancellation Flow...")
    
    # 1. Login as customer
    print("\n1. Logging in as customer...")
    customer_token = login_user(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not customer_token:
        print("❌ Customer login failed")
        return
    print("✅ Customer logged in successfully")
    
    # 2. Get customer's bookings
    print("\n2. Getting customer's bookings...")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{BASE_URL}/api/bookings/user/", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get bookings: {response.text}")
        return
    
    bookings = response.json()
    print(f"✅ Found {len(bookings)} bookings")
    
    # Find a pending or accepted booking to cancel
    cancellable_booking = None
    for booking in bookings:
        if booking['status'] in ['pending', 'accepted']:
            cancellable_booking = booking
            break
    
    if not cancellable_booking:
        print("ℹ️ No cancellable bookings found (need pending or accepted status)")
        return
    
    booking_id = cancellable_booking['id']
    print(f"✅ Found cancellable booking: ID {booking_id}, Status: {cancellable_booking['status']}")
    
    # 3. Cancel the booking
    print(f"\n3. Cancelling booking {booking_id}...")
    response = requests.post(f"{BASE_URL}/api/bookings/{booking_id}/cancel/", headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Booking cancelled successfully!")
        print(f"   New status: {result['booking']['status']}")
    else:
        print(f"❌ Failed to cancel booking: {response.text}")
        return
    
    # 4. Verify booking status changed
    print("\n4. Verifying booking status...")
    response = requests.get(f"{BASE_URL}/api/bookings/user/", headers=headers)
    updated_bookings = response.json()
    
    cancelled_booking = next((b for b in updated_bookings if b['id'] == booking_id), None)
    if cancelled_booking and cancelled_booking['status'] == 'cancelled':
        print("✅ Booking status correctly updated to 'cancelled'")
    else:
        print("❌ Booking status not updated correctly")
        return
    
    # 5. Check provider dashboard (if provider exists)
    print("\n5. Checking provider dashboard...")
    provider_token = login_user(PROVIDER_EMAIL, PROVIDER_PASSWORD)
    if provider_token:
        provider_headers = {"Authorization": f"Bearer {provider_token}"}
        
        # Check pending requests
        response = requests.get(f"{BASE_URL}/api/bookings/provider/requests/", headers=provider_headers)
        if response.status_code == 200:
            pending_requests = response.json()
            cancelled_in_pending = any(r['id'] == booking_id for r in pending_requests)
            if not cancelled_in_pending:
                print("✅ Cancelled booking removed from provider's pending requests")
            else:
                print("❌ Cancelled booking still appears in provider's pending requests")
        
        # Check active bookings
        response = requests.get(f"{BASE_URL}/api/bookings/provider/?status=active", headers=provider_headers)
        if response.status_code == 200:
            active_bookings = response.json()
            cancelled_in_active = any(b['id'] == booking_id for b in active_bookings)
            if not cancelled_in_active:
                print("✅ Cancelled booking removed from provider's active bookings")
            else:
                print("❌ Cancelled booking still appears in provider's active bookings")
    
    print("\n🎉 Booking cancellation test completed!")

if __name__ == "__main__":
    test_cancel_booking()
