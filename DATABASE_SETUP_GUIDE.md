# 🗄️ Database Setup Guide

## 📋 Overview

This guide provides comprehensive instructions for setting up the PostgreSQL database for the Home Services Platform. The database schema includes user management, service catalogs, booking systems, ratings, and availability management.

## 🚀 Quick Setup (Recommended)

### **One-Command Setup**
```bash
python setup_database.py
```

This automated script will:
- ✅ Create all database tables and relationships
- ✅ Set up user permissions and roles (25+ permissions)
- ✅ Populate service categories (7 categories, 26+ services)
- ✅ Create test users for all roles
- ✅ Configure constraints and indexes
- ✅ Verify setup completion

### **Verification**
```bash
python verify_database_setup.py
```

## 📊 Database Schema

### **Core Tables**

| Table | Records | Purpose |
|-------|---------|---------|
| `authentication_user` | 20+ | User accounts and authentication |
| `authentication_permission` | 25+ | System permissions |
| `authentication_usertyperolepermission` | 100+ | Role-based permissions |
| `bookings` | Variable | Service booking requests |
| `service_categories` | 7 | Service category definitions |
| `service_subcategories` | 26+ | Specific services offered |
| `user_registered_services` | Variable | Provider service registrations |
| `provider_ratings` | Variable | Customer ratings and reviews |
| `provider_availability` | Variable | Provider time slot management |
| `provider_off_days` | Variable | Provider unavailable days |

### **Key Relationships**

```
authentication_user (Primary)
├── bookings (customer/provider)
├── user_registered_services (provider services)
├── provider_ratings (ratings received)
├── provider_availability (time slots)
└── provider_off_days (unavailable days)

service_categories
└── service_subcategories
    ├── bookings (service requests)
    └── user_registered_services (provider offerings)

authentication_permission
├── authentication_usertyperolepermission (role permissions)
└── authentication_userpermissionoverride (user overrides)
```

## 🔑 Test Users & Credentials

### **Default Test Accounts**

| Username | Password | User Type | Role | Purpose |
|----------|----------|-----------|------|---------|
| `admin` | `admin123` | Platform Provider | Admin | Platform administration |
| `test_customer` | `testpass123` | End User | Head of House | Customer testing |
| `test_provider` | `testpass123` | Service Provider | Admin | Provider testing |

### **Additional Users**
The database may contain additional test users created during development. Use the verification script to see all available accounts.

## 🏷️ Service Categories

### **7 Main Categories (26+ Services)**

1. **🧹 Cleaning Services** (4 services)
   - Deep Cleaning ($500, 3 hours)
   - Regular Cleaning ($300, 2 hours)
   - Move-in/Move-out Cleaning ($600, 4 hours)
   - Post-Construction Cleaning ($800, 5 hours)

2. **🔧 Plumbing Services** (4 services)
   - Pipe Repair ($200, 2 hours)
   - Drain Cleaning ($150, 1.5 hours)
   - Faucet Installation ($100, 1 hour)
   - Toilet Repair ($180, 1.5 hours)

3. **⚡ Electrical Services** (4 services)
   - Wiring Installation ($400, 4 hours)
   - Light Fixture Installation ($120, 1 hour)
   - Outlet Installation ($80, 0.5 hours)
   - Electrical Troubleshooting ($150, 2 hours)

4. **❄️ HVAC Services** (4 services)
   - AC Installation ($800, 6 hours)
   - AC Repair ($250, 2 hours)
   - Heating System Maintenance ($200, 2 hours)
   - Duct Cleaning ($300, 3 hours)

5. **🔨 Carpentry Services** (4 services)
   - Furniture Assembly ($100, 2 hours)
   - Custom Shelving ($300, 4 hours)
   - Door & Window Repair ($150, 2 hours)
   - Cabinet Installation ($500, 6 hours)

6. **🎨 Painting Services** (4 services)
   - Interior Painting ($400, 8 hours)
   - Exterior Painting ($600, 12 hours)
   - Touch-up Painting ($100, 2 hours)
   - Wallpaper Installation ($250, 4 hours)

7. **🌱 Landscaping Services** (4 services)
   - Lawn Mowing ($80, 1 hour)
   - Garden Design ($300, 4 hours)
   - Tree Trimming ($200, 3 hours)
   - Irrigation Installation ($500, 6 hours)

## 🔐 Permissions System

### **Permission Categories**

1. **Dashboard Access** (3 permissions)
   - View End User Dashboard
   - View Service Provider Dashboard
   - View Platform Provider Dashboard

2. **Booking Management** (6 permissions)
   - Create Booking
   - View Own Bookings
   - View All Bookings
   - Accept/Decline Booking
   - Complete Booking
   - Cancel Booking

3. **Service Management** (4 permissions)
   - Register for Service
   - Set Service Pricing
   - View Service Catalog
   - Manage Service Availability

4. **User Management** (3 permissions)
   - View User List
   - Edit User Profile
   - Manage User Permissions

5. **Analytics & Reports** (3 permissions)
   - View Provider Analytics
   - View Platform Analytics
   - View Earnings Report

6. **Rating & Reviews** (3 permissions)
   - Rate Service Provider
   - View Ratings
   - Respond to Ratings

7. **Availability Management** (2 permissions)
   - Manage Availability Schedule
   - Set Off Days

### **Role-Based Permissions**

- **End Users**: Dashboard access, booking creation, rating providers
- **Service Providers**: Provider dashboard, booking management, service registration, availability management
- **Platform Providers**: Admin dashboard, user management, platform analytics

## 🛠️ Manual Setup (Alternative)

If the automated setup doesn't work, follow these manual steps:

### **1. Database Migration**
```bash
python manage.py makemigrations
python manage.py migrate
```

### **2. Create Superuser**
```bash
python manage.py createsuperuser
```

### **3. Create Permissions**
```python
python manage.py shell
>>> from authentication.models import Permission
>>> # Create permissions manually (see setup_database.py for full list)
```

### **4. Create Service Categories**
```python
>>> from bookings.models import ServiceCategory, ServiceSubcategory
>>> # Create categories manually (see setup_database.py for full data)
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify credentials in `backend/settings.py`
   - Ensure database `virtual_presenz` exists

2. **Migration Errors**
   - Delete migration files: `rm -rf */migrations/0*.py`
   - Recreate migrations: `python manage.py makemigrations`
   - Apply migrations: `python manage.py migrate`

3. **Permission Denied**
   - Ensure PostgreSQL user has CREATE/ALTER permissions
   - Check database user permissions

4. **Data Missing**
   - Run complete setup: `python setup_database.py`
   - Verify with: `python verify_database_setup.py`

### **Reset Database**
```bash
# WARNING: This deletes all data
python manage.py flush
python setup_database.py
python verify_database_setup.py
```

## 📊 Database Statistics

After successful setup, you should have:
- **Tables**: 11+ core application tables
- **Users**: 5+ test users across all roles
- **Permissions**: 25+ system permissions
- **Services**: 7 categories with 26+ subcategories
- **Constraints**: 15+ unique constraints, 20+ foreign keys

## 🎯 Next Steps

1. **Verify Setup**: `python verify_database_setup.py`
2. **Start Backend**: `python manage.py runserver`
3. **Start Frontend**: `cd frontend && npm run dev`
4. **Test Login**: Use test credentials at http://localhost:3000
5. **Admin Access**: http://localhost:8000/admin (admin/admin123)

## 📞 Support

If you encounter issues:
1. Run the verification script for detailed diagnostics
2. Check the troubleshooting section above
3. Review Django logs for specific error messages
4. Ensure PostgreSQL is properly installed and running
