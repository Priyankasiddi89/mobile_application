from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.admin_profile, name='admin_profile'),
    path('users/', views.users_management, name='users_management'),
    path('services/', views.services_management, name='services_management'),
    path('analytics/', views.analytics, name='analytics'),
    path('permissions/', views.get_permissions, name='get_permissions'),
    path('user-type-role-permissions/', views.get_user_type_role_permissions, name='get_user_type_role_permissions'),
    path('update-permissions/', views.update_user_type_role_permissions, name='update_user_type_role_permissions'),
]