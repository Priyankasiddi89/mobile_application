# 🎨 Home Services Platform - Figma Design Specifications

## 📋 **Design System**

### **Color Palette**
```
Primary Colors:
- Primary Blue: #667eea
- Primary Purple: #764ba2
- Success Green: #28a745
- Warning Orange: #ffc107
- Danger Red: #dc3545

Secondary Colors:
- Light Blue: #e1f5fe
- Light Green: #e8f5e8
- Light Orange: #fff3e0
- Light Pink: #fce4ec
- Light Purple: #f3e5f5

Neutral Colors:
- Dark Text: #2c3e50
- Medium Text: #495057
- Light Text: #6c757d
- Background: #f8f9fa
- White: #ffffff
- Border: #e9ecef
```

### **Typography**
```
Headings:
- H1: 2.5rem (40px), Bold, #2c3e50
- H2: 2rem (32px), Bold, #2c3e50
- H3: 1.5rem (24px), SemiBold, #495057
- H4: 1.25rem (20px), SemiBold, #495057

Body Text:
- Large: 1.125rem (18px), Regular, #495057
- Medium: 1rem (16px), Regular, #495057
- Small: 0.875rem (14px), Regular, #6c757d

Buttons:
- Button Text: 1rem (16px), SemiBold, White/Primary
```

### **Spacing System**
```
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px
```

### **Border Radius**
```
- Small: 6px
- Medium: 8px
- Large: 12px
- XLarge: 16px
```

---

## 🏠 **1. Landing Page**

### **Layout Structure**
```
Header (Fixed)
├── Logo (Left)
├── Navigation Menu (Center)
│   ├── Services
│   ├── How it Works
│   ├── About
│   └── Contact
└── Auth Buttons (Right)
    ├── Login
    └── Sign Up

Hero Section
├── Main Headline
├── Subtitle
├── CTA Buttons
│   ├── Book a Service (Primary)
│   └── Become a Provider (Secondary)
└── Hero Image/Illustration

Services Preview
├── Section Title
├── Service Categories Grid (3x2)
│   ├── Cleaning
│   ├── Plumbing
│   ├── Electrical
│   ├── Gardening
│   ├── Painting
│   └── View All
└── Browse All Services Button

How It Works
├── Section Title
├── Steps (3 columns)
│   ├── 1. Choose Service
│   ├── 2. Select Provider
│   └── 3. Get Service Done
└── Get Started Button

Footer
├── Company Info
├── Quick Links
├── Contact Info
└── Social Media
```

### **Design Elements**
- **Hero Background**: Gradient from #667eea to #764ba2
- **Service Cards**: White background, subtle shadow, hover effects
- **Icons**: Use consistent icon style (outline or filled)
- **Buttons**: Rounded corners (8px), gradient backgrounds

---

## 🔐 **2. Authentication Pages**

### **Login Page Layout**
```
Centered Card (max-width: 400px)
├── Logo/Brand
├── Page Title: "Welcome Back"
├── Login Form
│   ├── Username Field
│   ├── Password Field
│   ├── Remember Me Checkbox
│   ├── Login Button (Full width)
│   └── Forgot Password Link
├── Divider: "or"
├── Social Login Options
│   ├── Google Login
│   └── Facebook Login
└── Sign Up Link
```

### **Registration Page Layout**
```
Centered Card (max-width: 500px)
├── Logo/Brand
├── Page Title: "Create Account"
├── User Type Selection
│   ├── Customer Tab
│   └── Service Provider Tab
├── Registration Form
│   ├── Personal Info Section
│   │   ├── First Name
│   │   ├── Last Name
│   │   ├── Email
│   │   └── Phone
│   ├── Account Info Section
│   │   ├── Username
│   │   ├── Password
│   │   └── Confirm Password
│   └── Provider-specific Fields (if provider)
│       ├── Experience
│       ├── Specializations
│       └── Service Areas
├── Terms & Conditions Checkbox
├── Register Button (Full width)
└── Login Link
```

---

## 👤 **3. Customer Dashboard**

### **Dashboard Layout**
```
Sidebar Navigation (250px width)
├── Profile Section
│   ├── Avatar
│   ├── Name
│   └── User Type Badge
├── Navigation Menu
│   ├── 🏠 Dashboard
│   ├── 🔍 Browse Services
│   ├── 📋 My Bookings
│   ├── 🛒 Cart
│   ├── 👤 Profile
│   └── ⚙️ Settings
└── Logout Button

Main Content Area
├── Header
│   ├── Page Title
│   ├── Breadcrumb
│   └── User Actions
└── Content Sections
    ├── Quick Stats Cards
    │   ├── Active Bookings
    │   ├── Completed Services
    │   └── Total Spent
    ├── Recent Bookings Table
    ├── Recommended Services
    └── Quick Actions
```

### **Service Browsing Flow**
```
Service Categories Page
├── Search Bar (Top)
├── Filter Sidebar
│   ├── Location
│   ├── Price Range
│   ├── Rating
│   └── Availability
└── Categories Grid
    ├── Category Cards (4 columns)
    │   ├── Category Icon
    │   ├── Category Name
    │   ├── Service Count
    │   └── Starting Price
    └── Pagination

Service Providers Page
├── Breadcrumb Navigation
├── Filter & Sort Options
├── Provider Cards Grid
│   ├── Provider Photo
│   ├── Name & Rating
│   ├── Services Offered
│   ├── Price Range
│   ├── Availability Status
│   └── Book Now Button
└── Load More Button

Booking Flow
├── Provider Details Modal
│   ├── Provider Info
│   ├── Service Details
│   ├── Reviews & Ratings
│   └── Availability Calendar
├── Time Slot Selection
├── Service Customization
├── Address Selection
├── Cart Summary
└── Checkout Process
```

