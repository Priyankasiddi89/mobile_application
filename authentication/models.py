from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('End User', 'End User'),
        ('Service Provider', 'Service Provider'),
        ('Platform Provider', 'Platform Provider'),
    ]

    ROLE_CHOICES = [
        ('Customer', 'Customer'),
        ('Provider', 'Provider'),
        ('Admin', 'Admin'),
    ]

    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    # registered_services will be handled through a ManyToMany relationship

    def __str__(self):
        return f"{self.username} ({self.user_type})"

    def get_registered_services(self):
        """Get registered services for this user"""
        from bookings.models import UserRegisteredService
        return [urs.service for urs in UserRegisteredService.objects.filter(user=self)]
    
    def add_registered_service(self, service):
        """Add a service to registered services"""
        from bookings.models import UserRegisteredService
        UserRegisteredService.objects.get_or_create(user=self, service=service)
    
    def remove_registered_service(self, service):
        """Remove a service from registered services"""
        from bookings.models import UserRegisteredService
        UserRegisteredService.objects.filter(user=self, service=service).delete()
    
    def is_registered_for_service(self, service):
        """Check if user is registered for a service"""
        from bookings.models import UserRegisteredService
        return UserRegisteredService.objects.filter(user=self, service=service).exists()
    
    @property
    def registered_services(self):
        """Backward compatibility property"""
        return self.get_registered_services()
