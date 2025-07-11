from django.urls import path
from .views import RegisterView, LoginView, LogoutView, UserInfoView, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserInfoView.as_view(), name='user-info'),
    path('users/', UserListView.as_view(), name='user-list'),
] 