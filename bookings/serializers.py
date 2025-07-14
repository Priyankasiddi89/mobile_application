from rest_framework import serializers
from .models import ServiceCategory, ServiceSubcategory, Booking
from datetime import datetime
from django.utils import timezone

class ServiceCategorySerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    name = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
    gradient = serializers.CharField()

    def get_id(self, obj):
        return str(obj.id)

class ServiceSubcategorySerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    name = serializers.CharField()
    description = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    category = ServiceCategorySerializer()

    def get_id(self, obj):
        return str(obj.id)

class BookingSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    customer = serializers.CharField()
    provider = serializers.CharField(allow_blank=True, required=False)
    subcategory = ServiceSubcategorySerializer()
    booking_date = serializers.DateTimeField()
    service_date = serializers.DateTimeField()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    payment_status = serializers.CharField()
    payment_method = serializers.CharField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_id(self, obj):
        return str(obj.id)

    def create(self, validated_data):
        # Convert string IDs to references
        subcategory_id = validated_data.pop('subcategory')
        subcategory = ServiceSubcategory.objects(id=subcategory_id).first()
        
        booking = Booking(
            customer=validated_data['customer'],
            subcategory=subcategory,
            booking_date=validated_data['booking_date'],
            service_date=validated_data['service_date'],
            total_price=validated_data['total_price'],
            status=validated_data.get('status', 'pending'),
            payment_status=validated_data.get('payment_status', 'unpaid'),
            notes=validated_data.get('notes', '')
        )
        booking.save()
        return booking

class BookingCreateSerializer(serializers.Serializer):
    subcategory_id = serializers.CharField()
    service_date = serializers.DateTimeField()
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_service_date(self, value):
        # Ensure service date is in the future
        if value <= timezone.now():
            raise serializers.ValidationError("Service date must be in the future")
        return value 