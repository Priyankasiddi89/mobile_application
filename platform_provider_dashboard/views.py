from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from authentication.models import User
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