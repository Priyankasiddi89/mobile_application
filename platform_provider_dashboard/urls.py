from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.admin_profile, name='admin_profile'),
    path('users/', views.users_management, name='users_management'),
    path('services/', views.services_management, name='services_management'),
    path('analytics/', views.analytics, name='analytics'),
] 