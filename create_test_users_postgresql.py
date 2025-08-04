#!/usr/bin/env python
"""
Create test users for PostgreSQL database
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from bookings.models import ServiceSubcategory, UserRegisteredService

def create_test_users():
    print("Creating Test Users for PostgreSQL...\n")
    
    users_to_create = [
        {
            'username': 'test_customer',
            'email': 'customer@example.com',
            'password': 'testpass123',
            'user_type': 'End User',
            'role': 'Customer'
        },
        {
            'username': 'test_provider',
            'email': 'provider@example.com', 
            'password': 'testpass123',
            'user_type': 'Service Provider',
            'role': 'Provider'
        },
        {
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'admin123',
            'user_type': 'Platform Provider',
            'role': 'Admin'
        }
    ]
    
    created_users = []
    
    for user_data in users_to_create:
        try:
            # Check if user already exists
            if User.objects.filter(username=user_data['username']).exists():
                print(f"✅ User '{user_data['username']}' already exists")
                user = User.objects.get(username=user_data['username'])
                created_users.append(user)
                continue
            
            # Create user
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                user_type=user_data['user_type'],
                role=user_data['role']
            )
            
            # Set admin privileges for admin user
            if user_data['role'] == 'Admin':
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
            created_users.append(user)
            print(f"✅ Created user: {user.username} ({user.user_type})")
            
        except Exception as e:
            print(f"❌ Error creating user {user_data['username']}: {e}")
    
    return created_users

def register_provider_for_services():
    """Register test provider for some services"""
    print("\nRegistering test provider for services...")
    
    try:
        # Get test provider
        provider = User.objects.filter(username='test_provider', user_type='Service Provider').first()
        if not provider:
            print("❌ Test provider not found")
            return
        
        # Get some services to register for
        services = ServiceSubcategory.objects.all()[:3]  # First 3 services
        
        if not services:
            print("❌ No services found. Run populate_postgresql_data.py first")
            return
        
        registered_count = 0
        for service in services:
            # Check if already registered
            if not UserRegisteredService.objects.filter(user=provider, service=service).exists():
                # Set provider price slightly different from base price
                provider_price = float(service.price) + 50.00  # Add ₹50 to base price
                UserRegisteredService.objects.create(
                    user=provider,
                    service=service,
                    provider_price=provider_price,
                    description=f"Professional {service.name.lower()} service by {provider.username}",
                    is_available=True
                )
                print(f"   ✅ Registered for: {service.name} (₹{provider_price})")
                registered_count += 1
            else:
                print(f"   ✅ Already registered for: {service.name}")
        
        print(f"✅ Provider registered for {registered_count} new services")
        
    except Exception as e:
        print(f"❌ Error registering services: {e}")

def show_login_credentials():
    """Display login credentials for testing"""
    print("\n" + "="*50)
    print("TEST LOGIN CREDENTIALS")
    print("="*50)
    
    credentials = [
        ("End User (Customer)", "test_customer", "testpass123"),
        ("Service Provider", "test_provider", "testpass123"),
        ("Admin", "admin", "admin123")
    ]
    
    for role, username, password in credentials:
        print(f"\n{role}:")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
    
    print("\n" + "="*50)
    print("TESTING INSTRUCTIONS")
    print("="*50)
    print("1. Go to: http://localhost:3000")
    print("2. Click 'Register' or 'Login'")
    print("3. Use the credentials above")
    print("4. Test the dashboard functionality")
    
    print("\nAPI Testing:")
    print("curl -X POST http://localhost:8000/api/auth/login/ \\")
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"username":"test_customer","password":"testpass123"}\'')

def check_database_status():
    """Check current database status"""
    print("Database Status Check:")
    print("-" * 30)
    
    try:
        from bookings.models import ServiceCategory, ServiceSubcategory
        
        user_count = User.objects.count()
        category_count = ServiceCategory.objects.count()
        subcategory_count = ServiceSubcategory.objects.count()
        registration_count = UserRegisteredService.objects.count()
        
        print(f"Users: {user_count}")
        print(f"Service Categories: {category_count}")
        print(f"Service Subcategories: {subcategory_count}")
        print(f"User Service Registrations: {registration_count}")
        
        if category_count == 0:
            print("\n⚠️ No services found!")
            print("Run: python populate_postgresql_data.py")
        
        return user_count > 0 and category_count > 0
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def main():
    print("PostgreSQL Test Users Setup")
    print("=" * 40)
    
    # Check database status first
    if not check_database_status():
        print("\n❌ Database not properly set up")
        print("Run these commands first:")
        print("1. python manage.py migrate")
        print("2. python populate_postgresql_data.py")
        return
    
    # Create test users
    users = create_test_users()
    
    # Register provider for services
    register_provider_for_services()
    
    # Show credentials
    show_login_credentials()
    
    print("\n🎉 Test users setup complete!")
    print("\nNext steps:")
    print("1. Clear browser cache/localStorage")
    print("2. Go to http://localhost:3000")
    print("3. Register/Login with new credentials")
    print("4. Test the application")

if __name__ == "__main__":
    main()
