# Django + MongoDB Authentication API

## Status

✅ Registration, login, logout, and authenticated endpoints are working and tested successfully (as of July 2025).

---

This backend provides authentication APIs using Django, MongoDB (via mongoengine), and JWT (SimpleJWT). Below are instructions for running the backend and testing the APIs using PowerShell's Invoke-WebRequest and Postman.

---

## Getting Started

### 1. Install Requirements

```powershell
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root with your MongoDB Atlas connection string:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
MONGO_DB_NAME=virtual_Presenz
```

### 3. Run the Server

```powershell
# 🚀 Service Platform - Complete Setup & API Documentation

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Authentication APIs](#authentication-apis)
- [Service Provider APIs](#service-provider-apis)
- [End User APIs](#end-user-apis)
- [Booking Management APIs](#booking-management-apis)
- [Service Management APIs](#service-management-apis)
- [Payment APIs](#payment-apis)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (Download from [python.org](https://python.org))
- **Node.js 16+** (Download from [nodejs.org](https://nodejs.org))
- **MongoDB** (Download from [mongodb.com](https://mongodb.com) or use MongoDB Atlas)
- **Git** (Download from [git-scm.com](https://git-scm.com))

### 1. Clone Repository
```bash
git clone <repository-url>
cd service-platform
```

## 📝 Detailed Setup Instructions

### 2. Backend Setup (Django)

#### Step 2.1: Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Windows (Command Prompt):
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate
```

#### Step 2.2: Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# If requirements.txt doesn't exist, install manually:
pip install django djangorestframework mongoengine pymongo python-decouple djangorestframework-simplejwt
```

#### Step 2.3: Configure Database
```bash
# Make sure MongoDB is running
# Windows: Start MongoDB service
# macOS: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongod

# Run Django migrations (if any)
python manage.py migrate
```

#### Step 2.4: Populate Database
```bash
# Populate services database
python manage.py populate_services

