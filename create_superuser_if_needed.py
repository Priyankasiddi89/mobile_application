#!/usr/bin/env python
"""
Create Django superuser only if one doesn't already exist
"""
import os
import django
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

def check_and_create_superuser():
    print("🔍 Checking for existing superuser...")
    print("=" * 50)
    
    User = get_user_model()
    
    # Check if superuser1 exists
    superuser1_exists = User.objects.filter(username='superuser1', is_superuser=True).exists()

    if superuser1_exists:
        superuser1 = User.objects.get(username='superuser1')
        print(f"✅ superuser1 already exists:")
        print(f"   - Username: {superuser1.username}")
        print(f"     Email: {superuser1.email}")
        print(f"     Active: {superuser1.is_active}")
        print(f"     Staff: {superuser1.is_staff}")

        print(f"\n🎯 You can access Django Admin at: http://localhost:8000/admin")
        print(f"   Use superuser1 credentials to login.")
        return True
    
    else:
        print("❌ superuser1 not found. Creating it now...")
        create_default_superuser()
        return False

def create_default_superuser():
    """Create a default superuser with predefined credentials"""
    User = get_user_model()
    
    # Default superuser credentials
    username = "superuser1"
    email = "lakshmipriyankasiddi@gmail.com"
    password = "admin123"
    
    try:
        # Check if username already exists (but not superuser)
        if User.objects.filter(username=username).exists():
            existing_user = User.objects.get(username=username)
            if not existing_user.is_superuser:
                # Promote existing user to superuser
                existing_user.is_superuser = True
                existing_user.is_staff = True
                existing_user.save()
                print(f"✅ Promoted existing user '{username}' to superuser")
            else:
                print(f"✅ User '{username}' is already a superuser")
        else:
            # Create new superuser
            superuser = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"✅ Created new superuser:")
            print(f"   Username: {username}")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
        
        print(f"\n🎯 Django Admin Access:")
        print(f"   URL: http://localhost:8000/admin")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        print(f"\n🔧 Manual creation required:")
        print(f"   Run: python manage.py createsuperuser")

def interactive_superuser_creation():
    """Allow user to create custom superuser interactively"""
    print(f"\n🤔 Would you like to create a custom superuser instead?")
    choice = input("Create custom superuser? (y/n): ").lower().strip()
    
    if choice == 'y':
        print(f"\n📝 Creating custom superuser...")
        print(f"   (Leave blank to use defaults)")
        
        username = input("Username [admin]: ").strip() or "admin"
        email = input("Email [admin@homeservices.com]: ").strip() or "admin@homeservices.com"
        
        import getpass
        password = getpass.getpass("Password [admin123]: ") or "admin123"
        password_confirm = getpass.getpass("Confirm password: ") or "admin123"
        
        if password != password_confirm:
            print("❌ Passwords don't match. Using default password: admin123")
            password = "admin123"
        
        try:
            User = get_user_model()
            
            if User.objects.filter(username=username).exists():
                print(f"❌ Username '{username}' already exists")
                return False
            
            superuser = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            
            print(f"✅ Custom superuser created:")
            print(f"   Username: {username}")
            print(f"   Email: {email}")
            print(f"   Password: {'*' * len(password)}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating custom superuser: {e}")
            return False
    
    return False

if __name__ == "__main__":
    try:
        superuser_exists = check_and_create_superuser()
        
        if not superuser_exists:
            # Ask if user wants to create a custom one
            custom_created = interactive_superuser_creation()
            
            if not custom_created:
                print(f"\n💡 Default superuser credentials:")
                print(f"   Username: admin")
                print(f"   Password: admin123")
        
        print(f"\n🚀 Next steps:")
        print(f"   1. Start Django server: python manage.py runserver")
        print(f"   2. Access Django Admin: http://localhost:8000/admin")
        print(f"   3. Login with superuser credentials")
        print(f"   4. Manage users, bookings, and services")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"\n🔧 Manual superuser creation:")
        print(f"   Run: python manage.py createsuperuser")
        sys.exit(1)
