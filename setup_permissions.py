#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import Permission, UserTypeRolePermission

def create_permissions():
    """Create default permissions"""
    permissions_data = [
        # User Management Permissions
        {'name': 'View Users', 'codename': 'view_users', 'description': 'Can view user list and details', 'category': 'User Management'},
        {'name': 'Create Users', 'codename': 'create_users', 'description': 'Can create new users', 'category': 'User Management'},
        {'name': 'Edit Users', 'codename': 'edit_users', 'description': 'Can edit user information', 'category': 'User Management'},
        {'name': 'Delete Users', 'codename': 'delete_users', 'description': 'Can delete users', 'category': 'User Management'},
        
        # Service Management Permissions
        {'name': 'View Services', 'codename': 'view_services', 'description': 'Can view service categories and subcategories', 'category': 'Service Management'},
        {'name': 'Create Services', 'codename': 'create_services', 'description': 'Can create new services', 'category': 'Service Management'},
        {'name': 'Edit Services', 'codename': 'edit_services', 'description': 'Can edit service information', 'category': 'Service Management'},
        {'name': 'Register for Services', 'codename': 'register_services', 'description': 'Can register to provide services', 'category': 'Service Management'},
        
        # Booking Management Permissions
        {'name': 'View All Bookings', 'codename': 'view_all_bookings', 'description': 'Can view all platform bookings', 'category': 'Booking Management'},
        {'name': 'View Own Bookings', 'codename': 'view_own_bookings', 'description': 'Can view own bookings only', 'category': 'Booking Management'},
        {'name': 'Create Bookings', 'codename': 'create_bookings', 'description': 'Can create new bookings', 'category': 'Booking Management'},
        {'name': 'Accept Bookings', 'codename': 'accept_bookings', 'description': 'Can accept booking requests', 'category': 'Booking Management'},
        {'name': 'Complete Bookings', 'codename': 'complete_bookings', 'description': 'Can mark bookings as completed', 'category': 'Booking Management'},
        {'name': 'Cancel Bookings', 'codename': 'cancel_bookings', 'description': 'Can cancel bookings', 'category': 'Booking Management'},
        {'name': 'Delete Bookings', 'codename': 'delete_bookings', 'description': 'Can permanently delete bookings', 'category': 'Booking Management'},
        
        # Analytics Permissions
        {'name': 'View Platform Analytics', 'codename': 'view_platform_analytics', 'description': 'Can view platform-wide analytics', 'category': 'Analytics'},
        {'name': 'View Provider Analytics', 'codename': 'view_provider_analytics', 'description': 'Can view provider-specific analytics', 'category': 'Analytics'},
        
        # Profile Management Permissions
        {'name': 'View Own Profile', 'codename': 'view_own_profile', 'description': 'Can view own profile information', 'category': 'Profile Management'},
        {'name': 'Edit Own Profile', 'codename': 'edit_own_profile', 'description': 'Can edit own profile information', 'category': 'Profile Management'},
        {'name': 'Manage Availability', 'codename': 'manage_availability', 'description': 'Can manage service availability schedule', 'category': 'Profile Management'},
        
        # Financial Permissions
        {'name': 'Set Service Prices', 'codename': 'set_service_prices', 'description': 'Can set and modify service prices', 'category': 'Financial'},
        {'name': 'View Earnings', 'codename': 'view_earnings', 'description': 'Can view earnings and financial reports', 'category': 'Financial'},
        
        # Communication Permissions
        {'name': 'Send Messages', 'codename': 'send_messages', 'description': 'Can send messages to other users', 'category': 'Communication'},
        {'name': 'View Messages', 'codename': 'view_messages', 'description': 'Can view received messages', 'category': 'Communication'},
    ]

    created_count = 0
    for perm_data in permissions_data:
        permission, created = Permission.objects.get_or_create(
            codename=perm_data['codename'],
            defaults={
                'name': perm_data['name'],
                'description': perm_data['description'],
                'category': perm_data['category']
            }
        )
        if created:
            created_count += 1
            print(f'✅ Created permission: {permission.name}')

    print(f'\n📊 Created {created_count} new permissions')
    return Permission.objects.all()

def setup_default_permissions():
    """Setup default permissions for each user type and role"""
    
    # Create permissions first
    permissions = create_permissions()
    
    # Define default permissions for each user type and role
    default_permissions = {
        'End User': {
            'Head of House': [
                'view_own_profile', 'edit_own_profile', 'view_own_bookings', 
                'create_bookings', 'cancel_bookings', 'send_messages', 'view_messages'
            ],
            'Family Member': [
                'view_own_profile', 'edit_own_profile', 'view_own_bookings', 
                'create_bookings', 'send_messages', 'view_messages'
            ]
        },
        'Service Provider': {
            'Admin': [
                'view_own_profile', 'edit_own_profile', 'view_services', 'register_services',
                'view_own_bookings', 'accept_bookings', 'complete_bookings', 'cancel_bookings',
                'set_service_prices', 'view_earnings', 'view_provider_analytics',
                'manage_availability', 'send_messages', 'view_messages'
            ],
            'Employee': [
                'view_own_profile', 'edit_own_profile', 'view_services',
                'view_own_bookings', 'accept_bookings', 'complete_bookings',
                'manage_availability', 'send_messages', 'view_messages'
            ],
            'Supervisor': [
                'view_own_profile', 'edit_own_profile', 'view_services', 'register_services',
                'view_own_bookings', 'accept_bookings', 'complete_bookings', 'cancel_bookings',
                'view_provider_analytics', 'manage_availability', 'send_messages', 'view_messages'
            ]
        },
        'Platform Provider': {
            'Admin': [
                'view_users', 'create_users', 'edit_users', 'delete_users',
                'view_services', 'create_services', 'edit_services',
                'view_all_bookings', 'view_platform_analytics', 'view_provider_analytics',
                'view_own_profile', 'edit_own_profile', 'send_messages', 'view_messages'
            ],
            'Employee': [
                'view_users', 'view_services', 'view_all_bookings',
                'view_own_profile', 'edit_own_profile', 'send_messages', 'view_messages'
            ],
            'Service Desk': [
                'view_users', 'view_services', 'view_all_bookings',
                'view_own_profile', 'edit_own_profile', 'send_messages', 'view_messages'
            ]
        }
    }
    
    created_count = 0
    for user_type, roles in default_permissions.items():
        for role, permission_codenames in roles.items():
            for codename in permission_codenames:
                try:
                    permission = Permission.objects.get(codename=codename)
                    user_type_role_permission, created = UserTypeRolePermission.objects.get_or_create(
                        user_type=user_type,
                        role=role,
                        permission=permission,
                        defaults={'is_granted': True}
                    )
                    if created:
                        created_count += 1
                        print(f'✅ Granted {permission.name} to {user_type} - {role}')
                except Permission.DoesNotExist:
                    print(f'❌ Permission not found: {codename}')
    
    print(f'\n🎯 Created {created_count} permission assignments')

if __name__ == "__main__":
    print("🚀 Setting up permissions system...")
    setup_default_permissions()
    print("✅ Permissions setup completed!")
