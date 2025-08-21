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
        # End User roles
        ('Head of House', 'Head of House'),
        ('Family Member', 'Family Member'),
        # Service Provider roles
        ('Admin', 'Admin'),
        ('Employee', 'Employee'),
        ('Supervisor', 'Supervisor'),
        # Platform Provider roles (hidden)
        ('Service Desk', 'Service Desk'),
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


class Permission(models.Model):
    """Define available permissions in the system"""
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default='general')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['category', 'name']


class UserTypeRolePermission(models.Model):
    """Define permissions for specific user type and role combinations"""
    user_type = models.CharField(max_length=20, choices=User.USER_TYPE_CHOICES)
    role = models.CharField(max_length=20, choices=User.ROLE_CHOICES)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    is_granted = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user_type', 'role', 'permission']
        ordering = ['user_type', 'role', 'permission__category', 'permission__name']

    def __str__(self):
        return f"{self.user_type} - {self.role}: {self.permission.name} ({'✓' if self.is_granted else '✗'})"


class UserPermissionOverride(models.Model):
    """Override permissions for specific users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    is_granted = models.BooleanField(default=False)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='granted_permissions')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'permission']
        ordering = ['user__username', 'permission__category', 'permission__name']

    def __str__(self):
        return f"{self.user.username}: {self.permission.name} ({'✓' if self.is_granted else '✗'})"
    
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
