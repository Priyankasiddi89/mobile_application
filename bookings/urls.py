from django.urls import path
from .views import (
    ServiceCategoriesView,
    ServiceSubcategoriesView,
    CreateBookingView,
    UserBookingsView,
    BookingDetailView,
    ProviderRequestsView,
    AcceptRequestView,
    DeclineRequestView,
    ProviderActiveBookingsView
)

urlpatterns = [
    path('categories/', ServiceCategoriesView.as_view(), name='service-categories'),
    path('subcategories/', ServiceSubcategoriesView.as_view(), name='service-subcategories'),
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    path('user-bookings/', UserBookingsView.as_view(), name='user-bookings'),
    path('booking/<str:booking_id>/', BookingDetailView.as_view(), name='booking-detail'),
    path('provider/requests/', ProviderRequestsView.as_view(), name='provider-requests'),
    path('provider/accept/<str:booking_id>/', AcceptRequestView.as_view(), name='accept-request'),
    path('provider/decline/<str:booking_id>/', DeclineRequestView.as_view(), name='decline-request'),
    path('provider/active-bookings/', ProviderActiveBookingsView.as_view(), name='provider-active-bookings'),
] 