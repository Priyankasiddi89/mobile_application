from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from authentication.models import User
from authentication.views import MongoengineJWTAuthentication
from bookings.models import Booking, ServiceCategory, ServiceSubcategory
from bookings.serializers import BookingSerializer, ServiceSubcategorySerializer
from datetime import datetime, timedelta
from decimal import Decimal

class ProviderProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def get(self, request):
        """Get current provider profile information"""
        user = request.user

        # Get provider statistics
        total_bookings = Booking.objects(provider=user.username).count()
        completed_bookings = Booking.objects(provider=user.username, status='completed').count()
        active_bookings = Booking.objects(provider=user.username, status__in=['accepted', 'confirmed']).count()

        # Calculate total earnings
        completed_bookings_list = Booking.objects(provider=user.username, status='completed')
        total_earnings = sum([booking.total_price for booking in completed_bookings_list])

        return Response({
            'id': str(user.id),
            'username': user.username,
            'user_type': user.user_type,
            'role': user.role,
            'is_active': user.is_active,
            'registered_services': [str(service.id) for service in user.registered_services],
            'statistics': {
                'total_bookings': total_bookings,
                'completed_bookings': completed_bookings,
                'active_bookings': active_bookings,
                'total_earnings': float(total_earnings),
                'completion_rate': round((completed_bookings / total_bookings * 100) if total_bookings > 0 else 0, 2)
            }
        })

class ProviderIncomingRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def get(self, request):
        """Get incoming booking requests for the current provider"""
        user = request.user

        # Get user's registered services
        registered_service_ids = [str(service.id) for service in user.registered_services]

        if not registered_service_ids:
            # If provider has no registered services, return empty list
            return Response([])

        # Get bookings that are:
        # - pending status
        # - no provider assigned (provider=None)
        # - haven't been declined by this provider
        # - for services this provider is registered for
        requests = Booking.objects(
            status='pending',
            provider=None,
            declined_by__ne=user.username,
            subcategory__in=user.registered_services
        ).order_by('-created_at')

        serializer = BookingSerializer(requests, many=True)
        return Response(serializer.data)

class ProviderServicesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def get(self, request):
        """Get services registered by the current provider"""
        user = request.user

        # Get registered services for this provider
        registered_services = user.registered_services
        services_data = []

        for service in registered_services:
            services_data.append({
                'id': str(service.id),
                'name': service.name,
                'description': service.description,
                'price': float(service.price),
                'category': {
                    'id': str(service.category.id),
                    'name': service.category.name,
                    'description': service.category.description
                }
            })

        return Response(services_data)

    def post(self, request):
        """Register for a new service"""
        user = request.user
        service_id = request.data.get('service_id')

        if not service_id:
            return Response({'detail': 'Service ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = ServiceSubcategory.objects(id=service_id).first()
        if not service:
            return Response({'detail': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if already registered
        if service in user.registered_services:
            return Response({'detail': 'Already registered for this service'}, status=status.HTTP_400_BAD_REQUEST)

        # Add service to registered services
        user.registered_services.append(service)
        user.save()

        return Response({'detail': 'Successfully registered for service'}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Unregister from a service"""
        user = request.user
        service_id = request.data.get('service_id')

        if not service_id:
            return Response({'detail': 'Service ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = ServiceSubcategory.objects(id=service_id).first()
        if not service:
            return Response({'detail': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

        # Remove service from registered services
        if service in user.registered_services:
            user.registered_services.remove(service)
            user.save()
            return Response({'detail': 'Successfully unregistered from service'}, status=status.HTTP_200_OK)

        return Response({'detail': 'Not registered for this service'}, status=status.HTTP_400_BAD_REQUEST)

class ProviderBookingsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def get(self, request):
        """Get all bookings for the current provider"""
        user = request.user
        booking_status = request.query_params.get('status', None)

        # Filter bookings by status if provided
        if booking_status:
            # Handle multiple statuses separated by comma
            if ',' in booking_status:
                status_list = [status.strip() for status in booking_status.split(',')]
                print(f"Filtering bookings for provider {user.username} with statuses: {status_list}")
                bookings = Booking.objects(provider=user.username, status__in=status_list).order_by('-created_at')
            else:
                print(f"Filtering bookings for provider {user.username} with status: {booking_status}")
                bookings = Booking.objects(provider=user.username, status=booking_status).order_by('-created_at')
        else:
            print(f"Getting all bookings for provider {user.username}")
            bookings = Booking.objects(provider=user.username).order_by('-created_at')

        print(f"Found {len(bookings)} bookings")

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

class AcceptRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def post(self, request, booking_id):
        """Accept a pending request"""
        user = request.user

        booking = Booking.objects(id=booking_id, status='pending', provider=None).first()
        if not booking:
            return Response({'detail': 'Request not found or already accepted'}, status=status.HTTP_404_NOT_FOUND)

        # Check if provider is registered for this service
        if booking.subcategory not in user.registered_services:
            return Response({'detail': 'You are not registered for this service'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'accepted'
        booking.provider = user.username
        booking.save()

        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class DeclineRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def post(self, request, booking_id):
        """Decline a pending request"""
        user = request.user

        booking = Booking.objects(id=booking_id, status='pending', provider=None).first()
        if not booking:
            return Response({'detail': 'Request not found or already accepted'}, status=status.HTTP_404_NOT_FOUND)

        if user.username not in booking.declined_by:
            booking.declined_by.append(user.username)
            booking.save()

        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class UpdateBookingStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def put(self, request, booking_id):
        """Update booking status (confirm, complete, etc.)"""
        user = request.user
        new_status = request.data.get('status')
        payment_method = request.data.get('payment_method', 'online')  # 'online' or 'cod'

        if not new_status:
            return Response({'detail': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)

        booking = Booking.objects(id=booking_id, provider=user.username).first()
        if not booking:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        # Validate status transitions
        valid_transitions = {
            'accepted': ['confirmed', 'cancelled'],
            'confirmed': ['completed', 'cancelled'],
            'completed': [],  # No transitions from completed
            'cancelled': []   # No transitions from cancelled
        }

        if booking.status not in valid_transitions or new_status not in valid_transitions[booking.status]:
            return Response({'detail': 'Invalid status transition'}, status=status.HTTP_400_BAD_REQUEST)

        # Update booking status
        booking.status = new_status

        # If marking as completed, handle payment method
        if new_status == 'completed':
            if payment_method == 'cod':
                booking.payment_status = 'paid'  # COD is considered paid upon completion
                booking.payment_method = 'cod'
            else:
                booking.payment_status = 'pending'  # Online payment pending
                booking.payment_method = 'online'

        booking.save()

        # Send notification to end user if completed
        if new_status == 'completed':
            self._notify_customer_completion(booking)

        serializer = BookingSerializer(booking)
        return Response(serializer.data)

    def _notify_customer_completion(self, booking):
        """Send notification to customer about service completion"""
        # TODO: Implement actual notification system (email, SMS, push notification)
        print(f"NOTIFICATION: Service '{booking.subcategory.name}' completed for customer {booking.customer}")
        print(f"  - Booking ID: {booking.id}")
        print(f"  - Total Amount: ${booking.total_price}")
        print(f"  - Payment Status: {booking.payment_status}")
        print(f"  - Payment Method: {getattr(booking, 'payment_method', 'online')}")

class CompleteBookingView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def post(self, request, booking_id):
        """Mark booking as completed with payment method"""
        user = request.user
        payment_method = request.data.get('payment_method', 'online')  # 'online' or 'cod'

        print(f"CompleteBookingView: Looking for booking {booking_id} for provider {user.username}")
        print(f"Payment method: {payment_method}")

        # Debug: Check if booking exists at all
        booking_exists = Booking.objects(id=booking_id).first()
        if booking_exists:
            print(f"Booking exists with provider: {booking_exists.provider}")
        else:
            print(f"No booking found with ID: {booking_id}")

        booking = Booking.objects(id=booking_id, provider=user.username).first()
        if not booking:
            print(f"Booking not found for provider {user.username}")
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        if booking.status not in ['accepted', 'confirmed']:
            return Response({'detail': 'Booking cannot be completed from current status'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Mark as completed
        booking.status = 'completed'

        # Handle payment based on method
        if payment_method == 'cod':
            booking.payment_status = 'paid'  # COD is considered paid upon completion
            booking.payment_method = 'cod'
            message = f'Service completed successfully! Payment of ${booking.total_price} collected via COD.'
        else:
            booking.payment_status = 'pending'  # Online payment pending
            booking.payment_method = 'online'
            message = f'Service completed successfully! Customer needs to pay ${booking.total_price} online.'

        booking.save()

        # Send notification to customer
        self._notify_customer_completion(booking)

        serializer = BookingSerializer(booking)
        return Response({
            'booking': serializer.data,
            'message': message,
            'payment_required': payment_method == 'online'
        })

    def _notify_customer_completion(self, booking):
        """Send notification to customer about service completion"""
        # TODO: Implement actual notification system (email, SMS, push notification)
        print(f"NOTIFICATION: Service '{booking.subcategory.name}' completed for customer {booking.customer}")
        print(f"  - Booking ID: {booking.id}")
        print(f"  - Total Amount: ${booking.total_price}")
        print(f"  - Payment Status: {booking.payment_status}")
        print(f"  - Payment Method: {getattr(booking, 'payment_method', 'online')}")

class ProcessPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def post(self, request, booking_id):
        """Process payment for completed booking (for end users)"""
        user = request.user

        booking = Booking.objects(id=booking_id, customer=user.username).first()
        if not booking:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != 'completed':
            return Response({'detail': 'Booking must be completed before payment'},
                          status=status.HTTP_400_BAD_REQUEST)

        if booking.payment_status == 'paid':
            return Response({'detail': 'Payment already processed'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Process payment (simulate payment processing)
        # TODO: Integrate with actual payment gateway
        booking.payment_status = 'paid'
        booking.save()

        # Notify service provider about payment
        print(f"NOTIFICATION: Payment of ${booking.total_price} received for booking {booking.id}")
        print(f"  - Service Provider: {booking.provider}")
        print(f"  - Service: {booking.subcategory.name}")

        serializer = BookingSerializer(booking)
        return Response({
            'booking': serializer.data,
            'message': f'Payment of ${booking.total_price} processed successfully!'
        })

class ProviderEarningsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def get(self, request):
        """Get earnings statistics for the provider"""
        user = request.user

        # Get completed bookings
        completed_bookings = Booking.objects(provider=user.username, status='completed')

        # Calculate total earnings
        total_earnings = sum([booking.total_price for booking in completed_bookings])

        # Calculate monthly earnings (current month)
        current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_bookings = completed_bookings.filter(created_at__gte=current_month_start)
        monthly_earnings = sum([booking.total_price for booking in monthly_bookings])

        # Calculate weekly earnings
        week_start = datetime.now() - timedelta(days=7)
        weekly_bookings = completed_bookings.filter(created_at__gte=week_start)
        weekly_earnings = sum([booking.total_price for booking in weekly_bookings])

        # Get earnings by service
        earnings_by_service = {}
        for booking in completed_bookings:
            service_name = booking.subcategory.name
            if service_name not in earnings_by_service:
                earnings_by_service[service_name] = {
                    'total': 0,
                    'count': 0
                }
            earnings_by_service[service_name]['total'] += float(booking.total_price)
            earnings_by_service[service_name]['count'] += 1

        return Response({
            'total_earnings': float(total_earnings),
            'monthly_earnings': float(monthly_earnings),
            'weekly_earnings': float(weekly_earnings),
            'total_completed_jobs': len(completed_bookings),
            'monthly_completed_jobs': len(monthly_bookings),
            'weekly_completed_jobs': len(weekly_bookings),
            'earnings_by_service': earnings_by_service
        })

class ProviderDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def get(self, request):
        """Get dashboard statistics for the provider"""
        user = request.user

        # Get all bookings for this provider
        all_bookings = Booking.objects(provider=user.username)

        # Only show pending requests for services this provider is registered for
        if user.registered_services:
            pending_requests = Booking.objects(
                status='pending',
                provider=None,
                declined_by__ne=user.username,
                subcategory__in=user.registered_services
            )
        else:
            pending_requests = []  # No registered services = no pending requests

        active_bookings = Booking.objects(provider=user.username, status__in=['accepted', 'confirmed'])
        completed_bookings = Booking.objects(provider=user.username, status='completed')

        # Debug logging
        print(f"Dashboard stats for provider {user.username}:")
        print(f"  - Registered services: {len(user.registered_services)}")
        print(f"  - All bookings: {len(all_bookings)}")
        print(f"  - Pending requests (filtered): {len(pending_requests)}")
        print(f"  - Active bookings: {len(active_bookings)}")
        print(f"  - Completed bookings: {len(completed_bookings)}")
        if len(active_bookings) > 0:
            print(f"  - Active booking statuses: {[booking.status for booking in active_bookings]}")
        if len(pending_requests) > 0:
            print(f"  - Pending request services: {[req.subcategory.name for req in pending_requests]}")

        # Calculate completion rate
        total_bookings = len(all_bookings)
        completion_rate = (len(completed_bookings) / total_bookings * 100) if total_bookings > 0 else 0

        # Get recent activity (last 5 bookings)
        recent_bookings = Booking.objects(provider=user.username).order_by('-created_at')[:5]
        recent_activity = []
        for booking in recent_bookings:
            recent_activity.append({
                'id': str(booking.id),
                'service_name': booking.subcategory.name,
                'customer_name': booking.customer,
                'status': booking.status,
                'created_at': booking.created_at.isoformat(),
                'total_price': float(booking.total_price)
            })

        return Response({
            'pending_requests_count': len(pending_requests),
            'active_bookings_count': len(active_bookings),
            'completed_bookings_count': len(completed_bookings),
            'total_bookings_count': total_bookings,
            'completion_rate': round(completion_rate, 2),
            'registered_services_count': len(user.registered_services),
            'recent_activity': recent_activity
        })