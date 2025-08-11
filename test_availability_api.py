#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, date, time

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from bookings.models import ProviderAvailability, ProviderOffDay

def test_availability_api():
    """Test the availability system"""
    
    # Get a service provider
    provider = User.objects.filter(user_type='Service Provider').first()
    if not provider:
        print("No service provider found!")
        return
    
    print(f"Testing availability for provider: {provider.username}")
    
    # Test date
    test_date = date(2025, 8, 11)
    print(f"Test date: {test_date}")
    
    # Check current availability for this date
    existing_slots = ProviderAvailability.objects.filter(
        provider=provider,
        date=test_date
    )
    
    print(f"\nCurrent slots for {test_date}:")
    for slot in existing_slots:
        print(f"  {slot.start_time}-{slot.end_time}: {'Available' if slot.is_available else 'OFF'}")
    
    # Test creating/updating a slot
    test_slot = ProviderAvailability.objects.filter(
        provider=provider,
        date=test_date,
        start_time=time(18, 0),  # 6 PM
        end_time=time(21, 0)     # 9 PM
    ).first()
    
    if test_slot:
        print(f"\nFound existing 6-9 PM slot: {test_slot.is_available}")
        # Toggle availability
        test_slot.is_available = not test_slot.is_available
        test_slot.save()
        print(f"Updated to: {test_slot.is_available}")
    else:
        print(f"\nCreating new 6-9 PM slot as OFF")
        test_slot = ProviderAvailability.objects.create(
            provider=provider,
            date=test_date,
            start_time=time(18, 0),
            end_time=time(21, 0),
            is_available=False
        )
        print(f"Created slot: {test_slot.is_available}")
    
    # Check all slots again
    updated_slots = ProviderAvailability.objects.filter(
        provider=provider,
        date=test_date
    ).order_by('start_time')
    
    print(f"\nUpdated slots for {test_date}:")
    for slot in updated_slots:
        print(f"  {slot.start_time}-{slot.end_time}: {'Available' if slot.is_available else 'OFF'}")
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    test_availability_api()
