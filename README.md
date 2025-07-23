# 🏠 Home Services Platform

A comprehensive full-stack web application for home services management, connecting customers with service providers through a modern, scalable platform.

## 🚀 Project Overview

This platform features:
- **Django REST API** backend with **PostgreSQL** database
- **Next.js** frontend with modern React components and TypeScript
- **JWT authentication** with role-based access control
- **Multi-provider booking system** with intelligent request management
- **Real-time service catalog** with 6 categories and 24+ services
- **Advanced provider dashboard** with earnings tracking and analytics
- **Customer dashboard** with booking history and status tracking
- **Modern, responsive UI** with consistent purple gradient design system
- **API-first architecture** for scalability and mobile-ready integration

## 👥 User Roles & Permissions

```
├── 🏠 End User (Customer)
│   ├── Head of House - Full booking permissions
│   └── Family Member - Limited booking permissions
│
├── 🔧 Service Provider
│   ├── Admin - Full provider dashboard access
│   ├── Employee - Service execution
│   └── Supervisor - Team management
│
└── 🏢 Platform Provider (Admin Only)
    ├── Admin - Platform management
    ├── Employee - Support operations
    └── Service Desk - Customer support
```

## ✨ Key Features

### 🏠 **Customer Experience**
- **Service Discovery**: Browse 6 categories with 24+ professional services
- **Easy Booking**: Simple booking flow with service date selection
- **Request Tracking**: Real-time status updates (pending → accepted → completed)
- **Multi-Provider**: Requests visible to all qualified providers
- **Payment Options**: Cash on Delivery (COD) and online payment support

### 🔧 **Service Provider Tools**
- **Service Registration**: Register for specific services in your expertise
- **Smart Request Management**: View, accept, or decline incoming requests with conflict prevention
- **Advanced Analytics Dashboard**: Track monthly/weekly earnings, success rates, and performance metrics
- **Booking Status Management**: Mark services as completed with payment collection options
- **Multi-Provider System**: Fair competition with declined request filtering
- **Earnings Tracking**: Real-time earnings calculation based on completion dates

### 🎨 **Modern UI/UX**
- **Consistent Design**: Purple gradient theme across all components
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live request status and dashboard updates
- **Intuitive Navigation**: Clean sidebar navigation with role-based menus
- **Professional Styling**: Modern cards, buttons, and form elements
- **Enhanced Dashboards**: Beautiful analytics cards with visual indicators

## 🛠️ **Service Categories**

| Category | Icon | Services Available |
|----------|------|-------------------|
| **🧹 Cleaning Services** | 🧹 | Home Deep Cleaning, Bathroom Cleaning, Kitchen Cleaning, Sofa/Carpet Cleaning |
| **🔧 Appliance Repair & Installation** | 🔧 | AC Repair & Servicing, Washing Machine Repair, Refrigerator Repair, TV Installation & Repair |
| **⚡ Electricians** | ⚡ | Fan & Light Installation, Switchboard Repair, Wiring & Short Circuit Fix, Inverter Installation |
| **🚿 Plumbers** | 🚿 | Tap & Faucet Repair, Toilet & Flush Fix, Pipe Leakage Repair, Bathroom Fitting Installation |
| **🪚 Carpenters** | 🪚 | Furniture Assembly, Door & Window Repair, Bed/Table Repair, Hinge/Lock Fixing |
| **🏡 Home Renovation & Interior** | 🏡 | Interior Painting, False Ceiling Work, Modular Kitchen Setup, Tiling & Flooring |

---

## ⚡ **Quick Start (5 Minutes)**

```bash
# 1. Clone and setup backend
git clone <repository-url>
cd home-services-platform
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. Setup database (PostgreSQL required)
python manage.py migrate
python update_services_database.py
python create_test_users_postgresql.py

# 3. Start backend
python manage.py runserver

# 4. Setup frontend (new terminal)
cd frontend
npm install
npx next dev

# 5. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Login: test_customer / testpass123
```

---

## 🚀 **Detailed Setup Guide**

### **Prerequisites**
- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 12+** database
- **Git** for version control

### **1. Clone Repository**
```bash
git clone <repository-url>
cd home-services-platform
```

