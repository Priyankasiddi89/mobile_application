"""
Analytics API Endpoints
Handles dashboard statistics, earnings, and performance metrics
"""
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum
from bookings.models import Booking, UserRegisteredService, ProviderRating
from authentication.views import PostgreSQLJWTAuthentication


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_customer_dashboard_stats(request):
    """
    Get dashboard statistics for customers
    GET /api/analytics/customer/dashboard/
    """
    try:
        if request.user.user_type != 'End User':
            return Response(
                {'error': 'Only end users can access customer analytics'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get user's bookings
        user_bookings = Booking.objects.filter(customer=request.user.username)
        
        # Calculate statistics
        total_bookings = user_bookings.count()
        pending_bookings = user_bookings.filter(status='pending').count()
        accepted_bookings = user_bookings.filter(status='accepted').count()
        completed_bookings = user_bookings.filter(status='completed').count()
        cancelled_bookings = user_bookings.filter(status='cancelled').count()
        
        # Calculate total spent
        total_spent = user_bookings.filter(
            status='completed', 
            payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        return Response({
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'accepted_bookings': accepted_bookings,
            'completed_bookings': completed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'total_spent': float(total_spent),
            'recent_bookings': user_bookings.order_by('-created_at')[:5].values(
                'id', 'subcategory__name', 'status', 'service_date', 'total_price'
            )
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_provider_dashboard_stats(request):
    """
    Get dashboard statistics for service providers
    GET /api/analytics/provider/dashboard/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can access provider analytics'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get provider's bookings
        provider_bookings = Booking.objects.filter(provider=request.user.username)
        
        # Get registered services
        registered_service_relations = UserRegisteredService.objects.filter(user=request.user)
        registered_services = [urs.service for urs in registered_service_relations]
        
        # Get pending requests count (filtered by declined)
        if registered_services:
            pending_requests = Booking.objects.filter(
                status='pending',
                provider__isnull=True,
                subcategory__in=registered_services
            )
            
            # Filter out declined requests
            filtered_pending_count = 0
            for booking in pending_requests:
                try:
                    declined_providers = booking.get_declined_providers()
                    if request.user.username not in declined_providers:
                        filtered_pending_count += 1
                except:
                    filtered_pending_count += 1
        else:
            filtered_pending_count = 0
        
        # Calculate statistics
        total_bookings = provider_bookings.count()
        active_bookings = provider_bookings.filter(status__in=['accepted', 'confirmed', 'in_progress']).count()
        completed_bookings = provider_bookings.filter(status='completed').count()

        # For success rate, only count bookings that were actually assigned to this provider
        # (exclude pending requests that were never accepted)
        assigned_bookings = provider_bookings.filter(status__in=['accepted', 'confirmed', 'in_progress', 'completed', 'cancelled'])
        assigned_bookings_count = assigned_bookings.count()
        
        # Calculate earnings
        total_earnings = provider_bookings.filter(
            status='completed',
            payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or 0

        # Calculate monthly and weekly earnings
        from datetime import datetime, timedelta
        from django.utils import timezone

        now = timezone.now()
        current_month = now.month
        current_year = now.year

        # Current month earnings - using updated_at (completion date) for when earnings were actually received
        monthly_bookings = provider_bookings.filter(
            status='completed',
            payment_status='paid',
            updated_at__month=current_month,
            updated_at__year=current_year
        )

        monthly_earnings = monthly_bookings.aggregate(total=Sum('total_price'))['total'] or 0
        monthly_completed_jobs = monthly_bookings.count()

        # Current week earnings (last 7 days) - using completion date
        week_start = now - timedelta(days=7)
        weekly_bookings = provider_bookings.filter(
            status='completed',
            payment_status='paid',
            updated_at__gte=week_start
        )

        weekly_earnings = weekly_bookings.aggregate(total=Sum('total_price'))['total'] or 0
        weekly_completed_jobs = weekly_bookings.count()
        
        # Calculate completion rate (only for assigned bookings)
        completion_rate = round((completed_bookings / assigned_bookings_count * 100) if assigned_bookings_count > 0 else 0, 2)
        
        # Get earnings by service
        earnings_by_service = provider_bookings.filter(
            status='completed',
            payment_status='paid'
        ).values('subcategory__name').annotate(
            total_earnings=Sum('total_price'),
            job_count=Count('id')
        ).order_by('-total_earnings')

        # Calculate rating statistics
        provider_ratings = ProviderRating.objects.filter(provider=request.user)
        total_reviews = provider_ratings.count()

        if total_reviews > 0:
            average_rating = sum(rating.rating for rating in provider_ratings) / total_reviews
            average_rating = round(average_rating, 1)
        else:
            average_rating = 0

        return Response({
            'total_bookings': assigned_bookings_count,  # Only assigned bookings for success rate
            'pending_requests_count': filtered_pending_count,
            'active_bookings_count': active_bookings,
            'completed_bookings_count': completed_bookings,
            'total_earnings': float(total_earnings),
            'monthly_earnings': float(monthly_earnings),
            'monthly_completed_jobs': monthly_completed_jobs,
            'weekly_earnings': float(weekly_earnings),
            'weekly_completed_jobs': weekly_completed_jobs,
            'completion_rate': completion_rate,
            'registered_services_count': len(registered_services),
            'average_rating': average_rating,
            'total_reviews': total_reviews,
            'earnings_by_service': list(earnings_by_service),
            'recent_bookings': provider_bookings.order_by('-created_at')[:5].values(
                'id', 'customer', 'subcategory__name', 'status', 'service_date', 'total_price'
            )
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_provider_earnings(request):
    """
    Get detailed earnings data for service providers
    GET /api/analytics/provider/earnings/
    """
    try:
        if request.user.user_type != 'Service Provider':
            return Response(
                {'error': 'Only service providers can access earnings data'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get completed bookings
        completed_bookings = Booking.objects.filter(
            provider=request.user.username,
            status='completed',
            payment_status='paid'
        ).order_by('-created_at')
        
        # Calculate total earnings
        total_earnings = completed_bookings.aggregate(total=Sum('total_price'))['total'] or 0

        # Calculate monthly and weekly earnings (same logic as analytics API)
        from datetime import datetime, timedelta
        from django.utils import timezone

        now = timezone.now()
        current_month = now.month
        current_year = now.year

        # Monthly earnings (using completion date)
        monthly_bookings = completed_bookings.filter(
            updated_at__month=current_month,
            updated_at__year=current_year
        )
        monthly_earnings = monthly_bookings.aggregate(total=Sum('total_price'))['total'] or 0
        monthly_completed_jobs = monthly_bookings.count()

        # Weekly earnings (last 7 days)
        week_start = now - timedelta(days=7)
        weekly_bookings = completed_bookings.filter(updated_at__gte=week_start)
        weekly_earnings = weekly_bookings.aggregate(total=Sum('total_price'))['total'] or 0
        weekly_completed_jobs = weekly_bookings.count()

        # Get earnings by service
        earnings_by_service_query = completed_bookings.values('subcategory__name').annotate(
            total_earnings=Sum('total_price'),
            job_count=Count('id')
        ).order_by('-total_earnings')

        # Convert to the format expected by frontend (object with service names as keys)
        earnings_by_service = {}
        for item in earnings_by_service_query:
            service_name = item['subcategory__name']
            earnings_by_service[service_name] = {
                'total': float(item['total_earnings'] or 0),
                'count': item['job_count']
            }

        # Get recent earnings
        recent_earnings = completed_bookings[:10].values(
            'id', 'customer', 'subcategory__name', 'total_price',
            'service_date', 'payment_method', 'created_at'
        )

        return Response({
            'total_earnings': float(total_earnings),
            'total_jobs': completed_bookings.count(),
            'total_completed_jobs': completed_bookings.count(),  # Alias for frontend
            'monthly_earnings': float(monthly_earnings),
            'monthly_completed_jobs': monthly_completed_jobs,
            'weekly_earnings': float(weekly_earnings),
            'weekly_completed_jobs': weekly_completed_jobs,
            'earnings_by_service': earnings_by_service,
            'recent_earnings': list(recent_earnings),
            'average_job_value': float(total_earnings / completed_bookings.count()) if completed_bookings.count() > 0 else 0
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_platform_analytics(request):
    """
    Get platform-wide analytics (admin only)
    GET /api/analytics/platform/
    """
    try:
        if request.user.user_type != 'Platform Provider' or request.user.role != 'Admin':
            return Response(
                {'error': 'Only platform admins can access platform analytics'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all bookings
        all_bookings = Booking.objects.all()
        
        # Calculate statistics
        total_bookings = all_bookings.count()
        pending_bookings = all_bookings.filter(status='pending').count()
        completed_bookings = all_bookings.filter(status='completed').count()
        
        # Calculate revenue
        total_revenue = all_bookings.filter(
            status='completed', 
            payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        # Get user counts
        from authentication.models import User
        total_users = User.objects.count()
        customers = User.objects.filter(user_type='End User').count()
        providers = User.objects.filter(user_type='Service Provider').count()
        
        # Get popular services
        popular_services = all_bookings.values('subcategory__name').annotate(
            booking_count=Count('id')
        ).order_by('-booking_count')[:10]
        
        return Response({
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'completed_bookings': completed_bookings,
            'total_revenue': float(total_revenue),
            'total_users': total_users,
            'customers_count': customers,
            'providers_count': providers,
            'popular_services': list(popular_services),
            'completion_rate': round((completed_bookings / total_bookings * 100) if total_bookings > 0 else 0, 2)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
