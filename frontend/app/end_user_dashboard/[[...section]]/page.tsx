"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BookingModal from "../../components/BookingModal";
// EndUserSidebar component will be defined in this file

interface User {
  id: number;
  username: string;
  user_type: string;
  role: string;
  is_active: boolean;
}

interface Service {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  provider_name: string;
  description: string;
  price: number;
}

interface Booking {
  id: number;
  service_name: string;
  provider_name: string;
  booking_date: string;
  status: string;
  price: number;
}

function EndUserSidebar({ user }: { user: User }) {
  const router = useRouter();
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  const currentPath = section ? `/end_user_dashboard/${section}` : '/end_user_dashboard';

  const menuItems = [
    {
      title: "Home",
      path: "/end_user_dashboard",
      icon: "🏠"
    },
    {
      title: "Book a Service",
      path: "/end_user_dashboard/services",
      icon: "🔧"
    },
    {
      title: "My Requests",
      path: "/end_user_dashboard/requests",
      icon: "📝"
    }
  ];

  return (
    <div style={{
      width: 280,
      background: 'linear-gradient(135deg,rgb(18, 49, 103) 0%, #2a5298 100%)',
      padding: '32px 24px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      overflowY: 'auto',
      borderRight: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Logo/Brand */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          width: 70, 
          height: 70, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '2.5rem',
          margin: '0 auto 20px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          👤
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 500 }}>{user.username}</p>
        <div 
          onClick={() => router.push('/end_user_dashboard/profile')}
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '4px 8px',
            borderRadius: '4px',
            margin: '8px 0',
            textAlign: 'center'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(135, 206, 235, 0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <p style={{ 
            color: '#87CEEB', 
            margin: 0, 
            fontSize: '0.9rem', 
            fontWeight: 500, 
            textDecoration: 'underline',
            textAlign: 'center'
          }}>My Profile</p>
        </div>
      </div>



      {/* Navigation Menu */}
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item, index) => (
            <li key={index} style={{ marginBottom: 12 }}>
              <button
                onClick={() => router.push(item.path)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: currentPath === item.path ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.05)',
                  border: currentPath === item.path ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: currentPath === item.path ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'left',
                  boxShadow: currentPath === item.path ? '0 8px 25px rgba(0,0,0,0.2)' : 'none',
                  transform: currentPath === item.path ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={e => {
                  if (currentPath !== item.path) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={e => {
                  if (currentPath !== item.path) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: '1.3rem', marginRight: 15 }}>{item.icon}</span>
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div style={{ marginTop: 'auto', paddingTop: 0 }}>
        <button
          onClick={() => {
            localStorage.removeItem("access_token");
            router.push("/login");
          }}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            color: 'white',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '1.2rem', marginRight: 10 }}>🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}

export default function UserDashboardCatchAll() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:8000/api/auth/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: User) => {
        // Redirect if not an end user
        if (data.user_type !== "End User") {
          if (data.user_type === "Service Provider") {
            router.push("/service_provider_dashboard");
          } else if (data.user_type === "Platform Provider" || data.user_type === "Admin") {
            router.push("/platform_provider_dashboard");
          }
          return;
        }
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <h3 style={{ margin: "0", color: "#333" }}>Loading your dashboard...</h3>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <EndUserSidebar user={user} />
      <main style={{ flex: 1, padding: "32px", background: "#f8f9fa", marginLeft: "280px" }}>
        {/* Home page for end users */}
        {!section && <MainDashboard user={user} />}
        
        {/* Profile section route */}
        {section === "profile" && <ProfileSection user={user} />}
        
        {/* Bookings section */}
        {section === "bookings" && <BookingsSection user={user} />}
        
        {/* Requests section */}
        {section === "requests" && <RequestsSection user={user} />}
        
        {/* Services section */}
        {section === "services" && <ServicesSection user={user} />}
        
        {/* Notifications section */}
        {section === "notifications" && <NotificationsSection user={user} />}
        
        {/* Default end user dashboard */}
        {section && section !== "profile" && section !== "bookings" && section !== "requests" && section !== "services" && section !== "notifications" && <EndUserDashboard user={user} />}
      </main>
    </div>
  );
}

function ProfileSection({ user }: { user: User }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>👤 My Profile</h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong>Username:</strong> {user.username}
        </div>
        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong>User Type:</strong> {user.user_type}
        </div>
        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong>Role:</strong> {user.role}
        </div>
        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong>Status:</strong> <span style={{ color: user.is_active ? '#28a745' : '#dc3545' }}>{user.is_active ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    </div>
  );
}

function EndUserDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Hello, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>Welcome to your customer dashboard.</p>
      <button style={{ padding: '10px 24px', borderRadius: 8, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/end_user_dashboard/profile')}>View Profile</button>
    </div>
  );
}

function MainDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and subcategories from backend
  useEffect(() => {
    const fetchData = async () => {
      console.log('🚀 Starting to fetch categories and subcategories...');
      try {
        // Fetch categories (no authentication required)
        console.log('📋 Fetching categories from:', "http://localhost:8000/api/services/categories/");
        const categoriesResponse = await fetch("http://localhost:8000/api/services/categories/");
        console.log('📋 Categories response status:', categoriesResponse.status);

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log('✅ Categories fetched successfully:', categoriesData);
          console.log('📊 Number of categories:', categoriesData.length);
          if (categoriesData.length > 0) {
            console.log('🔍 Sample category structure:', categoriesData[0]);
          }
          setCategories(categoriesData);
        } else {
          console.error('❌ Categories fetch failed:', categoriesResponse.status, categoriesResponse.statusText);
          const errorText = await categoriesResponse.text();
          console.error('❌ Error response:', errorText);
        }

        // Fetch all subcategories (no authentication required)
        console.log('🔧 Fetching subcategories from:', "http://localhost:8000/api/services/subcategories/");
        const subcategoriesResponse = await fetch("http://localhost:8000/api/services/subcategories/");
        console.log('🔧 Subcategories response status:', subcategoriesResponse.status);

        if (subcategoriesResponse.ok) {
          const subcategoriesData = await subcategoriesResponse.json();
          console.log('✅ Subcategories fetched successfully:', subcategoriesData);
          console.log('📊 Number of subcategories:', subcategoriesData.length);
          if (subcategoriesData.length > 0) {
            console.log('🔍 Sample subcategory structure:', subcategoriesData[0]);
          }
          setSubcategories(subcategoriesData);
        } else {
          console.error('❌ Subcategories fetch failed:', subcategoriesResponse.status, subcategoriesResponse.statusText);
          const errorText = await subcategoriesResponse.text();
          console.error('❌ Error response:', errorText);
        }
      } catch (error) {
        console.error('💥 Error fetching data:', error);
      } finally {
        console.log('🏁 Fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mainOptions = [
    {
      title: "🏠 Home Services",
      description: "Browse and book home services",
      icon: "🏠",
      gradient: "linear-gradient(135deg,rgb(147, 164, 239) 0%, #764ba2 100%)",
      onClick: () => router.push("/end_user_dashboard/services")
    },
    {
      title: "📝 My Requests",
      description: "View your service requests and bookings",
      icon: "📝",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      onClick: () => router.push("/end_user_dashboard/requests")
    },
    {
      title: "🔔 Notifications",
      description: "Check your notifications and updates",
      icon: "🔔",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      onClick: () => router.push("/end_user_dashboard/notifications")
    }
  ];

  // Helper function to get category icon and gradient - using consistent cleaning service colors
  const getCategoryIcon = (categoryName: string) => {
    const cleaningGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    const iconMap: { [key: string]: { icon: string; gradient: string } } = {
      'Cleaning Services': {
        icon: '🧹',
        gradient: cleaningGradient
      },
      'Appliance Repair & Installation': {
        icon: '🔧',
        gradient: cleaningGradient
      },
      'Electricians': {
        icon: '⚡',
        gradient: cleaningGradient
      },
      'Plumbers': {
        icon: '🚿',
        gradient: cleaningGradient
      },
      'Carpenters': {
        icon: '🪚',
        gradient: cleaningGradient
      },
      'Home Renovation & Interior': {
        icon: '🏡',
        gradient: cleaningGradient
      },
      'default': {
        icon: '🏠',
        gradient: cleaningGradient
      }
    };
    return iconMap[categoryName] || iconMap.default;
  };

  // Create category data structure from backend data
  const categoryData = categories.reduce((acc: any, category: any) => {
    // Fix: subcategory.category is an object, not just an ID
    const categorySubcategories = subcategories.filter((sub: any) => sub.category.id === category.id);
    console.log(`🔍 Processing category: ${category.name} (ID: ${category.id})`);
    console.log(`🔍 Found ${categorySubcategories.length} subcategories for this category`);
    console.log('🔍 Subcategories:', categorySubcategories);

    acc[category.name] = {
      subcategories: categorySubcategories.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        price: sub.price
      }))
    };
    return acc;
  }, {});

  console.log('🏗️ Final categoryData structure:', categoryData);

  return (
    <div style={{ 
      background: 'linear-gradient(135deg,rgb(73, 100, 218) 0%, #764ba2 100%)', 
      borderRadius: 25, 
      padding: 30, 
      maxWidth: 1200, 
      margin: '0 auto', 
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      height: 'calc(100vh - 100px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        filter: 'blur(30px)'
      }}></div>

      <div style={{ textAlign: 'center', marginBottom: 30, position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 15px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          👋
        </div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 900, 
          marginBottom: 12, 
          color: 'white',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          background: 'linear-gradient(45deg, #fff, #f0f0f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Welcome Back!</h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1rem', 
          marginBottom: 0,
          fontWeight: 500
        }}>What would you like to do today?</p>
      </div>

      {/* Main Options */}
      <div style={{ marginBottom: 30, position: 'relative', zIndex: 1 }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 800, 
          marginBottom: 20, 
          color: 'white', 
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>Quick Actions</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 20 
        }}>
          {mainOptions.map((option, index) => (
            <div
              key={index}
              onClick={option.onClick}
              style={{
                background: option.gradient,
                borderRadius: 20,
                padding: 25,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
              }}
            >
              <div style={{ 
                background: 'rgba(255,255,255,0.25)', 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '2rem',
                marginBottom: 15,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {option.icon}
              </div>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: 'white', 
                fontSize: '1.4rem', 
                fontWeight: 800,
                textShadow: '0 2px 4px rgba(16, 16, 16, 0.3)'
              }}>
                {option.title}
              </h3>
              <p style={{ 
                margin: 0, 
                color: 'rgba(255,255,255,0.95)', 
                fontSize: '0.9rem', 
                lineHeight: 1.4,
                fontWeight: 500
              }}>
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Available Services Preview */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ margin: '0', color: 'white' }}>Loading services...</h3>
        </div>
      ) : categories.length > 0 ? (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: 20,
            color: 'white',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>Available Services</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 15
          }}>
            {categories.slice(0, 4).map((category: any, index: number) => {
              console.log(`🎨 Rendering category: ${category.name}`);
              const iconData = getCategoryIcon(category.name);
              const serviceCount = categoryData[category.name]?.subcategories?.length || 0;
              console.log(`🎨 Service count for ${category.name}: ${serviceCount}`);

              return (
                <div
                  key={category.id}
                  onClick={() => router.push("/end_user_dashboard/services")}
                  style={{
                    background: iconData.gradient,
                    borderRadius: 16,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  }}
                >
                  <div style={{
                    background: 'rgba(255,255,255,0.25)',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: 12,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    {iconData.icon}
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {category.name}
                  </h3>
                  <p style={{
                    margin: '0 0 8px 0',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    fontWeight: 500
                  }}>
                    {category.description}
                  </p>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: 'white',
                    fontWeight: 600,
                    display: 'inline-block'
                  }}>
                    {serviceCount} services
                  </div>
                </div>
              );
            })}
          </div>

          {categories.length > 4 && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                onClick={() => router.push("/end_user_dashboard/services")}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View All {categories.length} Categories →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'white' }}>No services available</h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>Services will appear here once they're added to the platform</p>
        </div>
      )}

    </div>
  );
}

