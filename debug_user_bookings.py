import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bookings.models import Booking
from authentication.models import User

def debug_user_bookings():
    print("🔍 Debugging User Bookings...\n")
    
    try:
        # Check all users
        all_users = User.objects.all()
        print(f"👥 Total users in database: {len(all_users)}")
        
        end_users = User.objects.filter(user_type='End User')
        print(f"👤 End users: {len(end_users)}")
        
        if len(end_users) > 0:
            for user in end_users:
                print(f"   - {user.username} (Active: {user.is_active})")
        
        # Check all bookings
        all_bookings = Booking.objects.all()
        print(f"\n📋 Total bookings in database: {len(all_bookings)}")
        
        if len(all_bookings) > 0:
            print("\n📝 All bookings:")
            for booking in all_bookings:
                print(f"   - ID: {booking.id}")
                print(f"     Customer: {booking.customer}")
                print(f"     Service: {booking.subcategory.name if booking.subcategory else 'N/A'}")
                print(f"     Status: {booking.status}")
                print(f"     Provider: {booking.provider or 'None'}")
                print()
        
        # Check bookings for each end user
        print("🔍 Bookings per end user:")
        for user in end_users:
            user_bookings = Booking.objects.filter(customer=user.username)
            print(f"   {user.username}: {len(user_bookings)} bookings")
            for booking in user_bookings:
                print(f"      * {booking.subcategory.name if booking.subcategory else 'N/A'} ({booking.status})")
        
        # Test the exact query used in the API
        if len(end_users) > 0:
            test_user = end_users[0]
            print(f"\n🧪 Testing API query for user: {test_user.username}")
            try:
                test_bookings = Booking.objects.filter(customer=test_user.username)
                print(f"   Query result: {len(test_bookings)} bookings")
                
                # Test processing each booking
                for booking in test_bookings:
                    try:
                        booking_data = {
                            'id': str(booking.id),
                            'service_name': booking.subcategory.name if booking.subcategory else 'N/A',
                            'provider_name': booking.provider if booking.provider else 'N/A',
                            'booking_date': booking.booking_date.strftime('%Y-%m-%d') if booking.booking_date else 'N/A',
                            'status': booking.status,
                            'price': float(booking.total_price) if booking.total_price else 0.0,
                        }
                        print(f"   ✅ Successfully processed: {booking_data}")
                    except Exception as e:
                        print(f"   ❌ Error processing booking {booking.id}: {e}")
                        
            except Exception as e:
                print(f"   ❌ Query failed: {e}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_user_bookings()
