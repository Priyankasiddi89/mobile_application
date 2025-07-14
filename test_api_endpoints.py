#!/usr/bin/env python
"""
Test script to verify API endpoints are working
"""
import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "username": "testprovider",  # Replace with your service provider username
    "password": "testpass123"    # Replace with your password
}

def test_login():
    """Test login and get access token"""
    print("🔐 Testing login...")
    
    login_url = f"{BASE_URL}/api/auth/login/"
    response = requests.post(login_url, json=TEST_USER)
    
    if response.status_code == 200:
        data = response.json()
        access_token = data.get('access')
        print(f"✅ Login successful! Token: {access_token[:20]}...")
        return access_token
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def test_categories_api(token):
    """Test categories API endpoint"""
    print("\n📂 Testing categories API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    categories_url = f"{BASE_URL}/api/bookings/categories/"
    
    response = requests.get(categories_url, headers=headers)
    
    if response.status_code == 200:
        categories = response.json()
        print(f"✅ Categories API working! Found {len(categories)} categories:")
        for cat in categories[:3]:  # Show first 3
            print(f"   - {cat.get('name', 'Unknown')}")
        return categories
    else:
        print(f"❌ Categories API failed: {response.status_code} - {response.text}")
        return []

def test_subcategories_api(token):
    """Test subcategories API endpoint"""
    print("\n🔧 Testing subcategories API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    subcategories_url = f"{BASE_URL}/api/bookings/subcategories/"
    
    response = requests.get(subcategories_url, headers=headers)
    
    if response.status_code == 200:
        subcategories = response.json()
        print(f"✅ Subcategories API working! Found {len(subcategories)} services:")
        for sub in subcategories[:5]:  # Show first 5
            print(f"   - {sub.get('name', 'Unknown')} (${sub.get('price', 'N/A')})")
        return subcategories
    else:
        print(f"❌ Subcategories API failed: {response.status_code} - {response.text}")
        return []

def test_provider_services_api(token):
    """Test provider services API endpoint"""
    print("\n👤 Testing provider services API...")
    
    headers = {"Authorization": f"Bearer {token}"}
    provider_services_url = f"{BASE_URL}/api/service_provider_dashboard/services/"
    
    response = requests.get(provider_services_url, headers=headers)
    
    if response.status_code == 200:
        services = response.json()
        print(f"✅ Provider services API working! Registered for {len(services)} services:")
        for service in services:
            print(f"   - {service.get('name', 'Unknown')}")
        return services
    else:
        print(f"❌ Provider services API failed: {response.status_code} - {response.text}")
        return []

def main():
    """Run all API tests"""
    print("🚀 Starting API endpoint tests...\n")
    
    # Test login
    token = test_login()
    if not token:
        print("\n❌ Cannot proceed without valid token. Please check your credentials.")
        return
    
    # Test all endpoints
    categories = test_categories_api(token)
    subcategories = test_subcategories_api(token)
    provider_services = test_provider_services_api(token)
    
    # Summary
    print(f"\n📊 Test Summary:")
    print(f"   Categories found: {len(categories)}")
    print(f"   Services found: {len(subcategories)}")
    print(f"   Registered services: {len(provider_services)}")
    
    if len(subcategories) > 0:
        print(f"\n✅ All APIs working! You should see {len(subcategories)} services in the dashboard.")
    else:
        print(f"\n❌ No services found. Check MongoDB collections.")

if __name__ == "__main__":
    main()
