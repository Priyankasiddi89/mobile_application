from rest_framework import serializers
from .models import User

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)
    user_type = serializers.CharField(required=True)
    role = serializers.CharField(required=True)
    is_active = serializers.BooleanField(default=True)

    def create(self, validated_data):
        user = User(**validated_data)
        user.save()
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['id'] = str(instance.id)
        return data 