function BookingsSection({ user }: { user: User }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/bookings/user/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => {
        setBookings([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <h3 style={{ margin: "0", color: "#333" }}>Loading bookings...</h3>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 800, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>📋 My Bookings</h2>
      {bookings.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No bookings found. Start by browsing our services!</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {bookings.map((booking: Booking) => (
            <div key={booking.id} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ margin: 0, color: '#333' }}>{booking.service_name}</h4>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem',
                  background: booking.status === 'completed' ? '#d4edda' : booking.status === 'in_progress' ? '#fff3cd' : '#f8d7da',
                  color: booking.status === 'completed' ? '#155724' : booking.status === 'in_progress' ? '#856404' : '#721c24'
                }}>
                  {booking.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: 12 }}>
                <div>
                  <strong>Provider:</strong> {booking.provider_name}
                </div>
                <div>
                  <strong>Date:</strong> {booking.booking_date}
                </div>
                <div>
                  <strong>Price:</strong> <span style={{ color: '#28a745', fontWeight: 600 }}>${booking.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RequestsSection({ user }: { user: User }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('📋 Fetching user bookings...');
        // Fetch bookings from backend API
        const response = await fetch("http://localhost:8000/api/bookings/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('📋 Bookings response status:', response.status);

        if (response.ok) {
          const bookings = await response.json();
          console.log('✅ Bookings fetched successfully:', bookings);
          console.log('📊 Number of bookings:', bookings.length);
          setRequests(bookings);
        } else {
          console.error('❌ Failed to fetch bookings, status:', response.status);
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          setRequests([]);
        }
      } catch (error) {
        console.error('💥 Error fetching bookings:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleCancelRequest = async (requestId: string) => {
    // Find the request to check its current status
    const requestToCancel = requests.find(req => req.id === parseInt(requestId));

    if (!requestToCancel) {
      alert("❌ Request not found.");
      return;
    }

    // Double-check the status before attempting to cancel
    if (requestToCancel.status?.toLowerCase() === 'cancelled') {
      alert("ℹ️ This request is already cancelled.");
      return;
    }

    if (!['pending', 'accepted'].includes(requestToCancel.status?.toLowerCase())) {
      alert(`ℹ️ Cannot cancel request with status: ${requestToCancel.status}. Only pending or accepted requests can be cancelled.`);
      return;
    }

    const confirmCancel = window.confirm(`Are you sure you want to cancel this booking request?\n\nService: ${requestToCancel.subcategory_name}\nStatus: ${requestToCancel.status}\n\nThis action cannot be undone.`);

    if (!confirmCancel) return;

    setCancelLoading(requestId);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please log in to cancel requests.");
        return;
      }

      console.log(`Attempting to cancel request ${requestId} with status: ${requestToCancel.status}`);

      const response = await fetch(`http://localhost:8000/api/bookings/${requestId}/cancel/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert("✅ Booking request cancelled successfully!");
        // Update the request status to cancelled instead of removing it
        const updatedRequests = requests.map(req =>
          req.id === parseInt(requestId)
            ? { ...req, status: 'cancelled' }
            : req
        );
        setRequests(updatedRequests);
      } else {
        const errorData = await response.json();
        console.error('Cancel request failed:', errorData);
        alert(`❌ Failed to cancel request: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert("❌ Network error. Please try again.");
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "60px",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 25,
        margin: '20px auto',
        maxWidth: 600,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          fontSize: "60px", 
          marginBottom: "20px",
          animation: 'pulse 2s infinite'
        }}>⏳</div>
        <h3 style={{ 
          margin: "0", 
          color: "white", 
          fontSize: '1.8rem',
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>Loading your requests...</h3>
        
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FF9800';
      case 'accepted': return '#4CAF50';
      case 'confirmed': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'declined': return '#FF5722';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === 'N/A') {
      return 'Date not available';
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      borderRadius: 25, 
      padding: 50, 
      maxWidth: 1200, 
      margin: '0 auto', 
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      minHeight: '80vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        filter: 'blur(30px)'
      }}></div>

      <div style={{ textAlign: 'center', marginBottom: 50, position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          margin: '0 auto 20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          📝
        </div>
        <h2 style={{ 
          fontSize: '3rem', 
          fontWeight: 900, 
          marginBottom: 16, 
          color: 'white',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>My Requests</h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.3rem', 
          marginBottom: 0,
          fontWeight: 500
        }}>Track your service requests and bookings</p>
      </div>
      
      {requests.length === 0 ? (
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: 25, 
          padding: 80, 
          textAlign: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ 
            fontSize: '6rem', 
            marginBottom: 30,
            animation: 'float 3s ease-in-out infinite'
          }}>📋</div>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#333', 
            fontSize: '2rem',
            fontWeight: 800
          }}>No requests yet</h3>
          <p style={{ 
            color: '#666', 
            margin: 0, 
            fontSize: '1.2rem',
            fontWeight: 500
          }}>Your service requests and bookings will appear here once you submit them.</p>

        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px', position: 'relative', zIndex: 1 }}>
          {requests.map((request: any, index: number) => (
            <div key={index} style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: 20, 
              padding: 20, 
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              border: '2px solid transparent',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
            }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: 6, 
                background: getStatusColor(request.status),
                borderRadius: '25px 25px 0 0'
              }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 }}>
                <div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#333', 
                    fontSize: '1.3rem', 
                    fontWeight: 800 
                  }}>
                    {request.subcategory?.name || 'Service Request'}
                  </h4>
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    color: '#666', 
                    fontSize: '0.9rem', 
                    lineHeight: 1.4,
                    fontWeight: 500
                  }}>
                    {request.notes || 'No additional details provided'}
                  </p>
                </div>
                <div style={{ 
                  background: getStatusColor(request.status), 
                  color: 'white', 
                  padding: '8px 15px', 
                  borderRadius: 20, 
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  letterSpacing: '0.5px'
                }}>
                  {request.status}
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '20px', 
                marginBottom: 25 
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                  padding: '15px', 
                  borderRadius: 15,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <strong style={{ color: '#333', fontSize: '0.9rem' }}>💰 Price:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '1rem', fontWeight: 600 }}>${request.total_price}</p>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                  padding: '15px', 
                  borderRadius: 15,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <strong style={{ color: '#333', fontSize: '0.9rem' }}>📅 Service Date:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '1rem', fontWeight: 600 }}>{formatDate(request.service_date)}</p>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                  padding: '15px', 
                  borderRadius: 15,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <strong style={{ color: '#333', fontSize: '0.9rem' }}>💳 Payment:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '1rem', fontWeight: 600 }}>{request.payment_status}</p>
                </div>
              </div>
              
              {request.provider && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', 
                  padding: '15px', 
                  borderRadius: 15,
                  border: '2px solid #4CAF50',
                  marginBottom: 15
                }}>
                  <strong style={{ color: '#2e7d32', fontSize: '0.9rem' }}>👨‍🔧 Assigned Provider:</strong>
                  <p style={{ margin: '8px 0 0 0', color: '#388e3c', fontSize: '1rem', fontWeight: 600 }}>{request.provider}</p>
                </div>
              )}
              
              <div style={{
                background: 'linear-gradient(135deg, #f0f8ff 0%, #e3f2fd 100%)',
                padding: '15px',
                borderRadius: 15,
                borderLeft: '4px solid #667eea'
              }}>
                <strong style={{ color: '#333', fontSize: '0.9rem' }}>📍 Service Address:</strong>
                <p style={{ margin: '8px 0 0 0', color: '#666', lineHeight: 1.4, fontSize: '0.9rem' }}>
                  {request.address || 'No address provided'}
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f0f8ff 0%, #e3f2fd 100%)',
                padding: '15px',
                borderRadius: 15,
                borderLeft: '4px solid #667eea',
                marginTop: '10px'
              }}>
                <strong style={{ color: '#333', fontSize: '0.9rem' }}>📝 Request Details:</strong>
                <p style={{ margin: '8px 0 0 0', color: '#666', lineHeight: 1.4, fontSize: '0.9rem' }}>
                  {request.notes || 'No additional details provided'}
                </p>
              </div>

              {/* Cancel Button - only show for pending or accepted requests (not cancelled, declined, completed, etc.) */}
              {(request.status?.toLowerCase() === 'pending' || request.status?.toLowerCase() === 'accepted') && (
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <button
                    onClick={() => handleCancelRequest(request.id.toString())}
                    disabled={cancelLoading === request.id.toString()}
                    style={{
                      background: cancelLoading === request.id.toString()
                        ? '#6c757d'
                        : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 25,
                      padding: '12px 30px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: cancelLoading === request.id.toString() ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                      opacity: cancelLoading === request.id.toString() ? 0.7 : 1
                    }}
                    onMouseEnter={e => {
                      if (cancelLoading !== request.id.toString()) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (cancelLoading !== request.id.toString()) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                      }
                    }}
                  >
                    {cancelLoading === request.id.toString() ? '⏳ Cancelling...' : '❌ Cancel Request'}
                  </button>
                </div>
              )}

              {/* Info message for non-cancellable requests */}
              {!['pending', 'accepted'].includes(request.status?.toLowerCase()) && (
                <div style={{
                  marginTop: 20,
                  textAlign: 'center',
                  padding: '10px 15px',
                  background: 'rgba(108, 117, 125, 0.1)',
                  borderRadius: 12,
                  border: '1px solid rgba(108, 117, 125, 0.2)'
                }}>
                  <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                    {request.status?.toLowerCase() === 'cancelled' && (
                      <>
                        {request.cancelled_by === 'provider' && '❌ This request has been cancelled by service provider'}
                        {request.cancelled_by === 'customer' && '❌ This request has been cancelled by you'}
                        {!request.cancelled_by && '❌ This request has been cancelled'}
                      </>
                    )}
                    {request.status?.toLowerCase() === 'declined' && '❌ This request has been declined by service provider'}
                    {request.status?.toLowerCase() === 'completed' && '✅ This service has been completed'}
                    {request.status?.toLowerCase() === 'in_progress' && '🔄 This service is currently in progress'}
                    {request.status?.toLowerCase() === 'confirmed' && 'ℹ️ This request is confirmed and cannot be cancelled'}
                    {!['cancelled', 'declined', 'completed', 'in_progress', 'confirmed'].includes(request.status?.toLowerCase()) &&
                      `ℹ️ Requests with status "${request.status}" cannot be cancelled`}
                  </small>
                </div>
              )}

              <div style={{
                marginTop: 15,
                padding: '12px 15px',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.1)'
              }}>
                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                  <strong>Request ID:</strong> #{request.id} | 
                  <strong>Created:</strong> {formatDate(request.created_at)} | 
                  <strong>Last Updated:</strong> {formatDate(request.updated_at)}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesSection({ user }: { user: User }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    subcategory: {
      id: string;
      name: string;
      description: string;
      price: number;
    } | null;
    categoryName: string;
  }>({
    isOpen: false,
    subcategory: null,
    categoryName: ""
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch categories and subcategories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories (no authentication required)
        const categoriesResponse = await fetch("http://localhost:8000/api/services/categories/");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Fetch all subcategories (no authentication required)
        const subcategoriesResponse = await fetch("http://localhost:8000/api/services/subcategories/");
        if (subcategoriesResponse.ok) {
          const subcategoriesData = await subcategoriesResponse.json();
          setSubcategories(subcategoriesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get category icon
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Cleaning Services': '🧹',
      'Appliance Repair & Installation': '🔧',
      'Electricians': '⚡',
      'Plumbers': '🚿',
      'Carpenters': '🪚',
      'Home Renovation & Interior': '🏡',
      'default': '🏠'
    };
    return iconMap[categoryName] || iconMap.default;
  };

  // Create category data structure from backend data
  const categoryData = categories.reduce((acc: any, category: any) => {
    // Fix: subcategory.category is an object, not just an ID
    const categorySubcategories = subcategories.filter((sub: any) => sub.category.id === category.id);
    acc[category.name] = {
      subcategories: categorySubcategories.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        priceRange: `$${sub.price}`,
        icon: getCategoryIcon(category.name)
      }))
    };
    return acc;
  }, {});

  const categoryIcons = {
    "Cleaning Services": { icon: "🧹", color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    "Appliance Repair & Installation": { icon: "🔧", color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    "Electricians": { icon: "⚡", color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    "Plumbers": { icon: "🚿", color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    "Carpenters": { icon: "🪚", color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    "Home Renovation & Interior": { icon: "🏡", color: "#667eea", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
  };

  const timeRanges = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM", 
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM",
    "7:00 PM - 8:00 PM",
    "8:00 PM - 9:00 PM",
    "9:00 PM - 10:00 PM"
  ];

  const iconData = categoryIcons[selectedCategory] || {
    icon: getCategoryIcon(selectedCategory),
    color: "#667eea",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  };

  // Function to save quote request to backend
  const saveQuoteRequest = async (requestData: any) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // setQuoteMsg("Please log in to submit requests."); // Removed - using BookingModal now
      return;
    }

    // setSubmitting(true); // Removed - using BookingModal now
    try {
      // Convert date and time to datetime
      const [year, month, day] = requestData.preferred_date.split('-');
      const [timeRange] = requestData.time_range.split(' - ');
      const [hour, minute] = timeRange.split(':');
      const ampm = timeRange.includes('PM') ? 'PM' : 'AM';
      
      let hour24 = parseInt(hour);
      if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
      if (ampm === 'AM' && hour24 === 12) hour24 = 0;
      
      const serviceDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minute));
      
      // Combine description and address for notes
      const notes = `Description: ${requestData.description}\nAddress: ${requestData.address}`;
      
      // The requestData.service_name is actually the subcategory ID
      const subcategoryId = requestData.service_name;
      
      const response = await fetch("http://localhost:8000/api/bookings/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subcategory_id: subcategoryId,
          service_date: serviceDate.toISOString(),
          notes: notes
        }),
      });

      if (response.ok) {
        const bookingData = await response.json();
        // setQuoteMsg(`✅ Quote request sent successfully! Check your requests section for updates.`); // Removed - using BookingModal now
        // setQuoteModal({ open: false, subcategory: null }); // Removed - using BookingModal now
        // setDescription(''); // Removed - using BookingModal now
        // setAddress(''); // Removed - using BookingModal now
        // setDate(''); // Removed - using BookingModal now
        // setTimeRange(''); // Removed - using BookingModal now
        
        // Show success notification
        setTimeout(() => {
          // setQuoteMsg(null); // Removed - using BookingModal now
        }, 5000);
      } else {
        const errorData = await response.json();
        // setQuoteMsg(`❌ Error: ${errorData.detail || 'Failed to submit request'}`); // Removed - using BookingModal now
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      // setQuoteMsg("Error submitting request. Please try again."); // Removed - using BookingModal now
    } finally {
      // setSubmitting(false); // Removed - using BookingModal now
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: 25, 
        padding: '40px 30px', 
        width: '100%', 
        maxWidth: '100%', 
        margin: '0', 
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        minHeight: 'calc(100vh - 64px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'pulse 2s infinite' }}>⏳</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '10px' }}>Loading Services...</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Fetching available services from the database</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg,rgb(58, 98, 154) 0%, #764ba2 100%)', 
      borderRadius: 25, 
      padding: '40px 30px', 
      width: '100%', 
      maxWidth: '100%', 
      margin: '0', 
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      minHeight: 'calc(100vh - 64px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Notification banner removed - BookingModal handles success messages */}
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        filter: 'blur(30px)'
      }}></div>

      <div style={{ textAlign: 'center', marginBottom: 50, position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          margin: '0 auto 20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          🏠
        </div>
        <h2 style={{ 
          fontSize: '3rem', 
          fontWeight: 900, 
          marginBottom: 16, 
          color: 'white',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>Home Services</h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.3rem', 
          marginBottom: 0,
          fontWeight: 500
        }}>Choose a category to browse available services</p>
      </div>

      {!selectedCategory ? (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 20 
          }}>
            {Object.keys(categoryData).map((category, index) => {
              const iconData = categoryIcons[category] || {
                icon: getCategoryIcon(category),
                gradient: 'linear-gradient(135deg,rgb(122, 77, 245) 0%, #764ba2 100%)',
                color: '#667eea'
              };
              return (
                <div
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    background: iconData?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 25,
                    padding: 35,
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
                  }}
                >
                  <div style={{ 
                    background: 'rgba(255,255,255,0.25)', 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '2.5rem',
                    marginBottom: 25,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    {iconData?.icon || getCategoryIcon(category)}
                  </div>
                  <h3 style={{ 
                    margin: '0 0 15px 0', 
                    color: 'white', 
                    fontSize: '1.8rem', 
                    fontWeight: 800,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {category}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.95)', 
                    fontSize: '1.1rem', 
                    lineHeight: 1.6,
                    fontWeight: 500
                  }}>
                    Browse {categoryData[category]?.subcategories?.length || 0} services
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 40,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '20px 30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                cursor: 'pointer',
                marginRight: 20,
                transition: 'all 0.2s ease',
                color: 'white'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              ←
            </button>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginRight: 20,
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}>
              {getCategoryIcon(selectedCategory)}
            </div>
            <h3 style={{ 
              margin: 0, 
              color: 'white', 
              fontSize: '2rem', 
              fontWeight: 800,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {selectedCategory}
            </h3>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 20 
          }}>
            {categoryData[selectedCategory].subcategories.map((sub, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 25,
                padding: 35,
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    marginRight: 20,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  }}>
                    {sub.icon}
                  </div>
                  <div>
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#333', 
                      fontSize: '1.4rem', 
                      fontWeight: 700 
                    }}>
                      {sub.name}
                    </h4>
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      color: '#666', 
                      fontSize: '1rem',
                      lineHeight: 1.5
                    }}>
                      {sub.description}
                    </p>
                    <div style={{ 
                      color: '#667eea', 
                      fontWeight: 700, 
                      fontSize: '1.1rem' 
                    }}>
                      {sub.priceRange}
                    </div>
                  </div>
                </div>
                
                <button
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 25,
                    padding: '15px 30px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    opacity: 1
                  }}
                  onMouseEnter={e => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                  }}
                  onClick={() => {
                    setBookingModal({
                      isOpen: true,
                      subcategory: {
                        id: sub.id.toString(),
                        name: sub.name,
                        description: sub.description,
                        price: parseFloat(sub.priceRange.replace('$', '')) || 0
                      },
                      categoryName: selectedCategory || ""
                    });
                  }}
                >
                  📝 Book Service
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal.isOpen && bookingModal.subcategory && (
        <BookingModal
          isOpen={bookingModal.isOpen}
          onClose={() => setBookingModal({ isOpen: false, subcategory: null, categoryName: "" })}
          subcategory={bookingModal.subcategory}
          categoryName={bookingModal.categoryName}
        />
      )}

      {/* Old quote modal removed - replaced with BookingModal */}
      {false && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: 25,
            padding: 35,
            minWidth: 450,
            maxWidth: 550,
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            position: 'relative',
            animation: 'slideUp 0.3s ease',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(20px)'
          }}>
            <button 
              onClick={() => setQuoteModal({ open: false, subcategory: null })} 
              style={{ 
                position: 'absolute', 
                top: 25, 
                right: 25, 
                background: 'rgba(0,0,0,0.1)', 
                border: 'none', 
                fontSize: 28, 
                color: '#666', 
                cursor: 'pointer',
                width: 45,
                height: 45,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
            >
              ×
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: 25 }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                width: 70, 
                height: 70, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '2.5rem',
                margin: '0 auto 20px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
              }}>
                📝
              </div>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                color: '#333', 
                fontWeight: 900, 
                fontSize: '1.6rem' 
              }}>Request a Quote</h3>
              <div style={{ 
                color: '#666', 
                fontWeight: 600, 
                fontSize: '1.1rem' 
              }}>{quoteModal.subcategory}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  marginBottom: 12, 
                  display: 'block',
                  fontSize: '1.1rem'
                }}>📝 Describe your service requirement:</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Please provide detailed information about the service you need..."
                  style={{ 
                    width: '100%', 
                    borderRadius: 20, 
                    border: '2px solid #e0e0e0', 
                    padding: 15, 
                    fontSize: 16, 
                    resize: 'vertical', 
                    background: '#f8f9fa',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  marginBottom: 12, 
                  display: 'block',
                  fontSize: '1.1rem'
                }}>📍 Address:</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  style={{ 
                    width: '100%', 
                    borderRadius: 20, 
                    border: '2px solid #e0e0e0', 
                    padding: 15, 
                    fontSize: 16, 
                    background: '#f8f9fa',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  marginBottom: 12, 
                  display: 'block',
                  fontSize: '1.1rem'
                }}>📅 Preferred Date:</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    borderRadius: 20, 
                    border: '2px solid #e0e0e0', 
                    padding: 15, 
                    fontSize: 16, 
                    background: '#f8f9fa',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              
              <div>
                <label style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  marginBottom: 12, 
                  display: 'block',
                  fontSize: '1.1rem'
                }}>⏰ Preferred Time Range:</label>
                <select
                  value={timeRange}
                  onChange={e => setTimeRange(e.target.value)}
                  style={{ 
                    width: '100%', 
                    borderRadius: 20, 
                    border: '2px solid #e0e0e0', 
                    padding: 15, 
                    fontSize: 16, 
                    background: '#f8f9fa',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                >
                  <option value="">Select time range</option>
                  {timeRanges.map((tr) => (
                    <option key={tr} value={tr}>{tr}</option>
                  ))}
                </select>
              </div>
              
              <button
                style={{ 
                  padding: '16px 0', 
                  borderRadius: 30, 
                  background: submitting ? '#4CAF50' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white', 
                  fontWeight: 800, 
                  border: 'none', 
                  cursor: submitting ? 'not-allowed' : 'pointer', 
                  fontSize: 18, 
                  marginTop: 10, 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  opacity: (!description.trim() || !address.trim() || !date || !timeRange || submitting) ? 0.6 : 1
                }}
                disabled={!description.trim() || !address.trim() || !date || !timeRange || submitting}
                onMouseEnter={e => {
                  if (!e.currentTarget.disabled && !submitting) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
                }}
                onClick={() => {
                  saveQuoteRequest({
                    service_name: quoteModal.subcategory,
                    description: description,
                    address: address,
                    preferred_date: date,
                    time_range: timeRange
                  });
                }}
              >
                {submitting ? '🔄 Submitting...' : '🚀 Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(40px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateX(-50%) translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0); 
          }
        }
      `}</style>
    </div>
  );
}

function NotificationsSection({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock notifications
    // This can be connected to a real API later
    const mockNotifications = [
      {
        id: 1,
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your cleaning service booking has been confirmed for tomorrow.',
        timestamp: '2025-07-09 10:30',
        read: false
      },
      {
        id: 2,
        type: 'reminder',
        title: 'Service Reminder',
        message: 'Your electrician appointment is scheduled for today at 2:00 PM.',
        timestamp: '2025-07-09 09:15',
        read: true
      },
      {
        id: 3,
        type: 'update',
        title: 'Service Update',
        message: 'Your plumbing service has been rescheduled to Friday.',
        timestamp: '2025-07-08 16:45',
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <h3 style={{ margin: "0", color: "#333" }}>Loading notifications...</h3>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 800, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>🔔 Notifications</h2>
      {notifications.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No notifications at the moment.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {notifications.map((notification: any) => (
            <div key={notification.id} style={{ 
              border: '1px solid #e9ecef', 
              borderRadius: 8, 
              padding: 20,
              background: notification.read ? '#f8f9fa' : '#fff',
              borderLeft: notification.read ? '4px solid #e9ecef' : '4px solid #667eea'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1.1rem' }}>{notification.title}</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#666' }}>{notification.message}</p>
                  <span style={{ fontSize: '0.8rem', color: '#999' }}>{notification.timestamp}</span>
                </div>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: notification.read ? 'transparent' : '#667eea',
                  marginLeft: '12px'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

 