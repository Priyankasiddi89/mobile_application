#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta, time

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from bookings.models import Booking, ServiceSubcategory

def create_test_bookings():
    """Create test bookings to demonstrate availability system"""
    
    # Get a service provider
    provider = User.objects.filter(user_type='Service Provider').first()
    if not provider:
        print("No service provider found!")
        return
    
    # Get a customer
    customer = User.objects.filter(user_type='End User').first()
    if not customer:
        print("No customer found!")
        return
    
    # Get a service
    service = ServiceSubcategory.objects.first()
    if not service:
        print("No service found!")
        return
    
    print(f"Creating test bookings for provider: {provider.username}")
    print(f"Customer: {customer.username}")
    print(f"Service: {service.name}")
    
    # Create bookings for the next few days
    today = datetime.now().date()
    
    test_bookings = [
        {
            'date': today + timedelta(days=1),
            'time': time(10, 0),  # 10:00 AM (in 9-12 slot)
            'status': 'accepted'
        },
        {
            'date': today + timedelta(days=1),
            'time': time(14, 0),  # 2:00 PM (in 12-3 slot)
            'status': 'pending'
        },
        {
            'date': today + timedelta(days=2),
            'time': time(16, 0),  # 4:00 PM (in 3-6 slot)
            'status': 'accepted'
        },
        {
            'date': today + timedelta(days=3),
            'time': time(19, 0),  # 7:00 PM (in 6-9 slot)
            'status': 'pending'
        }
    ]
    
    created_count = 0
    
    for booking_data in test_bookings:
        service_datetime = datetime.combine(booking_data['date'], booking_data['time'])
        
        # Check if booking already exists
        existing = Booking.objects.filter(
            provider=provider.username,
            customer=customer.username,
            service_date=service_datetime
        ).first()
        
        if not existing:
            booking = Booking.objects.create(
                customer=customer.username,
                provider=provider.username,
                subcategory=service,
                booking_date=datetime.now(),
                service_date=service_datetime,
                total_price=200.00,
                status=booking_data['status'],
                notes=f"Test booking for availability demo",
                address="123 Test Street, Test City"
            )
            created_count += 1
            print(f"✅ Created booking: {booking_data['date']} at {booking_data['time']} - {booking_data['status']}")
        else:
            print(f"⚠️ Booking already exists: {booking_data['date']} at {booking_data['time']}")
    
    print(f"\n🎉 Created {created_count} test bookings!")
    print("You can now see these bookings in the provider availability dashboard.")

if __name__ == "__main__":
    create_test_bookings()
