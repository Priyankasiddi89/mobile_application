#!/usr/bin/env python
"""
Test script for automatic booking cancellation functionality.
This script demonstrates how to test the cancel_expired_bookings management command.
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bookings.models import Booking, ServiceSubcategory
from authentication.models import User

def create_test_booking():
    """Create a test booking that's already expired for testing purposes."""
    
    # Get or create a test user
    customer, created = User.objects.get_or_create(
        username='test_customer',
        defaults={
            'email': 'test_customer@example.com',
            'user_type': 'End User'
        }
    )
    
    # Get or create a test service provider
    provider, created = User.objects.get_or_create(
        username='test_provider',
        defaults={
            'email': 'test_provider@example.com',
            'user_type': 'Service Provider'
        }
    )
    
    # Get a service subcategory (assuming one exists)
    subcategory = ServiceSubcategory.objects.first()
    if not subcategory:
        print("❌ No service subcategories found. Please run: python manage.py populate_services")
        return None
    
    # Create an expired booking (2 hours ago)
    expired_time = timezone.now() - timedelta(hours=2)
    
    booking = Booking.objects.create(
        customer=customer.username,
        provider=provider.username,
        subcategory=subcategory,
        booking_date=timezone.now() - timedelta(hours=3),
        service_date=expired_time,
        total_price=50.00,
        status='accepted',  # This should be auto-cancelled
        address='123 Test Street, Test City'
    )
    
    print(f"✅ Created test booking #{booking.id}")
    print(f"   Customer: {booking.customer}")
    print(f"   Provider: {booking.provider}")
    print(f"   Service: {booking.subcategory.name}")
    print(f"   Service Date: {booking.service_date}")
    print(f"   Status: {booking.status}")
    print(f"   Hours ago: {(timezone.now() - booking.service_date).total_seconds() / 3600:.1f}")
    
    return booking

def test_cancellation_command():
    """Test the automatic cancellation management command."""
    
    print("🧪 Testing Automatic Booking Cancellation")
    print("=" * 50)
    
    # Create a test expired booking
    test_booking = create_test_booking()
    if not test_booking:
        return
    
    print("\n📋 Before running cancellation command:")
    print(f"   Booking #{test_booking.id} status: {test_booking.status}")
    print(f"   Cancelled by: {test_booking.cancelled_by or 'None'}")
    
    # Run the management command
    print("\n🔄 Running cancellation command...")
    from django.core.management import call_command
    
    try:
        # Run with dry-run first
        print("\n1️⃣ Dry run (preview):")
        call_command('cancel_expired_bookings', '--dry-run', '--verbose')
        
        # Run actual cancellation
        print("\n2️⃣ Actual cancellation:")
        call_command('cancel_expired_bookings', '--verbose')
        
        # Check the result
        test_booking.refresh_from_db()
        print(f"\n📋 After running cancellation command:")
        print(f"   Booking #{test_booking.id} status: {test_booking.status}")
        print(f"   Cancelled by: {test_booking.cancelled_by or 'None'}")
        
        if test_booking.status == 'cancelled' and test_booking.cancelled_by == 'system':
            print("\n✅ SUCCESS: Booking was automatically cancelled!")
        else:
            print("\n❌ FAILED: Booking was not cancelled as expected")
            
    except Exception as e:
        print(f"\n❌ Error running command: {e}")
    
    # Cleanup
    print(f"\n🧹 Cleaning up test booking #{test_booking.id}")
    test_booking.delete()

if __name__ == '__main__':
    test_cancellation_command()
