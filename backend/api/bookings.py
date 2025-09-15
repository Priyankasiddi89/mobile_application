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
    ProviderResponseSerializer, ProviderAvailabilitySerializer, ProviderAvailabilityCreateSerializer,
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
        # Check if user has permission to create bookings
        if not check_user_permission(request.user, 'create_bookings'):
            return Response(
                {'error': 'You do not have permission to create bookings. Contact your administrator to grant "Create Bookings" permission.'},
                status=status.HTTP_403_FORBIDDEN
            )

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

@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_cart_booking(request):
    """Create a booking from cart items (multiple services from same provider)"""
    try:
        data = request.data
        cart_items = data.get('cart_items', [])
        notes = data.get('notes', '')

        if not cart_items:
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate all items are from same provider
        provider_ids = set(item.get('provider_id') for item in cart_items)
        if len(provider_ids) > 1:
            return Response(
                {'error': 'All services must be from the same provider'},
                status=status.HTTP_400_BAD_REQUEST
            )

        provider_id = list(provider_ids)[0]

        # Get provider user
        try:
            from authentication.models import User
            provider = User.objects.get(id=provider_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Provider not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate total price and create booking with multiple services
        total_price = sum(float(item.get('price', 0)) for item in cart_items)
        service_names = [item.get('subcategory_name') for item in cart_items]

        # Use the first service's subcategory for the main booking
        first_service_id = cart_items[0].get('subcategory_id')
        try:
            from bookings.models import ServiceSubcategory
            subcategory = ServiceSubcategory.objects.get(id=first_service_id)
        except ServiceSubcategory.DoesNotExist:
            return Response(
                {'error': 'Service not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create booking
        from bookings.models import Booking
        from django.utils import timezone

        booking = Booking.objects.create(
            customer=request.user.username,
            provider=provider.username,
            subcategory=subcategory,
            booking_date=timezone.now(),
            service_date=timezone.now() + timezone.timedelta(days=1),  # Default to tomorrow
            total_price=total_price,
            status='pending',
            payment_status='unpaid',
            notes=f"{notes}\n\nServices included: {', '.join(service_names)}\nTotal services: {len(cart_items)}"
        )

        # Store cart items as JSON in a custom field (we'll need to add this to the model)
        # For now, we'll store it in the notes field

        from bookings.serializers import BookingSerializer
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
        # Check if user has permission to view their own bookings
        if not check_user_permission(request.user, 'view_own_bookings'):
            return Response(
                {'error': 'You do not have permission to view bookings. Contact your administrator to grant "View Own Bookings" permission.'},
                status=status.HTTP_403_FORBIDDEN
            )

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
    GET /api/bookings/provider/?status=active - Returns only active bookings (accepted, confirmed)
    GET /api/bookings/provider/?status=completed - Returns only completed bookings
    """
    try:
        print(f"DEBUG: get_provider_bookings called by user: {request.user.username}")
        print(f"DEBUG: User type: '{request.user.user_type}'")
        print(f"DEBUG: User role: '{request.user.role}'")

        if request.user.user_type != 'Service Provider':
            print(f"DEBUG: Access denied - user type is '{request.user.user_type}', expected 'Service Provider'")
            return Response(
                {'error': f'Only service providers can access this endpoint. Your user type: {request.user.user_type}'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if user has permission to view active bookings
        if not check_user_permission(request.user, 'view_active_bookings'):
            return Response(
                {'error': 'You do not have permission to view active bookings. Contact your administrator to grant "View Active Bookings" permission.'},
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
            # Active bookings: accepted, confirmed (exclude pending, cancelled, declined, completed)
            active_statuses = ['accepted', 'confirmed']
            bookings = bookings_query.filter(status__in=active_statuses).order_by('-created_at')
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
        print(f"DEBUG: get_provider_requests called by user: {request.user.username}")
        print(f"DEBUG: User type: '{request.user.user_type}'")
        print(f"DEBUG: User role: '{request.user.role}'")

        if request.user.user_type != 'Service Provider':
            print(f"DEBUG: Access denied - user type is '{request.user.user_type}', expected 'Service Provider'")
            return Response(
                {'error': f'Only service providers can access this endpoint. Your user type: {request.user.user_type}'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if user has permission to view booking requests
        if not check_user_permission(request.user, 'view_booking_requests'):
            return Response(
                {'error': 'You do not have permission to view booking requests. Contact your administrator to grant "View Booking Requests" permission.'},
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

        # Check if user has permission to accept booking requests
        if not check_user_permission(request.user, 'accept_booking_requests'):
            return Response(
                {'error': 'You do not have permission to accept booking requests. Contact your administrator to grant "Accept Booking Requests" permission.'},
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

        # Validate time slot availability using centralized validator
        from .time_slot_validator import TimeSlotValidator

        is_valid, error_response = TimeSlotValidator.validate_time_slot(
            provider_id=request.user.id,
            service_date=booking.service_date,
            service_duration_hours=1,  # Default 1 hour service duration
            exclude_booking_id=booking.id  # Exclude current booking from conflict check
        )

        if not is_valid:
            return error_response

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


def check_user_permission(user, permission_codename):
    """Check if user has a specific permission based on their user_type and role"""
    from authentication.models import UserTypeRolePermission, Permission

    print(f"DEBUG: Checking permission '{permission_codename}' for user: {user.username}")
    print(f"DEBUG: User type: {user.user_type}, Role: {user.role}")

    try:
        permission = Permission.objects.get(codename=permission_codename)
        print(f"DEBUG: Found permission: {permission.name}")

        user_permission = UserTypeRolePermission.objects.get(
            user_type=user.user_type,
            role=user.role,
            permission=permission,
            is_granted=True
        )
        print(f"DEBUG: Permission granted: {user_permission}")
        return True
    except Permission.DoesNotExist:
        print(f"DEBUG: Permission '{permission_codename}' does not exist")
        return False
    except UserTypeRolePermission.DoesNotExist:
        print(f"DEBUG: User does not have permission '{permission_codename}' or it's not granted")
        # Check what permissions the user actually has
        user_perms = UserTypeRolePermission.objects.filter(
            user_type=user.user_type,
            role=user.role,
            is_granted=True
        )
        print(f"DEBUG: User's granted permissions: {[p.permission.codename for p in user_perms]}")
        return False

@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def cancel_booking_request(request, booking_id):
    """
    Cancel a booking request (customers and service providers)
    POST /api/bookings/{booking_id}/cancel/
    """
    try:
        print(f"DEBUG: Cancel request - User: {request.user.username}, Type: {request.user.user_type}, Role: {request.user.role}")

        # Check if user has permission to cancel bookings
        if not check_user_permission(request.user, 'cancel_bookings'):
            return Response(
                {'error': f'You do not have permission to cancel bookings. Contact your administrator to grant "Cancel Bookings" permission.'},
                status=status.HTTP_403_FORBIDDEN
            )

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

        # Set who cancelled the booking and reason
        cancellation_reason = request.data.get('cancellation_reason', '')
        if request.user.user_type == 'End User':
            booking.cancelled_by = 'customer'
            user_type_text = "Customer"
            if not cancellation_reason:
                cancellation_reason = "Customer requested cancellation"
        else:
            booking.cancelled_by = 'provider'
            user_type_text = "Service Provider"
            if not cancellation_reason:
                cancellation_reason = "Service provider cancelled the booking"

        booking.cancellation_reason = cancellation_reason

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


@api_view(['DELETE'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_booking_request(request, booking_id):
    """
    Permanently delete a booking (admin only)
    DELETE /api/bookings/{booking_id}/delete/
    """
    try:
        print(f"DEBUG: Delete request - User: {request.user.username}, Type: {request.user.user_type}, Role: {request.user.role}")

        # Check if user has permission to delete bookings
        if not check_user_permission(request.user, 'delete_bookings'):
            return Response(
                {'error': f'You do not have permission to delete bookings. Contact your administrator to grant "Delete Bookings" permission.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get booking
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Store booking info for response
        booking_info = {
            'id': booking.id,
            'customer': booking.customer,
            'subcategory': booking.subcategory.name,
            'status': booking.status
        }

        # Delete the booking permanently
        booking.delete()

        print(f"DEBUG: Successfully deleted booking {booking_id}")

        return Response({
            'message': 'Booking deleted permanently',
            'deleted_booking': booking_info
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_permissions(request):
    """
    Get permissions for the current user
    GET /api/user/permissions/
    """
    try:
        user = request.user
        print(f"DEBUG: Getting permissions for user: {user.username}, Type: {user.user_type}, Role: {user.role}")

        from authentication.models import UserTypeRolePermission

        # Get permissions for this user's type and role
        user_permissions = UserTypeRolePermission.objects.filter(
            user_type=user.user_type,
            role=user.role,
            is_granted=True
        ).select_related('permission')

        # Format permissions by category
        permissions_by_category = {}
        for user_perm in user_permissions:
            permission = user_perm.permission
            if permission.category not in permissions_by_category:
                permissions_by_category[permission.category] = []

            permissions_by_category[permission.category].append({
                'id': permission.id,
                'name': permission.name,
                'codename': permission.codename,
                'description': permission.description,
                'is_granted': True
            })

        # Also create a flat list for easy checking
        flat_permissions = {}
        for user_perm in user_permissions:
            flat_permissions[user_perm.permission.codename] = True

        print(f"DEBUG: Found {len(flat_permissions)} permissions for user")

        return Response({
            'permissions_by_category': permissions_by_category,
            'flat_permissions': flat_permissions,
            'user_type': user.user_type,
            'role': user.role
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"ERROR: Failed to get user permissions: {str(e)}")
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


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def respond_to_rating(request, rating_id):
    """
    Allow service providers to respond to customer reviews
    POST /api/bookings/ratings/{rating_id}/respond/
    Body: {
        "response": "Thank you for your feedback! We're glad you were satisfied with our service."
    }
    """
    try:
        # Ensure user is a service provider
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can respond to reviews'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if user has permission to respond to reviews
        from authentication.models import UserPermissionOverride, Permission
        try:
            # First check if there's a specific override for this user
            permission_obj = Permission.objects.get(codename='respond_to_reviews')
            override = UserPermissionOverride.objects.filter(
                user=request.user,
                permission=permission_obj
            ).first()

            if override:
                # User has a specific override
                if not override.is_granted:
                    return Response(
                        {'error': 'You do not have permission to respond to reviews'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # Check default role-based permissions
                from authentication.models import UserTypeRolePermission
                role_permission = UserTypeRolePermission.objects.filter(
                    user_type=request.user.user_type,
                    role=request.user.role,
                    permission=permission_obj
                ).first()

                if not role_permission or not role_permission.is_granted:
                    return Response(
                        {'error': 'You do not have permission to respond to reviews'},
                        status=status.HTTP_403_FORBIDDEN
                    )

        except Permission.DoesNotExist:
            return Response(
                {'error': 'Permission configuration error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Validate request data
        serializer = ProviderResponseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        response_text = serializer.validated_data['response']

        # Get the rating
        try:
            rating = ProviderRating.objects.get(
                id=rating_id,
                provider=request.user
            )
        except ProviderRating.DoesNotExist:
            return Response(
                {'error': 'Rating not found or you do not have permission to respond to it'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if response already exists
        if rating.provider_response:
            return Response(
                {'error': 'You have already responded to this review'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the rating with the response
        rating.provider_response = response_text
        rating.response_date = timezone.now()
        rating.save()

        # Return updated rating
        rating_serializer = ProviderRatingSerializer(rating)
        return Response({
            'message': 'Response submitted successfully',
            'rating': rating_serializer.data
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

            # Get bookings for this date range (all statuses that should be visible in availability management)
            # Include pending to show upcoming requests, and active statuses that block time slots
            active_booking_statuses = ['pending', 'accepted', 'confirmed', 'completed']
            bookings = Booking.objects.filter(
                provider=request.user.username,
                service_date__date__gte=start_date,
                service_date__date__lte=end_date,
                status__in=active_booking_statuses
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

        # Use centralized validator to get available slots
        from .time_slot_validator import TimeSlotValidator

        available_slots = TimeSlotValidator.get_available_slots(
            provider_id=provider_id,
            date=selected_date,
            service_duration_hours=1  # Default 1 hour service duration
        )

        # Determine message based on availability
        message = None
        if not available_slots:
            # Check specific reasons for no availability
            is_off_day = ProviderOffDay.objects.filter(
                provider=provider,
                date=selected_date
            ).exists()

            if is_off_day:
                message = 'Provider is off on this date'
            else:
                availability_slots = ProviderAvailability.objects.filter(
                    provider=provider,
                    date=selected_date,
                    is_available=True
                ).exists()

                if not availability_slots:
                    message = 'Provider has no availability slots for this date'
                else:
                    message = 'All time slots are booked for this date'

        response_data = {
            'provider_id': provider_id,
            'provider_name': provider.username,
            'date': selected_date,
            'available_slots': available_slots,
            'total_slots': len(available_slots)
        }

        if message:
            response_data['message'] = message

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
