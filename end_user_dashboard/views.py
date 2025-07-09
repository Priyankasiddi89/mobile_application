from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bookings.models import Booking, ServiceCategory, ServiceSubcategory
from authentication.models import User
import json

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    """Get all bookings for the authenticated end user"""
    try:
        # Get bookings for the current user using MongoEngine
        bookings = Booking.objects.filter(customer=request.user.username)
        
        booking_data = []
        for booking in bookings:
            booking_data.append({
                'id': str(booking.id),
                'service_name': booking.subcategory.name if booking.subcategory else 'N/A',
                'provider_name': booking.provider if booking.provider else 'N/A',
                'booking_date': booking.booking_date.strftime('%Y-%m-%d') if booking.booking_date else 'N/A',
                'status': booking.status,
                'price': float(booking.total_price) if booking.total_price else 0.0,
            })
        
        return Response(booking_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_services(request):
    """Get all available services for end users to browse"""
    try:
        # Get all subcategories as services
        subcategories = ServiceSubcategory.objects.all()
        
        service_data = []
        for subcategory in subcategories:
            service_data.append({
                'id': str(subcategory.id),
                'name': subcategory.name,
                'category': subcategory.category.name if subcategory.category else 'N/A',
                'subcategory': subcategory.name,
                'provider_name': 'Available Providers',  # Since subcategories don't have direct providers
                'description': subcategory.description,
                'price': float(subcategory.price) if subcategory.price else 0.0,
            })
        
        return Response(service_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_requests(request):
    """Get all service requests made by the authenticated end user"""
    try:
        # For now, return empty array since we haven't implemented requests yet
        # This can be expanded when we add request functionality
        return Response([])
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 