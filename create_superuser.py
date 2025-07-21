import os
import sys
import django
import getpass
from django.contrib.auth.hashers import make_password

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User

def create_superuser():
    print("🔐 Creating Superuser for MongoDB-based System\n")
    
    try:
        # Get username
        while True:
            username = input("Username: ").strip()
            if not username:
                print("❌ Username cannot be empty. Please try again.")
                continue
            
            # Check if username already exists
            existing_user = User.objects(username=username).first()
            if existing_user:
                print(f"❌ Username '{username}' already exists. Please choose a different username.")
                continue
            
            break
        
        # Get email (optional)
        email = input("Email address (optional): ").strip()
        if not email:
            email = f"{username}@admin.com"
        
        # Get password
        while True:
            password = getpass.getpass("Password: ")
            if len(password) < 6:
                print("❌ Password must be at least 6 characters long. Please try again.")
                continue
            
            password_confirm = getpass.getpass("Password (again): ")
            if password != password_confirm:
                print("❌ Passwords don't match. Please try again.")
                continue
            
            break
        
        # Create superuser
        print("\n🔧 Creating superuser...")
        
        # Hash the password
        hashed_password = make_password(password)
        
        # Create user with admin privileges
        superuser = User(
            username=username,
            password=hashed_password,
            user_type='Platform Provider',  # Admin user type
            role='Admin',
            is_active=True
        )
        
        # Save to MongoDB
        superuser.save()
        
        print(f"✅ Superuser '{username}' created successfully!")
        print(f"📧 Email: {email}")
        print(f"🔑 User Type: Platform Provider")
        print(f"👑 Role: Admin")
        
        print(f"\n🌐 You can now access:")
        print(f"   • Django Admin: http://localhost:8000/admin")
        print(f"   • API with admin privileges")
        print(f"   • Platform provider dashboard")
        
        print(f"\n📝 Login Credentials:")
        print(f"   Username: {username}")
        print(f"   Password: [the password you entered]")
        
        return True
        
    except KeyboardInterrupt:
        print("\n❌ Operation cancelled by user.")
        return False
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_quick_admin():
    """Create a quick admin user with default credentials"""
    print("🚀 Creating Quick Admin User...\n")
    
    try:
        username = "admin"
        password = "admin123"
        email = "admin@example.com"
        
        # Check if admin already exists
        existing_admin = User.objects(username=username).first()
        if existing_admin:
            print(f"✅ Admin user '{username}' already exists!")
            print(f"📝 Login with: {username} / admin123")
            return True
        
        # Create admin user
        hashed_password = make_password(password)
        
        admin_user = User(
            username=username,
            password=hashed_password,
            user_type='Platform Provider',
            role='Admin',
            is_active=True
        )
        
        admin_user.save()
        
        print(f"✅ Quick admin user created successfully!")
        print(f"📝 Login Credentials:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"   Email: {email}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating quick admin: {e}")
        return False

def list_existing_users():
    """List all existing users"""
    print("👥 Existing Users in Database:\n")
    
    try:
        all_users = User.objects.all()
        
        if len(all_users) == 0:
            print("📭 No users found in database.")
            return
        
        print(f"Found {len(all_users)} users:")
        print("-" * 60)
        
        for user in all_users:
            print(f"👤 {user.username}")
            print(f"   Type: {user.user_type}")
            print(f"   Role: {user.role}")
            print(f"   Active: {user.is_active}")
            print(f"   ID: {user.id}")
            print()
        
    except Exception as e:
        print(f"❌ Error listing users: {e}")

if __name__ == '__main__':
    print("🚀 MongoDB Superuser Creation Tool\n")
    
    # First, list existing users
    list_existing_users()
    
    print("Choose an option:")
    print("1. Create custom superuser (interactive)")
    print("2. Create quick admin (username: admin, password: admin123)")
    print("3. Just list existing users")
    
    choice = input("\nEnter choice (1/2/3): ").strip()
    
    if choice == "1":
        create_superuser()
    elif choice == "2":
        create_quick_admin()
    elif choice == "3":
        print("✅ User list shown above.")
    else:
        print("❌ Invalid choice. Creating custom superuser...")
        create_superuser()
    
    print("\n🎉 Done! You can now start the Django server and login.")
