from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import User
from .serializers import UserSerializer
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.permissions import IsAuthenticated
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.authentication import BaseAuthentication, get_authorization_header

USER_STRUCTURE = {
    "End User": ["Head of House", "Family member"],
    "Service Provider": ["Admin", "Employee", "Supervisor"],
    "Platform Provider": ["Admin", "Employee", "Service Desk"]
}

# Custom JWT Authentication for mongoengine users
class MongoengineJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        if not auth or auth[0].lower() != b'bearer':
            return None
        if len(auth) == 1 or len(auth) > 2:
            return None
        try:
            token = auth[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except Exception:
            return None
        user = User.objects(id=payload.get('user_id')).first()
        if not user:
            return None
        return (user, payload)

class RegisterView(APIView):
    def post(self, request):
        data = request.data.copy()
        user_type = data.get('user_type')
        role = data.get('role')
        if user_type not in USER_STRUCTURE:
            return Response({'detail': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)
        if role not in USER_STRUCTURE[user_type]:
            return Response({'detail': 'Invalid role for user type'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects(username=data['username']).first():
            return Response({'detail': 'Username already registered'}, status=status.HTTP_400_BAD_REQUEST)
        data['password'] = make_password(data['password'])
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'msg': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = User.objects(username=username).first()
        if not user or not check_password(password, user.password):
            return Response({'detail': 'Incorrect username or password'}, status=status.HTTP_401_UNAUTHORIZED)
        payload = {
            'user_id': str(user.id),
            'user_type': user.user_type,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(minutes=60),
            'token_type': 'access'
        }
        access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({
            'access': access_token,
            'user_type': user.user_type,
            'role': user.role
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    
    def post(self, request):
        # Since JWT is stateless, logout is handled client-side by deleting the token
        # This endpoint provides a clean way to handle logout requests
        return Response({'msg': 'Logout successful. Please delete the token on client side.'})

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    def get(self, request):
        user = request.user
        if not user:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        data = serializer.data
        data.pop('password', None)
        return Response(data)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [MongoengineJWTAuthentication]
    def get(self, request):
        users = User.objects(is_active=True)
        serializer = UserSerializer(users, many=True)
        for user in serializer.data:
            user.pop('password', None)
        return Response(serializer.data)
