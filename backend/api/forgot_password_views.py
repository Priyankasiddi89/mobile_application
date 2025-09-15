#!/usr/bin/env python
"""
Dedicated views for forgot password functionality
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
def forgot_password_view(request):
    """Forgot password view - proper Django view"""
    print(f"🔐 Forgot password view called")
    
    try:
        # Parse request data
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        
        print(f"📧 Email from request: {email}")
        
        if not email:
            print(f"❌ No email provided")
            return JsonResponse({'error': 'Email is required'}, status=400)
        
        # Find user
        try:
            user = User.objects.get(email=email)
            print(f"✅ User found: {user.username}")
        except User.DoesNotExist:
            print(f"❌ User not found with email: {email}")
            
            # Show available users for debugging
            all_users = User.objects.all()[:5]
            print(f"📋 Available users:")
            for u in all_users:
                print(f"   - {u.username}: {u.email or 'No email'}")
            
            print(f"📤 Returning 404 JSON response for unregistered email")
            response = JsonResponse({
                'error': f'The email address "{email}" is not registered with our platform. Please check your email spelling or register for a new account.',
                'email_provided': email,
                'suggestion': 'Please verify your email address or create a new account if you haven\'t registered yet.'
            }, status=404)
            print(f"📤 Response created successfully")
            return response
        
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
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            print(f"📧 Email sent successfully to {email}")
            email_sent = True
            
        except Exception as email_error:
            print(f"❌ Failed to send email: {email_error}")
            email_sent = False
        
        # Return success response (NO PASSWORD in response for security)
        response_data = {
            'message': f'Password has been reset successfully. A new password has been sent to {email}.',
            'username': user.username,
            'email_sent': email_sent
        }
        
        print(f"📤 Returning success response (password sent via email only)")
        return JsonResponse(response_data, status=200)
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        print(f"❌ Unexpected error in forgot password view: {e}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        print(f"📤 Returning 500 error response")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
