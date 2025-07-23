from django.db import models
from django.utils import timezone

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    gradient = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'service_categories'
        verbose_name_plural = 'Service Categories'

    def __str__(self):
        return self.name

class ServiceSubcategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Fixed price
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='subcategories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'service_subcategories'
        verbose_name_plural = 'Service Subcategories'

    def __str__(self):
        return f"{self.name} - ${self.price}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('online', 'Online'),
        ('cod', 'Cash on Delivery'),
    ]

    customer = models.CharField(max_length=150)  # Customer username
    provider = models.CharField(max_length=150, null=True, blank=True)  # Service provider username
    subcategory = models.ForeignKey(ServiceSubcategory, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateTimeField()
    service_date = models.DateTimeField()  # Date when service will be provided
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='online')
    notes = models.TextField(max_length=500, blank=True)
    declined_by = models.TextField(blank=True)  # JSON string of provider usernames who declined
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.id} - {self.customer} - {self.subcategory.name}"

    def get_declined_providers(self):
        """Get list of providers who declined this booking"""
        if self.declined_by:
            import json
            try:
                return json.loads(self.declined_by)
            except:
                return []
        return []

    def add_declined_provider(self, provider_username):
        """Add a provider to the declined list"""
        declined_list = self.get_declined_providers()
        if provider_username not in declined_list:
            declined_list.append(provider_username)
            import json
            self.declined_by = json.dumps(declined_list)
            self.save()


# Many-to-Many relationship for User registered services
class UserRegisteredService(models.Model):
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='user_services')
    service = models.ForeignKey(ServiceSubcategory, on_delete=models.CASCADE, related_name='registered_users')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_registered_services'
        unique_together = ['user', 'service']

    def __str__(self):
        return f"{self.user.username} - {self.service.name}"
