from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from .models import ServiceCategory, ServiceSubcategory, Booking
from .serializers import ServiceCategorySerializer, ServiceSubcategorySerializer, BookingSerializer, BookingCreateSerializer
from authentication.views import MongoengineJWTAuthentication
from datetime import datetime
from decimal import Decimal

# Create your views here.

class ServiceCategoriesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def get(self, request):
        """Get all service categories"""
        categories = ServiceCategory.objects.all()
        serializer = ServiceCategorySerializer(categories, many=True)
        return Response(serializer.data)

class ServiceSubcategoriesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]

    def get(self, request):
        """Get subcategories for a specific category"""
        category_id = request.query_params.get('category_id')
        if category_id:
            subcategories = ServiceSubcategory.objects(category=category_id)
        else:
            subcategories = ServiceSubcategory.objects.all()
        serializer = ServiceSubcategorySerializer(subcategories, many=True)
        return Response(serializer.data)

class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    
    def post(self, request):
        """Create a new booking (request)"""
        serializer = BookingCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Get the subcategory
                subcategory = ServiceSubcategory.objects(id=serializer.validated_data['subcategory_id']).first()
                if not subcategory:
                    return Response({'detail': 'Subcategory not found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Create booking
                booking = Booking(
                    customer=request.user.username,
                    subcategory=subcategory,
                    booking_date=datetime.utcnow(),
                    service_date=serializer.validated_data['service_date'],
                    total_price=subcategory.price,
                    status='pending',
                    payment_status='unpaid',
                    notes=serializer.validated_data.get('notes', '')
                )
                booking.save()
                
                # Serialize the response
                booking_serializer = BookingSerializer(booking)
                return Response(booking_serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserBookingsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    
    def get(self, request):
        """Get all bookings for the current user"""
        bookings = Booking.objects(customer=request.user.username).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

class ProviderRequestsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    
    def get(self, request):
        """Get all pending requests for service providers"""
        # Only show bookings that:
        # - are pending
        # - have no provider assigned
        # - this provider has not declined
        bookings = Booking.objects(
            status='pending',
            provider=None,
            declined_by__ne=request.user.username
        ).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

class AcceptRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    
    def post(self, request, booking_id):
        """Accept a pending request (service provider)"""
        booking = Booking.objects(id=booking_id, status='pending', provider=None).first()
        if not booking:
            return Response({'detail': 'Request not found or already accepted'}, status=status.HTTP_404_NOT_FOUND)
        booking.status = 'accepted'
        booking.provider = request.user.username
        booking.save()
        serializer = BookingSerializer(booking)
        # TODO: Notify end user (e.g., via email or websocket)
        return Response(serializer.data)

class DeclineRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    
    def post(self, request, booking_id):
        """Decline a pending request (service provider)"""
        booking = Booking.objects(id=booking_id, status='pending', provider=None).first()
        if not booking:
            return Response({'detail': 'Request not found or already accepted'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.username not in booking.declined_by:
            booking.declined_by.append(request.user.username)
            booking.save()
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    
    def get(self, request, booking_id):
        """Get specific booking details"""
        booking = Booking.objects(id=booking_id, customer=request.user.username).first()
        if not booking:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data)
    
    def put(self, request, booking_id):
        """Update booking status (cancel booking)"""
        booking = Booking.objects(id=booking_id, customer=request.user.username).first()
        if not booking:
            return Response({'detail': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        if new_status == 'cancelled':
            booking.status = 'cancelled'
            booking.save()
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        
        return Response({'detail': 'Invalid status update'}, status=status.HTTP_400_BAD_REQUEST)

class ProviderActiveBookingsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    def get(self, request):
        """Get all active (upcoming) bookings for the current provider"""
        bookings = Booking.objects(provider=request.user.username, status__in=['accepted', 'confirmed']).order_by('-service_date')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
