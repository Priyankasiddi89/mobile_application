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

        # Generate JWT token using SimpleJWT
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

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


def check_user_permission(user, permission_codename):
    """Check if user has a specific permission based on their user_type and role"""
    from authentication.models import UserTypeRolePermission, Permission

    print(f"DEBUG: Checking permission '{permission_codename}' for user: {user.username}")
    print(f"DEBUG: User type: {user.user_type}, Role: {user.role}")

    try:
        permission = Permission.objects.get(codename=permission_codename)
        print(f"DEBUG: Found permission: {permission.name}")

        user_permission = UserTypeRolePermission.objects.get(
            user_type=user.user_type,
            role=user.role,
            permission=permission,
            is_granted=True
        )
        print(f"DEBUG: Permission granted: {user_permission}")
        return True
    except Permission.DoesNotExist:
        print(f"DEBUG: Permission '{permission_codename}' does not exist")
        return False
    except UserTypeRolePermission.DoesNotExist:
        print(f"DEBUG: User does not have permission '{permission_codename}' or it's not granted")
        return False


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current user information
    GET /api/auth/me/

    Note: This endpoint always returns user data for authentication purposes.
    Profile viewing permissions are enforced at the frontend level.
    """
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@authentication_classes([PostgreSQLJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get user profile information with permission check
    GET /api/auth/profile/

    This endpoint enforces the 'view_own_profile' permission.
    """
    try:
        # Check if user has permission to view their own profile
        if not check_user_permission(request.user, 'view_own_profile'):
            return Response(
                {'error': 'You do not have permission to view your profile. Contact your administrator to grant "View Own Profile" permission.'},
                status=status.HTTP_403_FORBIDDEN
            )

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
    Update user profile including username and password
    PUT /api/auth/me/update/
    """
    try:
        # Check if user has permission to edit their own profile
        if not check_user_permission(request.user, 'edit_own_profile'):
            return Response(
                {'error': 'You do not have permission to edit your profile. Contact your administrator to grant "Edit Own Profile" permission.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user = request.user
        data = request.data

        print(f"DEBUG: Profile update request for user: {user.username}")
        print(f"DEBUG: Update data keys: {list(data.keys())}")

        # Update username if provided
        if 'username' in data:
            new_username = data['username'].strip()
            if not new_username:
                return Response(
                    {'error': 'Username cannot be empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if username is already taken by another user
            from authentication.models import User
            if User.objects.filter(username=new_username).exclude(id=user.id).exists():
                return Response(
                    {'error': 'Username is already taken'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            print(f"DEBUG: Updating username from {user.username} to {new_username}")
            user.username = new_username

        # Handle password change if provided
        if 'old_password' in data and 'new_password' in data:
            old_password = data['old_password']
            new_password = data['new_password']

            print(f"DEBUG: Password change requested")

            # Verify old password
            from django.contrib.auth import authenticate
            if not authenticate(username=user.username, password=old_password):
                return Response(
                    {'error': 'Current password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate new password
            if len(new_password) < 6:
                return Response(
                    {'error': 'New password must be at least 6 characters long'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            print(f"DEBUG: Setting new password")
            user.set_password(new_password)

        # Update other allowed fields
        if 'email' in data:
            user.email = data['email']
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']

        user.save()
        print(f"DEBUG: User profile updated successfully")

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
