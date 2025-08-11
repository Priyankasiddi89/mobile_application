"""
Backend API URL Configuration
All database interactions happen through these API endpoints
"""
from django.urls import path

# Import views directly to avoid circular imports
from .auth import (
    register_user, login_user, logout_user, get_current_user,
    update_user_profile, get_all_users
)
from .services import (
    get_service_categories, get_service_subcategories, get_services_by_category,
    get_provider_registered_services, get_provider_available_services,
    register_provider_service, unregister_provider_service
)
from .bookings import (
    create_booking, get_user_bookings, get_provider_bookings, get_provider_requests,
    update_booking_status, accept_booking_request, decline_booking_request, complete_booking,
    cancel_booking_request, create_provider_rating, get_provider_ratings,
    manage_provider_availability, manage_provider_off_days, get_provider_available_slots
)
from .analytics import (
    get_customer_dashboard_stats, get_provider_dashboard_stats,
    get_provider_earnings, get_platform_analytics
)
from .marketplace import (
    register_service_with_price, get_available_providers, create_provider_specific_booking,
    rate_provider, get_provider_profile, update_service_availability
)

urlpatterns = [
    # Authentication API endpoints
    path('auth/register/', register_user, name='api_register'),
    path('auth/login/', login_user, name='api_login'),
    path('auth/logout/', logout_user, name='api_logout'),
    path('auth/me/', get_current_user, name='api_current_user'),
    path('auth/me/update/', update_user_profile, name='api_update_profile'),
    path('auth/users/', get_all_users, name='api_all_users'),

    # Services API endpoints
    path('services/categories/', get_service_categories, name='api_service_categories'),
    path('services/subcategories/', get_service_subcategories, name='api_service_subcategories'),
    path('services/categories/<int:category_id>/services/', get_services_by_category, name='api_services_by_category'),
    path('services/provider/registered/', get_provider_registered_services, name='api_provider_registered_services'),
    path('services/provider/available/', get_provider_available_services, name='api_provider_available_services'),
    path('services/provider/register/', register_provider_service, name='api_register_provider_service'),
    path('services/provider/unregister/', unregister_provider_service, name='api_unregister_provider_service'),

    # Bookings API endpoints
    path('bookings/create/', create_booking, name='api_create_booking'),
    path('bookings/user/', get_user_bookings, name='api_user_bookings'),
    path('bookings/provider/', get_provider_bookings, name='api_provider_bookings'),
    path('bookings/provider/requests/', get_provider_requests, name='api_provider_requests'),
    path('bookings/<int:booking_id>/status/', update_booking_status, name='api_update_booking_status'),
    path('bookings/<int:booking_id>/accept/', accept_booking_request, name='api_accept_booking'),
    path('bookings/<int:booking_id>/decline/', decline_booking_request, name='api_decline_booking'),
    path('bookings/<int:booking_id>/complete/', complete_booking, name='api_complete_booking'),
    path('bookings/<int:booking_id>/cancel/', cancel_booking_request, name='api_cancel_booking'),
    path('bookings/rate-provider/', create_provider_rating, name='api_create_rating'),
    path('bookings/provider/<int:provider_id>/ratings/', get_provider_ratings, name='api_provider_ratings'),
    path('bookings/availability/', manage_provider_availability, name='api_provider_availability'),
    path('bookings/off-days/', manage_provider_off_days, name='api_provider_off_days'),
    path('bookings/provider/<int:provider_id>/available-slots/', get_provider_available_slots, name='api_provider_available_slots'),

    # Analytics API endpoints
    path('analytics/customer/dashboard/', get_customer_dashboard_stats, name='api_customer_dashboard_stats'),
    path('analytics/provider/dashboard/', get_provider_dashboard_stats, name='api_provider_dashboard_stats'),
    path('analytics/provider/earnings/', get_provider_earnings, name='api_provider_earnings'),
    path('analytics/platform/', get_platform_analytics, name='api_platform_analytics'),

    # Marketplace API endpoints
    path('marketplace/register-service/', register_service_with_price, name='api_register_service_with_price'),
    path('marketplace/service/<int:service_id>/providers/', get_available_providers, name='api_get_available_providers'),
    path('marketplace/book-provider/', create_provider_specific_booking, name='api_create_provider_specific_booking'),
    path('marketplace/rate-provider/', rate_provider, name='api_rate_provider'),
    path('marketplace/provider/<int:provider_id>/profile/', get_provider_profile, name='api_get_provider_profile'),
    path('marketplace/service-registration/<int:service_registration_id>/', update_service_availability, name='api_update_service_availability'),
]
