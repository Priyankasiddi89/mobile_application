# Clean PostgreSQL-only Service Provider Views
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from bookings.models import Booking, ServiceSubcategory, UserRegisteredService
from authentication.models import User
from authentication.views import PostgreSQLJWTAuthentication
from bookings.serializers import BookingSerializer, ServiceSubcategorySerializer
from datetime import datetime, timedelta
from decimal import Decimal

class ProviderProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def get(self, request):
        """Get current provider profile information"""
        user = request.user

        # Get provider statistics using Django ORM
        total_bookings = Booking.objects.filter(provider=user.username).count()
        completed_bookings = Booking.objects.filter(provider=user.username, status='completed').count()
        active_bookings = Booking.objects.filter(provider=user.username, status__in=['accepted', 'confirmed']).count()

        # Calculate total earnings
        completed_bookings_list = Booking.objects.filter(provider=user.username, status='completed')
        total_earnings = sum([booking.total_price for booking in completed_bookings_list])

        # Get registered services using UserRegisteredService model
        registered_service_relations = UserRegisteredService.objects.filter(user=user)
        registered_services_ids = [str(urs.service.id) for urs in registered_service_relations]

        return Response({
            'id': str(user.id),
            'username': user.username,
            'user_type': user.user_type,
            'role': user.role,
            'is_active': user.is_active,
            'registered_services': registered_services_ids,
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
    authentication_classes = [PostgreSQLJWTAuthentication]

    def get(self, request):
        """Get incoming booking requests for the current provider"""
        try:
            user = request.user
            print(f"🔍 Getting requests for provider: {user.username}")

            # Get user's registered services using UserRegisteredService model
            registered_service_relations = UserRegisteredService.objects.filter(user=user)
            registered_services = [urs.service for urs in registered_service_relations]

            print(f"🔧 Provider registered for {len(registered_services)} services")

            if not registered_services:
                print("❌ No registered services, returning empty list")
                return Response([])

            # Get all pending bookings for registered services
            requests = Booking.objects.filter(
                status='pending',
                provider__isnull=True,
                subcategory__in=registered_services
            ).order_by('-created_at')

            print(f"📋 Found {len(requests)} pending requests")

            # Filter out requests declined by this provider
            filtered_requests = []
            for booking in requests:
                try:
                    declined_providers = booking.get_declined_providers()
                    print(f"   📋 Booking {booking.id}:")
                    print(f"      declined_by field: '{booking.declined_by}' (type: {type(booking.declined_by)})")
                    print(f"      get_declined_providers(): {declined_providers} (type: {type(declined_providers)})")
                    print(f"      user.username: '{user.username}' (type: {type(user.username)})")
                    print(f"      user.username in declined_providers: {user.username in declined_providers}")

                    if user.username not in declined_providers:
                        filtered_requests.append(booking)
                        print(f"      ✅ INCLUDING booking {booking.id}")
                    else:
                        print(f"      ❌ EXCLUDING booking {booking.id} (declined by {user.username})")
                except Exception as e:
                    print(f"      ⚠️ Error processing booking {booking.id}: {e}")
                    import traceback
                    traceback.print_exc()
                    # If there's an issue with declined providers, include the request
                    filtered_requests.append(booking)

            print(f"🔧 Returning {len(filtered_requests)} filtered requests")

            # Use BookingSerializer for consistent response format
            serializer = BookingSerializer(filtered_requests, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"Error in ProviderIncomingRequestsView: {e}")
            import traceback
            traceback.print_exc()
            return Response([], status=status.HTTP_200_OK)

class ProviderServicesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def get(self, request):
        """Get services registered by the current provider"""
        try:
            user = request.user
            print(f"Getting registered services for provider: {user.username}")

            # Get registered services for this provider using UserRegisteredService model
            registered_service_relations = UserRegisteredService.objects.filter(user=user)
            registered_services = [urs.service for urs in registered_service_relations]

            print(f"Provider has {len(registered_services)} registered services")

            if not registered_services:
                print(f"No registered services found, returning empty list")
                return Response([])

            services_data = []

            for service in registered_services:
                try:
                    # Safely access service attributes
                    service_data = {
                        'id': str(service.id),
                        'name': getattr(service, 'name', 'Unknown Service'),
                        'description': getattr(service, 'description', ''),
                        'price': float(getattr(service, 'price', 0)),
                    }
                    
                    # Safely access category
                    if hasattr(service, 'category') and service.category:
                        try:
                            service_data['category'] = {
                                'id': str(service.category.id),
                                'name': service.category.name,
                                'description': getattr(service.category, 'description', '')
                            }
                        except Exception as cat_error:
                            print(f"Error accessing category for service {service.id}: {cat_error}")
                            service_data['category'] = {
                                'id': 'unknown',
                                'name': 'Unknown Category',
                                'description': ''
                            }
                    else:
                        service_data['category'] = {
                            'id': 'unknown',
                            'name': 'Unknown Category',
                            'description': ''
                        }
                    
                    services_data.append(service_data)
                    print(f"Added service: {service_data['name']}")
                except Exception as e:
                    print(f"Error processing service {service.id}: {e}")

            print(f"Returning {len(services_data)} services")
            return Response(services_data)
            
        except Exception as e:
            print(f"Error in ProviderServicesView.get: {e}")
            import traceback
            traceback.print_exc()
            return Response([], status=status.HTTP_200_OK)

    def post(self, request):
        """Register for a new service"""
        user = request.user
        service_id = request.data.get('service_id')

        if not service_id:
            return Response({'detail': 'Service ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = ServiceSubcategory.objects.get(id=service_id)
        except ServiceSubcategory.DoesNotExist:
            return Response({'detail': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if already registered using UserRegisteredService
        if UserRegisteredService.objects.filter(user=user, service=service).exists():
            return Response({'detail': 'Already registered for this service'}, status=status.HTTP_400_BAD_REQUEST)

        # Add service to registered services
        UserRegisteredService.objects.create(user=user, service=service)

        return Response({'detail': 'Successfully registered for service'}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Unregister from a service"""
        user = request.user
        service_id = request.data.get('service_id')

        if not service_id:
            return Response({'detail': 'Service ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = ServiceSubcategory.objects.get(id=service_id)
        except ServiceSubcategory.DoesNotExist:
            return Response({'detail': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

        # Remove service from registered services using UserRegisteredService
        registration = UserRegisteredService.objects.filter(user=user, service=service).first()
        if registration:
            registration.delete()
            return Response({'detail': 'Successfully unregistered from service'}, status=status.HTTP_200_OK)

        return Response({'detail': 'Not registered for this service'}, status=status.HTTP_400_BAD_REQUEST)

class ProviderBookingsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def get(self, request):
        """Get all bookings for the current provider"""
        user = request.user
        booking_status = request.query_params.get('status', None)

        print(f"Getting bookings for provider: {user.username}")

        # Filter bookings by status if provided
        if booking_status:
            if ',' in booking_status:
                status_list = [status.strip() for status in booking_status.split(',')]
                print(f"Filtering bookings for provider {user.username} with statuses: {status_list}")
                bookings = Booking.objects.filter(provider=user.username, status__in=status_list).order_by('-created_at')
            else:
                print(f"Filtering bookings for provider {user.username} with status: {booking_status}")
                bookings = Booking.objects.filter(provider=user.username, status=booking_status).order_by('-created_at')
        else:
            print(f"Getting all bookings for provider {user.username}")
            bookings = Booking.objects.filter(provider=user.username).order_by('-created_at')

        print(f"Found {len(bookings)} bookings")

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

# Accept and Decline Request Views
class AcceptRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]
    
    def post(self, request, booking_id):
        """Accept a pending request (service provider)"""
        try:
            booking = Booking.objects.get(id=booking_id, status='pending', provider__isnull=True)
        except Booking.DoesNotExist:
            return Response({'detail': 'Request not found or already accepted'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if provider is registered for this service
        user = request.user
        if not UserRegisteredService.objects.filter(user=user, service=booking.subcategory).exists():
            return Response({'detail': 'You are not registered for this service'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'accepted'
        booking.provider = user.username
        booking.save()
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class DeclineRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]
    
    def post(self, request, booking_id):
        """Decline a pending request (service provider)"""
        try:
            booking = Booking.objects.get(id=booking_id, status='pending', provider__isnull=True)
        except Booking.DoesNotExist:
            return Response({'detail': 'Request not found or already accepted'}, status=status.HTTP_404_NOT_FOUND)

        # Add to declined list
        user = request.user
        print(f"🚫 Provider {user.username} declining booking {booking_id}")
        print(f"   Before decline - declined_by: {booking.declined_by}")

        booking.add_declined_provider(user.username)

        print(f"   After decline - declined_by: {booking.declined_by}")
        print(f"   Declined providers list: {booking.get_declined_providers()}")

        serializer = BookingSerializer(booking)
        return Response({
            'booking': serializer.data,
            'message': 'Request declined successfully',
            'declined_by': booking.get_declined_providers()
        })

# Additional views required by URLs
class UpdateBookingStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def post(self, request, booking_id):
        """Update booking status"""
        return self._update_status(request, booking_id)

    def put(self, request, booking_id):
        """Update booking status (PUT method)"""
        return self._update_status(request, booking_id)

    def _update_status(self, request, booking_id):
        """Common method to update booking status"""
        try:
            booking = Booking.objects.get(id=booking_id, provider=request.user.username)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status in ['accepted', 'confirmed', 'completed', 'cancelled']:
            booking.status = new_status
            booking.save()
            serializer = BookingSerializer(booking)
            return Response(serializer.data)

        return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class CompleteBookingView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def post(self, request, booking_id):
        """Mark booking as completed with payment handling"""
        try:
            booking = Booking.objects.get(id=booking_id, provider=request.user.username)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get payment method from request
        payment_method = request.data.get('payment_method', 'cod')  # Default to COD

        # Update booking status and payment info
        booking.status = 'completed'
        booking.payment_method = payment_method

        # If COD, mark as paid immediately
        if payment_method == 'cod':
            booking.payment_status = 'paid'
        else:
            booking.payment_status = 'pending'  # For online payments

        booking.save()

        # Prepare response
        serializer = BookingSerializer(booking)

        # Calculate updated stats for response
        user = request.user
        total_bookings = Booking.objects.filter(provider=user.username).count()
        completed_bookings = Booking.objects.filter(provider=user.username, status='completed').count()
        active_bookings = Booking.objects.filter(provider=user.username, status__in=['accepted', 'confirmed']).count()

        response_data = {
            'booking': serializer.data,
            'message': f'Service completed successfully! Payment of ${float(booking.total_price):.2f} {"collected via COD" if payment_method == "cod" else "pending online payment"}.',
            'payment_required': payment_method != 'cod',
            'updated_stats': {
                'total_bookings': total_bookings,
                'completed_bookings': completed_bookings,
                'active_bookings': active_bookings
            }
        }

        return Response(response_data)

class ProcessPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def post(self, request, booking_id):
        """Process payment for booking"""
        try:
            booking = Booking.objects.get(id=booking_id, provider=request.user.username)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        booking.payment_status = 'paid'
        booking.save()
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class ProviderEarningsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def get(self, request):
        """Get provider earnings with detailed breakdown"""
        user = request.user

        # Get all completed bookings
        completed_bookings = Booking.objects.filter(provider=user.username, status='completed')
        total_earnings = sum([float(booking.total_price) if booking.total_price is not None else 0.0 for booking in completed_bookings])

        # Calculate earnings by service
        earnings_by_service = {}
        for booking in completed_bookings:
            service_name = booking.subcategory.name if booking.subcategory else 'Unknown Service'
            if service_name not in earnings_by_service:
                earnings_by_service[service_name] = {
                    'total': 0.0,  # Frontend expects 'total', not 'earnings'
                    'count': 0     # Frontend expects 'count', not 'jobs'
                }
            # Safely handle total_price
            price = float(booking.total_price) if booking.total_price is not None else 0.0
            earnings_by_service[service_name]['total'] += price
            earnings_by_service[service_name]['count'] += 1

        # For now, return total earnings (weekly/monthly can be added later)
        return Response({
            'total_earnings': float(total_earnings),
            'total_completed_jobs': len(completed_bookings),
            'weekly_earnings': float(total_earnings),  # TODO: Calculate actual weekly
            'weekly_completed_jobs': len(completed_bookings),  # TODO: Calculate actual weekly
            'monthly_earnings': float(total_earnings),  # TODO: Calculate actual monthly
            'monthly_completed_jobs': len(completed_bookings),  # TODO: Calculate actual monthly
            'earnings_by_service': earnings_by_service if earnings_by_service else {}
        })

class ProviderDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def get(self, request):
        """Get provider dashboard statistics"""
        user = request.user

        # Get registered services for this provider
        registered_service_relations = UserRegisteredService.objects.filter(user=user)
        registered_services = [urs.service for urs in registered_service_relations]

        total_bookings = Booking.objects.filter(provider=user.username).count()
        active_bookings = Booking.objects.filter(provider=user.username, status__in=['accepted', 'confirmed']).count()
        completed_bookings = Booking.objects.filter(provider=user.username, status='completed').count()

        # Only count pending requests for services this provider is registered for
        # AND filter out requests this provider has declined
        if registered_services:
            pending_requests_queryset = Booking.objects.filter(
                status='pending',
                provider__isnull=True,
                subcategory__in=registered_services
            )

            # Filter out requests declined by this provider
            filtered_pending_requests = []
            for booking in pending_requests_queryset:
                try:
                    declined_providers = booking.get_declined_providers()
                    if user.username not in declined_providers:
                        filtered_pending_requests.append(booking)
                except:
                    # If there's an issue with declined providers, include the request
                    filtered_pending_requests.append(booking)

            pending_requests = len(filtered_pending_requests)
        else:
            pending_requests = 0

        total_earnings = sum([float(booking.total_price) if booking.total_price is not None else 0.0 for booking in Booking.objects.filter(provider=user.username, status='completed')])

        # Calculate completion rate
        completion_rate = round((completed_bookings / total_bookings * 100) if total_bookings > 0 else 0, 2)

        return Response({
            'total_bookings': total_bookings,
            'pending_requests_count': pending_requests,
            'active_bookings_count': active_bookings,
            'completed_bookings_count': completed_bookings,
            'total_earnings': float(total_earnings),
            'completion_rate': completion_rate,
            'registered_services_count': len(registered_services)
        })
