# Home Services App: Django Backend & Next.js Frontend

## Project Overview
This project is a full-stack web application for home services, featuring:
- **Django** backend (with MongoDB)
- **Next.js** frontend (React)
- JWT authentication with user roles and types
- **Dynamic service catalog** with categories and subcategories from database
- **Quote request system** with detailed service requirements
- **Booking management** for customers to view and track requests
- **Role-based dashboards** for different user types
- **Modern, responsive UI** with optimized layouts and compact design

---

## User Structure
```
├── End User
│   ├── Head of House
│   └── Family Member
│
├── Service Provider
│   ├── Admin
│   ├── Employee
│   └── Supervisor
│
└── Platform Provider (Hidden)
    ├── Admin
    ├── Employee
    └── Service Desk
```
*Platform Provider is not available in the UI for registration.*

---

## Features

### 🏠 End User Dashboard
- **Home**: Main dashboard with quick actions and overview
- **Book a Service**: Browse and book services from the catalog
- **My Requests**: View and track all submitted requests with detailed status information
- **Profile Management**: Access user profile and settings
- **Compact Design**: Optimized layouts that fit within viewport without scrolling

### 🔧 Service Provider Dashboard
- **Service Management**: Manage available services and pricing
- **Request Management**: View and respond to customer requests
- **Booking Management**: Track confirmed bookings and schedules
- **Analytics**: View performance metrics and earnings

### 🎨 Enhanced UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Styling**: Updated color schemes, gradients, shadows, and glassmorphism effects
- **Interactive Elements**: Smooth hover effects, transitions, and loading states
- **Compact Layouts**: Optimized spacing and font sizes for better content density
- **Real-time Notifications**: Success/error messages with auto-dismiss
- **Fixed Viewport Design**: Content fits within current screen without scrolling

---

## Recent Updates

### UI/UX Improvements
- **Updated Color Scheme**: Enhanced gradients and color palette for better visual appeal
- **Compact Request Cards**: Reduced font sizes and padding for better space utilization
- **Optimized Navigation**: Streamlined sidebar with improved user flow
- **Fixed Viewport Layouts**: Dashboard content fits within screen without scrolling
- **Enhanced Typography**: Improved font sizing and spacing throughout the application

### Navigation Structure
- **Home**: Main dashboard with quick actions
- **Book a Service**: Direct access to service booking
- **My Requests**: Comprehensive request tracking with detailed status information
- **Profile**: Quick access via sidebar header

---

## Backend Setup (Django)

### Prerequisites
- Python 3.9+
- MongoDB database
- Virtual environment (recommended)

### Installation Steps

1. **Create and activate virtual environment:**
   ```sh
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

3. **Set up your .env file:**
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
   MONGO_DB_NAME=<dbname>
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```

