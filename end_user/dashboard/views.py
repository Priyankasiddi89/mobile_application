from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from authentication.models import User
from bookings.models import Booking, ServiceCategory, ServiceSubcategory

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile information"""
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
def user_bookings(request):
    """Get all bookings for the current user"""
    user = request.user
    bookings = Booking.objects.filter(customer=user)
    
    booking_data = []
    for booking in bookings:
        booking_data.append({
            'id': booking.id,
            'service_name': booking.service_name,
            'provider_name': booking.provider_name,
            'booking_date': booking.booking_date,
            'status': booking.status,
            'created_at': booking.created_at,
        })
    
    return Response(booking_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_services(request):
    """Get all available services for end users"""
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