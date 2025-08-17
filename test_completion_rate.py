#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from bookings.models import Booking

def test_completion_rate():
    """Test the new completion rate calculation"""
    
    provider = User.objects.get(username='spc')
    
    # Get booking counts
    total_bookings = Booking.objects.filter(provider=provider.username).count()
    completed_bookings = Booking.objects.filter(provider=provider.username, status='completed').count()
    active_bookings = Booking.objects.filter(provider=provider.username, status__in=['accepted', 'confirmed']).count()
    pending_bookings = Booking.objects.filter(provider=provider.username, status='pending').count()
    
    print(f"Provider: {provider.username}")
    print(f"Total bookings: {total_bookings}")
    print(f"Completed: {completed_bookings}")
    print(f"Active: {active_bookings}")
    print(f"Pending: {pending_bookings}")
    print()
    
    # Old calculation (incorrect)
    old_rate = round((completed_bookings / total_bookings * 100) if total_bookings > 0 else 0, 2)
    print(f"❌ Old calculation: {completed_bookings}/{total_bookings} = {old_rate}%")
    
    # New calculation (correct)
    relevant_bookings = completed_bookings + active_bookings
    if relevant_bookings > 0:
        new_rate = round((completed_bookings / relevant_bookings * 100), 2)
    elif completed_bookings > 0:
        new_rate = 100.0
    else:
        new_rate = 0.0
    
    print(f"✅ New calculation: {completed_bookings}/{relevant_bookings} = {new_rate}%")
    print()
    
    # Explanation
    print("📝 Logic explanation:")
    print("- Completion rate should only consider jobs that were actually worked on")
    print("- Pending requests don't count (they haven't been accepted yet)")
    print("- Cancelled/declined jobs don't count (they weren't completed)")
    print("- Only completed + active jobs are relevant for completion rate")
    print("- If no active jobs and there are completed jobs = 100%")

if __name__ == "__main__":
    test_completion_rate()