4. **Apply migrations:**
   ```sh
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (optional):**
   ```sh
   python manage.py createsuperuser
   ```

6. **Run the backend server:**
   ```sh
   python manage.py runserver
   ```
   The backend will be available at [http://localhost:8000](http://localhost:8000)

---

## Frontend Setup (Next.js)

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation Steps

1. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```sh
   npm install
   ```

3. **Run the frontend development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Quick Start Guide

### 1. Start Backend Server
```sh
# In the project root directory
python manage.py runserver
```

### 2. Start Frontend Server
```sh
# In a new terminal, navigate to frontend directory
cd frontend
npm run dev
```

### 3. Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Django Admin**: [http://localhost:8000/admin](http://localhost:8000/admin)

### 4. Register and Test
1. Go to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" and create an End User account
3. Login and explore the dashboard
4. Browse services and submit quote requests

---

## Authentication Flow
- **Login:** `/login` (username, password)
- **Sign Up:** `/signup` (username, password, user type, role)
  - User type and role are selected via dropdowns
  - Only End User and Service Provider types are available for registration

## Service System
- **Dynamic Categories**: Categories and subcategories are loaded from the database
- **Quote Requests**: Submit detailed requests with descriptions, addresses, and preferred dates/times
- **Status Tracking**: Track request status (pending, confirmed, completed, cancelled)
- **Real-time Updates**: Get notifications for request status changes
- **Compact Request Management**: Optimized request cards with detailed information

---

## API Endpoints (Backend)

### Authentication Endpoints

#### Register
- **POST** `/api/auth/register/`
- **Request Body:**
  ```json
  {
    "username": "alice",
    "password": "mypassword",
    "user_type": "End User",
    "role": "Head of House"
  }
  ```
- **Response:**
  ```json
  { "msg": "User registered successfully" }
  ```

#### Login
- **POST** `/api/auth/login/`
- **Request Body:**
  ```json
  {
    "username": "alice",
    "password": "mypassword"
  }
  ```
- **Response:**
  ```json
  {
    "refresh": "<refresh_token>",
    "access": "<access_token>",
    "user_type": "End User",
    "role": "Head of House"
  }
  ```

#### Other Auth Endpoints
- `/api/auth/logout/` (POST)
- `/api/auth/me/` (GET, JWT required)
- `/api/auth/users/` (GET, JWT required)

### Service Endpoints

#### Get Service Categories
- **GET** `/api/bookings/categories/`
- **Response:** List of all service categories

#### Get Service Subcategories
- **GET** `/api/bookings/subcategories/`
- **Response:** List of all subcategories with category information

### Booking Endpoints

#### Create Booking (Quote Request)
- **POST** `/api/bookings/create/` (JWT required)
- **Request Body:**
  ```json
  {
    "subcategory_id": "subcategory_id",
    "service_date": "2024-01-15T10:00:00Z",
    "notes": "Description: Need deep cleaning\nAddress: 123 Main St"
  }
  ```
- **Response:** Created booking details

#### Get User Bookings
- **GET** `/api/bookings/user-bookings/` (JWT required)
- **Response:** List of all bookings for the authenticated user

#### Update Booking Status
- **PUT** `/api/bookings/booking/<booking_id>/` (JWT required)
- **Request Body:**
  ```json
  {
    "status": "cancelled"
  }
  ```
- **Response:** Updated booking details

---

## Testing with curl

### Register
```sh
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "mypassword", "user_type": "End User", "role": "Head of House"}'
```

### Login
```sh
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "mypassword"}'
```

### Get Current User
```sh
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer <access_token>"
```

### Get Service Categories
```sh
curl -X GET http://localhost:8000/api/bookings/categories/
```

### Get Service Subcategories
```sh
curl -X GET http://localhost:8000/api/bookings/subcategories/
```

---

## Database Schema

### Users
- `id`: ObjectId
- `username`: String (unique)
- `password`: String (hashed)
- `user_type`: String (End User, Service Provider, Platform Provider)
- `role`: String (varies by user_type)
- `is_active`: Boolean

### Service Categories
- `id`: ObjectId
- `name`: String
- `description`: String
- `icon`: String

### Service Subcategories
- `id`: ObjectId
- `name`: String
- `description`: String
- `category`: ObjectId (reference to ServiceCategory)
- `price`: Decimal

### Bookings
- `id`: ObjectId
- `user`: ObjectId (reference to User)
- `subcategory`: ObjectId (reference to ServiceSubcategory)
- `service_date`: DateTime
- `status`: String (pending, confirmed, completed, cancelled)
- `notes`: String
- `created_at`: DateTime
- `updated_at`: DateTime

---

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your `.env` file and ensure `MONGO_URI` is correct
   - Verify MongoDB is running and accessible

2. **Frontend Not Loading Services**
   - Ensure backend server is running on port 8000
   - Check browser console for CORS errors
   - Verify API endpoints are accessible

3. **Authentication Issues**
   - Clear browser localStorage and try logging in again
   - Check if JWT tokens are being stored correctly

4. **Port Already in Use**
   - Backend: Change port in `manage.py runserver 8001`
   - Frontend: Change port in `package.json` scripts

### Development Tips

1. **Backend Development**
   - Use Django's built-in admin interface for data management
   - Check Django logs for detailed error messages
   - Use `python manage.py shell` for database queries

2. **Frontend Development**
   - Use browser dev tools to debug API calls
   - Check Network tab for request/response details
   - Use React dev tools for component debugging

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

This project is licensed under the MIT License. 