### **2. Backend Setup (Django + PostgreSQL)**

1. **Create virtual environment:**
   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure database:**
   ```bash
   # Create .env file in project root
   SECRET_KEY=your-secret-key-here
   DEBUG=True

   # PostgreSQL settings
   DB_NAME=home_services_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

4. **Setup database:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python update_services_database.py  # Populate service catalog with 24+ services
   python create_test_users_postgresql.py  # Create test users with proper roles
   ```

5. **Start backend server:**
   ```bash
   python manage.py runserver
   ```
   Backend available at: **http://localhost:8000**

6. **Verify API endpoints:**
   ```bash
   python test_api_endpoints.py  # Test all API endpoints
   ```

### **3. Frontend Setup (Next.js)**

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npx next dev
   ```
   Frontend available at: **http://localhost:3000**

### **4. Access the Application**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application interface |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **Django Admin** | http://localhost:8000/admin | Database management |

### **5. Test with Demo Accounts**

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `test_customer` | `testpass123` | End User | Customer dashboard, booking services |
| `test_provider` | `testpass123` | Service Provider | Provider dashboard, manage requests |
| `admin` | `admin123` | Platform Admin | Full system access |

---

## 🆕 **Recent Updates & Improvements**

### **✅ Latest Features (2025)**

#### **🔧 Enhanced Service Provider Dashboard**
- **Monthly/Weekly Earnings Tracking**: Real-time calculation based on completion dates
- **Advanced Analytics**: Success rates, completion rates, and performance metrics
- **Smart Request Filtering**: Automatically hide declined requests from other providers
- **Booking Status Management**: Proper separation of active vs completed bookings
- **Payment Integration**: COD and online payment options with status tracking

#### **🎯 Improved Booking System**
- **Multi-Provider Competition**: Fair request distribution among qualified providers
- **Status Lifecycle Management**: Pending → Accepted → In Progress → Completed
- **Conflict Prevention**: Accepted requests hidden from other providers
- **Date-Based Filtering**: Accurate monthly earnings using completion dates
- **Request History**: Complete audit trail of all booking activities

#### **🚀 API Architecture Overhaul**
- **Consolidated API Structure**: All endpoints organized under `/api/` with clear naming
- **Enhanced Authentication**: Robust JWT implementation with proper error handling
- **Database Optimization**: PostgreSQL-only implementation (removed MongoDB dependencies)
- **Response Consistency**: Standardized API responses across all endpoints
- **Error Handling**: Comprehensive error messages and status codes

#### **🎨 UI/UX Enhancements**
- **Visual Consistency**: Unified purple gradient theme across all components
- **Responsive Design**: Improved mobile and tablet compatibility
- **Loading States**: Better user feedback during API calls
- **Empty States**: Helpful messages when no data is available
- **Interactive Elements**: Enhanced buttons, cards, and navigation

---

## 🔄 **How It Works**

### **Customer Journey**
1. **Browse Services** → Select from 6 categories with 24+ services
2. **Book Service** → Choose service, set date, add notes
3. **Wait for Providers** → Multiple providers can see your request
4. **Provider Accepts** → Get notified when someone accepts
5. **Service Completion** → Provider marks as complete, payment collected
6. **Track Everything** → Real-time status updates in dashboard

### **Provider Journey**
1. **Register Services** → Choose which services you offer
2. **View Requests** → See incoming customer requests
3. **Accept/Decline** → Choose requests that fit your schedule
4. **Complete Service** → Mark job as done, collect payment
5. **Track Earnings** → Monitor completed jobs and earnings

---

## 🏗️ **API-First Architecture**

This platform uses a clean API-first architecture where **all database interactions happen through well-defined API endpoints** located in `backend/api/`.

### **API Structure**
```
backend/api/
├── auth.py          # Authentication endpoints
├── services.py      # Service management endpoints
├── bookings.py      # Booking management endpoints
├── analytics.py     # Dashboard analytics endpoints
└── urls.py          # URL routing configuration
```

### **Key Benefits**
- **🔒 Secure**: All database access controlled through APIs
- **📱 Scalable**: Easy to add mobile apps or third-party integrations
- **🧪 Testable**: Each endpoint can be tested independently
- **📚 Documented**: Clear API contracts and documentation

## 📡 **API Endpoints**

### **🔑 Authentication API (`/api/auth/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | ❌ |
| POST | `/api/auth/login/` | User login | ❌ |
| POST | `/api/auth/logout/` | User logout | ✅ |
| GET | `/api/auth/me/` | Get current user info | ✅ |
| PUT | `/api/auth/me/update/` | Update user profile | ✅ |
| GET | `/api/auth/users/` | Get all users (admin only) | ✅ |

