"""
Authentication API Endpoints
Handles user registration, login, logout, and profile management
"""
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from authentication.models import User
from authentication.serializers import UserSerializer
from authentication.views import PostgreSQLJWTAuthentication


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    POST /api/auth/register/
    """
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['username', 'password', 'user_type', 'role']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if user already exists
        if User.objects.filter(username=data['username']).exists():
            return Response(
                {'error': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create(
            username=data['username'],
            password=make_password(data['password']),
            user_type=data['user_type'],
            role=data['role']
        )
        
        return Response(
            {'message': 'User registered successfully', 'user_id': user.id}, 
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    User login
    POST /api/auth/login/
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user using Django's built-in authentication
        from django.contrib.auth import authenticate

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Account is disabled'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT token
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
            'user': {
                'id': user.id,
                'username': user.username,
                'user_type': user.user_type,
                'role': user.role,
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff
            }
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current user information
    GET /api/auth/me/
    """
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update user profile
    PUT /api/auth/me/
    """
    try:
        user = request.user
        data = request.data
        
        # Update allowed fields
        if 'email' in data:
            user.email = data['email']
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
            
        user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    User logout (blacklist refresh token)
    POST /api/auth/logout/
    """
    try:
        # Since JWT is stateless, logout is handled client-side by deleting the token
        # This endpoint provides a clean way to handle logout requests
        return Response(
            {'message': 'Logged out successfully. Please delete the token on client side.'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    """
    Get all users (admin only)
    GET /api/auth/users/
    """
    try:
        # Check if user is admin
        if request.user.user_type != 'Platform Provider' or request.user.role != 'Admin':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
