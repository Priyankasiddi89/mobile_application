"""
Bookings API Endpoints
Handles booking creation, management, and status updates
"""
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from bookings.models import Booking, ServiceSubcategory, UserRegisteredService
from bookings.serializers import BookingSerializer
from authentication.views import PostgreSQLJWTAuthentication


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """
    Create a new booking
    POST /api/bookings/create/
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['subcategory_id', 'service_date']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Get service subcategory
        try:
            subcategory = ServiceSubcategory.objects.get(id=data['subcategory_id'])
        except ServiceSubcategory.DoesNotExist:
            return Response(
                {'error': 'Service not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create booking
        booking = Booking.objects.create(
            customer=request.user.username,
            subcategory=subcategory,
            booking_date=timezone.now(),
            service_date=data['service_date'],
            total_price=subcategory.price,
            status='pending',
            payment_status='unpaid',
            notes=data.get('notes', ''),
        )
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_bookings(request):
    """
    Get bookings for current user
    GET /api/bookings/user/
    """
    try:
        bookings = Booking.objects.filter(customer=request.user.username).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_provider_bookings(request):
    """
    Get bookings assigned to current provider
    GET /api/bookings/provider/ - Returns ALL bookings
    GET /api/bookings/provider/?status=active - Returns only active bookings
    GET /api/bookings/provider/?status=completed - Returns only completed bookings
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get status filter from query parameters
        status_filter = request.GET.get('status', 'all')

        # Base query for provider's bookings
        bookings_query = Booking.objects.filter(provider=request.user.username)

        # Apply status filtering
        if status_filter == 'active':
            # Active bookings: accepted, confirmed, in_progress
            bookings = bookings_query.filter(status__in=['accepted', 'confirmed', 'in_progress']).order_by('-created_at')
        elif status_filter == 'completed':
            # Completed bookings: completed, cancelled
            bookings = bookings_query.filter(status__in=['completed', 'cancelled']).order_by('-created_at')
        else:
            # All bookings
            bookings = bookings_query.order_by('-created_at')

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_provider_requests(request):
    """
    Get pending requests for current provider
    GET /api/bookings/provider/requests/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get provider's registered services
        registered_service_relations = UserRegisteredService.objects.filter(user=request.user)
        registered_services = [urs.service for urs in registered_service_relations]
        
        if not registered_services:
            return Response([], status=status.HTTP_200_OK)
        
        # Get pending requests for registered services
        requests = Booking.objects.filter(
            status='pending',
            provider__isnull=True,
            subcategory__in=registered_services
        ).order_by('-created_at')
        
        # Filter out requests declined by this provider
        filtered_requests = []
        for booking in requests:
            try:
                declined_providers = booking.get_declined_providers()
                if request.user.username not in declined_providers:
                    filtered_requests.append(booking)
            except:
                filtered_requests.append(booking)
        
        serializer = BookingSerializer(filtered_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id):
    """
    Update booking status
    PUT /api/bookings/{booking_id}/status/
    """
    try:
        # Get booking
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if request.user.user_type == 'End User':
            # End users can only update their own bookings
            if booking.customer != request.user.username:
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.user_type == 'Service Provider':
            # Providers can only update bookings assigned to them
            if booking.provider != request.user.username:
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Update status
        new_status = request.data.get('status')
        if new_status:
            booking.status = new_status
            booking.save()
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def accept_booking_request(request, booking_id):
    """
    Accept a booking request (provider only)
    POST /api/bookings/{booking_id}/accept/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can accept requests'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get booking
        try:
            booking = Booking.objects.get(id=booking_id, status='pending', provider__isnull=True)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Request not found or already accepted'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if provider is registered for this service
        if not UserRegisteredService.objects.filter(user=request.user, service=booking.subcategory).exists():
            return Response(
                {'error': 'You are not registered for this service'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Accept the booking
        booking.status = 'accepted'
        booking.provider = request.user.username
        booking.save()
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def decline_booking_request(request, booking_id):
    """
    Decline a booking request (provider only)
    POST /api/bookings/{booking_id}/decline/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can decline requests'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get booking
        try:
            booking = Booking.objects.get(id=booking_id, status='pending', provider__isnull=True)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Request not found or already accepted'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Add to declined list
        booking.add_declined_provider(request.user.username)
        
        serializer = BookingSerializer(booking)
        return Response({
            'message': 'Request declined successfully',
            'booking': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def complete_booking(request, booking_id):
    """
    Mark booking as completed (provider only)
    POST /api/bookings/{booking_id}/complete/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can complete bookings'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get booking
        try:
            booking = Booking.objects.get(id=booking_id, provider=request.user.username)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found or not assigned to you'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update booking
        payment_method = request.data.get('payment_method', 'cod')
        booking.status = 'completed'
        booking.payment_method = payment_method
        booking.payment_status = 'paid'
        booking.save()
        
        serializer = BookingSerializer(booking)
        return Response({
            'message': 'Booking completed successfully',
            'booking': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
