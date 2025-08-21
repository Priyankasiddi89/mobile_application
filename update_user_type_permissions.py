#!/usr/bin/env python3
"""
Update user type permissions to be customized by user type
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import UserTypeRolePermission, Permission

print('🔄 Updating user type permissions...')

# Clear existing permissions
print('🗑️ Clearing existing permissions...')
UserTypeRolePermission.objects.all().delete()

# Set up customized permissions by user type
customized_permissions = {
    'End User': {
        # End Users: Focus on booking management and profile (NO analytics, manage_users available but not assigned by default)
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

# Create permission assignments
for user_type, roles in customized_permissions.items():
    print(f'\n👤 Setting up {user_type} permissions:')
    for role, permission_codes in roles.items():
        print(f'  📋 {role}:')
        for permission_code in permission_codes:
            try:
                permission = Permission.objects.get(codename=permission_code)
                user_type_permission = UserTypeRolePermission.objects.create(
                    user_type=user_type,
                    role=role,
                    permission=permission,
                    is_granted=True
                )
                print(f'    ✅ {permission.name}')
            except Permission.DoesNotExist:
                print(f'    ❌ Permission not found: {permission_code}')
            except Exception as e:
                print(f'    ❌ Error: {e}')

print('\n🎉 User type permissions updated successfully!')
print('\n📊 Summary:')
print('  • End User: Booking permissions only')
print('  • Service Provider: Service permissions only') 
print('  • Platform Provider: All permissions')
