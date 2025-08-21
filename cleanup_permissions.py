#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import Permission, UserTypeRolePermission

def cleanup_and_setup_clean_permissions():
    """Remove all old permissions and set up only the 4 clean categories"""
    
    print("🧹 Cleaning up old permissions...")
    
    # Delete all existing permissions and their assignments
    UserTypeRolePermission.objects.all().delete()
    Permission.objects.all().delete()
    
    print("✅ Removed all old permissions")
    
    # Create only the clean 4-category permissions
    permissions_data = [
        # Services Permissions
        {'name': 'Add New Service', 'codename': 'add_new_service', 'description': 'Can add new services to the platform', 'category': 'Services Permissions'},
        {'name': 'Edit Existing Service', 'codename': 'edit_existing_service', 'description': 'Can edit existing service information', 'category': 'Services Permissions'},
        {'name': 'Delete Existing Service', 'codename': 'delete_existing_service', 'description': 'Can delete existing services from the platform', 'category': 'Services Permissions'},
        
        # Booking Permissions
        {'name': 'View Own Bookings', 'codename': 'view_own_bookings', 'description': 'Can view own bookings only', 'category': 'Booking Permissions'},
        {'name': 'Create Bookings', 'codename': 'create_bookings', 'description': 'Can create new bookings', 'category': 'Booking Permissions'},
        {'name': 'Cancel Bookings', 'codename': 'cancel_bookings', 'description': 'Can cancel bookings', 'category': 'Booking Permissions'},
        {'name': 'Delete Bookings', 'codename': 'delete_bookings', 'description': 'Can permanently delete bookings', 'category': 'Booking Permissions'},
        
        # User Permissions
        {'name': 'View Own Profile', 'codename': 'view_own_profile', 'description': 'Can view own profile information', 'category': 'User Permissions'},
        {'name': 'Edit Own Profile', 'codename': 'edit_own_profile', 'description': 'Can edit own profile information', 'category': 'User Permissions'},
        {'name': 'Manage Users', 'codename': 'manage_users', 'description': 'Can manage other users', 'category': 'User Permissions'},
        
        # Analytics
        {'name': 'View Analytics', 'codename': 'view_analytics', 'description': 'Can view analytics and reports', 'category': 'Analytics'},
    ]
    
    print("📋 Creating clean permissions...")
    created_count = 0
    for perm_data in permissions_data:
        permission = Permission.objects.create(
            name=perm_data['name'],
            codename=perm_data['codename'],
            description=perm_data['description'],
            category=perm_data['category']
        )
        created_count += 1
        print(f'✅ Created: {permission.name}')
    
    print(f'\n📊 Created {created_count} clean permissions')
    
    # Set up default permissions for each user type and role
    default_permissions = {
        'End User': {
            'Head of House': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'create_bookings', 'cancel_bookings'],
            'Family Member': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'create_bookings']
        },
        'Service Provider': {
            'Admin': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'cancel_bookings', 'add_new_service', 'edit_existing_service', 'view_analytics'],
            'Employee': ['view_own_profile', 'edit_own_profile', 'view_own_bookings'],
            'Supervisor': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'cancel_bookings', 'view_analytics']
        },
        'Platform Provider': {
            'Admin': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'create_bookings', 'cancel_bookings', 'delete_bookings', 'add_new_service', 'edit_existing_service', 'delete_existing_service', 'manage_users', 'view_analytics'],
            'Employee': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'view_analytics'],
            'Service Desk': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'view_analytics']
        }
    }
    
    print("\n🎯 Setting up default permissions...")
    assignment_count = 0
    for user_type, roles in default_permissions.items():
        for role, permission_codenames in roles.items():
            for codename in permission_codenames:
                try:
                    permission = Permission.objects.get(codename=codename)
                    UserTypeRolePermission.objects.create(
                        user_type=user_type,
                        role=role,
                        permission=permission,
                        is_granted=True
                    )
                    assignment_count += 1
                    print(f'✅ {user_type} - {role}: {permission.name}')
                except Permission.DoesNotExist:
                    print(f'❌ Permission not found: {codename}')
    
    print(f'\n🎯 Created {assignment_count} permission assignments')
    
    # Show final summary
    print("\n📋 Final Permission Categories:")
    categories = Permission.objects.values_list('category', flat=True).distinct()
    for category in categories:
        perms = Permission.objects.filter(category=category)
        print(f"\n📁 {category}:")
        for perm in perms:
            print(f"   - {perm.name}")

if __name__ == "__main__":
    print("🚀 Cleaning up and setting up clean 4-category permissions...")
    cleanup_and_setup_clean_permissions()
    print("\n✅ Clean permission system setup completed!")
    print("🎯 Only 4 categories: Services Permissions, Booking Permissions, User Permissions, Analytics")
