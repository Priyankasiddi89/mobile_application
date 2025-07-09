from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.provider_profile, name='provider_profile'),
    path('requests/', views.incoming_requests, name='incoming_requests'),
    path('services/', views.provider_services, name='provider_services'),
    path('bookings/', views.provider_bookings, name='provider_bookings'),
] 