# Or use the manual script if the command doesn't exist:
python check_database.py
```

#### Step 2.5: Create Admin User (Optional)
```bash
# Create Django superuser for admin access
python manage.py createsuperuser
```

#### Step 2.6: Start Django Server
```bash
# Start Django development server
# 🚀 Service Platform - Complete Setup & API Documentation

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Authentication APIs](#authentication-apis)
- [Service Provider APIs](#service-provider-apis)
- [End User APIs](#end-user-apis)
- [Booking Management APIs](#booking-management-apis)
- [Service Management APIs](#service-management-apis)
- [Payment APIs](#payment-apis)
- [Complete API Reference](#complete-api-reference)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (Download from [python.org](https://python.org))
- **Node.js 16+** (Download from [nodejs.org](https://nodejs.org))
- **MongoDB** (Download from [mongodb.com](https://mongodb.com) or use MongoDB Atlas)
- **Git** (Download from [git-scm.com](https://git-scm.com))

### 1. Clone Repository
```bash
git clone <repository-url>
cd service-platform
```

## 📝 Detailed Setup Instructions

### 2. Backend Setup (Django)

#### Step 2.1: Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# Windows (Command Prompt):
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate
```

#### Step 2.2: Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# If requirements.txt doesn't exist, install manually:
pip install django djangorestframework mongoengine pymongo python-decouple djangorestframework-simplejwt
```

#### Step 2.3: Configure Database
```bash
# Make sure MongoDB is running
# Windows: Start MongoDB service
# macOS: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongod

# Run Django migrations (if any)
python manage.py migrate
```

#### Step 2.4: Populate Database
```bash
# Populate services database
python manage.py populate_services

# Or use the manual script if the command doesn't exist:
python check_database.py
```

#### Step 2.5: Create Admin User (Optional)
```bash
# Create Django superuser for admin access
python manage.py createsuperuser
```

#### Step 2.6: Start Django Server
```bash
# Start Django development server
python manage.py runserver

# Server will run on: http://localhost:8000
```

### 3. Frontend Setup (Next.js)

#### Step 3.1: Navigate to Frontend Directory
```bash
# Open new terminal and navigate to frontend
cd frontend
```

#### Step 3.2: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Alternative package managers:
# yarn install
# pnpm install
```

#### Step 3.3: Start Development Server
```bash
# Start Next.js development server
npx next dev

# Alternative commands:
# npm run dev
# yarn dev
# pnpm dev

# Server will run on: http://localhost:3000
```

### 4. Access Applications
- **🌐 Frontend (Next.js)**: http://localhost:3000
- **🔧 Backend API (Django)**: http://localhost:8000
- **⚙️ Django Admin Panel**: http://localhost:8000/admin
- **📊 API Documentation**: http://localhost:8000/api/

### 5. Verify Setup
```bash
# Test backend API
curl http://localhost:8000/api/bookings/categories/

# Should return JSON with service categories
```

### 6. Initial Data Setup
```bash
# Clean up any broken references (if needed)
python remove_unknown_services.py

# Create test users and bookings (optional)
python debug_user_services.py
```

---

## 🔐 Authentication APIs

### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "user_type": "End User"  // or "Service Provider"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "user_type": "End User"
  }
}
```

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "user_type": "End User"
  }
}
```

### Get Current User Info
```http
GET /api/auth/me/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "user_type": "End User",
  "is_active": true
}
```

### Logout
```http
POST /api/auth/logout/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "msg": "Logout successful. Please delete the token on client side."
}
```

---

## 🔧 Service Provider APIs

### Get Provider Dashboard Stats
```http
GET /api/service_provider_dashboard/stats/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_requests": 15,
  "pending_requests": 3,
  "completed_requests": 10,
  "total_earnings": 1250.00,
  "registered_services": 5
}
```

### Get Provider's Registered Services
```http
GET /api/service_provider_dashboard/services/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "service_id",
    "name": "Home Deep Cleaning",
    "description": "Complete home cleaning service",
    "price": 48.0,
    "category": {
      "id": "category_id",
      "name": "Cleaning Services",
      "description": "Professional cleaning services"
    }
  }
]
```

### Register for New Service
```http
POST /api/service_provider_dashboard/services/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "service_id": "subcategory_id"
}
```

**Response:**
```json
{
  "message": "Successfully registered for service",
  "service": {
    "id": "service_id",
    "name": "Kitchen Cleaning"
  }
}
```

### Unregister from Service
```http
DELETE /api/service_provider_dashboard/services/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "service_id": "subcategory_id"
}
```

### Get Booking Requests
```http
GET /api/service_provider_dashboard/requests/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "booking_id",
    "customer": "customer_username",
    "service_name": "Home Deep Cleaning",
    "booking_date": "2024-01-15T10:00:00Z",
    "service_date": "2024-01-20T09:00:00Z",
    "status": "pending",
    "total_price": 48.0,
    "notes": "Please focus on kitchen and bathrooms",
    "payment_method": "online"
  }
]
```

---

## 👤 End User APIs

### Get User Bookings
```http
GET /api/end_user_dashboard/bookings/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "booking_id",
    "subcategory": {
      "name": "Home Deep Cleaning",
      "id": "subcategory_id"
    },
    "provider_name": "provider_username",
    "booking_date": "2024-01-15T10:00:00Z",
    "service_date": "2024-01-20T09:00:00Z",
    "status": "pending",
    "total_price": 48.0,
    "notes": "Please focus on kitchen and bathrooms",
    "payment_status": "unpaid",
    "payment_method": "online",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

### Get Available Services
```http
GET /api/end_user_dashboard/services/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "subcategory_id",
    "name": "Home Deep Cleaning",
    "category": "Cleaning Services",
    "subcategory": "Home Deep Cleaning",
    "provider_name": "Available Providers",
    "description": "Complete home cleaning service",
    "price": 48.0
  }
]
```

### Get User Service Requests
```http
GET /api/end_user_dashboard/requests/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "booking_id",
    "service_name": "Home Deep Cleaning",
    "status": "pending",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

---

## 📋 Booking Management APIs

### Create New Booking
```http
POST /api/bookings/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "subcategory_id": "subcategory_id",
  "service_date": "2024-01-20",
  "notes": "Please focus on kitchen and bathrooms",
  "payment_method": "online"
}
```

**Response:**
```json
{
  "id": "booking_id",
  "message": "Booking created successfully",
  "booking": {
    "id": "booking_id",
    "customer": "customer_username",
    "subcategory": "Home Deep Cleaning",
    "service_date": "2024-01-20",
    "status": "pending",
    "total_price": 48.0
  }
}
```

### Update Booking Status
```http
PATCH /api/bookings/<booking_id>/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "accepted"  // or "completed", "cancelled"
}
```

### Accept Booking Request (Provider)
```http
POST /api/service_provider_dashboard/requests/<booking_id>/accept/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Booking request accepted successfully",
  "booking_id": "booking_id"
}
```

### Complete Booking (Provider)
```http
POST /api/service_provider_dashboard/requests/<booking_id>/complete/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Booking marked as completed",
  "booking_id": "booking_id"
}
```

---

## 🛠️ Service Management APIs

### Get All Service Categories
```http
GET /api/bookings/categories/
```

**Response:**
```json
[
  {
    "id": "category_id",
    "name": "Cleaning Services",
    "description": "Professional cleaning services for homes and offices"
  },
  {
    "id": "category_id_2",
    "name": "Repair Services",
    "description": "Home and appliance repair services"
  }
]
```

### Get All Service Subcategories
```http
GET /api/bookings/subcategories/
```

**Response:**
```json
[
  {
    "id": "subcategory_id",
    "name": "Home Deep Cleaning",
    "description": "Complete home cleaning service",
    "price": 48.0,
    "category": {
      "id": "category_id",
      "name": "Cleaning Services"
    }
  },
  {
    "id": "subcategory_id_2",
    "name": "Kitchen Cleaning",
    "description": "Specialized kitchen cleaning",
    "price": 17.0,
    "category": {
      "id": "category_id",
      "name": "Cleaning Services"
    }
  }
]
```

### Get Subcategories by Category
```http
GET /api/bookings/categories/<category_id>/subcategories/
```

**Response:**
```json
[
  {
    "id": "subcategory_id",
    "name": "Home Deep Cleaning",
    "description": "Complete home cleaning service",
    "price": 48.0
  }
]
```

---

## 💳 Payment APIs

### Process Payment
```http
POST /api/payments/process/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "booking_id": "booking_id",
  "payment_method": "online",
  "amount": 48.0
}
```

**Response:**
```json
{
  "message": "Payment processed successfully",
  "payment_id": "payment_id",
  "status": "completed"
}
```

### Get Payment History
```http
GET /api/payments/history/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "payment_id",
    "booking_id": "booking_id",
    "amount": 48.0,
    "payment_method": "online",
    "status": "completed",
    "created_at": "2024-01-20T10:00:00Z"
  }
]
```

---

## 👥 User Management APIs

### Get All Users (Admin)
```http
GET /api/auth/users/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "user_type": "End User",
    "is_active": true
  }
]
```

### Update User Profile
```http
PATCH /api/auth/me/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

