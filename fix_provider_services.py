#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from bookings.models import UserRegisteredService, ServiceSubcategory

def check_and_fix_provider_services():
    """Check provider services and register them if needed"""
    
    # Get the provider
    try:
        provider = User.objects.get(username='spc')
        print(f"Found provider: {provider.username} (ID: {provider.id})")
    except User.DoesNotExist:
        print("Provider 'spc' not found!")
        return
    
    # Check current registered services
    current_services = UserRegisteredService.objects.filter(user=provider)
    print(f"\nCurrent registered services: {current_services.count()}")
    
    for service in current_services:
        print(f"- {service.service.name} (ID: {service.service.id}) - ${service.provider_price} - Available: {service.is_available}")
    
    # Get all available services
    all_services = ServiceSubcategory.objects.all()
    print(f"\nAll available services: {all_services.count()}")
    
    # Register provider for all services if not already registered
    registered_count = 0
    for service in all_services:
        if not UserRegisteredService.objects.filter(user=provider, service=service).exists():
            # Register with a default price
            UserRegisteredService.objects.create(
                user=provider,
                service=service,
                provider_price=float(service.price) + 25.00,  # Add $25 to base price
                description=f"Professional {service.name} service by {provider.username}",
                is_available=True
            )
            print(f"✅ Registered for: {service.name} (ID: {service.id}) - ${float(service.price) + 25.00}")
            registered_count += 1
        else:
            print(f"✅ Already registered for: {service.name} (ID: {service.id})")
    
    print(f"\n✅ Registered for {registered_count} new services")
    
    # Show final status
    final_services = UserRegisteredService.objects.filter(user=provider)
    print(f"\nFinal registered services: {final_services.count()}")

if __name__ == "__main__":
    check_and_fix_provider_services()
