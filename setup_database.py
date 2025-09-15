#!/usr/bin/env python
"""
Complete Database Setup Script
Sets up PostgreSQL database with all tables, constraints, initial data, and test users
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from authentication.models import User, Permission, UserTypeRolePermission
from bookings.models import ServiceCategory, ServiceSubcategory, UserRegisteredService
from decimal import Decimal

def check_database_connection():
    """Check if database connection is working"""
    print("🔌 Checking database connection...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def run_migrations():
    """Run Django migrations to create all tables"""
    print("\n📋 Running Django migrations...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations'])
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations completed successfully")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_permissions():
    """Create system permissions"""
    print("\n🔑 Creating system permissions...")
    
    permissions_data = [
        # Dashboard Access
        ('view_end_user_dashboard', 'View End User Dashboard', 'dashboard'),
        ('view_service_provider_dashboard', 'View Service Provider Dashboard', 'dashboard'),
        ('view_platform_provider_dashboard', 'View Platform Provider Dashboard', 'dashboard'),
        
        # Booking Management
        ('create_booking', 'Create Booking', 'booking'),
        ('view_own_bookings', 'View Own Bookings', 'booking'),
        ('view_all_bookings', 'View All Bookings', 'booking'),
        ('accept_booking', 'Accept Booking Request', 'booking'),
        ('decline_booking', 'Decline Booking Request', 'booking'),
        ('complete_booking', 'Mark Booking as Complete', 'booking'),
        ('cancel_booking', 'Cancel Booking', 'booking'),
        
        # Service Management
        ('register_for_service', 'Register for Service', 'service'),
        ('unregister_from_service', 'Unregister from Service', 'service'),
        ('set_service_pricing', 'Set Custom Service Pricing', 'service'),
        ('view_service_catalog', 'View Service Catalog', 'service'),
        
        # User Management
        ('view_user_list', 'View User List', 'user'),
        ('edit_user_profile', 'Edit User Profile', 'user'),
        ('manage_user_permissions', 'Manage User Permissions', 'user'),
        
        # Analytics & Reports
        ('view_provider_analytics', 'View Provider Analytics', 'analytics'),
        ('view_platform_analytics', 'View Platform Analytics', 'analytics'),
        ('view_earnings_report', 'View Earnings Report', 'analytics'),
        
        # Rating & Reviews
        ('rate_provider', 'Rate Service Provider', 'rating'),
        ('view_ratings', 'View Ratings and Reviews', 'rating'),
        ('respond_to_rating', 'Respond to Customer Rating', 'rating'),
        
        # Availability Management
        ('manage_availability', 'Manage Availability Schedule', 'availability'),
        ('set_off_days', 'Set Off Days', 'availability'),
    ]
    
    created_count = 0
    for codename, name, category in permissions_data:
        permission, created = Permission.objects.get_or_create(
            codename=codename,
            defaults={
                'name': name,
                'category': category,
                'description': f'Permission to {name.lower()}'
            }
        )
        if created:
            created_count += 1
    
    print(f"✅ Created {created_count} new permissions")

def setup_role_permissions():
    """Setup default permissions for user types and roles"""
    print("\n👥 Setting up role-based permissions...")
    
    # End User permissions
    end_user_permissions = [
        'view_end_user_dashboard', 'create_booking', 'view_own_bookings',
        'cancel_booking', 'view_service_catalog', 'rate_provider', 'view_ratings'
    ]
    
    # Service Provider permissions
    provider_permissions = [
        'view_service_provider_dashboard', 'view_own_bookings', 'accept_booking',
        'decline_booking', 'complete_booking', 'register_for_service',
        'unregister_from_service', 'set_service_pricing', 'view_provider_analytics',
        'view_earnings_report', 'view_ratings', 'respond_to_rating',
        'manage_availability', 'set_off_days'
    ]
    
    # Platform Provider permissions (admin)
    platform_permissions = [
        'view_platform_provider_dashboard', 'view_all_bookings', 'view_user_list',
        'manage_user_permissions', 'view_platform_analytics', 'view_service_catalog'
    ]
    
    # Create role permissions
    role_mappings = [
        ('End User', 'Head of House', end_user_permissions),
        ('End User', 'Family Member', end_user_permissions),
        ('Service Provider', 'Admin', provider_permissions),
        ('Service Provider', 'Employee', provider_permissions),
        ('Service Provider', 'Supervisor', provider_permissions),
        ('Platform Provider', 'Admin', platform_permissions),
        ('Platform Provider', 'Service Desk', platform_permissions),
    ]
    
    created_count = 0
    for user_type, role, permission_codes in role_mappings:
        for permission_code in permission_codes:
            try:
                permission = Permission.objects.get(codename=permission_code)
                role_perm, created = UserTypeRolePermission.objects.get_or_create(
                    user_type=user_type,
                    role=role,
                    permission=permission,
                    defaults={'is_granted': True}
                )
                if created:
                    created_count += 1
            except Permission.DoesNotExist:
                print(f"⚠️  Permission '{permission_code}' not found")
    
    print(f"✅ Created {created_count} role permission mappings")

def create_service_categories():
    """Create service categories and subcategories"""
    print("\n🏷️  Creating service categories and subcategories...")
    
    services_data = [
        {
            'name': 'Cleaning Services',
            'description': 'Professional cleaning services for homes and offices',
            'icon': '🧹',
            'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'subcategories': [
                ('Deep Cleaning', 'Comprehensive deep cleaning service', 500.00, 3.0),
                ('Regular Cleaning', 'Weekly/monthly regular cleaning', 300.00, 2.0),
                ('Move-in/Move-out Cleaning', 'Cleaning for moving', 600.00, 4.0),
                ('Post-Construction Cleaning', 'Cleaning after construction work', 800.00, 5.0),
            ]
        },
        {
            'name': 'Plumbing Services',
            'description': 'Professional plumbing repair and installation',
            'icon': '🔧',
            'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'subcategories': [
                ('Pipe Repair', 'Fix leaking or broken pipes', 200.00, 2.0),
                ('Drain Cleaning', 'Clear blocked drains', 150.00, 1.5),
                ('Faucet Installation', 'Install new faucets', 100.00, 1.0),
                ('Toilet Repair', 'Fix toilet issues', 180.00, 1.5),
            ]
        },
        {
            'name': 'Electrical Services',
            'description': 'Safe and reliable electrical work',
            'icon': '⚡',
            'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'subcategories': [
                ('Wiring Installation', 'Install new electrical wiring', 400.00, 4.0),
                ('Light Fixture Installation', 'Install lights and fixtures', 120.00, 1.0),
                ('Outlet Installation', 'Install electrical outlets', 80.00, 0.5),
                ('Electrical Troubleshooting', 'Diagnose electrical issues', 150.00, 2.0),
            ]
        },
        {
            'name': 'HVAC Services',
            'description': 'Heating, ventilation, and air conditioning',
            'icon': '❄️',
            'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'subcategories': [
                ('AC Installation', 'Install air conditioning units', 800.00, 6.0),
                ('AC Repair', 'Repair air conditioning issues', 250.00, 2.0),
                ('Heating System Maintenance', 'Service heating systems', 200.00, 2.0),
                ('Duct Cleaning', 'Clean air ducts', 300.00, 3.0),
            ]
        },
        {
            'name': 'Carpentry Services',
            'description': 'Custom woodwork and furniture repair',
            'icon': '🔨',
            'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'subcategories': [
                ('Furniture Assembly', 'Assemble furniture pieces', 100.00, 2.0),
                ('Custom Shelving', 'Build custom shelves', 300.00, 4.0),
                ('Door & Window Repair', 'Fix doors and windows', 150.00, 2.0),
                ('Cabinet Installation', 'Install kitchen/bathroom cabinets', 500.00, 6.0),
            ]
        },
        {
            'name': 'Painting Services',
            'description': 'Interior and exterior painting',
            'icon': '🎨',
            'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'subcategories': [
                ('Interior Painting', 'Paint interior walls and rooms', 400.00, 8.0),
                ('Exterior Painting', 'Paint exterior walls', 600.00, 12.0),
                ('Touch-up Painting', 'Small paint touch-ups', 100.00, 2.0),
                ('Wallpaper Installation', 'Install wallpaper', 250.00, 4.0),
            ]
        },
        {
            'name': 'Landscaping Services',
            'description': 'Garden and outdoor space maintenance',
            'icon': '🌱',
            'gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'subcategories': [
                ('Lawn Mowing', 'Regular lawn maintenance', 80.00, 1.0),
                ('Garden Design', 'Design and plan gardens', 300.00, 4.0),
                ('Tree Trimming', 'Trim and prune trees', 200.00, 3.0),
                ('Irrigation Installation', 'Install sprinkler systems', 500.00, 6.0),
            ]
        }
    ]
    
    created_categories = 0
    created_subcategories = 0
    
    for category_data in services_data:
        category, created = ServiceCategory.objects.get_or_create(
            name=category_data['name'],
            defaults={
                'description': category_data['description'],
                'icon': category_data['icon'],
                'gradient': category_data['gradient']
            }
        )
        if created:
            created_categories += 1
        
        for subcat_name, subcat_desc, price, duration in category_data['subcategories']:
            subcategory, created = ServiceSubcategory.objects.get_or_create(
                name=subcat_name,
                category=category,
                defaults={
                    'description': subcat_desc,
                    'price': Decimal(str(price)),
                    'duration_hours': Decimal(str(duration))
                }
            )
            if created:
                created_subcategories += 1
    
    print(f"✅ Created {created_categories} categories and {created_subcategories} subcategories")

def create_test_users():
    """Create test users for different roles"""
    print("\n👤 Creating test users...")
    
    test_users = [
        ('admin', 'admin123', 'Platform Provider', 'Admin'),
        ('test_customer', 'testpass123', 'End User', 'Head of House'),
        ('test_provider', 'testpass123', 'Service Provider', 'Admin'),
        ('family_member', 'testpass123', 'End User', 'Family Member'),
        ('provider_employee', 'testpass123', 'Service Provider', 'Employee'),
    ]
    
    created_count = 0
    for username, password, user_type, role in test_users:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'user_type': user_type,
                'role': role,
                'email': f'{username}@example.com',
                'is_active': True,
                'is_staff': user_type == 'Platform Provider',
                'is_superuser': username == 'admin'
            }
        )
        if created:
            user.set_password(password)
            user.save()
            created_count += 1
    
    print(f"✅ Created {created_count} test users")

def main():
    """Main setup function"""
    print("🚀 Starting Complete Database Setup")
    print("=" * 60)
    
    # Check database connection
    if not check_database_connection():
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        sys.exit(1)
    
    # Create permissions
    create_permissions()
    
    # Setup role permissions
    setup_role_permissions()
    
    # Create service categories
    create_service_categories()
    
    # Create test users
    create_test_users()
    
    print("\n🎉 Database setup completed successfully!")
    print("\n📊 Summary:")
    print(f"  • Users: {User.objects.count()}")
    print(f"  • Permissions: {Permission.objects.count()}")
    print(f"  • Service Categories: {ServiceCategory.objects.count()}")
    print(f"  • Service Subcategories: {ServiceSubcategory.objects.count()}")
    
    print("\n🔑 Test Login Credentials:")
    print("  • Admin: admin / admin123")
    print("  • Customer: test_customer / testpass123")
    print("  • Provider: test_provider / testpass123")
    
    print("\n🎯 Next Steps:")
    print("  1. Start Django server: python manage.py runserver")
    print("  2. Start frontend: cd frontend && npm run dev")
    print("  3. Access application: http://localhost:3000")

if __name__ == "__main__":
    main()