---

## 📊 Dashboard APIs

### Service Provider Dashboard Stats
```http
GET /api/service_provider_dashboard/stats/
Authorization: Bearer <access_token>
```

### End User Dashboard Stats
```http
GET /api/end_user_dashboard/stats/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_bookings": 5,
  "pending_bookings": 2,
  "completed_bookings": 3,
  "total_spent": 240.0
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Error: MongoServerError: Authentication failed
# Solution: Check MongoDB connection string in settings.py
```

#### 2. Frontend Can't Connect to Backend
```bash
# Error: Network Error / CORS Error
# Solution: Ensure Django server is running on port 8000
python manage.py runserver
```

#### 3. "Unknown Service" in Provider Dashboard
```bash
# Solution: Clean up broken service references
python remove_unknown_services.py
```

#### 4. 401 Unauthorized Errors
```bash
# Solution: Check JWT token authentication
# Make sure token is included in Authorization header:
# Authorization: Bearer <your_access_token>
```

#### 5. Empty Services List
```bash
# Solution: Populate database with services
python check_database.py
```

### Debug Scripts

#### Check Database Status
```bash
python check_database.py
```

#### Debug User Services
```bash
python debug_user_services.py
```

#### Fix Broken Bookings
```bash
python fix_broken_bookings.py
```

