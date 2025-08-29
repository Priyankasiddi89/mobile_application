from rest_framework import serializers
from .models import ServiceCategory, ServiceSubcategory, Booking, ProviderRating, ProviderAvailability, ProviderOffDay
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
    address = serializers.CharField(required=False, allow_blank=True)
    cancelled_by = serializers.CharField(required=False, allow_blank=True)
    cancellation_reason = serializers.CharField(required=False, allow_blank=True)
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
        from datetime import time, timedelta

        now = timezone.now()

        # Ensure service date is in the future with minimum advance notice
        min_advance_hours = 2
        min_booking_time = now + timedelta(hours=min_advance_hours)
        if value <= min_booking_time:
            raise serializers.ValidationError(
                f"Bookings must be made at least {min_advance_hours} hours in advance"
            )

        # Prevent bookings too far in the future
        max_advance_days = 90
        max_booking_time = now + timedelta(days=max_advance_days)
        if value >= max_booking_time:
            raise serializers.ValidationError(
                f"Bookings cannot be made more than {max_advance_days} days in advance"
            )

        # Validate business hours (9 AM to 9 PM - matching 4 time slots)
        booking_time = value.time()
        business_start = time(9, 0)   # 9 AM
        business_end = time(21, 0)    # 9 PM

        if booking_time < business_start or booking_time >= business_end:
            raise serializers.ValidationError(
                f"Bookings are only allowed between {business_start.strftime('%I:%M %p')} and {business_end.strftime('%I:%M %p')}"
            )

        return value

class ProviderRatingSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    provider = serializers.CharField()
    customer = serializers.CharField()
    booking_id = serializers.SerializerMethodField()
    rating = serializers.IntegerField()
    review = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)

    def get_id(self, obj):
        return str(obj.id)

    def get_booking_id(self, obj):
        return str(obj.booking.id)

class ProviderRatingCreateSerializer(serializers.Serializer):
    booking_id = serializers.CharField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    review = serializers.CharField(required=False, allow_blank=True)

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class ProviderAvailabilitySerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    provider = serializers.CharField(read_only=True)
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    is_available = serializers.BooleanField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_id(self, obj):
        return str(obj.id)


class ProviderAvailabilityCreateSerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    is_available = serializers.BooleanField(default=True)

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Start time must be before end time")

        # Ensure date is not in the past
        from datetime import date
        if data['date'] < date.today():
            raise serializers.ValidationError("Cannot set availability for past dates")

        return data


class ProviderOffDaySerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    provider = serializers.CharField(read_only=True)
    date = serializers.DateField()
    reason = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)

    def get_id(self, obj):
        return str(obj.id)


class ProviderOffDayCreateSerializer(serializers.Serializer):
    date = serializers.DateField()
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Cannot set off day for past dates")
        return value