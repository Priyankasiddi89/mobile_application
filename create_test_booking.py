import os
import sys
import django
from datetime import datetime, date

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bookings.models import Booking, ServiceSubcategory
from authentication.models import User
from decimal import Decimal

def create_test_booking():
    print("🚀 Creating test booking...")
    
    # Check if we have users and services
    users = User.objects.filter(user_type='End User')
    subcategories = ServiceSubcategory.objects.all()
    
    print(f"📊 Found {len(users)} end users")
    print(f"📊 Found {len(subcategories)} subcategories")
    
    if len(users) == 0:
        print("❌ No end users found! Please create an end user account first.")
        return
    
    if len(subcategories) == 0:
        print("❌ No services found! Please run the populate services script first.")
        return
    
    # Get first user and service
    user = users[0]
    service = subcategories[0]
    
    print(f"👤 Using user: {user.username}")
    print(f"🔧 Using service: {service.name} (${service.price})")
    
    # Check if booking already exists
    existing = Booking.objects.filter(customer=user.username, subcategory=service).first()
    if existing:
        print(f"✅ Test booking already exists: {existing.id}")
        return
    
    # Create test booking
    booking = Booking(
        customer=user.username,
        subcategory=service,
        booking_date=datetime.now(),
        service_date=date.today(),
        total_price=service.price,
        status='pending',
        notes='Test booking created by script'
    )
    booking.save()
    
    print(f"✅ Created test booking: {booking.id}")
    print(f"   Customer: {booking.customer}")
    print(f"   Service: {booking.subcategory.name}")
    print(f"   Status: {booking.status}")
    print(f"   Price: ${booking.total_price}")
    
    # Show all bookings for this user
    all_bookings = Booking.objects.filter(customer=user.username)
    print(f"\n📋 Total bookings for {user.username}: {len(all_bookings)}")
    for b in all_bookings:
        print(f"   - {b.id}: {b.subcategory.name} ({b.status})")

if __name__ == '__main__':
    try:
        create_test_booking()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
