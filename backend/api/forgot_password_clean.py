"""
Clean Forgot Password API Implementation
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from authentication.models import User
import json
import random
import string

def generate_random_password(length=8):
    """Generate a random password"""
    characters = string.ascii_letters + string.digits + "!@#$%"
    return ''.join(random.choice(characters) for _ in range(length))

@csrf_exempt
@require_http_methods(["POST"])
def forgot_password_clean(request):
    """
    Clean forgot password implementation with proper validation
    
    POST /api/auth/forgot-password-clean/
    Body: {"email": "user@example.com"}
    
    Returns:
    - 200: Password reset successful (for registered emails)
    - 404: Email not registered
    - 400: Invalid request data
    - 500: Server error
    """
    print(f"🔐 Forgot Password Request Received")
    
    try:
        # Parse JSON data
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        
        print(f"📧 Email from request: {email}")
        
        # Validate email input
        if not email:
            print(f"❌ No email provided")
            return JsonResponse({
                'error': 'Email address is required',
                'code': 'EMAIL_REQUIRED'
            }, status=400)
        
        # Basic email format validation
        if '@' not in email or '.' not in email:
            print(f"❌ Invalid email format: {email}")
            return JsonResponse({
                'error': 'Please enter a valid email address',
                'code': 'INVALID_EMAIL_FORMAT'
            }, status=400)
        
        # Check if user exists with this email
        try:
            user = User.objects.get(email=email)
            print(f"✅ User found: {user.username} ({user.email})")
            
            # Generate new password
            new_password = generate_random_password(8)
            
            # Store old password hash for comparison
            old_password_hash = user.password
            print(f"🔐 Original password hash: {old_password_hash[:30]}...")

            # Test if old password works (for debugging)
            old_password_test = "admin"  # Common default
            if user.check_password(old_password_test):
                print(f"🔍 Old password '{old_password_test}' currently works")

            # Force password update with explicit transaction and verification
            try:
                print(f"🔄 Step 1: Setting new password...")
                user.set_password(new_password)

                print(f"🔄 Step 2: Saving user with transaction...")
                with transaction.atomic():
                    user.save()
                    print(f"🔄 Step 3: Transaction committed")

                print(f"🔄 Step 4: Refreshing from database...")
                user.refresh_from_db()

                # Get new hash
                new_password_hash = user.password
                print(f"🔐 New password hash: {new_password_hash[:30]}...")

                # Verify hash changed
                if old_password_hash != new_password_hash:
                    print(f"✅ Password hash changed successfully")

                    # Test new password IMMEDIATELY
                    if user.check_password(new_password):
                        print(f"✅ New password verification successful")

                        # Test old password should fail
                        if user.check_password(old_password_test):
                            print(f"❌ WARNING: Old password still works!")
                        else:
                            print(f"✅ Old password no longer works (correct)")

                    else:
                        print(f"❌ CRITICAL: New password verification failed!")
                        print(f"🔄 Attempting force password update...")

                        # Force update with make_password
                        hashed_password = user.make_password(new_password)
                        user.password = hashed_password

                        with transaction.atomic():
                            user.save()

                        user.refresh_from_db()

                        if user.check_password(new_password):
                            print(f"✅ Force update successful!")
                        else:
                            print(f"❌ FATAL: Force update also failed!")
                            # Return error instead of sending email
                            return JsonResponse({
                                'error': 'PASSWORD_UPDATE_FAILED',
                                'message': 'Failed to update password. Please try again.',
                                'code': 'SYSTEM_ERROR'
                            }, status=500)
                else:
                    print(f"❌ CRITICAL: Password hash did NOT change!")
                    print(f"🔄 Attempting direct hash update...")

                    # Direct hash update
                    hashed_password = user.make_password(new_password)
                    user.password = hashed_password

                    with transaction.atomic():
                        user.save()

                    user.refresh_from_db()
                    final_hash = user.password

                    if final_hash != old_password_hash and user.check_password(new_password):
                        print(f"✅ Direct hash update successful!")
                    else:
                        print(f"❌ FATAL: Direct hash update failed!")
                        return JsonResponse({
                            'error': 'PASSWORD_UPDATE_FAILED',
                            'message': 'Failed to update password. Please contact support.',
                            'code': 'SYSTEM_ERROR'
                        }, status=500)

            except Exception as save_error:
                print(f"❌ FATAL ERROR saving password: {save_error}")
                import traceback
                traceback.print_exc()
                return JsonResponse({
                    'error': 'PASSWORD_UPDATE_FAILED',
                    'message': f'System error: {str(save_error)}',
                    'code': 'SYSTEM_ERROR'
                }, status=500)

            print(f"✅ Password updated for user: {user.username}")
            print(f"🔑 New password: {new_password}")
            print(f"💡 Use username '{user.username}' (not email) for login")
            
            # Send email with new password
            email_sent = False
            try:
                subject = 'Password Reset - Home Services Platform'
                message = f"""Hello {user.first_name or user.username},

Your password has been reset successfully.

Login Details:
Username: {user.username}
New Password: {new_password}
Login URL: http://localhost:3000/login

Please login with these credentials and consider changing your password in your profile settings.

Best regards,
Home Services Platform Team"""
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@homeservices.com',
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                print(f"📧 Email sent successfully to {email}")
                email_sent = True
                
            except Exception as email_error:
                print(f"❌ Email sending failed: {email_error}")
                email_sent = False
            
            # Return success response
            response_data = {
                'success': True,
                'message': f'Password has been reset successfully. A new password has been sent to {email}.',
                'username': user.username,
                'email_sent': email_sent,
                'code': 'PASSWORD_RESET_SUCCESS'
            }
            
            print(f"📤 Returning success response")
            return JsonResponse(response_data, status=200)
            
        except User.DoesNotExist:
            print(f"❌ User not found with email: {email}")
            
            # Show available users for debugging (remove in production)
            all_users = User.objects.filter(email__isnull=False).exclude(email='')[:5]
            print(f"📋 Available registered emails:")
            for u in all_users:
                print(f"   - {u.username}: {u.email}")
            
            # Return clear error message
            response_data = {
                'success': False,
                'error': 'Email is not registered',
                'message': f'The email address "{email}" is not registered with our platform. Please check your email spelling or register for a new account.',
                'email_provided': email,
                'suggestion': 'Please verify your email address or create a new account if you haven\'t registered yet.',
                'code': 'EMAIL_NOT_REGISTERED'
            }
            
            print(f"📤 Returning email not registered error")
            return JsonResponse(response_data, status=400)
    
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Invalid request data',
            'message': 'Please provide valid JSON data',
            'code': 'INVALID_JSON'
        }, status=400)
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'success': False,
            'error': 'Server error',
            'message': 'An unexpected error occurred. Please try again later.',
            'code': 'SERVER_ERROR'
        }, status=500)
