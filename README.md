# 🏠 Home Services Platform

A comprehensive full-stack web application for home services management, connecting customers with service providers.

## 🚀 Project Overview

This platform features:
- **Django REST API** backend with **PostgreSQL** database
- **Next.js** frontend with modern React components
- **JWT authentication** with role-based access control
- **Multi-provider booking system** with request management
- **Real-time service catalog** with 6 categories and 24+ services
- **Provider dashboard** for service registration and request handling
- **Customer dashboard** for booking and tracking services
- **Modern, responsive UI** with consistent design system

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
- **Request Management**: View, accept, or decline incoming requests
- **Earnings Dashboard**: Track completed jobs and earnings
- **Status Updates**: Mark services as completed with payment collection
- **Multi-Provider System**: Compete fairly for customer requests

### 🎨 **Modern UI/UX**
- **Consistent Design**: Purple gradient theme across all components
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live request status and dashboard updates
- **Intuitive Navigation**: Clean sidebar navigation with role-based menus
- **Professional Styling**: Modern cards, buttons, and form elements

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

## 🚀 **Quick Start Guide**

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
   python update_services_database.py  # Populate service catalog
   python create_test_users_postgresql.py  # Create test users
   ```

5. **Start backend server:**
   ```bash
   python manage.py runserver
   ```
   Backend available at: **http://localhost:8000**

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
   npm run dev
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

## 📡 **API Documentation**

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | ❌ |
| POST | `/api/auth/login/` | User login | ❌ |
| POST | `/api/auth/logout/` | User logout | ✅ |
| GET | `/api/auth/me/` | Get current user info | ✅ |
| PUT | `/api/auth/me/` | Update user profile | ✅ |

### **Service Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookings/categories/` | Get all service categories | ❌ |
| GET | `/api/bookings/subcategories/` | Get all services | ❌ |

### **Booking Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings/create/` | Create new booking | ✅ |
| GET | `/api/end_user_dashboard/bookings/` | Get user's bookings | ✅ |
| PUT | `/api/bookings/booking/<id>/` | Update booking status | ✅ |

### **Service Provider Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/service_provider_dashboard/requests/` | Get incoming requests | ✅ |
| GET | `/api/service_provider_dashboard/services/` | Get registered services | ✅ |
| POST | `/api/service_provider_dashboard/services/` | Register for service | ✅ |
| DELETE | `/api/service_provider_dashboard/services/` | Unregister from service | ✅ |
| POST | `/api/service_provider_dashboard/accept/<id>/` | Accept request | ✅ |
| POST | `/api/service_provider_dashboard/decline/<id>/` | Decline request | ✅ |
| POST | `/api/service_provider_dashboard/complete/<id>/` | Mark as completed | ✅ |
| GET | `/api/service_provider_dashboard/earnings/` | Get earnings data | ✅ |

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
curl http://localhost:8000/api/bookings/categories/

# Check CORS settings in backend/settings.py
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
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
npm run dev -- -p 3001
```

### **Development Commands**

```bash
# Backend
python manage.py makemigrations    # Create migrations
python manage.py migrate           # Apply migrations
python manage.py shell            # Django shell
python manage.py collectstatic    # Collect static files

# Frontend
npm run build                      # Build for production
npm run start                      # Start production server
npm run lint                       # Run linting
```

### **Useful Scripts**

```bash
# Populate database with services
python update_services_database.py

# Create test users
python create_test_users_postgresql.py

# Check database status
python manage.py dbshell
```

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

**Built with ❤️ for connecting customers with reliable home service providers**