### **🛠️ Services API (`/api/services/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/services/categories/` | Get service categories | ❌ |
| GET | `/api/services/subcategories/` | Get all services | ❌ |
| GET | `/api/services/categories/{id}/services/` | Get services by category | ❌ |
| GET | `/api/services/provider/registered/` | Get provider's services | ✅ |
| GET | `/api/services/provider/available/` | Get available services | ✅ |
| POST | `/api/services/provider/register/` | Register for service | ✅ |
| DELETE | `/api/services/provider/unregister/` | Unregister from service | ✅ |

### **📅 Bookings API (`/api/bookings/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings/create/` | Create new booking | ✅ |
| GET | `/api/bookings/user/` | Get user's bookings | ✅ |
| GET | `/api/bookings/provider/` | Get provider's bookings (all) | ✅ |
| GET | `/api/bookings/provider/?status=active` | Get active bookings only | ✅ |
| GET | `/api/bookings/provider/?status=completed` | Get completed bookings only | ✅ |
| GET | `/api/bookings/provider/requests/` | Get pending requests | ✅ |
| PUT | `/api/bookings/{id}/status/` | Update booking status | ✅ |
| POST | `/api/bookings/{id}/accept/` | Accept request | ✅ |
| POST | `/api/bookings/{id}/decline/` | Decline request | ✅ |
| POST | `/api/bookings/{id}/complete/` | Complete booking | ✅ |

### **📊 Analytics API (`/api/analytics/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/customer/dashboard/` | Customer dashboard stats | ✅ |
| GET | `/api/analytics/provider/dashboard/` | Provider dashboard stats with monthly/weekly data | ✅ |
| GET | `/api/analytics/provider/earnings/` | Detailed earnings with monthly/weekly breakdown | ✅ |
| GET | `/api/analytics/platform/` | Platform analytics (admin only) | ✅ |

### **🔄 New API Features**

- **Smart Filtering**: Bookings API supports status filtering (`?status=active`, `?status=completed`)
- **Enhanced Analytics**: Monthly and weekly earnings calculated from completion dates
- **Conflict Prevention**: Declined requests automatically filtered per provider
- **Real-time Updates**: All endpoints return fresh data with proper caching
- **Error Handling**: Comprehensive error responses with helpful messages

### **Example API Calls**

#### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepass123",
    "user_type": "End User",
    "role": "Head of House"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepass123"
  }'
```

#### Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "subcategory_id": "1",
    "service_date": "2024-01-15T10:00:00Z",
    "notes": "Need deep cleaning for 3-bedroom apartment"
  }'
```

---

## 🗄️ **Database Schema (PostgreSQL)**

### **Users Table**
```sql
- id: SERIAL PRIMARY KEY
- username: VARCHAR(150) UNIQUE
- password: VARCHAR(128) (hashed)
- user_type: VARCHAR(50) (End User, Service Provider, Platform Provider)
- role: VARCHAR(50) (varies by user_type)
- email: VARCHAR(254)
- is_active: BOOLEAN
- date_joined: TIMESTAMP
```