#### Remove Unknown Services
```bash
python remove_unknown_services.py
```

#### Test Authentication
```bash
python test_auth_endpoints.py
```

---

## 🧪 Testing

### Manual API Testing

#### Test Authentication Flow
```bash
# 1. Register user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123","user_type":"End User"}'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# 3. Get user info (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer TOKEN"
```

#### Test Service APIs
```bash
# Get categories
curl http://localhost:8000/api/bookings/categories/

# Get subcategories
curl http://localhost:8000/api/bookings/subcategories/

# Get user bookings (requires auth)
curl -X GET http://localhost:8000/api/end_user_dashboard/bookings/ \
  -H "Authorization: Bearer TOKEN"
```

### Frontend Testing

#### Test User Registration
1. Go to http://localhost:3000
2. Click "Register"
3. Fill form and submit
4. Check if redirected to dashboard

#### Test Service Provider Flow
1. Register as "Service Provider"
2. Go to Services section
3. Click "Add Service"
4. Register for services
5. Check "My Requests" for bookings

#### Test End User Flow
1. Register as "End User"
2. Go to Services section
3. Browse available services
4. Book a service
5. Check "My Requests" for booking status

---

## 📚 Additional Resources

### Project Structure
```
service-platform/
├── backend/                 # Django backend
│   ├── authentication/      # User auth APIs
│   ├── bookings/           # Booking management
│   ├── service_provider/   # Provider dashboard
│   ├── end_user_dashboard/ # End user dashboard
│   └── manage.py
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # Reusable components
│   └── package.json
├── debug_*.py             # Debug scripts
├── fix_*.py              # Repair scripts
└── README_API.md         # This file
```

### Environment Variables
Create `.env` file in backend directory:
```env
SECRET_KEY=your_secret_key_here
DEBUG=True
MONGODB_URI=mongodb://localhost:27017/service_platform
```

### Development Tips
- Use `python manage.py shell` for Django shell
- Use browser dev tools to debug frontend
- Check Django logs for backend errors
- Use MongoDB Compass to view database
- Test APIs with Postman or curl

---

## 🚀 Deployment

### Production Setup
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up proper CORS settings
4. Use production web server (gunicorn)
5. Set up reverse proxy (nginx)

### Docker Setup (Optional)
```bash
# Build and run with Docker
docker-compose up --build
```

---

## 📞 Support

For issues and questions:
1. Check troubleshooting section above
2. Run debug scripts to identify issues
3. Check Django server logs
4. Check browser console for frontend errors

---

**🎉 Happy Coding!**

# Server will run on: http://localhost:8000
```

### 3. Frontend Setup (Next.js)

#### Step 3.1: Navigate to Frontend Directory
```bash
# Open new terminal and navigate to frontend
cd frontend
```

#### Step 3.2: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Alternative package managers:
# yarn install
# pnpm install
```

#### Step 3.3: Start Development Server
```bash
# Start Next.js development server
npx next dev

# Alternative commands:
# npm run dev
# yarn dev
# pnpm dev

# Server will run on: http://localhost:3000
```

### 4. Access Applications
- **🌐 Frontend (Next.js)**: http://localhost:3000
- **🔧 Backend API (Django)**: http://localhost:8000
- **⚙️ Django Admin Panel**: http://localhost:8000/admin
- **📊 API Documentation**: http://localhost:8000/api/

### 5. Verify Setup
```bash
# Test backend API
curl http://localhost:8000/api/bookings/categories/

# Should return JSON with service categories
```

## 🔐 Authentication APIs

### Base URL: `http://localhost:8000/api/auth/`

#### 1. User Registration
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "user_type": "End User"  // or "Service Provider"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "user_type": "End User"
  }
}
```

#### 2. User Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "user_type": "End User"
  }
}
```

#### 3. Get Current User
```http
GET /api/auth/me/
Authorization: Bearer <access_token>
```

#### 4. Token Refresh
```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 🔧 Service Provider APIs

### Base URL: `http://localhost:8000/api/service_provider_dashboard/`

