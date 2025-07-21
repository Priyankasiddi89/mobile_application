import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from mongoengine.errors import DoesNotExist

def remove_unknown_services():
    print("🗑️ Removing Unknown Services from All Providers...\n")
    
    try:
        # Get all service providers
        service_providers = User.objects.filter(user_type='Service Provider')
        print(f"🔧 Found {len(service_providers)} service providers")
        
        total_removed = 0
        
        for provider in service_providers:
            print(f"\n👤 Provider: {provider.username}")
            
            if not hasattr(provider, 'registered_services') or not provider.registered_services:
                print("   📋 No registered services")
                continue
            
            original_count = len(provider.registered_services)
            print(f"   📊 Currently has {original_count} registered services")
            
            # Filter out broken/unknown services
            working_services = []
            removed_count = 0
            
            for service in provider.registered_services:
                try:
                    # Try to access service properties to test if it's valid
                    service_name = service.name
                    service_price = service.price
                    category_name = service.category.name
                    
                    # If we get here, the service is valid
                    working_services.append(service)
                    print(f"   ✅ Keeping: {service_name} (${service_price}) - {category_name}")
                    
                except DoesNotExist:
                    print(f"   🗑️ Removing: Broken service reference (DoesNotExist)")
                    removed_count += 1
                except Exception as e:
                    print(f"   🗑️ Removing: Invalid service ({str(e)[:50]}...)")
                    removed_count += 1
            
            # Update provider's registered services
            provider.registered_services = working_services
            provider.save()
            
            total_removed += removed_count
            print(f"   📊 Result: Kept {len(working_services)}, Removed {removed_count}")
        
        print(f"\n🎉 Cleanup Complete!")
        print(f"   🗑️ Total unknown services removed: {total_removed}")
        
        # Show final status
        print(f"\n📊 Final Status:")
        for provider in service_providers:
            if hasattr(provider, 'registered_services') and provider.registered_services:
                valid_count = 0
                for service in provider.registered_services:
                    try:
                        _ = service.name  # Test if service is accessible
                        valid_count += 1
                    except:
                        pass
                print(f"   {provider.username}: {valid_count} valid services")
            else:
                print(f"   {provider.username}: 0 services")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def remove_all_services():
    """Remove all registered services for all providers"""
    print("🗑️ Removing ALL Services from All Providers...\n")
    
    try:
        service_providers = User.objects.filter(user_type='Service Provider')
        
        for provider in service_providers:
            if hasattr(provider, 'registered_services'):
                old_count = len(provider.registered_services)
                provider.registered_services = []
                provider.save()
                print(f"✅ Cleared {old_count} services for {provider.username}")
        
        print("🎉 All services cleared from all providers!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    print("🚀 Service Cleanup Tool\n")
    print("Choose an option:")
    print("1. Remove only unknown/broken services (recommended)")
    print("2. Remove ALL services from all providers")
    
    choice = input("\nEnter choice (1/2): ").strip()
    
    if choice == "2":
        confirm = input("⚠️ This will remove ALL services. Are you sure? (yes/no): ").strip().lower()
        if confirm == "yes":
            remove_all_services()
        else:
            print("❌ Cancelled")
    else:
        remove_unknown_services()
