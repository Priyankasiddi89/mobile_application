from mongoengine import Document, StringField, DateTimeField, DecimalField, ReferenceField, BooleanField, IntField, ListField
from datetime import datetime

class ServiceCategory(Document):
    name = StringField(required=True, max_length=100)
    description = StringField(required=True)
    icon = StringField(required=True)
    gradient = StringField(required=True)
    
    meta = {'collection': 'service_categories'}

class ServiceSubcategory(Document):
    name = StringField(required=True, max_length=100)
    description = StringField(required=True)
    price = DecimalField(required=True, precision=2)  # Fixed price
    category = ReferenceField(ServiceCategory, required=True)
    
    meta = {'collection': 'service_subcategories'}

class Booking(Document):
    customer = StringField(required=True)  # Customer username
    provider = StringField(null=True)  # Service provider username (assigned when accepted)
    subcategory = ReferenceField(ServiceSubcategory, required=True)
    booking_date = DateTimeField(required=True)
    service_date = DateTimeField(required=True)  # Date when service will be provided
    total_price = DecimalField(required=True, precision=2)
    status = StringField(required=True, choices=['pending', 'accepted', 'confirmed', 'completed', 'cancelled'], default='pending')
    payment_status = StringField(choices=['unpaid', 'paid'], default='unpaid')
    notes = StringField(max_length=500)
    declined_by = ListField(StringField(), default=list)  # List of provider usernames who declined
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {'collection': 'bookings'}
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
