import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bookings.models import ServiceCategory, ServiceSubcategory
from decimal import Decimal

def populate():
    print("Populating services...")
    
    # Clear existing
    ServiceCategory.objects.delete()
    ServiceSubcategory.objects.delete()
    
    # Create Cleaning Services
    cleaning = ServiceCategory(
        name='Cleaning Services',
        description='Professional home cleaning services',
        icon='🧹',
        gradient='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    )
    cleaning.save()
    
    ServiceSubcategory(category=cleaning, name='Home Deep Cleaning', description='Full house cleaning', price=Decimal('48.00')).save()
    ServiceSubcategory(category=cleaning, name='Kitchen Cleaning', description='Kitchen deep clean', price=Decimal('17.00')).save()
    ServiceSubcategory(category=cleaning, name='Bathroom Cleaning', description='Bathroom sanitization', price=Decimal('8.00')).save()
    
    # Create Appliance Repair
    appliance = ServiceCategory(
        name='Appliance Repair & Installation',
        description='Home appliance services',
        icon='🔧',
        gradient='linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    )
    appliance.save()
    
    ServiceSubcategory(category=appliance, name='AC Installation/Repair', description='AC services', price=Decimal('15.00')).save()
    ServiceSubcategory(category=appliance, name='Washing Machine Repair', description='Washing machine fix', price=Decimal('9.00')).save()
    
    # Create Electrician Services
    electrical = ServiceCategory(
        name='Electrician Services',
        description='Electrical work and repairs',
        icon='⚡',
        gradient='linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    )
    electrical.save()
    
    ServiceSubcategory(category=electrical, name='Fan/Light Installation', description='Fan and light setup', price=Decimal('3.50')).save()
    ServiceSubcategory(category=electrical, name='Switch/Socket Repair', description='Electrical repairs', price=Decimal('2.50')).save()
    
    print(f"Created {ServiceCategory.objects.count()} categories")
    print(f"Created {ServiceSubcategory.objects.count()} subcategories")
    print("Done!")

if __name__ == '__main__':
    populate()
