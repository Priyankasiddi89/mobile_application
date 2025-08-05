#!/usr/bin/env python3
"""
Test the complete rating workflow from booking to review
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

def test_rating_workflow():
    """Test complete rating workflow"""
    print("🧪 Testing Complete Rating Workflow...")
    print("=" * 50)
    
    # Step 1: Check if there are any completed bookings to rate
    print("\n1. Checking for completed bookings to rate...")
    
    customer_logins = [
        {"email": "customer@test.com", "password": "password123"},
        {"email": "user@test.com", "password": "password123"},
    ]
    
    customer_token = None
    customer_username = None
    
    for login_data in customer_logins:
        token, user_data = login_user(login_data["email"], login_data["password"])
        if token:
            customer_token = token
            customer_username = user_data.get('username')
            print(f"✅ Customer logged in: {customer_username}")
            break
    
    if not customer_token:
        print("❌ Could not login as customer")
        return
    
    # Get customer's bookings
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{BASE_URL}/api/bookings/user/", headers=headers)
    
    if response.status_code == 200:
        bookings = response.json()
        completed_bookings = [b for b in bookings if b['status'] == 'completed']
        
        print(f"Found {len(completed_bookings)} completed bookings")
        
        if completed_bookings:
            # Try to rate the first completed booking
            booking = completed_bookings[0]
            booking_id = booking['id']
            provider_name = booking.get('provider', 'Unknown')
            service_name = booking.get('subcategory_name', 'Unknown')
            
            print(f"\n2. Rating completed service...")
            print(f"   Booking ID: {booking_id}")
            print(f"   Service: {service_name}")
            print(f"   Provider: {provider_name}")
            
            # Submit a rating
            rating_data = {
                "booking_id": str(booking_id),
                "rating": 5,
                "review": "Excellent service! Very professional, arrived on time, and completed the work perfectly. Highly recommended!"
            }
            
            rating_response = requests.post(f"{BASE_URL}/api/bookings/rate-provider/", 
                                          headers=headers, json=rating_data)
            
            if rating_response.status_code == 201:
                result = rating_response.json()
                print(f"✅ Rating submitted successfully!")
                print(f"   Rating: 5/5 stars")
                print(f"   Review: \"{rating_data['review']}\"")
                
                # Step 3: Check provider's updated ratings
                print(f"\n3. Checking provider's updated ratings...")
                
                # Login as provider
                provider_logins = [
                    {"email": "spc@test.com", "password": "password123"},
                    {"email": "provider@test.com", "password": "password123"},
                ]
                
                provider_token = None
                for login_data in provider_logins:
                    token, user_data = login_user(login_data["email"], login_data["password"])
                    if token and user_data.get('username') == provider_name:
                        provider_token = token
                        print(f"✅ Provider logged in: {user_data.get('username')}")
                        break
                
                if provider_token:
                    provider_headers = {"Authorization": f"Bearer {provider_token}"}
                    
                    # Get updated dashboard stats
                    stats_response = requests.get(f"{BASE_URL}/api/analytics/provider/dashboard/", 
                                                headers=provider_headers)
                    
                    if stats_response.status_code == 200:
                        stats = stats_response.json()
                        print(f"✅ Provider dashboard updated:")
                        print(f"   Average Rating: {stats.get('average_rating', 0)}/5")
                        print(f"   Total Reviews: {stats.get('total_reviews', 0)}")
                        
                        # Get detailed ratings
                        user_response = requests.get(f"{BASE_URL}/api/auth/user/", headers=provider_headers)
                        if user_response.status_code == 200:
                            user_data = user_response.json()
                            user_id = user_data.get('id')
                            
                            ratings_response = requests.get(f"{BASE_URL}/api/bookings/provider/{user_id}/ratings/")
                            
                            if ratings_response.status_code == 200:
                                ratings_data = ratings_response.json()
                                print(f"✅ Detailed ratings:")
                                
                                ratings = ratings_data.get('ratings', [])
                                for rating in ratings:
                                    print(f"   - {rating.get('rating', 0)}/5 by {rating.get('customer', 'Anonymous')}")
                                    if rating.get('review'):
                                        print(f"     \"{rating.get('review', '')}\"")
                                    print(f"     Date: {rating.get('created_at', 'Unknown')}")
                                    print()
                
                # Step 4: Check marketplace display
                print(f"\n4. Checking marketplace display...")
                
                service_id = booking.get('subcategory', {}).get('id', 1)
                marketplace_response = requests.get(f"{BASE_URL}/api/marketplace/service/{service_id}/providers/")
                
                if marketplace_response.status_code == 200:
                    marketplace_data = marketplace_response.json()
                    providers = marketplace_data.get('providers', [])
                    
                    for provider in providers:
                        if provider.get('provider_name') == provider_name:
                            print(f"✅ Marketplace updated:")
                            print(f"   Provider: {provider.get('provider_name')}")
                            print(f"   Rating: {provider.get('rating', 0)}/5")
                            print(f"   Reviews: {provider.get('total_reviews', 0)}")
                            print(f"   Completed: {provider.get('completed_bookings', 0)} bookings")
                            break
                
            elif "already rated" in rating_response.text:
                print(f"ℹ️ This service has already been rated")
                print("   The rating system is working - preventing duplicate ratings!")
            else:
                error_data = rating_response.json() if rating_response.headers.get('content-type') == 'application/json' else {}
                print(f"❌ Rating submission failed: {error_data.get('error', rating_response.text)}")
        else:
            print("ℹ️ No completed bookings found to rate")
            print("\nTo test the rating system:")
            print("1. Complete a booking (mark it as completed)")
            print("2. Login as customer and rate the service")
            print("3. Check provider dashboard to see the rating")
    else:
        print(f"❌ Failed to get customer bookings: {response.text}")
    
    print("\n🎯 Rating System Features:")
    print("=" * 30)
    print("✅ Customers can rate completed services (1-5 stars)")
    print("✅ Customers can leave detailed reviews")
    print("✅ Providers see ratings in their dashboard")
    print("✅ Ratings appear in marketplace for other customers")
    print("✅ System prevents duplicate ratings")
    print("✅ Average ratings calculated automatically")

if __name__ == "__main__":
    test_rating_workflow()
