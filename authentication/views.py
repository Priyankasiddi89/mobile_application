from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import User
from .serializers import UserSerializer
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import authenticate
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

# PostgreSQL JWT Authentication (renamed from MongoengineJWTAuthentication)
class PostgreSQLJWTAuthentication(BaseAuthentication):
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
        try:
            user = User.objects.get(id=payload.get('user_id'))
        except User.DoesNotExist:
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
        if User.objects.filter(username=data['username']).exists():
            return Response({'detail': 'Username already registered'}, status=status.HTTP_400_BAD_REQUEST)
        data['password'] = make_password(data['password'])
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()

            # Create default availability for service providers
            if user_type == 'Service Provider':
                self.create_default_availability(user)

            return Response({'msg': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create_default_availability(self, user):
        """Create default availability slots for new service providers"""
        try:
            from datetime import date, timedelta, time
            from bookings.models import ProviderAvailability, ProviderOffDay

            # Default time slots
            default_slots = [
                (time(9, 0), time(12, 0)),   # 9 AM - 12 PM
                (time(12, 0), time(15, 0)),  # 12 PM - 3 PM
                (time(15, 0), time(18, 0)),  # 3 PM - 6 PM
                (time(18, 0), time(21, 0)),  # 6 PM - 9 PM
            ]

            start_date = date.today()
            days_ahead = 30  # Create availability for next 30 days

            for day_offset in range(days_ahead):
                current_date = start_date + timedelta(days=day_offset)

                # Check if it's Sunday (weekday 6)
                if current_date.weekday() == 6:  # Sunday
                    # Mark Sunday as off day
                    ProviderOffDay.objects.get_or_create(
                        provider=user,
                        date=current_date,
                        defaults={'reason': 'Default Sunday off'}
                    )
                else:
                    # Create availability slots for non-Sunday days
                    for start_time, end_time in default_slots:
                        ProviderAvailability.objects.get_or_create(
                            provider=user,
                            date=current_date,
                            start_time=start_time,
                            end_time=end_time,
                            defaults={'is_available': True}
                        )
        except Exception as e:
            # Log error but don't fail registration
            print(f"Error creating default availability for {user.username}: {e}")

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'detail': 'Incorrect username or password'}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, user.password):
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
    authentication_classes = [PostgreSQLJWTAuthentication]
    
    def post(self, request):
        # Since JWT is stateless, logout is handled client-side by deleting the token
        # This endpoint provides a clean way to handle logout requests
        return Response({'msg': 'Logout successful. Please delete the token on client side.'})

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]

    def get(self, request):
        user = request.user
        if not user:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        data = serializer.data
        data.pop('password', None)
        return Response(data)

    def put(self, request):
        """Update user profile"""
        user = request.user
        if not user:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Only allow updating certain fields
        allowed_fields = ['email', 'role']
        update_data = {}

        for field in allowed_fields:
            if field in request.data:
                update_data[field] = request.data[field]

        if update_data:
            for field, value in update_data.items():
                setattr(user, field, value)
            user.save()

        serializer = UserSerializer(user)
        data = serializer.data
        data.pop('password', None)
        return Response(data)

    def patch(self, request):
        """Partial update user profile"""
        return self.put(request)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [PostgreSQLJWTAuthentication]
    def get(self, request):
        users = User.objects.filter(is_active=True)
        serializer = UserSerializer(users, many=True)
        for user in serializer.data:
            user.pop('password', None)
        return Response(serializer.data)
