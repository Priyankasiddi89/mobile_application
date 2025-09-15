#!/usr/bin/env python
"""
Simple forgot password implementation
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail
from django.conf import settings
import json
import random
import string
from authentication.models import User

def generate_password():
    """Generate a simple 8-character password"""
    chars = string.ascii_letters + string.digits + "!@#$"
    password = ''.join(random.choice(chars) for _ in range(8))
    return password

@csrf_exempt
@require_http_methods(["POST"])
def reset_password(request):
    """Reset password endpoint"""
    try:
        # Parse request data
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        
        print(f"🔐 Forgot password request for: {email}")
        
        if not email:
            return JsonResponse({
                'error': 'Email is required'
            }, status=400)
        
        # Find user
        try:
            user = User.objects.get(email=email)
            print(f"✅ User found: {user.username}")
        except User.DoesNotExist:
            print(f"❌ User not found with email: {email}")
            return JsonResponse({
                'error': 'No account found with this email address. Please check your email or register for a new account.'
            }, status=404)
        
        # Generate new password
        new_password = generate_password()

        # Update user password
        user.set_password(new_password)
        user.save()

        print(f"✅ Password reset successful for {user.username}")
        print(f"🔑 New password: {new_password}")

        # Send email with new password
        try:
            subject = 'Password Reset - Home Services Platform'
            message = f"""
Hello {user.first_name or user.username},

Your password has been reset successfully.

Login Details:
- Username: {user.username}
- New Password: {new_password}
- Login URL: http://localhost:3000/login

Please login with these credentials and consider changing your password.

Best regards,
Home Services Platform Team
            """

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

            print(f"📧 Email sent to {email}")
            email_sent = True

        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            email_sent = False

        # Return success response
        response_data = {
            'message': f'Password has been reset successfully for {user.username}.',
            'username': user.username,
            'email_sent': email_sent
        }

        # In development, also return the password
        if settings.DEBUG:
            response_data['new_password'] = new_password
            response_data['message'] += f' New password: {new_password}'
        else:
            response_data['message'] += f' A new password has been sent to {email}.'

        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        print(f"❌ Error in forgot password: {e}")
        return JsonResponse({
            'error': 'An error occurred while processing your request'
        }, status=500)
