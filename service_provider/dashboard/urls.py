from django.urls import path
from .views import (
    ProviderProfileView,
    ProviderIncomingRequestsView,
    ProviderServicesView,
    ProviderBookingsView,
    AcceptRequestView,
    DeclineRequestView,
    UpdateBookingStatusView,
    CompleteBookingView,
    ProcessPaymentView,
    ProviderEarningsView,
    ProviderDashboardStatsView
)

urlpatterns = [
    path('profile/', ProviderProfileView.as_view(), name='provider_profile'),
    path('requests/', ProviderIncomingRequestsView.as_view(), name='incoming_requests'),
    path('services/', ProviderServicesView.as_view(), name='provider_services'),
    path('bookings/', ProviderBookingsView.as_view(), name='provider_bookings'),
    path('accept/<str:booking_id>/', AcceptRequestView.as_view(), name='accept_request'),
    path('decline/<str:booking_id>/', DeclineRequestView.as_view(), name='decline_request'),
    path('booking/<str:booking_id>/status/', UpdateBookingStatusView.as_view(), name='update_booking_status'),
    path('booking/<str:booking_id>/complete/', CompleteBookingView.as_view(), name='complete_booking'),
    path('booking/<str:booking_id>/payment/', ProcessPaymentView.as_view(), name='process_payment'),
    path('earnings/', ProviderEarningsView.as_view(), name='provider_earnings'),
    path('stats/', ProviderDashboardStatsView.as_view(), name='provider_dashboard_stats'),
]