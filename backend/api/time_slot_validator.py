"""
Time Slot Validation Utility
Centralized validation for booking time slots
"""
from datetime import datetime, timedelta, time
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from bookings.models import Booking, ProviderAvailability, ProviderOffDay
from authentication.models import User


class TimeSlotValidator:
    """Centralized time slot validation for bookings"""
    
    # Business hours configuration (matching 4 time slots)
    BUSINESS_START_HOUR = 9   # 9 AM
    BUSINESS_END_HOUR = 21    # 9 PM
    
    # Booking constraints
    MIN_ADVANCE_HOURS = 2    # Minimum 2 hours advance notice
    MAX_ADVANCE_DAYS = 90    # Maximum 90 days in advance
    DEFAULT_SERVICE_DURATION = 1  # Default 1 hour service duration
    
    def __init__(self, provider_id=None, service_date=None, service_duration_hours=None, service_subcategory=None):
        self.provider_id = provider_id
        self.service_date = service_date
        self.service_subcategory = service_subcategory
        self.provider = None

        # Determine service duration
        if service_duration_hours:
            self.service_duration_hours = service_duration_hours
        elif service_subcategory and hasattr(service_subcategory, 'duration_hours'):
            self.service_duration_hours = float(service_subcategory.duration_hours)
        else:
            self.service_duration_hours = self.DEFAULT_SERVICE_DURATION

        if provider_id:
            try:
                self.provider = User.objects.get(id=provider_id, user_type='Service Provider')
            except User.DoesNotExist:
                self.provider = None
    
    def validate_all(self, exclude_booking_id=None):
        """
        Run all validations and return the first error found
        Returns: (is_valid: bool, error_response: Response or None)
        """
        validations = [
            self.validate_basic_requirements,
            self.validate_date_range,
            self.validate_business_hours,
            self.validate_provider_exists,
            self.validate_provider_off_day,
            self.validate_provider_availability,
            lambda: self.validate_booking_conflicts(exclude_booking_id),
        ]
        
        for validation in validations:
            is_valid, error_response = validation()
            if not is_valid:
                return False, error_response
        
        return True, None
    
    def validate_basic_requirements(self):
        """Validate basic requirements are met"""
        if not self.service_date:
            return False, Response(
                {'error': 'Service date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not self.provider_id:
            return False, Response(
                {'error': 'Provider ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return True, None
    
    def validate_date_range(self):
        """Validate the booking date is within acceptable range"""
        now = timezone.now()
        
        # Check minimum advance notice
        min_booking_time = now + timedelta(hours=self.MIN_ADVANCE_HOURS)
        if self.service_date <= min_booking_time:
            return False, Response(
                {'error': f'Bookings must be made at least {self.MIN_ADVANCE_HOURS} hours in advance'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check maximum advance booking
        max_booking_time = now + timedelta(days=self.MAX_ADVANCE_DAYS)
        if self.service_date >= max_booking_time:
            return False, Response(
                {'error': f'Bookings cannot be made more than {self.MAX_ADVANCE_DAYS} days in advance'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return True, None
    
    def validate_business_hours(self):
        """Validate the booking is within business hours"""
        booking_time = self.service_date.time()
        booking_end_time = (self.service_date + timedelta(hours=self.service_duration_hours)).time()
        
        business_start = time(self.BUSINESS_START_HOUR, 0)
        business_end = time(self.BUSINESS_END_HOUR, 0)
        
        if booking_time < business_start or booking_end_time > business_end:
            return False, Response(
                {'error': f'Bookings are only allowed between {business_start.strftime("%I:%M %p")} and {business_end.strftime("%I:%M %p")}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return True, None
    
    def validate_provider_exists(self):
        """Validate the provider exists and is active"""
        if not self.provider:
            return False, Response(
                {'error': 'Provider not found or inactive'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not self.provider.is_active:
            return False, Response(
                {'error': 'Provider is currently inactive'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return True, None
    
    def validate_provider_off_day(self):
        """Validate the provider is not off on the requested date"""
        booking_date = self.service_date.date()
        
        is_off_day = ProviderOffDay.objects.filter(
            provider=self.provider,
            date=booking_date
        ).exists()
        
        if is_off_day:
            return False, Response(
                {'error': f'Provider is not available on {booking_date.strftime("%B %d, %Y")}'},
                status=status.HTTP_409_CONFLICT
            )
        
        return True, None
    
    def validate_provider_availability(self):
        """Validate the provider has availability slots for the requested time"""
        booking_date = self.service_date.date()
        booking_start_time = self.service_date.time()
        booking_end_time = (self.service_date + timedelta(hours=self.service_duration_hours)).time()
        
        # Get provider's availability slots for this date
        availability_slots = ProviderAvailability.objects.filter(
            provider=self.provider,
            date=booking_date,
            is_available=True
        )
        
        if not availability_slots.exists():
            return False, Response(
                {'error': f'Provider has no available time slots on {booking_date.strftime("%B %d, %Y")}'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Check if the requested time falls within any available slot
        time_slot_available = False
        for slot in availability_slots:
            if (booking_start_time >= slot.start_time and 
                booking_end_time <= slot.end_time):
                time_slot_available = True
                break
        
        if not time_slot_available:
            return False, Response(
                {'error': f'Provider is not available from {booking_start_time.strftime("%I:%M %p")} to {booking_end_time.strftime("%I:%M %p")} on {booking_date.strftime("%B %d, %Y")}'},
                status=status.HTTP_409_CONFLICT
            )
        
        return True, None
    
    def validate_booking_conflicts(self, exclude_booking_id=None):
        """Validate there are no conflicting bookings"""
        booking_start = self.service_date
        booking_end = self.service_date + timedelta(hours=self.service_duration_hours)
        booking_date = self.service_date.date()
        
        # Get existing active bookings for this provider on this date
        active_booking_statuses = ['accepted', 'confirmed', 'completed']  # Include completed to prevent rebooking
        conflicting_bookings = Booking.objects.filter(
            provider=self.provider.username,
            service_date__date=booking_date,
            status__in=active_booking_statuses,
        )
        
        # Exclude the current booking if updating
        if exclude_booking_id:
            conflicting_bookings = conflicting_bookings.exclude(id=exclude_booking_id)
        
        # Check for time overlaps
        for existing_booking in conflicting_bookings:
            existing_start = existing_booking.service_date
            existing_end = existing_start + timedelta(hours=self.DEFAULT_SERVICE_DURATION)
            
            # Check if there's any overlap
            if (booking_start < existing_end and booking_end > existing_start):
                return False, Response(
                    {'error': f'Time slot conflict! Provider already has a booking from {existing_start.strftime("%I:%M %p")} to {existing_end.strftime("%I:%M %p")} on {booking_date.strftime("%B %d, %Y")}. Please select a different time slot.'},
                    status=status.HTTP_409_CONFLICT
                )
        
        return True, None
    
    @classmethod
    def validate_time_slot(cls, provider_id, service_date, service_duration_hours=None, exclude_booking_id=None):
        """
        Convenience method to validate a time slot
        Returns: (is_valid: bool, error_response: Response or None)
        """
        validator = cls(provider_id, service_date, service_duration_hours)
        return validator.validate_all(exclude_booking_id)
    
    @classmethod
    def get_available_slots(cls, provider_id, date, service_duration_hours=None):
        """
        Get all available time slots for a provider on a specific date
        Returns: list of available time slots (4 standard slots)
        """
        try:
            provider = User.objects.get(id=provider_id, user_type='Service Provider')
        except User.DoesNotExist:
            return []

        # Check if provider is off on this date
        is_off_day = ProviderOffDay.objects.filter(
            provider=provider,
            date=date
        ).exists()

        if is_off_day:
            return []

        # Define the 4 standard time slots
        standard_slots = [
            {'start': time(9, 0), 'end': time(12, 0), 'label': '9:00 AM - 12:00 PM'},
            {'start': time(12, 0), 'end': time(15, 0), 'label': '12:00 PM - 3:00 PM'},
            {'start': time(15, 0), 'end': time(18, 0), 'label': '3:00 PM - 6:00 PM'},
            {'start': time(18, 0), 'end': time(21, 0), 'label': '6:00 PM - 9:00 PM'}
        ]

        # Get provider's availability slots for this date
        availability_slots = ProviderAvailability.objects.filter(
            provider=provider,
            date=date,
            is_available=True
        )

        # Get existing active bookings for this date (all statuses that block time slots)
        active_booking_statuses = ['accepted', 'confirmed', 'completed']  # Include completed to prevent rebooking
        existing_bookings = Booking.objects.filter(
            provider=provider.username,
            service_date__date=date,
            status__in=active_booking_statuses
        )

        duration = service_duration_hours or cls.DEFAULT_SERVICE_DURATION
        available_slots = []

        for slot in standard_slots:
            # Check if provider has availability for this slot
            has_availability = False
            for avail_slot in availability_slots:
                if (slot['start'] >= avail_slot.start_time and
                    slot['end'] <= avail_slot.end_time):
                    has_availability = True
                    break

            if not has_availability:
                continue

            # Check if this slot conflicts with existing bookings
            # The issue is that bookings are stored in UTC but represent local times
            # We need to compare times in the same timezone context
            import pytz

            # Use Asia/Dhaka timezone (UTC+6) as this seems to be the intended timezone
            # based on the booking time analysis (03:30 UTC = 09:30 Dhaka time)
            local_tz = pytz.timezone('Asia/Dhaka')

            # Create slot times in local timezone
            slot_start_naive = datetime.combine(date, slot['start'])
            slot_end_naive = datetime.combine(date, slot['end'])
            slot_start = local_tz.localize(slot_start_naive)
            slot_end = local_tz.localize(slot_end_naive)

            is_available = True
            for booking in existing_bookings:
                # Convert booking time to local timezone for comparison
                booking_start = booking.service_date.astimezone(local_tz)
                booking_end = booking_start + timedelta(hours=duration)

                # Check if there's any overlap
                if (slot_start < booking_end and slot_end > booking_start):
                    is_available = False
                    break

            if is_available:
                available_slots.append({
                    'start_time': slot['start'].strftime('%H:%M'),
                    'end_time': slot['end'].strftime('%H:%M'),
                    'display_time': slot['label']
                })

        return available_slots
