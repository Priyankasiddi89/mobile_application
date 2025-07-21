import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bookings.models import ServiceCategory, ServiceSubcategory

def check_database():
    print("🔍 Checking Database Contents...")
    
    categories = ServiceCategory.objects.all()
    subcategories = ServiceSubcategory.objects.all()
    
    print(f"📋 Total Categories: {len(categories)}")
    print(f"🔧 Total Subcategories: {len(subcategories)}")
    
    if len(categories) == 0:
        print("❌ No categories found! Database is empty.")
        return False
    
    print("\n📂 Categories in database:")
    for cat in categories:
        print(f"  - {cat.name} (ID: {cat.id})")
        cat_subs = ServiceSubcategory.objects.filter(category=cat)
        print(f"    Subcategories: {len(cat_subs)}")
        for sub in cat_subs:
            print(f"      * {sub.name} - ${sub.price}")
    
    return True

def populate_if_empty():
    if not check_database():
        print("\n🚀 Populating database...")
        
        from decimal import Decimal
        
        # Create categories
        cleaning = ServiceCategory(
            name='Cleaning Services',
            description='Professional home cleaning services',
            icon='🧹',
            gradient='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        )
        cleaning.save()
        print(f"✅ Created: {cleaning.name}")
        
        # Add subcategories
        subs = [
            {'name': 'Home Deep Cleaning', 'description': 'Full house cleaning', 'price': Decimal('48.00')},
            {'name': 'Kitchen Cleaning', 'description': 'Kitchen deep clean', 'price': Decimal('17.00')},
            {'name': 'Bathroom Cleaning', 'description': 'Bathroom sanitization', 'price': Decimal('8.00')},
        ]
        
        for sub_data in subs:
            sub = ServiceSubcategory(category=cleaning, **sub_data)
            sub.save()
            print(f"  ✅ Added: {sub.name} - ${sub.price}")
        
        print("\n🎉 Database populated!")
        check_database()

if __name__ == '__main__':
    populate_if_empty()
