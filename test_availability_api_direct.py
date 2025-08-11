#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, date, time

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from bookings.models import ProviderAvailability
from bookings.serializers import ProviderAvailabilityCreateSerializer

def test_api_directly():
    """Test the availability API logic directly"""
    
    # Get a service provider
    provider = User.objects.filter(user_type='Service Provider').first()
    if not provider:
        print("No service provider found!")
        return
    
    print(f"Testing with provider: {provider.username}")
    
    # Test data - same as what frontend sends
    test_data = {
        'date': '2025-08-12',
        'start_time': '18:00',
        'end_time': '21:00',
        'is_available': False
    }
    
    print(f"Test data: {test_data}")
    
    # Test serializer validation
    serializer = ProviderAvailabilityCreateSerializer(data=test_data)
    if serializer.is_valid():
        print("✅ Serializer validation passed")
        print(f"Validated data: {serializer.validated_data}")
        
        # Check if slot already exists
        existing_slot = ProviderAvailability.objects.filter(
            provider=provider,
            date=serializer.validated_data['date'],
            start_time=serializer.validated_data['start_time'],
            end_time=serializer.validated_data['end_time']
        ).first()
        
        if existing_slot:
            print(f"Found existing slot: {existing_slot}")
            print(f"Current availability: {existing_slot.is_available}")
            
            # Update it
            existing_slot.is_available = serializer.validated_data['is_available']
            existing_slot.save()
            print(f"Updated to: {existing_slot.is_available}")
        else:
            print("No existing slot found, creating new one...")
            
            # Create new slot
            availability_slot = ProviderAvailability.objects.create(
                provider=provider,
                **serializer.validated_data
            )
            print(f"Created new slot: {availability_slot}")
        
        print("✅ API logic test successful!")
        
    else:
        print("❌ Serializer validation failed:")
        print(f"Errors: {serializer.errors}")

if __name__ == "__main__":
    test_api_directly()
