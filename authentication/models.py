from django.db import models
from mongoengine import Document, StringField, BooleanField

# Create your models here.

class User(Document):
    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    user_type = StringField(required=True)
    role = StringField(required=True)
    is_active = BooleanField(default=True)
    @property
    def is_authenticated(self):
        return True
