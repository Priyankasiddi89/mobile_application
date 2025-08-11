"""
Bookings API Endpoints
Handles booking creation, management, and status updates
"""
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from bookings.models import Booking, ServiceSubcategory, UserRegisteredService, ProviderRating, ProviderAvailability, ProviderOffDay
from bookings.serializers import (
    BookingSerializer, ProviderRatingSerializer, ProviderRatingCreateSerializer,
    ProviderAvailabilitySerializer, ProviderAvailabilityCreateSerializer,
    ProviderOffDaySerializer, ProviderOffDayCreateSerializer
)
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
        print(f"DEBUG: Current user - Username: '{request.user.username}', Email: '{request.user.email}', ID: {request.user.id}")
        print(f"DEBUG: Looking for bookings with provider='{request.user.username}'")

        # Also check if there are bookings with email as provider
        email_bookings = Booking.objects.filter(provider=request.user.email)
        print(f"DEBUG: Found {email_bookings.count()} bookings with email as provider")

        # Try both username and email for provider matching
        from django.db.models import Q
        bookings_query = Booking.objects.filter(
            Q(provider=request.user.username) | Q(provider=request.user.email)
        )
        print(f"DEBUG: Found {bookings_query.count()} total bookings for username/email as provider")

        # Check all bookings to see what provider values exist
        all_bookings = Booking.objects.all()
        provider_values = set(booking.provider for booking in all_bookings if booking.provider)
        print(f"DEBUG: All provider values in database: {provider_values}")

        # Apply status filtering
        if status_filter == 'active':
            # Active bookings: accepted, confirmed, in_progress (exclude cancelled)
            bookings = bookings_query.filter(status__in=['accepted', 'confirmed', 'in_progress']).order_by('-created_at')
            print(f"DEBUG: Active bookings filter - found {bookings.count()} active bookings")
            for booking in bookings:
                print(f"DEBUG: Active booking - ID: {booking.id}, Status: {booking.status}, Provider: {booking.provider}, Customer: {booking.customer}")
        elif status_filter == 'completed':
            # Completed bookings: only completed (exclude cancelled)
            bookings = bookings_query.filter(status='completed').order_by('-created_at')
        elif status_filter == 'cancelled':
            # Cancelled bookings: only cancelled
            bookings = bookings_query.filter(status='cancelled').order_by('-created_at')
        else:
            # All bookings except cancelled (providers don't need to see cancelled requests)
            bookings = bookings_query.exclude(status='cancelled').order_by('-created_at')

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
        # Include both unassigned requests AND requests specifically assigned to this provider
        from django.db.models import Q
        requests = Booking.objects.filter(
            status='pending',
            subcategory__in=registered_services
        ).filter(
            Q(provider__isnull=True) |
            Q(provider=request.user.username) |
            Q(provider=request.user.email)
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
        print(f"DEBUG: Accept request - User: {request.user.username}, Email: {request.user.email}, Type: {request.user.user_type}")
        print(f"DEBUG: Trying to accept booking ID: {booking_id}")

        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can accept requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get booking - can be either unassigned or assigned to this provider
        try:
            from django.db.models import Q

            # First check if booking exists at all
            all_bookings = Booking.objects.filter(id=booking_id)
            print(f"DEBUG: Found {all_bookings.count()} bookings with ID {booking_id}")
            if all_bookings.exists():
                existing_booking = all_bookings.first()
                print(f"DEBUG: Existing booking - Status: {existing_booking.status}, Provider: {existing_booking.provider}")

            booking = Booking.objects.filter(
                id=booking_id,
                status='pending'
            ).filter(
                Q(provider__isnull=True) |  # Unassigned requests
                Q(provider=request.user.username) |  # Assigned to username
                Q(provider=request.user.email)  # Assigned to email
            ).first()

            print(f"DEBUG: Filtered booking result: {booking}")

            if not booking:
                return Response(
                    {'error': 'Request not found, already accepted, or not assigned to you'},
                    status=status.HTTP_404_NOT_FOUND
                )

        except Exception as e:
            return Response(
                {'error': f'Database error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Check if provider is registered for this service
        if not UserRegisteredService.objects.filter(user=request.user, service=booking.subcategory).exists():
            return Response(
                {'error': 'You are not registered for this service'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Accept the booking
        booking.status = 'accepted'
        # Only set provider if not already set (for unassigned requests)
        if not booking.provider:
            booking.provider = request.user.username
        booking.save()

        print(f"DEBUG: Booking {booking_id} accepted by provider {request.user.username}")
        
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
        
        # Get booking - can be either unassigned or assigned to this provider
        try:
            from django.db.models import Q

            print(f"DEBUG: Decline request - User: {request.user.username}, Type: {request.user.user_type}")
            print(f"DEBUG: Trying to decline booking ID: {booking_id}")

            booking = Booking.objects.filter(
                id=booking_id,
                status='pending'
            ).filter(
                Q(provider__isnull=True) |  # Unassigned requests
                Q(provider=request.user.username) |  # Assigned to username
                Q(provider=request.user.email)  # Assigned to email
            ).first()

            if not booking:
                return Response(
                    {'error': 'Request not found, already accepted, or not assigned to you'},
                    status=status.HTTP_404_NOT_FOUND
                )

        except Exception as e:
            return Response(
                {'error': f'Database error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Handle decline based on booking type
        if booking.provider:
            # This is an assigned request (marketplace booking) - change status to declined
            print(f"DEBUG: Declining assigned booking {booking_id} - changing status to declined")
            booking.status = 'declined'
            booking.provider = None  # Clear provider assignment
            booking.save()

            print(f"DEBUG: Assigned booking {booking_id} declined by {request.user.username} - status changed to 'declined'")
        else:
            # This is an unassigned request - add to declined list
            print(f"DEBUG: Adding {request.user.username} to declined list for unassigned booking {booking_id}")
            booking.add_declined_provider(request.user.username)

            print(f"DEBUG: Unassigned booking {booking_id} - provider {request.user.username} added to declined list")

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


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def cancel_booking_request(request, booking_id):
    """
    Cancel a booking request (customers and service providers)
    POST /api/bookings/{booking_id}/cancel/
    """
    try:
        print(f"DEBUG: Cancel request - User: {request.user.username}, Type: {request.user.user_type}")

        if request.user.user_type not in ['End User', 'Service Provider']:
            return Response(
                {'error': 'Only customers and service providers can cancel bookings'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get booking based on user type
        try:
            if request.user.user_type == 'End User':
                # Customer can cancel their own bookings
                booking = Booking.objects.get(id=booking_id, customer=request.user.username)
                print(f"DEBUG: Customer cancelling their own booking")
            else:
                # Service provider can cancel bookings assigned to them
                from django.db.models import Q
                booking = Booking.objects.filter(id=booking_id).filter(
                    Q(provider=request.user.username) | Q(provider=request.user.email)
                ).first()

                if not booking:
                    return Response(
                        {'error': 'Booking not found or not assigned to you'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                print(f"DEBUG: Service provider cancelling assigned booking")

        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found or you do not have permission to cancel it'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if booking can be cancelled
        print(f"DEBUG: Attempting to cancel booking {booking_id} with current status: '{booking.status}'")

        # Different cancellation rules for customers vs providers
        if request.user.user_type == 'End User':
            # Customers can cancel pending or accepted bookings
            allowed_statuses = ['pending', 'accepted']
        else:
            # Service providers can cancel pending, accepted, or confirmed bookings
            allowed_statuses = ['pending', 'accepted', 'confirmed']

        if booking.status not in allowed_statuses:
            print(f"DEBUG: Cannot cancel booking - invalid status: '{booking.status}' (allowed for {request.user.user_type}: {allowed_statuses})")
            return Response(
                {'error': f'Cannot cancel booking with status: {booking.status}. {request.user.user_type}s can cancel bookings with status: {", ".join(allowed_statuses)}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cancel the booking
        old_status = booking.status
        booking.status = 'cancelled'

        # Set who cancelled the booking
        if request.user.user_type == 'End User':
            booking.cancelled_by = 'customer'
            user_type_text = "Customer"
        else:
            booking.cancelled_by = 'provider'
            user_type_text = "Service Provider"

        booking.save()

        print(f"DEBUG: Successfully cancelled booking {booking_id}: {old_status} -> cancelled by {user_type_text}")

        serializer = BookingSerializer(booking)
        return Response({
            'message': f'Booking cancelled successfully by {user_type_text.lower()}',
            'booking': serializer.data,
            'cancelled_by': booking.cancelled_by
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_provider_rating(request):
    """
    Create a rating for a provider after service completion
    POST /api/bookings/rate-provider/
    Body: {
        "booking_id": "123",
        "rating": 5,
        "review": "Excellent service!"
    }
    """
    try:
        if request.user.user_type != 'End User':
            return Response(
                {'error': 'Only customers can rate providers'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProviderRatingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking_id = serializer.validated_data['booking_id']
        rating_value = serializer.validated_data['rating']
        review_text = serializer.validated_data.get('review', '')

        # Get booking
        try:
            booking = Booking.objects.get(
                id=booking_id,
                customer=request.user.username,
                status='completed'
            )
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Completed booking not found or you do not have permission to rate it'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if rating already exists
        if ProviderRating.objects.filter(booking=booking).exists():
            return Response(
                {'error': 'You have already rated this service'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get provider user object
        from authentication.models import User
        try:
            provider_user = User.objects.get(username=booking.provider)
        except User.DoesNotExist:
            return Response(
                {'error': 'Provider not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create rating
        rating = ProviderRating.objects.create(
            provider=provider_user,
            customer=request.user,
            booking=booking,
            rating=rating_value,
            review=review_text
        )

        serializer = ProviderRatingSerializer(rating)
        return Response({
            'message': 'Rating submitted successfully',
            'rating': serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_provider_ratings(request, provider_id):
    """
    Get all ratings for a specific provider
    GET /api/bookings/provider/{provider_id}/ratings/
    """
    try:
        from authentication.models import User

        # Get provider user
        try:
            provider = User.objects.get(id=provider_id, user_type='Service Provider')
        except User.DoesNotExist:
            return Response(
                {'error': 'Provider not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all ratings for this provider
        ratings = ProviderRating.objects.filter(provider=provider).order_by('-created_at')

        # Calculate average rating
        total_ratings = ratings.count()
        if total_ratings > 0:
            average_rating = sum(rating.rating for rating in ratings) / total_ratings
            average_rating = round(average_rating, 1)
        else:
            average_rating = 0

        # Count ratings with review text
        ratings_with_reviews = ratings.filter(review__isnull=False).exclude(review='').exclude(review__exact='')
        total_reviews = ratings_with_reviews.count()

        # Serialize ratings
        serializer = ProviderRatingSerializer(ratings, many=True)

        return Response({
            'provider_id': provider_id,
            'provider_name': provider.username,
            'total_ratings': total_ratings,
            'total_reviews': total_reviews,
            'average_rating': average_rating,
            'ratings': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ===== PROVIDER AVAILABILITY MANAGEMENT =====

@api_view(['GET', 'POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def manage_provider_availability(request):
    """
    GET: Get provider's availability slots
    POST: Create new availability slot
    """
    if request.user.user_type != 'Service Provider':
        return Response(
            {'error': 'Only service providers can manage availability'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        try:
            # Get date range from query params (default to next 30 days)
            from datetime import date, timedelta
            start_date = request.GET.get('start_date', date.today())
            end_date = request.GET.get('end_date', date.today() + timedelta(days=30))

            if isinstance(start_date, str):
                start_date = date.fromisoformat(start_date)
            if isinstance(end_date, str):
                end_date = date.fromisoformat(end_date)

            availability_slots = ProviderAvailability.objects.filter(
                provider=request.user,
                date__gte=start_date,
                date__lte=end_date
            ).order_by('date', 'start_time')

            # Get bookings for this date range
            bookings = Booking.objects.filter(
                provider=request.user.username,
                service_date__date__gte=start_date,
                service_date__date__lte=end_date,
                status__in=['pending', 'accepted', 'active', 'completed']
            ).order_by('service_date')

            # Serialize availability slots
            serializer = ProviderAvailabilitySerializer(availability_slots, many=True)

            # Prepare booking data
            booking_data = []
            for booking in bookings:
                booking_data.append({
                    'id': str(booking.id),
                    'date': booking.service_date.date().isoformat(),
                    'time': booking.service_date.time().strftime('%H:%M'),
                    'customer': booking.customer,
                    'service': booking.subcategory.name,
                    'status': booking.status,
                    'address': booking.address[:50] + '...' if len(booking.address) > 50 else booking.address
                })

            return Response({
                'availability_slots': serializer.data,
                'bookings': booking_data,
                'start_date': start_date,
                'end_date': end_date
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'POST':
        try:
            serializer = ProviderAvailabilityCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if slot already exists
            existing_slot = ProviderAvailability.objects.filter(
                provider=request.user,
                date=serializer.validated_data['date'],
                start_time=serializer.validated_data['start_time'],
                end_time=serializer.validated_data['end_time']
            ).first()

            if existing_slot:
                # Update existing slot
                existing_slot.is_available = serializer.validated_data['is_available']
                existing_slot.save()
                response_serializer = ProviderAvailabilitySerializer(existing_slot)
                return Response({
                    'message': 'Availability slot updated',
                    'slot': response_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                # Create new slot
                availability_slot = ProviderAvailability.objects.create(
                    provider=request.user,
                    **serializer.validated_data
                )
                response_serializer = ProviderAvailabilitySerializer(availability_slot)
                return Response({
                    'message': 'Availability slot created',
                    'slot': response_serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def manage_provider_off_days(request):
    """
    GET: Get provider's off days
    POST: Create new off day
    """
    if request.user.user_type != 'Service Provider':
        return Response(
            {'error': 'Only service providers can manage off days'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        try:
            from datetime import date, timedelta
            start_date = request.GET.get('start_date', date.today())
            end_date = request.GET.get('end_date', date.today() + timedelta(days=90))

            if isinstance(start_date, str):
                start_date = date.fromisoformat(start_date)
            if isinstance(end_date, str):
                end_date = date.fromisoformat(end_date)

            off_days = ProviderOffDay.objects.filter(
                provider=request.user,
                date__gte=start_date,
                date__lte=end_date
            ).order_by('date')

            serializer = ProviderOffDaySerializer(off_days, many=True)

            return Response({
                'off_days': serializer.data,
                'start_date': start_date,
                'end_date': end_date
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'POST':
        try:
            serializer = ProviderOffDayCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if off day already exists
            existing_off_day = ProviderOffDay.objects.filter(
                provider=request.user,
                date=serializer.validated_data['date']
            ).first()

            if existing_off_day:
                return Response(
                    {'error': 'Off day already exists for this date'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create new off day
            off_day = ProviderOffDay.objects.create(
                provider=request.user,
                **serializer.validated_data
            )
            response_serializer = ProviderOffDaySerializer(off_day)
            return Response({
                'message': 'Off day created',
                'off_day': response_serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'DELETE':
        try:
            date_to_remove = request.data.get('date')
            if not date_to_remove:
                return Response(
                    {'error': 'Date is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Remove off day if it exists
            deleted_count, _ = ProviderOffDay.objects.filter(
                provider=request.user,
                date=date_to_remove
            ).delete()

            return Response({
                'message': f'Removed off day for {date_to_remove}' if deleted_count > 0 else 'No off day found for this date',
                'deleted_count': deleted_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
def get_provider_available_slots(request, provider_id):
    """
    Get available time slots for a specific provider on a specific date
    GET /api/bookings/provider/{provider_id}/available-slots/?date=2025-01-08
    """
    try:
        from authentication.models import User
        from datetime import datetime, time, timedelta

        # Get provider
        try:
            provider = User.objects.get(id=provider_id, user_type='Service Provider')
        except User.DoesNotExist:
            return Response(
                {'error': 'Provider not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get date from query params
        date_str = request.GET.get('date')
        if not date_str:
            return Response(
                {'error': 'Date parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if provider is off on this date
        is_off_day = ProviderOffDay.objects.filter(
            provider=provider,
            date=selected_date
        ).exists()

        if is_off_day:
            return Response({
                'provider_id': provider_id,
                'provider_name': provider.username,
                'date': selected_date,
                'available_slots': [],
                'message': 'Provider is off on this date'
            }, status=status.HTTP_200_OK)

        # Get provider's availability slots for this date
        availability_slots = ProviderAvailability.objects.filter(
            provider=provider,
            date=selected_date,
            is_available=True
        ).order_by('start_time')

        # Get existing bookings for this date
        existing_bookings = Booking.objects.filter(
            provider=provider.username,
            service_date__date=selected_date,
            status__in=['pending', 'accepted', 'active']
        )

        # Build list of available slots
        available_slots = []
        for slot in availability_slots:
            # Check if this slot conflicts with existing bookings
            from django.utils import timezone
            slot_start = timezone.make_aware(datetime.combine(selected_date, slot.start_time))
            slot_end = timezone.make_aware(datetime.combine(selected_date, slot.end_time))

            is_slot_available = True
            for booking in existing_bookings:
                booking_time = booking.service_date
                # Assume each booking takes 2 hours (can be made configurable)
                booking_end = booking_time + timedelta(hours=2)

                # Check for time overlap
                if (slot_start < booking_end and slot_end > booking_time):
                    is_slot_available = False
                    break

            if is_slot_available:
                available_slots.append({
                    'start_time': slot.start_time.strftime('%H:%M'),
                    'end_time': slot.end_time.strftime('%H:%M'),
                    'display_time': f"{slot.start_time.strftime('%I:%M %p')} - {slot.end_time.strftime('%I:%M %p')}"
                })

        return Response({
            'provider_id': provider_id,
            'provider_name': provider.username,
            'date': selected_date,
            'available_slots': available_slots,
            'total_slots': len(available_slots)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
