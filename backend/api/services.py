"""
Services API Endpoints
Handles service categories, subcategories, and service management
"""
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from bookings.models import ServiceCategory, ServiceSubcategory, UserRegisteredService
from bookings.serializers import ServiceCategorySerializer, ServiceSubcategorySerializer
from authentication.views import PostgreSQLJWTAuthentication


@api_view(['GET'])
@permission_classes([AllowAny])
def get_service_categories(request):
    """
    Get all service categories
    GET /api/services/categories/
    """
    try:
        categories = ServiceCategory.objects.all().order_by('name')
        serializer = ServiceCategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_service_subcategories(request):
    """
    Get all service subcategories
    GET /api/services/subcategories/
    """
    try:
        subcategories = ServiceSubcategory.objects.select_related('category').all().order_by('category__name', 'name')
        serializer = ServiceSubcategorySerializer(subcategories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_services_by_category(request, category_id):
    """
    Get services by category ID
    GET /api/services/categories/{category_id}/services/
    """
    try:
        subcategories = ServiceSubcategory.objects.filter(category_id=category_id).order_by('name')
        serializer = ServiceSubcategorySerializer(subcategories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_provider_registered_services(request):
    """
    Get services registered by current provider
    GET /api/services/provider/registered/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        registered_relations = UserRegisteredService.objects.filter(user=request.user).select_related('service')
        services = [relation.service for relation in registered_relations]
        serializer = ServiceSubcategorySerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_provider_available_services(request):
    """
    Get services available for provider registration
    GET /api/services/provider/available/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can access this endpoint'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all services
        all_services = ServiceSubcategory.objects.all()
        
        # Get registered service IDs
        registered_service_ids = UserRegisteredService.objects.filter(
            user=request.user
        ).values_list('service_id', flat=True)
        
        # Filter out registered services
        available_services = all_services.exclude(id__in=registered_service_ids)
        
        serializer = ServiceSubcategorySerializer(available_services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def register_provider_service(request):
    """
    Register provider for a service
    POST /api/services/provider/register/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can register for services'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        service_id = request.data.get('service_id')
        if not service_id:
            return Response(
                {'error': 'service_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if service exists
        try:
            service = ServiceSubcategory.objects.get(id=service_id)
        except ServiceSubcategory.DoesNotExist:
            return Response(
                {'error': 'Service not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already registered
        if UserRegisteredService.objects.filter(user=request.user, service=service).exists():
            return Response(
                {'error': 'Already registered for this service'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Register for service
        UserRegisteredService.objects.create(user=request.user, service=service)
        
        return Response(
            {'message': f'Successfully registered for {service.name}'}, 
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def unregister_provider_service(request):
    """
    Unregister provider from a service
    DELETE /api/services/provider/unregister/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can unregister from services'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        service_id = request.data.get('service_id')
        if not service_id:
            return Response(
                {'error': 'service_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if registration exists
        try:
            registration = UserRegisteredService.objects.get(
                user=request.user, 
                service_id=service_id
            )
            service_name = registration.service.name
            registration.delete()
            
            return Response(
                {'message': f'Successfully unregistered from {service_name}'}, 
                status=status.HTTP_200_OK
            )
            
        except UserRegisteredService.DoesNotExist:
            return Response(
                {'error': 'Not registered for this service'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
