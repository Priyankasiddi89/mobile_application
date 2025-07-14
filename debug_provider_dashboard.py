#!/usr/bin/env python
"""
Debug script to check provider dashboard issues
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_platform.settings')
django.setup()

from bookings.models import Booking, ServiceSubcategory
from auth_app.models import User

def debug_provider_dashboard():
    """Debug provider dashboard issues"""
    print("🔍 Debugging Provider Dashboard Issues...\n")
    
    try:
        # Get all service providers
        providers = User.objects(user_type='Service Provider')
        print(f"👥 Service Providers found: {len(providers)}")
        
        for provider in providers:
            print(f"\n🔧 Provider: {provider.username}")
            print(f"   Active: {provider.is_active}")
            print(f"   Registered Services: {len(provider.registered_services)}")
            
            # Show registered services
            if provider.registered_services:
                print("   📋 Registered for:")
                for service in provider.registered_services:
                    print(f"      - {service.name} (${service.price})")
            else:
                print("   ❌ No registered services")
            
            # Check pending requests (old way - showing all)
            all_pending = Booking.objects(
                status='pending', 
                provider=None, 
                declined_by__ne=provider.username
            )
            print(f"   📥 All pending requests: {len(all_pending)}")
            
            # Check pending requests (new way - filtered by registered services)
            if provider.registered_services:
                filtered_pending = Booking.objects(
                    status='pending', 
                    provider=None, 
                    declined_by__ne=provider.username,
                    subcategory__in=provider.registered_services
                )
                print(f"   📥 Filtered pending requests: {len(filtered_pending)}")
                
                if filtered_pending:
                    print("      Filtered requests:")
                    for req in filtered_pending:
                        print(f"         * {req.id} | {req.customer} | {req.subcategory.name}")
            else:
                print(f"   📥 Filtered pending requests: 0 (no registered services)")
            
            # Check provider's bookings
            provider_bookings = Booking.objects(provider=provider.username)
            print(f"   📋 Provider's bookings: {len(provider_bookings)}")
            
            if provider_bookings:
                print("      Provider's bookings:")
                for booking in provider_bookings:
                    print(f"         * {booking.id} | {booking.status} | {booking.subcategory.name} | Customer: {booking.customer}")
        
        # Show all pending requests in system
        print(f"\n📥 All pending requests in system:")
        all_pending_requests = Booking.objects(status='pending', provider=None)
        print(f"   Total: {len(all_pending_requests)}")
        
        for req in all_pending_requests:
            print(f"      * {req.id} | {req.customer} | {req.subcategory.name} | ${req.total_price}")
            print(f"        Service Date: {req.service_date}")
            print(f"        Declined by: {req.declined_by}")
        
        # Show all services available
        print(f"\n🔧 All services in system:")
        all_services = ServiceSubcategory.objects.all()
        print(f"   Total: {len(all_services)}")
        
        for service in all_services[:5]:  # Show first 5
            print(f"      * {service.name} (${service.price}) - {service.category.name}")
        
        if len(all_services) > 5:
            print(f"      ... and {len(all_services) - 5} more services")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_provider_dashboard()