---

## 🔧 **4. Service Provider Dashboard**

### **Dashboard Layout**
```
Sidebar Navigation (250px width)
├── Profile Section
│   ├── Avatar
│   ├── Name
│   ├── Rating Display
│   └── Provider Badge
├── Navigation Menu
│   ├── 📊 Dashboard
│   ├── 📋 Booking Requests
│   ├── 📅 My Schedule
│   ├── 💼 My Services
│   ├── 💰 Earnings
│   ├── ⭐ Reviews
│   ├── 👤 Profile
│   └── ⚙️ Settings
└── Logout Button

Main Content Area
├── Stats Overview
│   ├── Pending Requests
│   ├── Today's Bookings
│   ├── This Month's Earnings
│   └── Average Rating
├── Quick Actions
│   ├── Update Availability
│   ├── Add New Service
│   └── View Calendar
├── Recent Requests Table
├── Upcoming Bookings
└── Performance Charts
```

### **Booking Management**
```
Requests Page
├── Filter Tabs
│   ├── All Requests
│   ├── Pending
│   ├── Accepted
│   └── Completed
├── Request Cards
│   ├── Customer Info
│   ├── Service Details
│   ├── Date & Time
│   ├── Location
│   ├── Price
│   └── Action Buttons
│       ├── Accept
│       ├── Decline
│       ├── Message Customer
│       └── View Details
└── Pagination

Calendar View
├── Month/Week/Day Views
├── Booking Slots
│   ├── Confirmed Bookings
│   ├── Pending Requests
│   └── Blocked Times
├── Availability Toggle
└── Quick Add Booking
```

---

## 🛡️ **5. Platform Admin Dashboard**

### **Dashboard Layout**
```
Sidebar Navigation (280px width)
├── Admin Profile
├── Navigation Menu
│   ├── 📊 Analytics
│   ├── 👥 User Management
│   ├── 🔧 Service Management
│   ├── 📋 Booking Management
│   ├── 💰 Financial Reports
│   ├── ⚙️ Platform Settings
│   ├── 🔐 Permissions
│   └── 📧 Communications
└── System Status

Main Content Area
├── KPI Cards
│   ├── Total Users
│   ├── Active Bookings
│   ├── Revenue
│   └── Platform Growth
├── Charts & Analytics
│   ├── User Growth Chart
│   ├── Revenue Trends
│   ├── Popular Services
│   └── Geographic Distribution
├── Recent Activities
└── System Alerts
```

---

## 📱 **6. Responsive Design Guidelines**

### **Breakpoints**
```
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+
```

### **Mobile Adaptations**
```
Navigation:
- Hamburger menu for mobile
- Bottom tab navigation for main sections
- Collapsible sidebar on tablet

Cards & Grids:
- Single column on mobile
- 2 columns on tablet
- 3-4 columns on desktop

Forms:
- Full-width inputs on mobile
- Stacked labels
- Larger touch targets (44px minimum)
```

---

## 🎯 **7. Interactive Elements**

### **Buttons**
```
Primary Button:
- Background: Gradient (#667eea to #764ba2)
- Text: White, SemiBold
- Padding: 12px 24px
- Border Radius: 8px
- Hover: Slight scale (1.02)

Secondary Button:
- Background: Transparent
- Border: 2px solid #667eea
- Text: #667eea, SemiBold
- Hover: Background #667eea, Text White

Danger Button:
- Background: #dc3545
- Text: White
- Hover: Darker red
```

### **Cards**
```
Standard Card:
- Background: White
- Border Radius: 12px
- Shadow: 0 4px 24px rgba(44, 62, 80, 0.08)
- Padding: 24px
- Hover: Lift effect (translateY(-2px))
```

### **Forms**
```
Input Fields:
- Border: 2px solid #e9ecef
- Border Radius: 8px
- Padding: 12px 16px
- Focus: Border color #667eea
- Error: Border color #dc3545

Labels:
- Font Weight: SemiBold
- Color: #495057
- Margin Bottom: 8px
```

---

## 🔄 **8. Animation Guidelines**

### **Transitions**
```
- Duration: 0.3s ease
- Hover effects: 0.2s ease
- Page transitions: 0.4s ease-in-out
- Loading animations: 1s infinite
```

### **Micro-interactions**
```
- Button hover: Scale 1.02
- Card hover: Lift 2px
- Form focus: Border color change
- Success states: Green checkmark animation
- Loading states: Spinner or skeleton screens
```

---

## 📐 **9. Figma Setup Instructions**

### **Creating the Design System**
1. Create color styles for all defined colors
2. Set up text styles for all typography
3. Create component library for buttons, cards, forms
4. Set up grid system (12-column)
5. Create spacing tokens as styles

### **Page Structure**
1. Create frames for each screen size
2. Use auto-layout for responsive components
3. Create master components for reusable elements
4. Set up prototyping for user flows
5. Add interactions and animations

### **Organization**
```
Pages Structure:
├── 🎨 Design System
├── 🏠 Landing Page
├── 🔐 Authentication
├── 👤 Customer Dashboard
├── 🔧 Provider Dashboard
├── 🛡️ Admin Dashboard
└── 📱 Mobile Versions
```

This comprehensive specification provides everything you need to create a professional Figma design for your Home Services Platform. Each section includes detailed layouts, styling, and interactive elements that match your current implementation.
