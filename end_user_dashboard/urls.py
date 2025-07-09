from django.urls import path
from . import views

urlpatterns = [
    path('bookings/', views.user_bookings, name='user_bookings'),
    path('services/', views.available_services, name='available_services'),
    path('requests/', views.user_requests, name='user_requests'),
] 