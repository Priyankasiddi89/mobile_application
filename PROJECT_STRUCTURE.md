# 🏗️ Project Structure

## 📁 Root Directory
```
home-services-platform/
├── 📄 README.md                           # Main documentation
├── 📄 requirements.txt                    # Python dependencies
├── 📄 manage.py                          # Django management script
├── 📄 PROJECT_STRUCTURE.md               # This file
├── 📄 create_test_users_postgresql.py    # Create demo users
├── 📄 update_services_database.py        # Populate service catalog
│
├── 📁 backend/                           # Django project settings
│   ├── __init__.py
│   ├── settings.py                       # Main configuration
│   ├── urls.py                          # Root URL routing
│   ├── wsgi.py                          # WSGI configuration
│   └── asgi.py                          # ASGI configuration
│
├── 📁 authentication/                    # User management app
│   ├── models.py                        # User model
│   ├── views.py                         # Auth API endpoints
│   ├── serializers.py                   # User serialization
│   ├── urls.py                          # Auth URL routing
│   └── migrations/                      # Database migrations
│
├── 📁 bookings/                         # Core booking system
│   ├── models.py                        # Booking, Service models
│   ├── views.py                         # Booking API endpoints
│   ├── serializers.py                   # Data serialization
│   ├── urls.py                          # Booking URL routing
│   ├── admin.py                         # Django admin config
│   └── migrations/                      # Database migrations
│
├── 📁 end_user_dashboard/               # Customer dashboard
│   ├── views.py                         # Customer API endpoints
│   └── urls.py                          # Customer URL routing
│
├── 📁 service_provider/                 # Provider management
│   └── dashboard/                       # Provider dashboard
│       ├── views.py                     # Provider API endpoints
│       └── urls.py                      # Provider URL routing
│
├── 📁 platform_provider_dashboard/     # Admin dashboard
│   ├── views.py                         # Admin API endpoints
│   └── urls.py                          # Admin URL routing
│
├── 📁 frontend/                         # Next.js application
│   ├── 📄 package.json                 # Node.js dependencies
│   ├── 📄 next.config.ts               # Next.js configuration
│   ├── 📄 tsconfig.json                # TypeScript configuration
│   │
│   ├── 📁 app/                         # App Router (Next.js 13+)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Home page
│   │   ├── login/                      # Login page
│   │   ├── register/                   # Registration page
│   │   ├── end_user_dashboard/         # Customer dashboard
│   │   └── service_provider_dashboard/ # Provider dashboard
│   │
│   ├── 📁 public/                      # Static assets
│   └── 📁 node_modules/                # Node.js packages
│
└── 📁 venv/                            # Python virtual environment
```

## 🔧 Key Files & Their Purpose

### **Backend Core**
- `manage.py` - Django management commands
- `backend/settings.py` - Database, CORS, JWT configuration
- `backend/urls.py` - Main API routing

### **Authentication System**
- `authentication/models.py` - User model with roles
- `authentication/views.py` - Login, register, profile APIs
- `authentication/serializers.py` - User data validation

### **Booking System**
- `bookings/models.py` - Service categories, bookings, user services
- `bookings/views.py` - Service catalog, booking creation APIs
- `bookings/serializers.py` - Data transformation for APIs

### **Dashboard APIs**
- `end_user_dashboard/views.py` - Customer booking management
- `service_provider/dashboard/views.py` - Provider request management
- `platform_provider_dashboard/views.py` - Admin system management

### **Frontend Application**
- `frontend/app/layout.tsx` - Global layout and navigation
- `frontend/app/end_user_dashboard/` - Customer interface
- `frontend/app/service_provider_dashboard/` - Provider interface

### **Database Setup**
- `create_test_users_postgresql.py` - Creates demo accounts
- `update_services_database.py` - Populates service catalog

## 🗄️ Database Tables

### **Core Tables**
1. `auth_user` - User accounts and authentication
2. `bookings_servicecategory` - Service categories (6 categories)
3. `bookings_servicesubcategory` - Individual services (24+ services)
4. `bookings_booking` - Customer service requests
5. `bookings_userregisteredservice` - Provider service registrations

### **Key Relationships**
- Users → Bookings (one-to-many)
- Service Categories → Subcategories (one-to-many)
- Users → Registered Services (many-to-many via UserRegisteredService)
- Bookings → Service Subcategories (many-to-one)

## 🚀 Development Workflow

### **Backend Development**
1. Activate virtual environment: `venv\Scripts\activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Start server: `python manage.py runserver`

### **Frontend Development**
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

### **Database Management**
1. Create migrations: `python manage.py makemigrations`
2. Apply migrations: `python manage.py migrate`
3. Access Django admin: `http://localhost:8000/admin`
4. Database shell: `python manage.py dbshell`

## 🔄 API Flow

### **Customer Journey**
1. `POST /api/auth/register/` - Create account
2. `POST /api/auth/login/` - Get JWT token
3. `GET /api/bookings/categories/` - Browse services
4. `POST /api/bookings/create/` - Book service
5. `GET /api/end_user_dashboard/bookings/` - Track requests

### **Provider Journey**
1. `POST /api/auth/register/` - Create provider account
2. `POST /api/service_provider_dashboard/services/` - Register for services
3. `GET /api/service_provider_dashboard/requests/` - View incoming requests
4. `POST /api/service_provider_dashboard/accept/<id>/` - Accept request
5. `POST /api/service_provider_dashboard/complete/<id>/` - Mark completed

## 📦 Dependencies

### **Backend (Python)**
- Django 4.2.7 - Web framework
- Django REST Framework 3.14.0 - API framework
- psycopg2-binary 2.9.9 - PostgreSQL adapter
- PyJWT 2.8.0 - JWT token handling
- django-cors-headers 4.3.1 - CORS support

### **Frontend (Node.js)**
- Next.js 14+ - React framework
- TypeScript - Type safety
- React 18+ - UI library

## 🎯 Production Deployment

### **Backend**
- Use `gunicorn` for WSGI server
- Configure `whitenoise` for static files
- Set up PostgreSQL database
- Configure environment variables

### **Frontend**
- Build with `npm run build`
- Deploy static files or use Vercel/Netlify
- Configure API base URL for production

---

**This structure provides a clean, maintainable codebase for the home services platform.** 🏗️
