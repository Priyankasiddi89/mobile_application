import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from bookings.models import ServiceSubcategory

def debug_user_services():
    print("🔧 Debugging User Services...\n")
    
    try:
        # Check all users
        all_users = User.objects.all()
        print(f"👥 Total users: {len(all_users)}")
        
        service_providers = User.objects.filter(user_type='Service Provider')
        print(f"🔧 Service providers: {len(service_providers)}")
        
        if len(service_providers) == 0:
            print("❌ No service providers found!")
            return
        
        # Check each service provider
        for provider in service_providers:
            print(f"\n🔧 Provider: {provider.username}")
            print(f"   Active: {provider.is_active}")
            print(f"   User type: {provider.user_type}")
            
            # Check registered_services attribute
            try:
                registered_services = provider.registered_services
                print(f"   ✅ Has registered_services attribute: {type(registered_services)}")
                print(f"   📊 Number of registered services: {len(registered_services)}")
                
                if len(registered_services) > 0:
                    print("   📋 Registered services:")
                    for service in registered_services:
                        try:
                            print(f"      - {service.name} (${service.price})")
                        except Exception as service_error:
                            print(f"      - Error loading service: {service_error}")
                else:
                    print("   📋 No registered services")
                    
            except Exception as e:
                print(f"   ❌ Error accessing registered_services: {e}")
        
        # Check available services
        print(f"\n🔧 Available services in database:")
        all_services = ServiceSubcategory.objects.all()
        print(f"   Total services: {len(all_services)}")
        
        if len(all_services) > 0:
            print("   Sample services:")
            for service in all_services[:3]:
                print(f"      - {service.name} (${service.price}) - {service.category.name}")
        
        # Test registering a service
        if len(service_providers) > 0 and len(all_services) > 0:
            test_provider = service_providers[0]
            test_service = all_services[0]
            
            print(f"\n🧪 Testing service registration...")
            print(f"   Provider: {test_provider.username}")
            print(f"   Service: {test_service.name}")
            
            # Check if already registered
            if test_service in test_provider.registered_services:
                print("   ✅ Service already registered")
            else:
                print("   📝 Service not registered, adding...")
                try:
                    test_provider.registered_services.append(test_service)
                    test_provider.save()
                    print("   ✅ Successfully registered service")
                    
                    # Verify
                    updated_provider = User.objects.get(id=test_provider.id)
                    print(f"   ✅ Verification: {len(updated_provider.registered_services)} services registered")
                    
                except Exception as reg_error:
                    print(f"   ❌ Error registering service: {reg_error}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_user_services()