### **Service Categories Table**
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100)
- description: TEXT
- icon: VARCHAR(50) (emoji)
- gradient: VARCHAR(200) (CSS gradient)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **Service Subcategories Table**
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100)
- description: TEXT
- price: DECIMAL(10,2)
- category_id: INTEGER (FK to service_categories)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **Bookings Table**
```sql
- id: SERIAL PRIMARY KEY
- customer: VARCHAR(150) (username)
- provider: VARCHAR(150) (username, nullable)
- subcategory_id: INTEGER (FK to service_subcategories)
- booking_date: TIMESTAMP
- service_date: TIMESTAMP
- total_price: DECIMAL(10,2)
- status: VARCHAR(20) (pending, accepted, completed, cancelled)
- payment_status: VARCHAR(20) (unpaid, paid)
- payment_method: VARCHAR(20) (cod, online)
- notes: TEXT
- declined_by: TEXT (JSON array of usernames)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **User Registered Services Table**
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER (FK to auth_user)
- service_id: INTEGER (FK to service_subcategories)
- created_at: TIMESTAMP
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Database Connection Error**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check database exists
psql -U postgres -l

# Test connection
python manage.py dbshell
```

#### **Frontend Not Loading Services**
```bash
# Check backend is running
curl http://localhost:8000/api/services/categories/

# Check CORS settings in backend/settings.py
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]

# Test API endpoints
python test_api_endpoints.py
```

#### **Authentication Issues**
```bash
# Clear browser storage
# Open DevTools → Application → Storage → Clear All

# Check JWT token format
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/auth/me/
```

#### **Port Already in Use**
```bash
# Backend (change port)
python manage.py runserver 8001

# Frontend (change port)
npx next dev -p 3001
```

### **Development Commands**

```bash
# Backend
python manage.py makemigrations    # Create migrations
python manage.py migrate           # Apply migrations
python manage.py shell            # Django shell
python manage.py collectstatic    # Collect static files

# Frontend
npx next dev                       # Start development server
npx next build                     # Build for production
npx next start                     # Start production server
npm run lint                       # Run linting (if configured)
```

### **Useful Scripts**

```bash
# Database Setup
python update_services_database.py        # Populate database with services
python create_test_users_postgresql.py    # Create test users

# Testing & Debugging
python test_api_endpoints.py              # Test all API endpoints
python debug_api_responses.py             # Debug API response issues
python fix_booking_completion_date.py     # Fix booking completion dates

# Database Management
python manage.py dbshell                  # Access database shell
python manage.py shell                    # Django shell for debugging
```

### **🧹 Project Structure**

The project has been cleaned up to include only essential files:

**✅ Essential Files:**
- `manage.py` - Django management commands
- `update_services_database.py` - Service catalog setup
- `create_test_users_postgresql.py` - Test user creation
- `test_api_endpoints.py` - API testing utility
- `requirements.txt` - Python dependencies

**🗑️ Removed Files:**
- Debug scripts (`debug_*.py`)
- Fix scripts (`fix_*.py`)
- Temporary test files (`test_*_fix.py`)
- Development utilities no longer needed

---

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow PEP 8 for Python code
- Use TypeScript for frontend components
- Write descriptive commit messages
- Test thoroughly before submitting
- Use the new API structure under `/api/`
- Ensure proper error handling in all endpoints
- Follow the established purple gradient design system

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Django REST Framework** for robust API development
- **Next.js** for modern React framework
- **PostgreSQL** for reliable data storage
- **Tailwind CSS** concepts for styling inspiration

---

---

## 🎉 **What's Been Accomplished**

This platform represents a complete, production-ready home services management system with:

### **✅ Technical Achievements**
- **Full-Stack Implementation**: Django REST API + Next.js frontend
- **Database Migration**: Successfully migrated from MongoDB to PostgreSQL
- **API Consolidation**: All endpoints organized under clean `/api/` structure
- **Authentication System**: Robust JWT implementation with role-based access
- **Real-time Features**: Live booking updates and status tracking

### **✅ Business Features**
- **Multi-Provider System**: Fair competition among service providers
- **Smart Request Management**: Automatic conflict prevention and filtering
- **Advanced Analytics**: Monthly/weekly earnings tracking with completion-date accuracy
- **Payment Integration**: COD and online payment options
- **Professional UI**: Consistent purple gradient design across all components

### **✅ User Experience**
- **Customer Journey**: Seamless booking from discovery to completion
- **Provider Tools**: Complete dashboard for service management and earnings
- **Admin Features**: Platform management and analytics
- **Mobile Ready**: Responsive design for all device types

---

**Built with ❤️ for connecting customers with reliable home service providers**