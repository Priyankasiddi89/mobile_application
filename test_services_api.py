#!/usr/bin/env python
"""
Test script to check services API and database
"""
import os
import django
from django.conf import settings
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_platform.settings')
django.setup()

from bookings.models import ServiceCategory, ServiceSubcategory

def test_database():
    """Test if services are in the database"""
    print("🔍 Testing Database...")
    
    categories = ServiceCategory.objects.all()
    subcategories = ServiceSubcategory.objects.all()
    
    print(f"📋 Categories in database: {len(categories)}")
    print(f"🔧 Subcategories in database: {len(subcategories)}")
    
    if len(categories) == 0:
        print("❌ No categories found! Running populate_services...")
        from django.core.management import call_command
        call_command('populate_services')
        
        # Check again
        categories = ServiceCategory.objects.all()
        subcategories = ServiceSubcategory.objects.all()
        print(f"✅ After population - Categories: {len(categories)}, Subcategories: {len(subcategories)}")
    
    # Show sample data
    for category in categories[:3]:
        print(f"\n📂 {category.name}")
        cat_subcategories = ServiceSubcategory.objects.filter(category=category)
        for sub in cat_subcategories[:2]:
            print(f"   - {sub.name} (${sub.price})")

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API Endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Test categories endpoint
    try:
        response = requests.get(f"{base_url}/api/bookings/categories/", timeout=5)
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Categories API: {len(categories)} categories")
        else:
            print(f"❌ Categories API failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Categories API error: {e}")
    
    # Test subcategories endpoint
    try:
        response = requests.get(f"{base_url}/api/bookings/subcategories/", timeout=5)
        if response.status_code == 200:
            subcategories = response.json()
            print(f"✅ Subcategories API: {len(subcategories)} subcategories")
        else:
            print(f"❌ Subcategories API failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Subcategories API error: {e}")

def main():
    print("🚀 Service Platform - API & Database Test\n")
    
    try:
        test_database()
        test_api_endpoints()
        
        print("\n✅ Test completed!")
        print("\n📝 Next steps:")
        print("1. Make sure Django server is running: python manage.py runserver")
        print("2. Refresh your end user dashboard")
        print("3. Services should now be visible on the home page")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