#### 1. Dashboard Statistics
```http
GET /api/service_provider_dashboard/stats/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "pending_requests_count": 5,
  "active_bookings_count": 3,
  "completed_bookings_count": 12,
  "total_earnings": 450.00,
  "completion_rate": 95.5,
  "registered_services_count": 4
}
```

#### 2. Incoming Requests
```http
GET /api/service_provider_dashboard/requests/
Authorization: Bearer <access_token>
```

#### 3. Accept Request
```http
POST /api/service_provider_dashboard/accept/<booking_id>/
Authorization: Bearer <access_token>
```

#### 4. Decline Request
```http
POST /api/service_provider_dashboard/decline/<booking_id>/
Authorization: Bearer <access_token>
```

#### 5. Provider Bookings
```http
GET /api/service_provider_dashboard/bookings/
Authorization: Bearer <access_token>

# Filter by status
GET /api/service_provider_dashboard/bookings/?status=accepted,confirmed
GET /api/service_provider_dashboard/bookings/?status=completed,cancelled
```

#### 6. Complete Booking with Payment
```http
POST /api/service_provider_dashboard/booking/<booking_id>/complete/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "payment_method": "cod"  // or "online"
}
```

**Response:**
```json
{
  "booking": { /* booking object */ },
  "message": "Service completed successfully! Payment of $48.00 collected via COD.",
  "payment_required": false
}
```

#### 7. Update Booking Status
```http
PUT /api/service_provider_dashboard/booking/<booking_id>/status/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "confirmed",
  "payment_method": "online"
}
```

#### 8. Provider Services Management
```http
# Get registered services
GET /api/service_provider_dashboard/services/
Authorization: Bearer <access_token>

# Register for new service
POST /api/service_provider_dashboard/services/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "service_id": "507f1f77bcf86cd799439011"
}

# Unregister from service
DELETE /api/service_provider_dashboard/services/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "service_id": "507f1f77bcf86cd799439011"
}
```

#### 9. Earnings Analytics
```http
GET /api/service_provider_dashboard/earnings/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_earnings": 450.00,
  "monthly_earnings": 120.00,
  "weekly_earnings": 48.00,
  "total_completed_jobs": 12,
  "monthly_completed_jobs": 4,
  "weekly_completed_jobs": 2
}
```

## 👤 End User APIs

### Base URL: `http://localhost:8000/api/end_user_dashboard/`

#### 1. End User Dashboard Statistics
```http
GET /api/end_user_dashboard/stats/
Authorization: Bearer <access_token>
```

#### 2. User Bookings
```http
GET /api/end_user_dashboard/bookings/
Authorization: Bearer <access_token>

# Filter by status
GET /api/end_user_dashboard/bookings/?status=pending
GET /api/end_user_dashboard/bookings/?status=completed
```

#### 3. Process Payment
```http
POST /api/service_provider_dashboard/booking/<booking_id>/payment/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "booking": { /* booking object */ },
  "message": "Payment of $48.00 processed successfully!"
}
```

## 📋 Booking Management APIs

### Base URL: `http://localhost:8000/api/bookings/`

#### 1. Create Booking
```http
POST /api/bookings/create/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "subcategory_id": "507f1f77bcf86cd799439011",
  "service_date": "2024-01-15",
  "notes": "Please bring cleaning supplies"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "customer": "john_doe",
  "subcategory": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Home Deep Cleaning",
    "price": 48.00
  },
  "service_date": "2024-01-15",
  "status": "pending",
  "total_price": 48.00,
  "created_at": "2024-01-10T10:30:00Z"
}
```

#### 2. Get Service Categories
```http
GET /api/bookings/categories/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "name": "Cleaning Services",
    "description": "Professional home cleaning services",
    "icon": "🧹",
    "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }
]
```

#### 3. Get Service Subcategories
```http
GET /api/bookings/subcategories/
Authorization: Bearer <access_token>

# Filter by category
GET /api/bookings/subcategories/?category_id=507f1f77bcf86cd799439013
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Home Deep Cleaning",
    "description": "Full house sanitization, bathroom, kitchen",
    "price": 48.00,
    "category": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Cleaning Services"
    }
  }
]
```

## 🔧 Service Management APIs

### Available Services Database

The platform includes the following service categories:

