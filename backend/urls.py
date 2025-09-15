"""
Backend URL Configuration for Home Services Platform

This configuration provides a clean API-first architecture where all database
interactions happen through well-defined API endpoints.

API Structure:
- /api/ - All API endpoints (backend/api/)
- /admin/ - Django admin interface
- /legacy/ - Legacy endpoints (for backward compatibility)
"""
from django.contrib import admin
from django.urls import path, include



urlpatterns = [
    # Django Admin Interface
    path('admin/', admin.site.urls),

    # Main API Endpoints (API-First Architecture)
    path('api/', include('backend.api.urls')),

    # Legacy Endpoints (for backward compatibility)
    path('legacy/auth/', include('authentication.urls')),
    path('legacy/bookings/', include('bookings.urls')),
    path('legacy/end_user_dashboard/', include('end_user_dashboard.urls')),
    path('legacy/service_provider_dashboard/', include('service_provider.dashboard.urls')),
    path('legacy/platform_provider_dashboard/', include('platform_provider_dashboard.urls')),
]
