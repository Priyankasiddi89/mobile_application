from django.db import models
from mongoengine import Document, StringField, BooleanField, ListField, ReferenceField
from bookings.models import ServiceSubcategory

# Create your models here.

class User(Document):
    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    user_type = StringField(required=True)
    role = StringField(required=True)
    is_active = BooleanField(default=True)
    registered_services = ListField(ReferenceField(ServiceSubcategory), default=list)  # For providers
    @property
    def is_authenticated(self):
        return True
