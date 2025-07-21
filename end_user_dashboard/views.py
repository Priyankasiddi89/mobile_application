from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bookings.models import Booking, ServiceCategory, ServiceSubcategory
from authentication.models import User
from authentication.views import MongoengineJWTAuthentication
import json

@api_view(['GET'])
@authentication_classes([MongoengineJWTAuthentication])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    """Get all bookings for the authenticated end user"""
    try:
        print(f"🔍 User bookings request received")
        print(f"🔍 Request headers: {dict(request.headers)}")
        print(f"🔍 Request user: {request.user}")
        print(f"🔍 User authenticated: {request.user.is_authenticated if hasattr(request.user, 'is_authenticated') else 'N/A'}")

        if hasattr(request.user, 'username'):
            print(f"🔍 User username: {request.user.username}")
            try:
                # Get bookings for the current user using MongoEngine
                bookings = Booking.objects.filter(customer=request.user.username)
                print(f"Found {len(bookings)} bookings for user {request.user.username}")
            except Exception as query_error:
                print(f"❌ Error querying bookings: {query_error}")
                # Return empty list if query fails
                return Response([])
        else:
            print(f"❌ User object has no username attribute")
            return Response({'error': 'User not properly authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        booking_data = []
        for booking in bookings:
            try:
                # Safely get subcategory name
                try:
                    service_name = booking.subcategory.name if booking.subcategory else 'Service Unavailable'
                except Exception as subcategory_error:
                    print(f"⚠️ Subcategory reference broken for booking {booking.id}: {subcategory_error}")
                    service_name = 'Service Unavailable (Deleted)'

                print(f"Processing booking: {booking.id} - {service_name}")

                # Format dates safely - use ISO format for JavaScript Date compatibility
                booking_date_str = None
                service_date_str = None
                created_at_str = None
                updated_at_str = None

                try:
                    if hasattr(booking, 'booking_date') and booking.booking_date:
                        booking_date_str = booking.booking_date.isoformat()
                except:
                    pass

                try:
                    if hasattr(booking, 'service_date') and booking.service_date:
                        # Handle both datetime and date objects
                        if hasattr(booking.service_date, 'isoformat'):
                            service_date_str = booking.service_date.isoformat()
                        else:
                            service_date_str = str(booking.service_date)
                except:
                    pass

                try:
                    if hasattr(booking, 'created_at') and booking.created_at:
                        created_at_str = booking.created_at.isoformat()
                except:
                    pass

                try:
                    if hasattr(booking, 'updated_at') and booking.updated_at:
                        updated_at_str = booking.updated_at.isoformat()
                except:
                    pass

                # Get subcategory object for frontend compatibility
                subcategory_obj = None
                try:
                    if booking.subcategory:
                        subcategory_obj = {
                            'name': service_name,
                            'id': str(booking.subcategory.id) if hasattr(booking.subcategory, 'id') else None
                        }
                except:
                    subcategory_obj = {
                        'name': service_name,
                        'id': None
                    }

                booking_data.append({
                    'id': str(booking.id),
                    'service_name': service_name,  # Keep for backward compatibility
                    'subcategory': subcategory_obj,  # Frontend expects this
                    'provider_name': booking.provider if booking.provider else 'Unassigned',
                    'booking_date': booking_date_str,
                    'service_date': service_date_str,
                    'status': booking.status if hasattr(booking, 'status') else 'unknown',
                    'price': float(booking.total_price) if (hasattr(booking, 'total_price') and booking.total_price) else 0.0,
                    'total_price': float(booking.total_price) if (hasattr(booking, 'total_price') and booking.total_price) else 0.0,  # Frontend expects this
                    'notes': booking.notes if (hasattr(booking, 'notes') and booking.notes) else 'No additional details provided',
                    'created_at': created_at_str,
                    'updated_at': updated_at_str,
                    'payment_status': booking.payment_status if hasattr(booking, 'payment_status') else 'unpaid',
                    'payment_method': booking.payment_method if hasattr(booking, 'payment_method') else 'online'
                })
            except Exception as booking_error:
                print(f"❌ Error processing booking {booking.id}: {booking_error}")
                # Add a fallback booking entry
                booking_data.append({
                    'id': str(booking.id),
                    'service_name': 'Error Loading Service',
                    'subcategory': {'name': 'Error Loading Service', 'id': None},
                    'provider_name': 'Unassigned',
                    'booking_date': None,
                    'service_date': None,
                    'status': getattr(booking, 'status', 'unknown'),
                    'price': 0.0,
                    'total_price': 0.0,
                    'notes': 'Error loading booking details',
                    'created_at': None,
                    'updated_at': None,
                    'payment_status': 'unpaid',
                    'payment_method': 'online'
                })

        print(f"Returning {len(booking_data)} bookings")
        return Response(booking_data)
    except Exception as e:
        print(f"Error in user_bookings: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([MongoengineJWTAuthentication])
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
@authentication_classes([MongoengineJWTAuthentication])
@permission_classes([IsAuthenticated])
def user_requests(request):
    """Get all service requests made by the authenticated end user"""
    try:
        # For now, return empty array since we haven't implemented requests yet
        # This can be expanded when we add request functionality
        return Response([])
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 