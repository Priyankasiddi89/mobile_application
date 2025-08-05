#!/usr/bin/env python3
"""
Debug script to check rating data inconsistency
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def login_user(email, password):
    """Login and get access token"""
    response = requests.post(f"{BASE_URL}/api/auth/login/", {
        "username": email,
        "password": password
    })
    if response.status_code == 200:
        data = response.json()
        return data["access"], data
    else:
        print(f"Login failed for {email}: {response.text}")
        return None, None

def debug_rating_issue():
    """Debug the rating data inconsistency"""
    print("🔍 Debugging Rating Data Inconsistency...")
    print("=" * 50)

    # Skip login for now and just check the ratings endpoints directly
    print("Checking ratings endpoints without authentication...")

    provider_token = None
    provider_data = {"id": 1, "username": "spc"}  # Assume provider ID 1
    
    # Test 1: Check ratings detail API (no auth needed)
    print(f"\n2. Testing Ratings Detail API...")
    user_id = provider_data.get('id')
    ratings_response = requests.get(f"{BASE_URL}/api/bookings/provider/{user_id}/ratings/")
    
    if ratings_response.status_code == 200:
        ratings_data = ratings_response.json()
        print(f"✅ Ratings Detail Response:")
        print(f"   Provider ID: {ratings_data.get('provider_id', 'Not found')}")
        print(f"   Provider Name: {ratings_data.get('provider_name', 'Not found')}")
        print(f"   Average Rating: {ratings_data.get('average_rating', 'Not found')}")
        print(f"   Total Ratings: {ratings_data.get('total_ratings', 'Not found')}")
        print(f"   Number of Rating Objects: {len(ratings_data.get('ratings', []))}")
        
        # Show individual ratings
        ratings = ratings_data.get('ratings', [])
        if ratings:
            print(f"   Individual Ratings:")
            for i, rating in enumerate(ratings):
                print(f"     {i+1}. Rating: {rating.get('rating', 'N/A')}/5")
                print(f"        Customer: {rating.get('customer', 'N/A')}")
                print(f"        Review: {rating.get('review', 'No review')[:50]}...")
                print(f"        Booking ID: {rating.get('booking_id', 'N/A')}")
        else:
            print(f"   ❌ No individual ratings found")
    else:
        print(f"❌ Ratings detail failed: {ratings_response.text}")
    
    # Test 3: Try different provider IDs
    print(f"\n3. Testing Different Provider ID Formats...")
    
    # Try with username instead of ID
    username = provider_data.get('username')
    print(f"   Trying with username: {username}")
    
    # Try all possible user IDs (1, 2, 3, etc.)
    for test_id in range(1, 6):
        test_response = requests.get(f"{BASE_URL}/api/bookings/provider/{test_id}/ratings/")
        if test_response.status_code == 200:
            test_data = test_response.json()
            total_ratings = test_data.get('total_ratings', 0)
            if total_ratings > 0:
                print(f"   ✅ Found ratings for provider ID {test_id}:")
                print(f"      Provider Name: {test_data.get('provider_name', 'Unknown')}")
                print(f"      Total Ratings: {total_ratings}")
                print(f"      Average Rating: {test_data.get('average_rating', 0)}")
    
    # Test 4: Check if there are any ratings in the system at all
    print(f"\n4. Checking All Providers for Ratings...")
    
    # Get all providers and check their ratings
    for test_id in range(1, 10):
        test_response = requests.get(f"{BASE_URL}/api/bookings/provider/{test_id}/ratings/")
        if test_response.status_code == 200:
            test_data = test_response.json()
            total_ratings = test_data.get('total_ratings', 0)
            provider_name = test_data.get('provider_name', 'Unknown')
            
            print(f"   Provider ID {test_id} ({provider_name}): {total_ratings} ratings")
            
            if total_ratings > 0:
                print(f"      ⭐ Average: {test_data.get('average_rating', 0)}/5")
                ratings = test_data.get('ratings', [])
                for rating in ratings:
                    print(f"         - {rating.get('rating', 0)}/5 by {rating.get('customer', 'Unknown')}")
        elif test_response.status_code == 404:
            # Provider not found, skip
            continue
        else:
            print(f"   Error checking provider {test_id}: {test_response.text}")
    
    print(f"\n🎯 Summary:")
    print("- Dashboard stats and ratings detail should show the same data")
    print("- If they differ, there's a query inconsistency")
    print("- Check the debug output above to see which provider ID has the actual ratings")

if __name__ == "__main__":
    debug_rating_issue()
