#!/usr/bin/env python3
"""
Debug script to check booking statuses in the database
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/path/to/your/project')  # Update this path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mobile_app.settings')

try:
    django.setup()
    from api.models import Booking
    
    print("🔍 Current Booking Statuses in Database:")
    print("=" * 50)
    
    bookings = Booking.objects.all().order_by('-created_at')
    
    if not bookings:
        print("No bookings found in database.")
    else:
        for booking in bookings:
            print(f"ID: {booking.id:3d} | Status: {booking.status:12s} | Customer: {booking.customer:20s} | Service: {booking.subcategory_name}")
    
    print("\n📊 Status Summary:")
    print("=" * 30)
    
    status_counts = {}
    for booking in bookings:
        status = booking.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    for status, count in status_counts.items():
        print(f"{status:12s}: {count:3d} bookings")
    
    print(f"\nTotal bookings: {len(bookings)}")
    
except Exception as e:
    print(f"Error: {e}")
    print("Make sure you're running this from the project directory and Django is properly configured.")
