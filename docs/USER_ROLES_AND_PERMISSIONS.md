# User Roles and Permissions System

This document explains the user type and role system implemented in the application, and how it relates to permissions management.

## Overview

The application uses a two-tier system for user classification and permission management:

1. **User Type**: Broad category defining the user's primary function
2. **Role**: Specific role within that user type that determines detailed permissions

## User Types and Roles

### 1. End User
**Purpose**: Customers who book and use services

**Available Roles:**
- **Head of House**: Primary account holder with full family management permissions
- **Family Member**: Secondary user with limited permissions

**Typical Permissions:**
- View and book services
- Manage own bookings
- View family bookings (Head of House only)
- Cancel own requests
- Rate service providers

### 2. Service Provider
**Purpose**: Individuals or businesses that provide services

**Available Roles:**
- **Admin**: Full administrative control over the service provider account
- **Employee**: Basic service delivery permissions
- **Supervisor**: Mid-level management with team oversight

**Typical Permissions:**
- View and manage service requests
- Accept/decline bookings
- Manage availability and pricing
- View earnings and analytics
- Edit profile (Admin/Supervisor only)

### 3. Platform Provider
**Purpose**: Platform administrators and support staff

**Available Roles:**
- **Service Desk**: Customer support and basic platform management

**Typical Permissions:**
- View all bookings and users
- Manage platform-wide settings
- Handle customer support requests
- Access analytics and reports

## Permission System Architecture

### Database Structure

```python
# User Model
class User(AbstractUser):
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

# Permission Model
class Permission(models.Model):
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default='general')

# User Type + Role Permission Mapping
class UserTypeRolePermission(models.Model):
    user_type = models.CharField(max_length=20, choices=User.USER_TYPE_CHOICES)
    role = models.CharField(max_length=20, choices=User.ROLE_CHOICES)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    is_granted = models.BooleanField(default=False)
```

### Permission Categories

**Profile Management:**
- `view_own_profile` - View personal profile information
- `edit_own_profile` - Edit personal profile information
- `change_password` - Change account password

**Booking Management:**
- `create_booking` - Create new service bookings
- `view_own_bookings` - View personal booking history
- `cancel_own_booking` - Cancel personal bookings
- `view_family_bookings` - View family member bookings (Head of House)

**Service Provider Operations:**
- `manage_services` - Add/remove service offerings
- `manage_availability` - Set availability schedules
- `view_earnings` - Access earnings and analytics
- `accept_requests` - Accept booking requests
- `decline_requests` - Decline booking requests

**Administrative Functions:**
- `manage_users` - User account management
- `view_analytics` - Access platform analytics
- `manage_permissions` - Modify user permissions

## Profile Display Enhancement

### Visual Indicators

The profile sections now display user type and role with enhanced visual styling:

**User Type Badge:**
- Color-coded gradient backgrounds
- End User: Blue gradient
- Service Provider: Purple gradient  
- Platform Provider: Pink gradient
- Admin: Red gradient

**Role Badge:**
- Green background for all roles
- Includes explanatory text: "(Determines permissions)"

**Status Indicator:**
- Green for Active users
- Red for Inactive users

### Profile Layout

```
┌─────────────────────────────────────┐
│ Profile Information                 │
├─────────────────────────────────────┤
│ Username: john_doe                  │
├─────────────────────────────────────┤
│ User Type: [Service Provider]       │
├─────────────────────────────────────┤
│ Role: [Admin] (Determines permissions) │
├─────────────────────────────────────┤
│ Status: [Active]                    │
└─────────────────────────────────────┘
```

## Permission Checking

### Frontend Implementation

```typescript
// Check if user has specific permission
const hasPermission = (permissionCode: string): boolean => {
  return userPermissions[permissionCode] || false;
};

// Conditional rendering based on permissions
{hasPermission('edit_own_profile') && (
  <button onClick={editProfile}>Edit Profile</button>
)}
```

### Backend Implementation

```python
def check_user_permission(user, permission_codename):
    """Check if user has a specific permission based on their user_type and role"""
    try:
        permission = Permission.objects.get(codename=permission_codename)
        user_permission = UserTypeRolePermission.objects.get(
            user_type=user.user_type,
            role=user.role,
            permission=permission,
            is_granted=True
        )
        return True
    except (Permission.DoesNotExist, UserTypeRolePermission.DoesNotExist):
        return False
```

## Permission Management

### Admin Interface

Administrators can manage permissions through the Django admin interface:

1. **Permission Creation**: Define new permissions with categories
2. **Role Assignment**: Assign permissions to user type + role combinations
3. **User Overrides**: Grant/revoke specific permissions for individual users

### Default Permission Sets

**End User - Head of House:**
- All personal management permissions
- Family booking management
- Service rating and feedback

**End User - Family Member:**
- Basic personal management
- Own booking management only

**Service Provider - Admin:**
- Full service provider permissions
- Team management capabilities
- Financial and analytics access

**Service Provider - Employee:**
- Basic service delivery permissions
- Limited profile management

**Service Provider - Supervisor:**
- Employee permissions plus team oversight
- Advanced analytics access

## Best Practices

### For Developers

1. **Always Check Permissions**: Never assume user capabilities
2. **Graceful Degradation**: Show appropriate messages for denied permissions
3. **Consistent Checking**: Use the same permission checking logic across frontend and backend
4. **Clear Error Messages**: Provide helpful feedback when permissions are denied

### For Administrators

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Regular Audits**: Review and update permission assignments
3. **Role-Based Thinking**: Design permissions around job functions
4. **Documentation**: Keep permission purposes well-documented

## Troubleshooting

### Common Issues

1. **Permission Not Working**: Check if permission exists and is granted to user's type+role
2. **UI Not Updating**: Verify frontend permission checking logic
3. **Backend Errors**: Ensure API endpoints check permissions properly

### Debug Commands

```bash
# Check user permissions
python manage.py shell -c "
from authentication.models import User, UserTypeRolePermission
user = User.objects.get(username='username')
perms = UserTypeRolePermission.objects.filter(
    user_type=user.user_type, 
    role=user.role, 
    is_granted=True
)
for p in perms: print(f'{p.permission.codename}: {p.permission.name}')
"

# List all permissions for a role
python manage.py shell -c "
from authentication.models import UserTypeRolePermission
perms = UserTypeRolePermission.objects.filter(
    user_type='Service Provider',
    role='Admin',
    is_granted=True
)
for p in perms: print(p.permission.codename)
"
```

This role and permission system provides flexible, granular control over user capabilities while maintaining clear visual indicators in the user interface to help users understand their access levels.
