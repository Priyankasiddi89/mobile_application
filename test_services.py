#!/usr/bin/env python
"""
Test script to check and populate services if needed
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_platform.settings')
django.setup()

from bookings.models import ServiceCategory, ServiceSubcategory
from decimal import Decimal

def check_services():
    """Check if services exist in the database"""
    categories_count = ServiceCategory.objects.count()
    subcategories_count = ServiceSubcategory.objects.count()
    
    print(f"Categories in database: {categories_count}")
    print(f"Subcategories in database: {subcategories_count}")
    
    if categories_count == 0:
        print("No services found. Populating database...")
        populate_services()
    else:
        print("Services already exist!")
        # List existing categories
        for category in ServiceCategory.objects.all():
            subcats = ServiceSubcategory.objects(category=category)
            print(f"- {category.name}: {len(subcats)} services")

def populate_services():
    """Populate database with sample services"""
    print("Populating services...")
    
    # Clear existing data
    ServiceCategory.objects.delete()
    ServiceSubcategory.objects.delete()
    
    # Create service categories
    categories_data = [
        {
            'name': 'Cleaning Services',
            'description': 'Professional home cleaning, deep cleaning, and maintenance services',
            'icon': '🧹',
            'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'subcategories': [
                {'name': 'Home Deep Cleaning', 'description': 'Full house sanitization, bathroom, kitchen', 'price': Decimal('48.00')},
                {'name': 'Kitchen Cleaning', 'description': 'Degreasing, sink & chimney area', 'price': Decimal('17.00')},
                {'name': 'Sofa/Carpet Shampooing', 'description': 'Wet vacuum cleaning, odor removal', 'price': Decimal('12.00')},
                {'name': 'Bathroom Cleaning', 'description': 'Descaling, tile scrubbing, disinfectant', 'price': Decimal('8.00')},
            ]
        },
        {
            'name': 'Appliance Repair & Installation',
            'description': 'Repair and installation of home appliances and electronics',
            'icon': '🔧',
            'gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'subcategories': [
                {'name': 'AC Installation/Repair', 'description': 'Split/Window AC, gas refill, servicing', 'price': Decimal('15.00')},
                {'name': 'Washing Machine Repair', 'description': 'Front/top load, PCB or drum issues', 'price': Decimal('9.00')},
                {'name': 'Refrigerator Repair', 'description': 'Cooling, gas leak, compressor repair', 'price': Decimal('11.50')},
                {'name': 'Chimney Cleaning', 'description': 'Dismantling, oil and soot removal', 'price': Decimal('10.50')},
            ]
        },
        {
            'name': 'Electrician Services',
            'description': 'Electrical repairs, installations, and safety inspections',
            'icon': '⚡',
            'gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'subcategories': [
                {'name': 'Fan/Light Installation', 'description': 'Ceiling/wall fan, LED panel', 'price': Decimal('3.50')},
                {'name': 'Switch/Socket Repair', 'description': 'Replacement or rewiring', 'price': Decimal('2.50')},
                {'name': 'MCB Installation', 'description': 'Mini circuit breaker & load panel fix', 'price': Decimal('7.00')},
                {'name': 'Inverter Setup/Repair', 'description': 'Wiring, connection, maintenance', 'price': Decimal('8.50')},
            ]
        },
        {
            'name': 'Plumbing',
            'description': 'Plumbing repairs, installations, and maintenance services',
            'icon': '🚰',
            'gradient': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'subcategories': [
                {'name': 'Tap/Faucet Fix', 'description': 'Leakage, replacement', 'price': Decimal('3.00')},
                {'name': 'Water Tank Cleaning', 'description': 'Manual or machine deep clean', 'price': Decimal('12.00')},
                {'name': 'Bathroom Fitting Install', 'description': 'Shower, geyser, flush tank', 'price': Decimal('7.00')},
                {'name': 'Drainage/Leakage Repair', 'description': 'Pipe blockage, leakage detection', 'price': Decimal('8.50')},
            ]
        },
        {
            'name': 'Carpentry',
            'description': 'Custom woodwork, repairs, and furniture assembly',
            'icon': '🔨',
            'gradient': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'subcategories': [
                {'name': 'Furniture Assembly', 'description': 'Bed, wardrobe, table assembly', 'price': Decimal('25.00')},
                {'name': 'Door/Window Repair', 'description': 'Hinge fix, lock replacement', 'price': Decimal('15.00')},
                {'name': 'Custom Woodwork', 'description': 'Shelf, cabinet, custom furniture', 'price': Decimal('45.00')},
                {'name': 'Floor Repair', 'description': 'Wooden floor, laminate repair', 'price': Decimal('20.00')},
            ]
        }
    ]
    
    # Create categories and subcategories
    for cat_data in categories_data:
        subcategories_data = cat_data.pop('subcategories', [])
        
        # Create category
        category = ServiceCategory(**cat_data)
        category.save()
        print(f'Created category: {category.name}')
        
        # Create subcategories for this category
        for sub_data in subcategories_data:
            subcategory = ServiceSubcategory(
                category=category,
                **sub_data
            )
            subcategory.save()
            print(f'  - Created subcategory: {subcategory.name} (${subcategory.price})')
    
    print("Successfully populated database with services!")

if __name__ == "__main__":
    check_services()
