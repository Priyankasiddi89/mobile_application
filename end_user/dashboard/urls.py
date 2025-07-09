from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.user_profile, name='user_profile'),
    path('bookings/', views.user_bookings, name='user_bookings'),
    path('services/', views.available_services, name='available_services'),
] 