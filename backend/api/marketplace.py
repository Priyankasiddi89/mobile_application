"""
Marketplace API endpoints for provider pricing and customer selection
"""
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Count, Q
from django.contrib.auth import get_user_model
from bookings.models import ServiceSubcategory, UserRegisteredService, Booking, ProviderRating
from authentication.views import PostgreSQLJWTAuthentication
import json

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_service_with_price(request):
    """
    Provider registers for a service with custom pricing
    POST /api/marketplace/register-service/
    Body: {
        "service_id": 1,
        "provider_price": 500.00,
        "description": "Professional cleaning with eco-friendly products",
        "is_available": true
    }
    """
    try:
        user = request.user
        
        if user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can register for services'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        service_id = request.data.get('service_id')
        provider_price = request.data.get('provider_price')
        description = request.data.get('description', '')
        is_available = request.data.get('is_available', True)
        
        if not service_id or not provider_price:
            return Response(
                {'error': 'service_id and provider_price are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            service = ServiceSubcategory.objects.get(id=service_id)
        except ServiceSubcategory.DoesNotExist:
            return Response(
                {'error': 'Service not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or update provider service registration
        provider_service, created = UserRegisteredService.objects.update_or_create(
            user=user,
            service=service,
            defaults={
                'provider_price': provider_price,
                'description': description,
                'is_available': is_available
            }
        )
        
        return Response({
            'message': 'Service registered successfully' if created else 'Service updated successfully',
            'service': {
                'id': provider_service.id,
                'service_name': service.name,
                'category': service.category.name,
                'provider_price': float(provider_service.provider_price),
                'base_price': float(service.price),
                'description': provider_service.description,
                'is_available': provider_service.is_available,
                'registered_at': provider_service.registered_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_providers(request, service_id):
    """
    Get all available providers for a specific service with their pricing and ratings
    GET /api/marketplace/service/{service_id}/providers/
    """
    try:
        try:
            service = ServiceSubcategory.objects.get(id=service_id)
        except ServiceSubcategory.DoesNotExist:
            return Response(
                {'error': 'Service not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all providers registered for this service
        provider_services = UserRegisteredService.objects.filter(
            service=service,
            is_available=True,
            user__is_active=True,
            user__user_type='Service Provider'
        ).select_related('user')
        
        providers_data = []
        
        for provider_service in provider_services:
            provider = provider_service.user
            
            # Calculate provider's average rating
            provider_ratings = ProviderRating.objects.filter(provider=provider)
            avg_rating = provider_ratings.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0

            # Count total ratings and reviews with text
            total_ratings = provider_ratings.count()
            total_reviews = provider_ratings.filter(
                review__isnull=False
            ).exclude(review='').exclude(review__exact='').count()
            
            # Count completed bookings
            completed_bookings = Booking.objects.filter(
                provider=provider.username,
                status='completed'
            ).count()
            
            providers_data.append({
                'provider_id': provider.id,
                'provider_name': provider.username,
                'provider_email': provider.email,
                'provider_price': float(provider_service.provider_price),
                'base_price': float(service.price),
                'price_difference': float(provider_service.provider_price - service.price),
                'description': provider_service.description,
                'rating': round(avg_rating, 1),
                'total_ratings': total_ratings,
                'total_reviews': total_reviews,
                'completed_bookings': completed_bookings,
                'registered_at': provider_service.registered_at.isoformat()
            })
        
        # Sort by rating (highest first), then by price (lowest first)
        providers_data.sort(key=lambda x: (-x['rating'], x['provider_price']))
        
        return Response({
            'service': {
                'id': service.id,
                'name': service.name,
                'category': service.category.name,
                'base_price': float(service.price)
            },
            'providers': providers_data,
            'total_providers': len(providers_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_provider_specific_booking(request):
    """
    Create a booking request for a specific provider
    POST /api/marketplace/book-provider/
    Body: {
        "provider_id": 2,
        "service_id": 1,
        "service_date": "2024-01-15T10:00:00Z",
        "notes": "Need deep cleaning for 3-bedroom apartment"
    }
    """
    try:
        user = request.user

        # Check if user has permission to create bookings
        from authentication.models import UserTypeRolePermission, Permission

        def check_user_permission(user, permission_codename):
            try:
                permission = Permission.objects.get(codename=permission_codename)
                user_permission = UserTypeRolePermission.objects.get(
                    user_type=user.user_type,
                    role=user.role,
                    permission=permission,
                    is_granted=True
                )
                return True
            except (Permission.DoesNotExist, UserTypeRolePermission.DoesNotExist):
                return False

        if not check_user_permission(user, 'create_bookings'):
            return Response(
                {'error': 'You do not have permission to create bookings. Contact your administrator to grant "Create Bookings" permission.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if user.user_type != 'End User':
            return Response(
                {'error': 'Only end users can create bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        provider_id = request.data.get('provider_id')
        service_id = request.data.get('service_id')
        service_date = request.data.get('service_date')
        notes = request.data.get('notes', '')
        address = request.data.get('address', '')

        if not all([provider_id, service_id, service_date]):
            return Response(
                {'error': 'provider_id, service_id, and service_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate provider
        try:
            provider = User.objects.get(id=provider_id, user_type='Service Provider', is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Provider not found or inactive'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate service
        try:
            service = ServiceSubcategory.objects.get(id=service_id)
        except ServiceSubcategory.DoesNotExist:
            return Response(
                {'error': 'Service not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if provider offers this service
        try:
            provider_service = UserRegisteredService.objects.get(
                user=provider,
                service=service,
                is_available=True
            )
        except UserRegisteredService.DoesNotExist:
            return Response(
                {'error': 'Provider does not offer this service or is currently unavailable'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create booking with provider-specific pricing
        from django.utils import timezone
        from django.utils.dateparse import parse_datetime

        # Parse service_date if it's a string
        if isinstance(service_date, str):
            service_date = parse_datetime(service_date)

        # Validate time slot availability using centralized validator
        from .time_slot_validator import TimeSlotValidator

        validator = TimeSlotValidator(
            provider_id=provider.id,
            service_date=service_date,
            service_subcategory=service
        )

        is_valid, error_response = validator.validate_all()

        if not is_valid:
            return error_response

        booking = Booking.objects.create(
            customer=user.username,
            provider=provider.username,  # Assign the specific provider
            subcategory=service,
            booking_date=timezone.now(),  # Set current time as booking date
            service_date=service_date,
            total_price=provider_service.provider_price,  # Use provider's custom price
            notes=notes,
            address=address,  # Include service address
            status='pending'  # Start as pending - provider needs to accept
        )
        
        return Response({
            'message': 'Booking request sent successfully! The provider will review and respond to your request.',
            'booking': {
                'id': booking.id,
                'customer': booking.customer,
                'provider': booking.provider,
                'service': service.name,
                'category': service.category.name,
                'service_date': booking.service_date.isoformat(),
                'total_price': float(booking.total_price),
                'status': booking.status,
                'notes': booking.notes,
                'address': booking.address,
                'created_at': booking.created_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_provider(request):
    """
    Rate a provider after service completion
    POST /api/marketplace/rate-provider/
    Body: {
        "booking_id": 1,
        "rating": 5,
        "review": "Excellent service, very professional"
    }
    """
    try:
        user = request.user
        
        if user.user_type != 'End User':
            return Response(
                {'error': 'Only end users can rate providers'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking_id = request.data.get('booking_id')
        rating = request.data.get('rating')
        review = request.data.get('review', '')
        
        if not booking_id or not rating:
            return Response(
                {'error': 'booking_id and rating are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if rating not in range(1, 6):
            return Response(
                {'error': 'Rating must be between 1 and 5'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate booking
        try:
            booking = Booking.objects.get(
                id=booking_id,
                customer=user.username,
                status='completed'
            )
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found or not completed'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get provider
        try:
            provider = User.objects.get(username=booking.provider)
        except User.DoesNotExist:
            return Response(
                {'error': 'Provider not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or update rating
        provider_rating, created = ProviderRating.objects.update_or_create(
            provider=provider,
            customer=user,
            booking=booking,
            defaults={
                'rating': rating,
                'review': review
            }
        )
        
        return Response({
            'message': 'Rating submitted successfully' if created else 'Rating updated successfully',
            'rating': {
                'id': provider_rating.id,
                'provider': provider.username,
                'rating': provider_rating.rating,
                'review': provider_rating.review,
                'created_at': provider_rating.created_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_provider_profile(request, provider_id):
    """
    Get detailed provider profile with ratings and services
    GET /api/marketplace/provider/{provider_id}/profile/
    """
    try:
        try:
            provider = User.objects.get(id=provider_id, user_type='Service Provider', is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Provider not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get provider's services with pricing
        provider_services = UserRegisteredService.objects.filter(
            user=provider,
            is_available=True
        ).select_related('service', 'service__category')

        services_data = []
        for ps in provider_services:
            services_data.append({
                'service_id': ps.service.id,
                'service_name': ps.service.name,
                'category': ps.service.category.name,
                'provider_price': float(ps.provider_price),
                'base_price': float(ps.service.price),
                'description': ps.description
            })

        # Get ratings and reviews
        ratings = ProviderRating.objects.filter(provider=provider).order_by('-created_at')

        reviews_data = []
        total_rating = 0
        for rating in ratings:
            reviews_data.append({
                'customer': rating.customer.username,
                'rating': rating.rating,
                'review': rating.review,
                'created_at': rating.created_at.isoformat()
            })
            total_rating += rating.rating

        avg_rating = round(total_rating / len(reviews_data), 1) if reviews_data else 0

        # Get completed bookings count
        completed_bookings = Booking.objects.filter(
            provider=provider.username,
            status='completed'
        ).count()

        return Response({
            'provider': {
                'id': provider.id,
                'username': provider.username,
                'email': provider.email,
                'role': provider.role,
                'date_joined': provider.date_joined.isoformat()
            },
            'statistics': {
                'average_rating': avg_rating,
                'total_reviews': len(reviews_data),
                'completed_bookings': completed_bookings,
                'services_offered': len(services_data)
            },
            'services': services_data,
            'reviews': reviews_data[:10]  # Latest 10 reviews
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_service_availability(request, service_registration_id):
    """
    Update provider's service availability and pricing
    PUT /api/marketplace/service-registration/{service_registration_id}/
    Body: {
        "provider_price": 600.00,
        "is_available": false,
        "description": "Updated service description"
    }
    """
    try:
        user = request.user

        if user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can update their services'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            provider_service = UserRegisteredService.objects.get(
                id=service_registration_id,
                user=user
            )
        except UserRegisteredService.DoesNotExist:
            return Response(
                {'error': 'Service registration not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update fields if provided
        if 'provider_price' in request.data:
            provider_service.provider_price = request.data['provider_price']

        if 'is_available' in request.data:
            provider_service.is_available = request.data['is_available']

        if 'description' in request.data:
            provider_service.description = request.data['description']

        provider_service.save()

        return Response({
            'message': 'Service updated successfully',
            'service': {
                'id': provider_service.id,
                'service_name': provider_service.service.name,
                'provider_price': float(provider_service.provider_price),
                'is_available': provider_service.is_available,
                'description': provider_service.description
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_provider_services(request, provider_id):
    """Get all services offered by a specific provider - accessible by all authenticated users"""
    try:
        from authentication.models import User
        from bookings.models import UserRegisteredService, ServiceSubcategory

        # Get provider
        try:
            provider = User.objects.get(id=provider_id, user_type='Service Provider')
        except User.DoesNotExist:
            return Response(
                {'error': 'Provider not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all services registered by this provider
        registered_services = UserRegisteredService.objects.filter(
            user=provider
        ).select_related('service', 'service__category')

        services_data = []
        for reg_service in registered_services:
            services_data.append({
                'id': reg_service.id,
                'subcategory_id': reg_service.service.id,
                'subcategory_name': reg_service.service.name,
                'category_name': reg_service.service.category.name,
                'description': reg_service.description or reg_service.service.description,
                'provider_id': str(provider.id),
                'provider_name': provider.username,
                'provider_price': float(reg_service.provider_price),
                'is_available': reg_service.is_available,
                'created_at': reg_service.registered_at.isoformat() if reg_service.registered_at else None
            })

        return Response(services_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
