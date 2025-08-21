#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import Permission, UserTypeRolePermission

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
for perm_data in permissions_data:
    permission = Permission.objects.create(
        name=perm_data['name'],
        codename=perm_data['codename'],
        description=perm_data['description'],
        category=perm_data['category']
    )
    print(f'✅ Created: {permission.name}')

# Set up default permissions - customized by user type
default_permissions = {
    'End User': {
        # End Users: Focus on booking management and profile
        'Head of House': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'create_bookings', 'cancel_bookings', 'delete_bookings'],
        'Family Member': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'create_bookings', 'cancel_bookings']
    },
    'Service Provider': {
        # Service Providers: Focus on service management and limited booking access
        'Admin': ['view_own_profile', 'edit_own_profile', 'add_new_service', 'edit_existing_service', 'delete_existing_service', 'view_analytics'],
        'Employee': ['view_own_profile', 'edit_own_profile', 'add_new_service', 'edit_existing_service'],
        'Supervisor': ['view_own_profile', 'edit_own_profile', 'add_new_service', 'edit_existing_service', 'delete_existing_service', 'view_analytics']
    },
    'Platform Provider': {
        # Platform Providers: Full access to all permissions
        'Admin': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'create_bookings', 'cancel_bookings', 'delete_bookings', 'add_new_service', 'edit_existing_service', 'delete_existing_service', 'manage_users', 'view_analytics'],
        'Employee': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'view_analytics'],
        'Service Desk': ['view_own_profile', 'edit_own_profile', 'view_own_bookings', 'view_analytics']
    }
}

print("\n🎯 Setting up default permissions...")
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
                print(f'✅ {user_type} - {role}: {permission.name}')
            except Permission.DoesNotExist:
                print(f'❌ Permission not found: {codename}')

print("\n📋 Final Permission Categories:")
categories = Permission.objects.values_list('category', flat=True).distinct()
for category in categories:
    perms = Permission.objects.filter(category=category)
    print(f"\n📁 {category}:")
    for perm in perms:
        print(f"   - {perm.name}")

print("\n✅ Clean permission system setup completed!")
print("🎯 Only 4 categories: Services Permissions, Booking Permissions, User Permissions, Analytics")
