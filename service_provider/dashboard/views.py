from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from authentication.models import User
from bookings.models import Booking, ServiceCategory, ServiceSubcategory

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def provider_profile(request):
    """Get current provider profile information"""
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
def incoming_requests(request):
    """Get incoming booking requests for the current provider"""
    user = request.user
    # Get bookings that are pending and haven't been declined by this provider
    requests = Booking.objects.filter(
        status='pending',
        declined_by__nin=[user.username]
    )
    
    requests_data = []
    for req in requests:
        requests_data.append({
            'id': str(req.id),
            'service_name': req.subcategory.name,
            'customer_name': req.customer,
            'booking_date': req.booking_date.isoformat(),
            'status': req.status,
            'created_at': req.created_at.isoformat(),
        })
    
    return Response(requests_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def provider_services(request):
    """Get services offered by the current provider"""
    user = request.user
    # This would need to be implemented based on your service model
    # For now, returning a placeholder
    return Response([
        {
            'id': 1,
            'name': 'Sample Service',
            'category': 'Home Cleaning',
            'price': 50.00,
            'description': 'Sample service description'
        }
    ])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def provider_bookings(request):
    """Get all bookings for the current provider"""
    user = request.user
    bookings = Booking.objects.filter(provider=user.username)
    
    booking_data = []
    for booking in bookings:
        booking_data.append({
            'id': str(booking.id),
            'service_name': booking.subcategory.name,
            'customer_name': booking.customer,
            'booking_date': booking.booking_date.isoformat(),
            'status': booking.status,
            'created_at': booking.created_at.isoformat(),
        })
    
    return Response(booking_data) 