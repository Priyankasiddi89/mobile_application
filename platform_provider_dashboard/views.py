from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from authentication.models import User, Permission, UserTypeRolePermission, UserPermissionOverride
from bookings.models import Booking, ServiceCategory, ServiceSubcategory

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_profile(request):
    """Get current admin profile information"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'user_type': user.user_type,
        'role': user.role,
        'is_active': user.is_active,
        'email': user.email if hasattr(user, 'email') else None,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_management(request):
    """Get all users for admin management"""
    users = User.objects.all()
    
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'user_type': user.user_type,
            'role': user.role,
            'is_active': user.is_active,
            'email': user.email if hasattr(user, 'email') else None,
        })
    
    return Response(users_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def services_management(request):
    """Get all services for admin management"""
    categories = ServiceCategory.objects.all()
    
    services_data = []
    for category in categories:
        subcategories = ServiceSubcategory.objects.filter(category=category)
        category_data = {
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'subcategories': []
        }
        
        for subcategory in subcategories:
            category_data['subcategories'].append({
                'id': subcategory.id,
                'name': subcategory.name,
                'description': subcategory.description,
            })
        
        services_data.append(category_data)
    
    return Response(services_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics(request):
    """Get platform analytics for admin dashboard"""
    total_users = User.objects.count()
    total_providers = User.objects.filter(user_type='Service Provider').count()
    total_services = ServiceCategory.objects.count()
    total_bookings = Booking.objects.count()
    
    return Response({
        'totalUsers': total_users,
        'totalProviders': total_providers,
        'totalServices': total_services,
        'totalBookings': total_bookings,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_permissions(request):
    """Get all available permissions grouped by category"""
    if request.user.user_type != 'Platform Provider' or request.user.role != 'Admin':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    permissions = Permission.objects.all()
    permissions_by_category = {}

    for permission in permissions:
        if permission.category not in permissions_by_category:
            permissions_by_category[permission.category] = []
        permissions_by_category[permission.category].append({
            'id': permission.id,
            'name': permission.name,
            'codename': permission.codename,
            'description': permission.description
        })

    return Response(permissions_by_category)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_type_role_permissions(request):
    """Get permissions for all user type and role combinations"""
    if request.user.user_type != 'Platform Provider' or request.user.role != 'Admin':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    # Get all user type and role combinations
    user_types = [choice[0] for choice in User.USER_TYPE_CHOICES]

    # Define roles based on user type structure
    user_type_roles = {
        'End User': ['Head of House', 'Family Member'],
        'Service Provider': ['Admin', 'Employee', 'Supervisor'],
        'Platform Provider': ['Admin', 'Employee', 'Service Desk']
    }

    permissions = Permission.objects.all()

    result = {}

    for user_type in user_types:
        result[user_type] = {}
        for role in user_type_roles.get(user_type, []):
            result[user_type][role] = {}

            # Get existing permissions for this combination
            existing_permissions = UserTypeRolePermission.objects.filter(
                user_type=user_type,
                role=role
            ).select_related('permission')

            existing_dict = {perm.permission.id: perm.is_granted for perm in existing_permissions}

            # Group permissions by category
            for permission in permissions:
                if permission.category not in result[user_type][role]:
                    result[user_type][role][permission.category] = []

                result[user_type][role][permission.category].append({
                    'id': permission.id,
                    'name': permission.name,
                    'codename': permission.codename,
                    'description': permission.description,
                    'is_granted': existing_dict.get(permission.id, False)
                })

    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_type_role_permissions(request):
    """Update permissions for a specific user type and role combination"""
    if request.user.user_type != 'Platform Provider' or request.user.role != 'Admin':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    user_type = request.data.get('user_type')
    role = request.data.get('role')
    permissions_data = request.data.get('permissions', {})

    if not user_type or not role:
        return Response({'error': 'user_type and role are required'}, status=status.HTTP_400_BAD_REQUEST)

    # Update permissions for this user type and role combination
    for permission_id, is_granted in permissions_data.items():
        try:
            permission = Permission.objects.get(id=permission_id)
            user_type_role_permission, created = UserTypeRolePermission.objects.get_or_create(
                user_type=user_type,
                role=role,
                permission=permission,
                defaults={'is_granted': is_granted}
            )
            if not created:
                user_type_role_permission.is_granted = is_granted
                user_type_role_permission.save()
        except Permission.DoesNotExist:
            continue

    return Response({'message': 'Permissions updated successfully'})