#!/usr/bin/env python
"""
Debug script to check bookings in the database
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_platform.settings')
django.setup()

from bookings.models import Booking
from auth_app.models import User

def debug_bookings():
    """Debug bookings and users"""
    print("🔍 Debugging Bookings Database...\n")
    
    try:
        # Check all bookings
        all_bookings = Booking.objects.all()
        print(f"📋 Total bookings in database: {len(all_bookings)}")
        
        if len(all_bookings) == 0:
            print("❌ No bookings found in database!")
            return
        
        # Show all bookings
        for booking in all_bookings:
            print(f"\n📝 Booking ID: {booking.id}")
            print(f"   Customer: {booking.customer}")
            print(f"   Provider: {booking.provider}")
            print(f"   Service: {booking.subcategory.name}")
            print(f"   Status: {booking.status}")
            print(f"   Payment Status: {booking.payment_status}")
            print(f"   Total Price: ${booking.total_price}")
            print(f"   Service Date: {booking.service_date}")
        
        # Check active bookings specifically
        print(f"\n🟢 Active bookings (accepted/confirmed):")
        active_bookings = Booking.objects(status__in=['accepted', 'confirmed'])
        for booking in active_bookings:
            print(f"   - {booking.id} | {booking.customer} | {booking.subcategory.name} | {booking.status}")
        
        # Check users
        print(f"\n👥 Service Providers in database:")
        providers = User.objects(user_type='Service Provider')
        for provider in providers:
            print(f"   - {provider.username} | Active: {provider.is_active}")
            
            # Check their bookings
            provider_bookings = Booking.objects(provider=provider.username)
            print(f"     Bookings: {len(provider_bookings)}")
            for booking in provider_bookings:
                print(f"       * {booking.id} | {booking.status} | {booking.subcategory.name}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_bookings()
