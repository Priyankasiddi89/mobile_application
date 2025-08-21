from django.core.management.base import BaseCommand
from authentication.models import Permission

class Command(BaseCommand):
    help = 'Create default permissions for the platform'

    def handle(self, *args, **options):
        permissions_data = [
            # User Management Permissions
            {'name': 'View Users', 'codename': 'view_users', 'description': 'Can view user list and details', 'category': 'User Management'},
            {'name': 'Create Users', 'codename': 'create_users', 'description': 'Can create new users', 'category': 'User Management'},
            {'name': 'Edit Users', 'codename': 'edit_users', 'description': 'Can edit user information', 'category': 'User Management'},
            {'name': 'Delete Users', 'codename': 'delete_users', 'description': 'Can delete users', 'category': 'User Management'},
            {'name': 'Manage User Permissions', 'codename': 'manage_user_permissions', 'description': 'Can manage user permissions', 'category': 'User Management'},
            
            # Service Management Permissions
            {'name': 'View Services', 'codename': 'view_services', 'description': 'Can view service categories and subcategories', 'category': 'Service Management'},
            {'name': 'Create Services', 'codename': 'create_services', 'description': 'Can create new services', 'category': 'Service Management'},
            {'name': 'Edit Services', 'codename': 'edit_services', 'description': 'Can edit service information', 'category': 'Service Management'},
            {'name': 'Delete Services', 'codename': 'delete_services', 'description': 'Can delete services', 'category': 'Service Management'},
            
            # Booking Management Permissions
            {'name': 'View All Bookings', 'codename': 'view_all_bookings', 'description': 'Can view all platform bookings', 'category': 'Booking Management'},
            {'name': 'View Own Bookings', 'codename': 'view_own_bookings', 'description': 'Can view own bookings only', 'category': 'Booking Management'},
            {'name': 'Create Bookings', 'codename': 'create_bookings', 'description': 'Can create new bookings', 'category': 'Booking Management'},
            {'name': 'Edit Bookings', 'codename': 'edit_bookings', 'description': 'Can edit booking information', 'category': 'Booking Management'},
            {'name': 'Cancel Bookings', 'codename': 'cancel_bookings', 'description': 'Can cancel bookings', 'category': 'Booking Management'},
            {'name': 'Accept Bookings', 'codename': 'accept_bookings', 'description': 'Can accept booking requests', 'category': 'Booking Management'},
            {'name': 'Complete Bookings', 'codename': 'complete_bookings', 'description': 'Can mark bookings as completed', 'category': 'Booking Management'},
            
            # Analytics Permissions
            {'name': 'View Platform Analytics', 'codename': 'view_platform_analytics', 'description': 'Can view platform-wide analytics', 'category': 'Analytics'},
            {'name': 'View Provider Analytics', 'codename': 'view_provider_analytics', 'description': 'Can view provider-specific analytics', 'category': 'Analytics'},
            {'name': 'Export Analytics', 'codename': 'export_analytics', 'description': 'Can export analytics data', 'category': 'Analytics'},
            
            # Financial Permissions
            {'name': 'View Financial Reports', 'codename': 'view_financial_reports', 'description': 'Can view financial reports and earnings', 'category': 'Financial'},
            {'name': 'Manage Payments', 'codename': 'manage_payments', 'description': 'Can manage payment processing', 'category': 'Financial'},
            {'name': 'Set Service Prices', 'codename': 'set_service_prices', 'description': 'Can set and modify service prices', 'category': 'Financial'},
            
            # Profile Management Permissions
            {'name': 'View Own Profile', 'codename': 'view_own_profile', 'description': 'Can view own profile information', 'category': 'Profile Management'},
            {'name': 'Edit Own Profile', 'codename': 'edit_own_profile', 'description': 'Can edit own profile information', 'category': 'Profile Management'},
            {'name': 'View Other Profiles', 'codename': 'view_other_profiles', 'description': 'Can view other users profiles', 'category': 'Profile Management'},
            
            # Communication Permissions
            {'name': 'Send Messages', 'codename': 'send_messages', 'description': 'Can send messages to other users', 'category': 'Communication'},
            {'name': 'View Messages', 'codename': 'view_messages', 'description': 'Can view received messages', 'category': 'Communication'},
            {'name': 'Send Notifications', 'codename': 'send_notifications', 'description': 'Can send system notifications', 'category': 'Communication'},
            
            # System Administration Permissions
            {'name': 'Access Admin Panel', 'codename': 'access_admin_panel', 'description': 'Can access Django admin panel', 'category': 'System Administration'},
            {'name': 'Manage System Settings', 'codename': 'manage_system_settings', 'description': 'Can manage system-wide settings', 'category': 'System Administration'},
            {'name': 'View System Logs', 'codename': 'view_system_logs', 'description': 'Can view system logs and audit trails', 'category': 'System Administration'},
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
                self.stdout.write(
                    self.style.SUCCESS(f'Created permission: {permission.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new permissions')
        )
