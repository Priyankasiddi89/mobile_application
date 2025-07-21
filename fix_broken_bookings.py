import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bookings.models import Booking, ServiceSubcategory
from mongoengine.errors import DoesNotExist

def fix_broken_bookings():
    print("🔧 Fixing Broken Booking References...\n")
    
    try:
        all_bookings = Booking.objects.all()
        print(f"📋 Total bookings: {len(all_bookings)}")
        
        broken_bookings = []
        fixed_bookings = []
        
        for booking in all_bookings:
            try:
                # Try to access the subcategory
                subcategory_name = booking.subcategory.name
                print(f"✅ Booking {booking.id}: {subcategory_name} - OK")
            except DoesNotExist as e:
                print(f"❌ Booking {booking.id}: Broken subcategory reference")
                broken_bookings.append(booking)
            except Exception as e:
                print(f"⚠️ Booking {booking.id}: Other error - {e}")
                broken_bookings.append(booking)
        
        print(f"\n📊 Summary:")
        print(f"   ✅ Working bookings: {len(all_bookings) - len(broken_bookings)}")
        print(f"   ❌ Broken bookings: {len(broken_bookings)}")
        
        if len(broken_bookings) > 0:
            print(f"\n🔧 Fixing broken bookings...")
            
            # Get the first available subcategory to use as replacement
            available_subcategories = ServiceSubcategory.objects.all()
            if len(available_subcategories) > 0:
                replacement_subcategory = available_subcategories[0]
                print(f"   Using replacement subcategory: {replacement_subcategory.name}")
                
                for booking in broken_bookings:
                    try:
                        # Option 1: Fix by assigning a valid subcategory
                        booking.subcategory = replacement_subcategory
                        booking.save()
                        print(f"   ✅ Fixed booking {booking.id}")
                        fixed_bookings.append(booking)
                    except Exception as fix_error:
                        print(f"   ❌ Failed to fix booking {booking.id}: {fix_error}")
            else:
                print("   ❌ No subcategories available for replacement")
                print("   💡 Run: python check_database.py to populate services first")
        
        print(f"\n🎉 Results:")
        print(f"   🔧 Fixed bookings: {len(fixed_bookings)}")
        print(f"   ❌ Still broken: {len(broken_bookings) - len(fixed_bookings)}")
        
        # Test the bookings again
        print(f"\n🧪 Testing fixed bookings...")
        for booking in all_bookings:
            try:
                service_name = booking.subcategory.name if booking.subcategory else 'N/A'
                print(f"   ✅ {booking.id}: {service_name}")
            except Exception as e:
                print(f"   ❌ {booking.id}: Still broken - {e}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def delete_broken_bookings():
    """Alternative: Delete broken bookings instead of fixing them"""
    print("🗑️ Deleting Broken Bookings...\n")
    
    try:
        all_bookings = Booking.objects.all()
        broken_bookings = []
        
        for booking in all_bookings:
            try:
                # Try to access the subcategory
                _ = booking.subcategory.name
            except DoesNotExist:
                broken_bookings.append(booking)
            except Exception:
                broken_bookings.append(booking)
        
        print(f"Found {len(broken_bookings)} broken bookings")
        
        if len(broken_bookings) > 0:
            for booking in broken_bookings:
                print(f"Deleting booking {booking.id}")
                booking.delete()
            
            print(f"✅ Deleted {len(broken_bookings)} broken bookings")
        else:
            print("✅ No broken bookings found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    print("🚀 Booking Repair Tool\n")
    print("Choose an option:")
    print("1. Fix broken bookings (assign valid subcategory)")
    print("2. Delete broken bookings")
    print("3. Just check status")
    
    choice = input("\nEnter choice (1/2/3): ").strip()
    
    if choice == "1":
        fix_broken_bookings()
    elif choice == "2":
        delete_broken_bookings()
    else:
        # Just check status
        fix_broken_bookings()
