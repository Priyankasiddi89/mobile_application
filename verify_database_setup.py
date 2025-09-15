#!/usr/bin/env python
"""
Database Setup Verification Script
Verifies that the database is properly set up with all required tables, data, and relationships
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from authentication.models import User, Permission, UserTypeRolePermission
from bookings.models import ServiceCategory, ServiceSubcategory, UserRegisteredService, ProviderRating

def check_database_connection():
    """Check database connection"""
    print("🔌 Checking Database Connection...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Connected to PostgreSQL")
            print(f"   Version: {version.split(',')[0]}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_tables():
    """Check if all required tables exist"""
    print("\n📋 Checking Database Tables...")
    
    required_tables = [
        'authentication_user',
        'authentication_permission',
        'authentication_usertyperolepermission',
        'authentication_userpermissionoverride',
        'bookings',
        'service_categories',
        'service_subcategories',
        'user_registered_services',
        'provider_ratings',
        'provider_availability',
        'provider_off_days'
    ]
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        """)
        existing_tables = [row[0] for row in cursor.fetchall()]
    
    missing_tables = []
    for table in required_tables:
        if table in existing_tables:
            print(f"✅ {table}")
        else:
            print(f"❌ {table} - MISSING")
            missing_tables.append(table)
    
    if missing_tables:
        print(f"\n⚠️  Missing {len(missing_tables)} tables. Run: python setup_database.py")
        return False
    else:
        print(f"\n✅ All {len(required_tables)} required tables exist")
        return True

def check_data():
    """Check if required data exists"""
    print("\n📊 Checking Database Data...")
    
    checks = [
        ("Users", User.objects.count(), 1),
        ("Permissions", Permission.objects.count(), 20),
        ("Service Categories", ServiceCategory.objects.count(), 5),
        ("Service Subcategories", ServiceSubcategory.objects.count(), 15),
        ("Role Permissions", UserTypeRolePermission.objects.count(), 50),
    ]
    
    all_good = True
    for name, count, min_expected in checks:
        if count >= min_expected:
            print(f"✅ {name}: {count} records")
        else:
            print(f"❌ {name}: {count} records (expected at least {min_expected})")
            all_good = False
    
    if not all_good:
        print(f"\n⚠️  Insufficient data. Run: python setup_database.py")
        return False
    else:
        print(f"\n✅ All data checks passed")
        return True

def check_test_users():
    """Check if test users exist"""
    print("\n👤 Checking Test Users...")

    # Check for key user types
    required_users = [
        ('admin', 'Platform Provider'),
        ('test_customer', 'End User'),
        ('test_provider', 'Service Provider'),
    ]

    all_exist = True
    existing_users = []

    for username, expected_type in required_users:
        try:
            user = User.objects.get(username=username)
            if user.user_type == expected_type:
                print(f"✅ {username} ({user.user_type} - {user.role})")
                existing_users.append(user)
            else:
                print(f"⚠️  {username} exists but is {user.user_type} (expected {expected_type})")
                existing_users.append(user)
        except User.DoesNotExist:
            print(f"❌ {username} - MISSING")
            all_exist = False

    # Show additional users for reference
    total_users = User.objects.count()
    if total_users > len(existing_users):
        print(f"\n📊 Total users in database: {total_users}")
        print("   Other users available for testing:")
        other_users = User.objects.exclude(username__in=[u[0] for u in required_users])[:5]
        for user in other_users:
            print(f"   • {user.username} ({user.user_type} - {user.role})")

    if len(existing_users) >= 2:  # At least admin and one test user
        print(f"\n✅ Sufficient test users available")
        return True
    else:
        print(f"\n⚠️  Need more test users. Run: python setup_database.py")
        return False

def check_relationships():
    """Check database relationships"""
    print("\n🔗 Checking Database Relationships...")
    
    try:
        # Check if categories have subcategories
        categories_with_subs = ServiceCategory.objects.filter(subcategories__isnull=False).distinct().count()
        total_categories = ServiceCategory.objects.count()
        
        if categories_with_subs > 0:
            print(f"✅ Service relationships: {categories_with_subs}/{total_categories} categories have subcategories")
        else:
            print(f"❌ No service relationships found")
            return False
        
        # Check if permissions are assigned to roles
        role_perms = UserTypeRolePermission.objects.filter(is_granted=True).count()
        if role_perms > 0:
            print(f"✅ Permission relationships: {role_perms} role permissions granted")
        else:
            print(f"❌ No role permissions found")
            return False
        
        print(f"\n✅ All relationship checks passed")
        return True
        
    except Exception as e:
        print(f"❌ Relationship check failed: {e}")
        return False

def check_constraints():
    """Check database constraints"""
    print("\n🔒 Checking Database Constraints...")
    
    with connection.cursor() as cursor:
        # Check unique constraints
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.table_constraints 
            WHERE constraint_type = 'UNIQUE' 
            AND table_schema = 'public';
        """)
        unique_constraints = cursor.fetchone()[0]
        
        # Check foreign key constraints
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY' 
            AND table_schema = 'public';
        """)
        foreign_keys = cursor.fetchone()[0]
        
        print(f"✅ Unique constraints: {unique_constraints}")
        print(f"✅ Foreign key constraints: {foreign_keys}")
        
        if unique_constraints > 0 and foreign_keys > 0:
            print(f"\n✅ Database constraints are properly configured")
            return True
        else:
            print(f"\n❌ Missing database constraints")
            return False

def main():
    """Main verification function"""
    print("🔍 Database Setup Verification")
    print("=" * 50)
    
    checks = [
        ("Database Connection", check_database_connection),
        ("Required Tables", check_tables),
        ("Data Population", check_data),
        ("Test Users", check_test_users),
        ("Relationships", check_relationships),
        ("Constraints", check_constraints),
    ]
    
    all_passed = True
    results = []
    
    for check_name, check_func in checks:
        result = check_func()
        results.append((check_name, result))
        if not result:
            all_passed = False
    
    print("\n" + "=" * 50)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 50)
    
    for check_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{check_name:<25} {status}")
    
    if all_passed:
        print(f"\n🎉 All checks passed! Database is properly configured.")
        print(f"\n🚀 Ready to start the application:")
        print(f"   1. python manage.py runserver")
        print(f"   2. cd frontend && npm run dev")
        print(f"   3. Open http://localhost:3000")
        
        print(f"\n🔑 Test login credentials:")
        print(f"   • Admin: admin / admin123")
        print(f"   • Customer: test_customer / testpass123")
        print(f"   • Provider: test_provider / testpass123")
        
    else:
        print(f"\n⚠️  Some checks failed. Please run:")
        print(f"   python setup_database.py")
        print(f"\n   Then run this verification script again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
