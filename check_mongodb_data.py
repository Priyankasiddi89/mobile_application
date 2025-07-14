#!/usr/bin/env python
"""
Check MongoDB data directly
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_platform.settings')
django.setup()

from bookings.models import ServiceCategory, ServiceSubcategory

def check_mongodb_data():
    """Check what's in MongoDB"""
    print("🔍 Checking MongoDB data...\n")
    
    try:
        # Check categories
        categories = ServiceCategory.objects.all()
        print(f"📂 Categories found: {len(categories)}")
        
        for category in categories:
            print(f"   - {category.name} (ID: {category.id})")
        
        # Check subcategories
        subcategories = ServiceSubcategory.objects.all()
        print(f"\n🔧 Subcategories found: {len(subcategories)}")
        
        for sub in subcategories[:10]:  # Show first 10
            print(f"   - {sub.name} (${sub.price}) - Category: {sub.category.name if sub.category else 'None'}")
        
        if len(subcategories) > 10:
            print(f"   ... and {len(subcategories) - 10} more services")
        
        # Group by category
        print(f"\n📊 Services by category:")
        for category in categories:
            cat_services = ServiceSubcategory.objects(category=category)
            print(f"   - {category.name}: {len(cat_services)} services")
        
        return len(categories), len(subcategories)
        
    except Exception as e:
        print(f"❌ Error checking MongoDB: {e}")
        return 0, 0

def check_sample_data():
    """Show sample data structure"""
    print(f"\n🔬 Sample data structure:")
    
    try:
        # Get first category
        first_category = ServiceCategory.objects.first()
        if first_category:
            print(f"Sample Category:")
            print(f"   Name: {first_category.name}")
            print(f"   Description: {first_category.description}")
            print(f"   Icon: {getattr(first_category, 'icon', 'N/A')}")
        
        # Get first subcategory
        first_subcategory = ServiceSubcategory.objects.first()
        if first_subcategory:
            print(f"\nSample Subcategory:")
            print(f"   Name: {first_subcategory.name}")
            print(f"   Description: {first_subcategory.description}")
            print(f"   Price: ${first_subcategory.price}")
            print(f"   Category: {first_subcategory.category.name if first_subcategory.category else 'None'}")
            
    except Exception as e:
        print(f"❌ Error getting sample data: {e}")

if __name__ == "__main__":
    categories_count, subcategories_count = check_mongodb_data()
    
    if categories_count > 0 and subcategories_count > 0:
        check_sample_data()
        print(f"\n✅ MongoDB has data! The issue is likely with API authentication.")
        print(f"   Next step: Restart Django server and test the frontend.")
    else:
        print(f"\n❌ No data found in MongoDB. You may need to populate the database.")
