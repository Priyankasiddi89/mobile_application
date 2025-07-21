import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from bookings.models import ServiceSubcategory
from mongoengine.errors import DoesNotExist

def fix_provider_services():
    print("🔧 Fixing Provider Service References...\n")
    
    try:
        # Get all service providers
        service_providers = User.objects.filter(user_type='Service Provider')
        print(f"🔧 Found {len(service_providers)} service providers")
        
        for provider in service_providers:
            print(f"\n👤 Provider: {provider.username}")
            
            if not hasattr(provider, 'registered_services') or not provider.registered_services:
                print("   📋 No registered services")
                continue
            
            print(f"   📊 Has {len(provider.registered_services)} registered services")
            
            # Check each registered service
            broken_services = []
            working_services = []
            
            for service in provider.registered_services:
                try:
                    # Try to access service properties
                    service_name = service.name
                    service_price = service.price
                    category_name = service.category.name
                    
                    print(f"   ✅ Working service: {service_name} (${service_price}) - {category_name}")
                    working_services.append(service)
                    
                except DoesNotExist as e:
                    print(f"   ❌ Broken service reference: {e}")
                    broken_services.append(service)
                except Exception as e:
                    print(f"   ⚠️ Error accessing service: {e}")
                    broken_services.append(service)
            
            print(f"   📊 Summary: {len(working_services)} working, {len(broken_services)} broken")
            
            # Fix broken services
            if len(broken_services) > 0:
                print(f"   🔧 Fixing {len(broken_services)} broken services...")
                
                # Option 1: Remove broken services
                print("   🗑️ Removing broken service references...")
                provider.registered_services = working_services
                provider.save()
                
                print(f"   ✅ Updated provider services: {len(working_services)} services remaining")
                
                # Option 2: Replace with valid services (if user wants)
                available_services = ServiceSubcategory.objects.all()
                if len(available_services) > 0 and len(working_services) == 0:
                    print(f"   💡 Provider has no working services. Adding some default services...")
                    
                    # Add first 3 available services as defaults
                    default_services = available_services[:3]
                    for service in default_services:
                        provider.registered_services.append(service)
                        print(f"      + Added: {service.name}")
                    
                    provider.save()
                    print(f"   ✅ Added {len(default_services)} default services")
        
        print(f"\n🎉 Service reference cleanup completed!")
        
        # Show final status
        print(f"\n📊 Final Status:")
        for provider in service_providers:
            working_count = 0
            if hasattr(provider, 'registered_services') and provider.registered_services:
                for service in provider.registered_services:
                    try:
                        _ = service.name  # Test if service is accessible
                        working_count += 1
                    except:
                        pass
            
            print(f"   {provider.username}: {working_count} working services")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def clear_all_provider_services():
    """Alternative: Clear all registered services for all providers"""
    print("🗑️ Clearing All Provider Services...\n")
    
    try:
        service_providers = User.objects.filter(user_type='Service Provider')
        
        for provider in service_providers:
            if hasattr(provider, 'registered_services'):
                old_count = len(provider.registered_services)
                provider.registered_services = []
                provider.save()
                print(f"✅ Cleared {old_count} services for {provider.username}")
        
        print("🎉 All provider services cleared!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def add_sample_services():
    """Add some sample services to providers"""
    print("➕ Adding Sample Services to Providers...\n")
    
    try:
        service_providers = User.objects.filter(user_type='Service Provider')
        available_services = ServiceSubcategory.objects.all()
        
        if len(available_services) == 0:
            print("❌ No services available in database!")
            return
        
        for provider in service_providers:
            # Add first 3 services as samples
            sample_services = available_services[:3]
            provider.registered_services = list(sample_services)
            provider.save()
            
            print(f"✅ Added {len(sample_services)} services to {provider.username}:")
            for service in sample_services:
                print(f"   - {service.name} (${service.price})")
        
        print("🎉 Sample services added!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    print("🚀 Provider Services Repair Tool\n")
    print("Choose an option:")
    print("1. Fix broken service references (recommended)")
    print("2. Clear all provider services")
    print("3. Add sample services to providers")
    print("4. Just check status")
    
    choice = input("\nEnter choice (1/2/3/4): ").strip()
    
    if choice == "1":
        fix_provider_services()
    elif choice == "2":
        clear_all_provider_services()
    elif choice == "3":
        add_sample_services()
    else:
        # Just check status
        fix_provider_services()
