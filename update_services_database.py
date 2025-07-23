#!/usr/bin/env python
"""
Update service categories and subcategories in the database
"""
import os
import django
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bookings.models import ServiceCategory, ServiceSubcategory

def update_services():
    print("🔄 Updating Service Categories and Subcategories")
    print("=" * 60)
    
    # New service structure - using consistent cleaning service colors for all
    cleaning_gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

    services_data = [
        {
            'name': 'Cleaning Services',
            'description': 'Professional home and office cleaning services',
            'icon': '🧹',
            'gradient': cleaning_gradient,
            'subcategories': [
                {'name': 'Home Deep Cleaning', 'description': 'Complete deep cleaning of your home', 'price': 150.00},
                {'name': 'Bathroom Cleaning', 'description': 'Thorough bathroom cleaning and sanitization', 'price': 80.00},
                {'name': 'Kitchen Cleaning', 'description': 'Complete kitchen cleaning including appliances', 'price': 100.00},
                {'name': 'Sofa/Carpet Cleaning', 'description': 'Professional sofa and carpet cleaning', 'price': 120.00},
            ]
        },
        {
            'name': 'Appliance Repair & Installation',
            'description': 'Expert repair and installation of home appliances',
            'icon': '🔧',
            'gradient': cleaning_gradient,
            'subcategories': [
                {'name': 'AC Repair & Servicing', 'description': 'Air conditioner repair and maintenance', 'price': 200.00},
                {'name': 'Washing Machine Repair', 'description': 'Washing machine troubleshooting and repair', 'price': 150.00},
                {'name': 'Refrigerator Repair', 'description': 'Refrigerator repair and maintenance', 'price': 180.00},
                {'name': 'TV Installation & Repair', 'description': 'TV mounting, setup, and repair services', 'price': 120.00},
            ]
        },
        {
            'name': 'Electricians',
            'description': 'Professional electrical services and installations',
            'icon': '⚡',
            'gradient': cleaning_gradient,
            'subcategories': [
                {'name': 'Fan & Light Installation', 'description': 'Ceiling fan and light fixture installation', 'price': 100.00},
                {'name': 'Switchboard Repair', 'description': 'Electrical switchboard repair and replacement', 'price': 120.00},
                {'name': 'Wiring & Short Circuit Fix', 'description': 'Electrical wiring and short circuit repairs', 'price': 150.00},
                {'name': 'Inverter Installation', 'description': 'Home inverter installation and setup', 'price': 200.00},
            ]
        },
        {
            'name': 'Plumbers',
            'description': 'Expert plumbing services for homes and offices',
            'icon': '🚿',
            'gradient': cleaning_gradient,
            'subcategories': [
                {'name': 'Tap & Faucet Repair', 'description': 'Tap and faucet repair and replacement', 'price': 80.00},
                {'name': 'Toilet & Flush Fix', 'description': 'Toilet and flush system repair', 'price': 100.00},
                {'name': 'Pipe Leakage Repair', 'description': 'Water pipe leakage detection and repair', 'price': 120.00},
                {'name': 'Bathroom Fitting Installation', 'description': 'Complete bathroom fitting installation', 'price': 250.00},
            ]
        },
        {
            'name': 'Carpenters',
            'description': 'Professional carpentry and furniture services',
            'icon': '🪚',
            'gradient': cleaning_gradient,
            'subcategories': [
                {'name': 'Furniture Assembly', 'description': 'Assembly of furniture and fixtures', 'price': 100.00},
                {'name': 'Door & Window Repair', 'description': 'Door and window repair and adjustment', 'price': 120.00},
                {'name': 'Bed/Table Repair', 'description': 'Bed and table repair and restoration', 'price': 150.00},
                {'name': 'Hinge/Lock Fixing', 'description': 'Door hinge and lock repair', 'price': 80.00},
            ]
        },
        {
            'name': 'Home Renovation & Interior',
            'description': 'Complete home renovation and interior design services',
            'icon': '🏡',
            'gradient': cleaning_gradient,
            'subcategories': [
                {'name': 'Interior Painting', 'description': 'Professional interior painting services', 'price': 300.00},
                {'name': 'False Ceiling Work', 'description': 'False ceiling installation and design', 'price': 400.00},
                {'name': 'Modular Kitchen Setup', 'description': 'Complete modular kitchen installation', 'price': 800.00},
                {'name': 'Tiling & Flooring', 'description': 'Floor tiling and flooring installation', 'price': 350.00},
            ]
        }
    ]
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    print("🗑️ Clearing existing service data...")
    ServiceSubcategory.objects.all().delete()
    ServiceCategory.objects.all().delete()
    
    # Create new categories and subcategories
    for category_data in services_data:
        print(f"\n📂 Creating category: {category_data['name']}")
        
        # Create category
        category = ServiceCategory.objects.create(
            name=category_data['name'],
            description=category_data['description'],
            icon=category_data['icon'],
            gradient=category_data['gradient']
        )
        
        print(f"   ✅ Created category: {category.name}")
        
        # Create subcategories
        for sub_data in category_data['subcategories']:
            subcategory = ServiceSubcategory.objects.create(
                name=sub_data['name'],
                description=sub_data['description'],
                price=sub_data['price'],
                category=category
            )
            print(f"      ➕ Added subcategory: {subcategory.name} (${subcategory.price})")
    
    print(f"\n✅ Service update completed!")
    
    # Print summary
    total_categories = ServiceCategory.objects.count()
    total_subcategories = ServiceSubcategory.objects.count()
    
    print(f"\n📊 Summary:")
    print(f"   📂 Total categories: {total_categories}")
    print(f"   🔧 Total subcategories: {total_subcategories}")
    
    print(f"\n🎯 Next steps:")
    print(f"   1. Restart Django server: python manage.py runserver")
    print(f"   2. Check end user dashboard - services should be updated")
    print(f"   3. Check service provider dashboard - new services available for registration")

if __name__ == "__main__":
    update_services()