#### 1. 🧹 Cleaning Services
- **Home Deep Cleaning** - $48.00
- **Kitchen Cleaning** - $17.00
- **Sofa/Carpet Shampooing** - $12.00
- **Bathroom Cleaning** - $8.00

#### 2. 🔧 Appliance Repair & Installation
- **AC Installation/Repair** - $15.00
- **Washing Machine Repair** - $9.00
- **Refrigerator Repair** - $11.50
- **Chimney Cleaning** - $10.50

#### 3. ⚡ Electrician Services
- **Fan/Light Installation** - $3.50
- **Switch/Socket Repair** - $2.50
- **MCB Installation** - $7.00
- **Inverter Setup/Repair** - $8.50

#### 4. 🚰 Plumbing
- **Tap/Faucet Fix** - $3.00
- **Water Tank Cleaning** - $12.00
- **Bathroom Fitting Install** - $7.00
- **Drainage/Leakage Repair** - $8.50

#### 5. 🔨 Carpentry
- **Furniture Assembly** - $25.00
- **Door/Window Repair** - $15.00
- **Custom Woodwork** - $45.00
- **Floor Repair** - $20.00

## 💳 Payment System

### Payment Methods
- **Cash on Delivery (COD)**: Payment collected at service completion
- **Online Payment**: Digital payment processing (pending implementation)

### Payment Statuses
- **unpaid**: Initial status
- **pending**: Awaiting online payment
- **paid**: Payment completed

### Payment Workflow
1. **Service Completion**: Provider marks service as completed
2. **Payment Method Selection**: COD or Online
3. **Status Update**:
   - COD: Automatically marked as paid
   - Online: Status set to pending until payment
4. **Payment Processing**: Customer completes online payment
5. **Confirmation**: Both parties notified of payment completion

## 🧪 Testing

### 1. Test User Accounts
Create test accounts for both user types:

```bash
# Service Provider
POST /api/auth/register/
{
  "username": "test_provider",
  "email": "provider@test.com",
  "password": "testpass123",
  "user_type": "Service Provider"
}

# End User
POST /api/auth/register/
{
  "username": "test_customer",
  "email": "customer@test.com",
  "password": "testpass123",
  "user_type": "End User"
}
```

### 2. Test Service Registration
```bash
# Login as service provider
POST /api/auth/login/
{
  "username": "test_provider",
  "password": "testpass123"
}

# Register for a service
POST /api/service_provider_dashboard/services/
{
  "service_id": "<subcategory_id>"
}
```

### 3. Test Booking Flow
```bash
# Login as end user
POST /api/auth/login/
{
  "username": "test_customer",
  "password": "testpass123"
}

# Create booking
POST /api/bookings/create/
{
  "subcategory_id": "<service_id>",
  "service_date": "2024-01-15",
  "notes": "Test booking"
}

# Provider accepts booking
POST /api/service_provider_dashboard/accept/<booking_id>/

# Provider completes service
POST /api/service_provider_dashboard/booking/<booking_id>/complete/
{
  "payment_method": "cod"
}
```

### 4. Debug Scripts
```bash
# Check database contents
python debug_provider_dashboard.py

# Populate services if empty
python manage.py populate_services

# Check API endpoints
python test_api_endpoints.py
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Booking not found" Error
- Ensure provider is registered for the service
- Check booking belongs to the correct provider
- Verify booking status allows the operation

#### 2. Authentication Errors
- Check JWT token is valid and not expired
- Ensure proper Authorization header format
- Verify user has correct permissions

#### 3. No Services Available
- Run `python manage.py populate_services`
- Check MongoDB connection
- Verify service categories are created

#### 4. Dashboard Shows Wrong Data
- Check API filtering logic
- Verify user registration for services
- Clear browser cache and refresh

### API Response Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## 📱 Frontend Routes

### Service Provider Dashboard
- `/service_provider_dashboard` - Home
- `/service_provider_dashboard/services` - Service Management
- `/service_provider_dashboard/requests` - Incoming Requests
- `/service_provider_dashboard/active` - Active Bookings
- `/service_provider_dashboard/previous` - Previous Bookings
- `/service_provider_dashboard/earnings` - Earnings Analytics

### End User Dashboard
- `/end_user_dashboard` - Home
- `/end_user_dashboard/bookings` - My Bookings
- `/end_user_dashboard/book` - Book Service

## 🚀 Production Deployment

### Environment Variables
```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com

