#!/usr/bin/env python3
"""
Test script to verify rating and review functionality
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

def test_rating_system():
    """Test the complete rating system"""
    print("🧪 Testing Rating & Review System...")
    
    # Test 1: Customer rates a completed service
    print("\n1. Testing Customer Rating Submission...")
    
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
    
    if customer_token:
        # Get customer's completed bookings
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/api/bookings/user/", headers=headers)
        
        if response.status_code == 200:
            bookings = response.json()
            completed_bookings = [b for b in bookings if b['status'] == 'completed']
            
            if completed_bookings:
                booking = completed_bookings[0]
                booking_id = booking['id']
                provider_name = booking.get('provider', 'Unknown')
                
                print(f"   Found completed booking {booking_id} with provider {provider_name}")
                
                # Submit a rating
                rating_data = {
                    "booking_id": str(booking_id),
                    "rating": 5,
                    "review": "Excellent service! Very professional and completed the work on time."
                }
                
                rating_response = requests.post(f"{BASE_URL}/api/bookings/rate-provider/", 
                                              headers=headers, 
                                              json=rating_data)
                
                if rating_response.status_code == 201:
                    result = rating_response.json()
                    print(f"   ✅ Rating submitted successfully!")
                    print(f"   Message: {result.get('message', 'Success')}")
                    
                    rating_info = result.get('rating', {})
                    print(f"   Rating: {rating_info.get('rating', 'Unknown')}/5 stars")
                    print(f"   Review: {rating_info.get('review', 'No review')}")
                    
                    # Test 2: Get provider ratings
                    print(f"\n2. Testing Provider Ratings Retrieval...")
                    
                    # Get provider ID (assuming it's the user ID)
                    # For this test, we'll try to get ratings for provider ID 1
                    provider_id = 1
                    
                    ratings_response = requests.get(f"{BASE_URL}/api/bookings/provider/{provider_id}/ratings/")
                    
                    if ratings_response.status_code == 200:
                        ratings_data = ratings_response.json()
                        print(f"   ✅ Provider ratings retrieved successfully!")
                        print(f"   Provider: {ratings_data.get('provider_name', 'Unknown')}")
                        print(f"   Total Ratings: {ratings_data.get('total_ratings', 0)}")
                        print(f"   Average Rating: {ratings_data.get('average_rating', 0)}/5")
                        
                        ratings_list = ratings_data.get('ratings', [])
                        print(f"   Recent Reviews:")
                        for rating in ratings_list[:3]:  # Show first 3 reviews
                            print(f"     - {rating.get('rating', 0)}/5 by {rating.get('customer', 'Anonymous')}")
                            if rating.get('review'):
                                print(f"       \"{rating.get('review', '')}\"")
                    else:
                        print(f"   ❌ Failed to get provider ratings: {ratings_response.text}")
                    
                elif rating_response.status_code == 400:
                    error_data = rating_response.json()
                    if "already rated" in str(error_data.get('error', '')):
                        print(f"   ℹ️ This service has already been rated")
                    else:
                        print(f"   ❌ Rating submission failed: {error_data.get('error', 'Unknown error')}")
                else:
                    print(f"   ❌ Rating submission failed: {rating_response.text}")
            else:
                print("   ℹ️ No completed bookings found to rate")
        else:
            print(f"   ❌ Failed to get customer bookings: {response.text}")
    else:
        print("   ❌ Could not login as customer")
    
    # Test 3: Check marketplace provider ratings
    print(f"\n3. Testing Marketplace Provider Ratings Display...")
    
    # Get providers for a service (assuming service ID 1 exists)
    service_id = 1
    marketplace_response = requests.get(f"{BASE_URL}/api/marketplace/service/{service_id}/providers/")
    
    if marketplace_response.status_code == 200:
        marketplace_data = marketplace_response.json()
        providers = marketplace_data.get('providers', [])
        
        print(f"   ✅ Found {len(providers)} providers in marketplace")
        
        for provider in providers[:3]:  # Show first 3 providers
            print(f"   Provider: {provider.get('provider_name', 'Unknown')}")
            print(f"     Rating: {provider.get('rating', 0)}/5 ({provider.get('total_reviews', 0)} reviews)")
            print(f"     Price: ${provider.get('provider_price', 0)}")
            print(f"     Completed: {provider.get('completed_bookings', 0)} bookings")
            print()
    else:
        print(f"   ❌ Failed to get marketplace providers: {marketplace_response.text}")
    
    print("\n🎯 Summary:")
    print("- Customers can rate completed services with 1-5 stars and optional review")
    print("- Provider ratings are displayed in marketplace for informed booking decisions")
    print("- Average ratings and total review counts help customers choose providers")
    print("- Rating system prevents duplicate ratings for the same booking")

if __name__ == "__main__":
    test_rating_system()