# MongoDB
MONGODB_URI=mongodb://localhost:27017/service_platform

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
```

### Security Considerations
- Use HTTPS in production
- Set strong JWT secret keys
- Configure CORS properly
- Implement rate limiting
- Use environment variables for secrets

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Test with provided debug scripts
4. Check Django server logs for errors

**Happy Coding! 🚀**
```
```

---

## API Endpoints & Usage

### 1. Register a New User

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/register/" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username": "testuser", "password": "testpass123", "user_type": "End User", "role": "Head of House"}' `
  | Select-Object -ExpandProperty Content
```

### 2. Login (Get JWT Token)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/login/" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username": "testuser", "password": "testpass123"}' `
  | Select-Object -ExpandProperty Content
```
- The response will include `"access"` token.

### 3. Logout (Authenticated)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/logout/" `
  -Headers @{"Authorization"="Bearer <access_token>"} `
  -Method POST `
  | Select-Object -ExpandProperty Content
```
- Replace `<access_token>` with the value from the login response.

### 4. Get Current User Info (Authenticated)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/me/" `
  -Headers @{"Authorization"="Bearer <access_token>"} `
  -Method GET `
  | Select-Object -ExpandProperty Content
```
- Replace `<access_token>` with the value from the login response.

### 5. List Active Users (Authenticated)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/users/" `
  -Headers @{"Authorization"="Bearer <access_token>"} `
  -Method GET `
  | Select-Object -ExpandProperty Content
```

---

## Testing the API with Postman

You can also test all endpoints using [Postman](https://www.postman.com/):

### 1. Register a New User
- Set method to **POST**
- URL: `http://127.0.0.1:8000/api/auth/register/`
- Go to the **Body** tab, select **raw** and **JSON**
- Paste this JSON:
  ```json
  {
    "username": "testuser",
    "password": "testpass123",
    "user_type": "End User",
    "role": "Head of House"
  }
  ```
- Click **Send**

### 2. Login (Get JWT Token)
- Set method to **POST**
- URL: `http://127.0.0.1:8000/api/auth/login/`
- **Body**: raw, JSON:
  ```json
  {
    "username": "testuser",
    "password": "testpass123"
  }
  ```
- Click **Send**
- Copy the `access` token from the response

### 3. Logout (Authenticated)
- Set method to **POST**
- URL: `http://127.0.0.1:8000/api/auth/logout/`
- Go to the **Authorization** tab
- Set type to **Bearer Token**
- Paste your `access` token
- Click **Send**

### 4. Get Current User Info (Authenticated)
- Set method to **GET**
- URL: `http://127.0.0.1:8000/api/auth/me/`
- Go to the **Authorization** tab
- Set type to **Bearer Token**
- Paste your `access` token
- Click **Send**

### 5. List Active Users (Authenticated)
- Set method to **GET**
- URL: `http://127.0.0.1:8000/api/auth/users/`
- **Authorization**: Bearer Token, paste your `access` token
- Click **Send**

---

**Tips:**
- Always set the `Content-Type` header to `application/json` for POST requests.
- For authenticated endpoints, use the **Authorization** tab and select **Bearer Token**.
- You can save your requests in a Postman collection for easy reuse.

---

## User Types and Roles
- **End User:** Head of House, Family member
- **Service Provider:** Admin, Employee, Supervisor
- **Platform Provider:** Admin, Employee, Service Desk

---

## Troubleshooting
- If you see `Authentication credentials were not provided.`, check your Authorization header.
- If you see `Invalid user type` or `Invalid role for user type`, check your registration payload.
- If you have issues with PowerShell, try using Postman or HTTPie for testing.

---

## Next Steps
- Add more user/account features (profile update, password reset, etc.)
- Implement role-based permissions for certain endpoints
- Build out your main app logic and connect it to these APIs
- Start integrating with your Next.js frontend
- Add API documentation (Swagger/OpenAPI)

For further help, see the code comments or contact the project maintainer. 