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
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

interface UserPermissions {
  [key: string]: boolean;
}

function PermissionDenied({ section, permission }: { section: string; permission: string }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 40,
      maxWidth: 600,
      margin: '40px auto',
      boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: 20 }}>🔒</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, color: '#dc3545' }}>
        Access Denied
      </h2>
      <p style={{ color: '#6c757d', marginBottom: 20 }}>
        You don't have permission to access <strong>{section}</strong>.
      </p>
      <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
        Required permission: <strong>{permission}</strong>
      </p>
      <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: 20 }}>
        Contact your administrator to request access.
      </p>
    </div>
  );
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

interface CartItem {
  id: string;
  subcategory_id: number;
  subcategory_name: string;
  provider_id: string;
  provider_name: string;
  price: number;
  description: string;
  category_name: string;
  added_at: string;
  booking_details?: {
    selected_date: string;
    selected_time: string;
    address: string;
    notes: string;
  };
}

interface Cart {
  items: CartItem[];
  provider_id: string | null;
  provider_name: string | null;
  total_price: number;
  total_items: number;
}

interface Booking {
  id: number;
  service_name: string;
  provider_name: string;
  booking_date: string;
  status: string;
  price: number;
}

function EndUserSidebar({ user, hasPermission, permissionsLoading, cartItemCount }: { user: User; hasPermission: (permission: string) => boolean; permissionsLoading: boolean; cartItemCount: number }) {
  const router = useRouter();
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  const currentPath = section ? `/end_user_dashboard/${section}` : '/end_user_dashboard';

  const allMenuItems = [
    {
      title: "Home",
      path: "/end_user_dashboard",
      icon: "🏠",
      permission: null // Home is always accessible
    },
    {
      title: "Book a Service",
      path: "/end_user_dashboard/services",
      icon: "🔧",
      permission: "create_bookings"
    },
    {
      title: "Cart",
      path: "/end_user_dashboard/cart",
      icon: "🛒",
      permission: "create_bookings"
    },
    {
      title: "My Requests",
      path: "/end_user_dashboard/requests",
      icon: "📝",
      permission: "view_own_bookings"
    }
  ];

  // Filter menu items based on permissions
  // If permissions haven't loaded yet, show all items to prevent empty menu
  const menuItems = permissionsLoading ? allMenuItems : allMenuItems.filter(item =>
    item.permission === null || hasPermission(item.permission)
  );

  console.log('🎯 Menu items after filtering:', menuItems.map(item => item.title));

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
        {hasPermission('view_own_profile') && (
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
        )}
        {!hasPermission('view_own_profile') && (
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            margin: '8px 0',
            fontSize: '0.8rem',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>Profile access restricted</p>
        )}
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
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <span style={{ fontSize: '1.3rem', marginRight: 15 }}>{item.icon}</span>
                  {item.title}
                </div>

                {/* Cart Badge */}
                {item.title === 'Cart' && cartItemCount > 0 && (
                  <span style={{
                    background: '#ff4757',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginLeft: '8px'
                  }}>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
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
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({});
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;

  // Function to load user permissions
  const loadUserPermissions = async (userType: string, role: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log('❌ No token found, skipping permission loading');
      setPermissionsLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Permission loading timeout - setting default permissions');
      setUserPermissions({});
      setPermissionsLoading(false);
    }, 10000); // 10 second timeout

    try {
      console.log('🔐 Loading user permissions for:', userType, role);
      const response = await fetch("http://localhost:8000/api/user/permissions/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('🌐 API Response status:', response.status);
      console.log('🌐 API Response ok:', response.ok);

      if (response.ok) {
        const permissionData = await response.json();
        console.log('📦 Raw API response:', permissionData);

        const flatPermissions = permissionData.flat_permissions || {};
        console.log('🎯 Flat permissions:', flatPermissions);

        console.log('✅ User permissions loaded:', flatPermissions);
        setUserPermissions(flatPermissions);
      } else {
        console.error('❌ Failed to load permissions - Status:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);

        // Set default permissions for End Users if API fails
        console.log('🔄 Setting fallback permissions for End User');
        const fallbackPermissions = {
          'view_own_profile': true,
          'edit_own_profile': true,
          'view_own_bookings': true,
          'create_bookings': true,
          'cancel_bookings': true,
          'delete_bookings': true
        };
        setUserPermissions(fallbackPermissions);
      }
    } catch (error) {
      console.error('💥 Error loading permissions:', error);

      // Set default permissions for End Users if there's an error
      console.log('🔄 Setting fallback permissions due to error');
      const fallbackPermissions = {
        'view_own_profile': true,
        'edit_own_profile': true,
        'view_own_bookings': true,
        'create_bookings': true,
        'cancel_bookings': true,
        'delete_bookings': true
      };
      setUserPermissions(fallbackPermissions);
    } finally {
      clearTimeout(timeoutId);
      setPermissionsLoading(false);
    }
  };

  // Function to check if user has a specific permission
  const hasPermission = (permissionCode: string): boolean => {
    console.log(`🔍 Checking permission: ${permissionCode}`);
    console.log(`📋 Available permissions:`, userPermissions);
    console.log(`✅ Has permission: ${userPermissions[permissionCode] === true}`);

    return userPermissions[permissionCode] === true;
  };

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

        // Load user permissions after user data is loaded
        loadUserPermissions(data.user_type, data.role);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  // Load cart count from localStorage
  const loadCartCount = () => {
    const savedCart = localStorage.getItem('userCart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        setCartItemCount(cart.items?.length || 0);
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartItemCount(0);
      }
    } else {
      setCartItemCount(0);
    }
  };

  // Load cart count on component mount and listen for updates
  useEffect(() => {
    loadCartCount();

    const handleStorageChange = () => {
      loadCartCount();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  if (loading || permissionsLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <h3 style={{ margin: "0", color: "#333" }}>
            {loading ? "Loading your dashboard..." : "Loading permissions..."}
          </h3>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <EndUserSidebar user={user} hasPermission={hasPermission} permissionsLoading={permissionsLoading} cartItemCount={cartItemCount} />
      <main style={{
        flex: 1,
        marginLeft: "280px",
        padding: "24px 32px",
        background: "#f8f9fa",
        minHeight: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        maxWidth: "calc(100vw - 280px)"
      }}>
        {/* Home page for end users */}
        {!section && <MainDashboard user={user} />}
        
        {/* Profile section route */}
        {section === "profile" && (
          <ProfileSection user={user} hasPermission={hasPermission} />
        )}

        {/* Requests section - check permission */}
        {section === "requests" && (
          permissionsLoading || hasPermission('view_own_bookings') ? (
            <RequestsSection user={user} hasPermission={hasPermission} />
          ) : (
            <PermissionDenied section="My Requests" permission="View Own Bookings" />
          )
        )}

        {/* Services section - check permission */}
        {section === "services" && (
          permissionsLoading || hasPermission('create_bookings') ? (
            <ServicesSection user={user} />
          ) : (
            <PermissionDenied section="Book a Service" permission="Create Bookings" />
          )
        )}

        {/* Cart section - check permission */}
        {section === "cart" && (
          permissionsLoading || hasPermission('create_bookings') ? (
            <CartSection user={user} />
          ) : (
            <PermissionDenied section="Cart" permission="Create Bookings" />
          )
        )}

        {/* Notifications section */}
        {section === "notifications" && <NotificationsSection user={user} />}

        {/* Default end user dashboard */}
        {section && section !== "profile" && section !== "bookings" && section !== "requests" && section !== "services" && section !== "notifications" && section !== "cart" && <EndUserDashboard user={user} />}
      </main>
    </div>
  );
}

function ProfileSection({ user, hasPermission }: { user: User; hasPermission: (permission: string) => boolean }) {
  const canView = hasPermission('view_own_profile');
  const canEdit = hasPermission('edit_own_profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username,
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    address: user.address || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      alert("❌ You don't have permission to edit your profile.");
      return;
    }

    // Validation
    if (showPasswordFields) {
      if (!editForm.oldPassword) {
        alert("❌ Please enter your current password.");
        return;
      }
      if (!editForm.newPassword) {
        alert("❌ Please enter a new password.");
        return;
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        alert("❌ New password and confirm password don't match.");
        return;
      }
      if (editForm.newPassword.length < 6) {
        alert("❌ New password must be at least 6 characters long.");
        return;
      }
    }

    if (!editForm.username.trim()) {
      alert("❌ Username cannot be empty.");
      return;
    }

    setEditLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("❌ Authentication required. Please log in again.");
        return;
      }

      const updateData: any = {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim()
      };

      // Only include password fields if user wants to change password
      if (showPasswordFields) {
        updateData.old_password = editForm.oldPassword;
        updateData.new_password = editForm.newPassword;
      }

      console.log('🔄 Updating profile with data:', { ...updateData, old_password: '***', new_password: '***' });

      const response = await fetch("http://localhost:8000/api/auth/me/update/", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });

      console.log('🌐 Profile update response status:', response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('✅ Profile updated successfully:', updatedUser);

        alert("✅ Profile updated successfully!");

        // Reset form and exit edit mode
        setIsEditing(false);
        setShowPasswordFields(false);
        setEditForm({
          username: updatedUser.username,
          email: updatedUser.email || '',
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Refresh the page to show updated user data
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('❌ Profile update failed:', errorData);

        let errorMessage = 'Unknown error';
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }

        alert(`❌ Failed to update profile: ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Error updating profile:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowPasswordFields(false);
    setEditForm({
      username: user.username,
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      address: user.address || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // If user doesn't have permission to view profile, show permission denied message
  if (!canView) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 32,
        maxWidth: 600,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)',
        textAlign: 'center'
      }}>
        <div style={{
          padding: '40px 20px',
          background: 'rgba(220, 53, 69, 0.1)',
          borderRadius: 12,
          border: '2px solid rgba(220, 53, 69, 0.2)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{
            color: '#dc3545',
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: '0 0 12px 0'
          }}>
            Access Denied
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '1rem',
            margin: '0 0 16px 0',
            lineHeight: 1.5
          }}>
            You don't have permission to view your profile.
          </p>
          <div style={{
            background: 'rgba(220, 53, 69, 0.1)',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgba(220, 53, 69, 0.2)',
            marginBottom: '16px'
          }}>
            <strong style={{ color: '#dc3545' }}>Required permission:</strong>
            <span style={{ color: '#6c757d', marginLeft: '8px' }}>View Own Profile</span>
          </div>
          <p style={{
            color: '#6c757d',
            fontSize: '0.9rem',
            margin: 0,
            fontStyle: 'italic'
          }}>
            Contact your administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>👤 My Profile</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!canEdit && (
            <span style={{ color: '#6c757d', fontSize: '0.9rem', fontStyle: 'italic' }}>
              🔒 Read-only
            </span>
          )}
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {!isEditing ? (
        // View Mode
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Personal Information Section */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #e9ecef'
          }}>
            <h4 style={{
              margin: '0 0 16px 0',
              color: '#495057',
              fontSize: '1.1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              👤 Personal Information
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <strong style={{ color: '#6c757d' }}>Username:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50' }}>{user.username}</div>
              </div>
              {user.email && (
                <div>
                  <strong style={{ color: '#6c757d' }}>Email:</strong>
                  <div style={{ marginTop: 4, color: '#2c3e50' }}>{user.email}</div>
                </div>
              )}
              {(user.first_name || user.last_name) && (
                <div>
                  <strong style={{ color: '#6c757d' }}>Full Name:</strong>
                  <div style={{ marginTop: 4, color: '#2c3e50' }}>
                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'Not provided'}
                  </div>
                </div>
              )}
              {user.phone && (
                <div>
                  <strong style={{ color: '#6c757d' }}>Phone:</strong>
                  <div style={{ marginTop: 4, color: '#2c3e50' }}>{user.phone}</div>
                </div>
              )}
              {user.address && (
                <div>
                  <strong style={{ color: '#6c757d' }}>Address:</strong>
                  <div style={{ marginTop: 4, color: '#2c3e50' }}>{user.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information Section */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #e9ecef'
          }}>
            <h4 style={{
              margin: '0 0 16px 0',
              color: '#495057',
              fontSize: '1.1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🏷️ Account Details
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <strong style={{ color: '#6c757d' }}>User Type:</strong>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {user.user_type}
                  </span>
                </div>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>Role:</strong>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {user.role}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
                    (Determines permissions)
                  </span>
                </div>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>Account Status:</strong>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: user.is_active ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: '24px' }}>
          {/* Personal Information Section */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #e9ecef'
          }}>
            <h4 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '1.1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              👤 Personal Information
            </h4>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {/* Username Field */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
                  Username:
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                border: '2px solid #e9ecef',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {/* Email Field */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
              Email:
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '2px solid #e9ecef',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {/* First Name Field */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
              First Name:
            </label>
            <input
              type="text"
              value={editForm.first_name}
              onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '2px solid #e9ecef',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {/* Last Name Field */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
              Last Name:
            </label>
            <input
              type="text"
              value={editForm.last_name}
              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '2px solid #e9ecef',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {/* Phone Field */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
              Phone:
            </label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '2px solid #e9ecef',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {/* Address Field */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
              Address:
            </label>
            <textarea
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '2px solid #e9ecef',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>
            </div>
          </div>

          {/* Account Information Section (Read-only) */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #e9ecef'
          }}>
            <h4 style={{
              margin: '0 0 20px 0',
              color: '#495057',
              fontSize: '1.1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🏷️ Account Details (Read-only)
            </h4>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#6c757d' }}>
                  User Type:
                </label>
                <input
                  type="text"
                  value={user.user_type}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    border: '2px solid #e9ecef',
                    fontSize: '1rem',
                    background: '#f8f9fa',
                    color: '#6c757d'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#6c757d' }}>
                  Role:
                </label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    border: '2px solid #e9ecef',
                    fontSize: '1rem',
                    background: '#f8f9fa',
                    color: '#6c757d'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <input
                type="checkbox"
                id="changePassword"
                checked={showPasswordFields}
                onChange={(e) => {
                  setShowPasswordFields(e.target.checked);
                  if (!e.target.checked) {
                    setEditForm({
                      ...editForm,
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }
                }}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="changePassword" style={{ fontWeight: 600, color: '#2c3e50', cursor: 'pointer' }}>
                🔐 Change Password
              </label>
            </div>

            {showPasswordFields && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
                    Current Password:
                  </label>
                  <input
                    type="password"
                    value={editForm.oldPassword}
                    onChange={(e) => setEditForm({ ...editForm, oldPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 8,
                      border: '2px solid #e9ecef',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
                    New Password:
                  </label>
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 8,
                      border: '2px solid #e9ecef',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 8,
                      border: '2px solid #e9ecef',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={editLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 8,
                background: editLoading
                  ? '#6c757d'
                  : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                cursor: editLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
            >
              {editLoading ? '⏳ Saving...' : '✅ Save Changes'}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={editLoading}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 8,
                background: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: editLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      )}
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
    <div>
      <div style={{
        background: 'linear-gradient(135deg,rgb(18, 49, 103) 0%, #2a5298 100%)',
        borderRadius: 16,
        padding: 32,
        maxWidth: 1200,
        margin: '0 auto 24px',
        boxShadow: '0 4px 20px rgba(18, 49, 103, 0.2)',
        color: 'white'
      }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
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
      <div style={{ marginBottom: 30 }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: 20,
          color: 'white',
          textAlign: 'center'
        }}>Quick Actions</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 15
        }}>
          {mainOptions.map((option, index) => (
            <div
              key={index}
              onClick={option.onClick}
              style={{
                background: option.gradient,
                borderRadius: 12,
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                width: 50,
                height: 50,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: 12,
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
    </div>

    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 32,
      maxWidth: 1200,
      margin: '0 auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      {/* Available Services Preview */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ margin: '0', color: 'white' }}>Loading services...</h3>
        </div>
      ) : categories.length > 0 ? (
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 20,
            color: '#2c3e50',
            textAlign: 'center'
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
    </div>
  );
}

// Helper functions for parsing booking data
const parseBookingNotes = (notes: string) => {
  const result = {
    isMultiService: false,
    serviceCount: 1,
    servicesList: [] as string[],
    description: '',
    address: '',
    timeSlot: ''
  };

  if (!notes) return result;



  // Check for multi-service booking
  const servicesMatch = notes.match(/Services included: ([^\n\r]+)/);
  const serviceCountMatch = notes.match(/Total services: (\d+)/);

  if (servicesMatch && serviceCountMatch) {
    const serviceCount = parseInt(serviceCountMatch[1]);
    result.isMultiService = serviceCount > 1; // Only multi if more than 1 service
    result.serviceCount = serviceCount;
    result.servicesList = servicesMatch[1].split(', ').map(s => s.trim());
  } else {
    // Check for cart-based multi-service booking format
    const cartMatch = notes.match(/Multi-service booking with (\d+) services/);
    if (cartMatch) {
      const serviceCount = parseInt(cartMatch[1]);
      result.isMultiService = serviceCount > 1; // Only multi if more than 1 service
      result.serviceCount = serviceCount;
    } else {
      // Check for single service booking format
      const singleMatch = notes.match(/Single service booking: ([^\n\r]+)/);
      if (singleMatch) {
        result.isMultiService = false;
        result.serviceCount = 1;
        result.servicesList = [singleMatch[1].trim()];
      }
    }
  }

  // Extract description
  const descriptionMatch = notes.match(/Description: ([^\n\r]+)/);
  if (descriptionMatch) {
    result.description = descriptionMatch[1].trim();
  }

  // Extract address - try multiple patterns and clean up
  let addressMatch = notes.match(/Address: ([^\n\r]+)/);
  if (!addressMatch) {
    // Try alternative patterns
    addressMatch = notes.match(/address: ([^\n\r]+)/i);
  }
  if (!addressMatch) {
    // Try to find address in different format
    addressMatch = notes.match(/Service Address: ([^\n\r]+)/);
  }
  if (!addressMatch) {
    // Try to find address at the end of notes (common pattern)
    addressMatch = notes.match(/Address:\s*([^,\n\r]+?)(?:\s+Description:|$)/);
  }
  if (addressMatch) {
    let address = addressMatch[1].trim();
    // Clean up address by removing time slot information that might be appended
    address = address.replace(/\s+Time Slot:.*$/i, '');
    address = address.replace(/\s+Description:.*$/i, '');
    result.address = address.trim();
  }

  // Extract time slot - try multiple patterns including time ranges
  let timeMatch = notes.match(/Time Slot: ([^\n\r]+)/);
  if (!timeMatch) {
    timeMatch = notes.match(/time slot: ([^\n\r]+)/i);
  }
  if (!timeMatch) {
    // Look for time ranges like "3pm-6pm", "3:00pm-6:00pm", "3 PM - 6 PM"
    timeMatch = notes.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*[-–]\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  }
  if (!timeMatch) {
    // Look for simple number ranges like "9-12", "9 - 12"
    timeMatch = notes.match(/(\d{1,2}\s*[-–]\s*\d{1,2})/);
  }
  if (!timeMatch) {
    // Look for single times like "at 11:32 PM"
    timeMatch = notes.match(/at (\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  }
  if (!timeMatch) {
    // Look for any time format
    timeMatch = notes.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  }
  if (!timeMatch) {
    // Look for simple time formats like "3pm", "6am"
    timeMatch = notes.match(/(\d{1,2}\s*(?:am|pm))/i);
  }
  if (timeMatch) {
    result.timeSlot = timeMatch[1].trim();
  }

  return result;
};

function RequestsSection({ user, hasPermission }: { user: User; hasPermission: (permission: string) => boolean }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

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

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async (requestId: string) => {
    console.log('=== CANCEL REQUEST DEBUG ===');
    console.log('Raw requestId parameter:', requestId, typeof requestId);
    console.log('Parsed requestId:', parseInt(requestId));
    console.log('Total requests in state:', requests.length);
    console.log('Available requests:', requests.map(r => ({ id: r.id, status: r.status, type: typeof r.id })));

    // Try different ways to find the request
    const requestToCancel1 = requests.find(req => req.id === parseInt(requestId));
    const requestToCancel2 = requests.find(req => req.id.toString() === requestId);
    const requestToCancel3 = requests.find(req => req.id == requestId); // Loose equality
    const requestToCancel4 = requests.find(req => String(req.id) === String(requestId)); // Both as strings

    console.log('Find attempt 1 (parseInt):', requestToCancel1 ? 'FOUND' : 'NOT FOUND');
    console.log('Find attempt 2 (toString):', requestToCancel2 ? 'FOUND' : 'NOT FOUND');
    console.log('Find attempt 3 (loose ==):', requestToCancel3 ? 'FOUND' : 'NOT FOUND');
    console.log('Find attempt 4 (both strings):', requestToCancel4 ? 'FOUND' : 'NOT FOUND');

    const requestToCancel = requestToCancel1 || requestToCancel2 || requestToCancel3 || requestToCancel4;

    if (!requestToCancel) {
      console.error('Request not found in local state');
      console.log('Searched for ID:', parseInt(requestId));
      console.log('Available IDs:', requests.map(r => r.id));
      console.log('Available ID types:', requests.map(r => typeof r.id));
      alert("❌ Request not found in local data. Please refresh the page and try again.");
      return;
    }

    console.log('Found request to cancel:', requestToCancel);

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

    // Prompt for cancellation reason
    const cancellationReason = window.prompt(
      "Please provide a reason for cancellation (optional):",
      "Change of plans"
    );

    // If user clicked Cancel on the prompt, don't proceed
    if (cancellationReason === null) return;

    setCancelLoading(requestId);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please log in to cancel requests.");
        return;
      }

      console.log(`Attempting to cancel request ${requestId} with status: ${requestToCancel.status}`);
      console.log('API URL:', `http://localhost:8000/api/bookings/${requestId}/cancel/`);

      const response = await fetch(`http://localhost:8000/api/bookings/${requestId}/cancel/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cancellation_reason: cancellationReason || "Customer requested cancellation"
        })
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Cancel success response:', data);
        alert("✅ Booking request cancelled successfully!");

        // Update the request status to cancelled in local state
        const updatedRequests = requests.map(req => {
          if (req.id === parseInt(requestId) || req.id.toString() === requestId || req.id == requestId) {
            console.log('Updating request status from', req.status, 'to cancelled');
            return { ...req, status: 'cancelled', cancelled_by: 'customer' };
          }
          return req;
        });

        console.log('Updated requests:', updatedRequests.map(r => ({ id: r.id, status: r.status })));
        setRequests(updatedRequests);

        // Also refresh the data from server to ensure consistency
        console.log('Refreshing requests from server...');
        setTimeout(() => {
          fetchRequests();
        }, 500); // Small delay to ensure backend has processed the change
      } else {
        const errorText = await response.text();
        console.error('Cancel request failed - Status:', response.status);
        console.error('Cancel request failed - Response:', errorText);

        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.detail || 'Unknown error';
        } catch (e) {
          errorMessage = errorText || 'Unknown error';
        }

        alert(`❌ Failed to cancel request: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert("❌ Network error. Please try again.");
    } finally {
      setCancelLoading(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    console.log('=== DELETE REQUEST DEBUG ===');
    console.log('Attempting to delete request ID:', requestId);

    // Find the request to check its current status
    const requestToDelete = requests.find(req => req.id === parseInt(requestId) || req.id.toString() === requestId || req.id == requestId);

    if (!requestToDelete) {
      console.error('Request not found in local state');
      alert("❌ Request not found. Please refresh the page and try again.");
      return;
    }

    console.log('Found request to delete:', requestToDelete);

    // Check if request can be deleted (only completed or cancelled)
    const deletableStatuses = ['completed', 'cancelled'];
    if (!deletableStatuses.includes(requestToDelete.status?.toLowerCase())) {
      alert("❌ You can only delete completed or cancelled bookings.");
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete this ${requestToDelete.status} booking? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("❌ Authentication required. Please log in again.");
      return;
    }

    setDeleteLoading(requestId);

    try {
      console.log(`Attempting to delete request ${requestId} with status: ${requestToDelete.status}`);
      console.log('API URL:', `http://localhost:8000/api/bookings/${requestId}/delete/`);

      const response = await fetch(`http://localhost:8000/api/bookings/${requestId}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Delete success response:', data);
        alert("✅ Booking deleted successfully!");

        // Remove the request from local state
        const updatedRequests = requests.filter(req =>
          req.id !== parseInt(requestId) && req.id.toString() !== requestId && req.id != requestId
        );

        console.log('Updated requests after deletion:', updatedRequests.map(r => ({ id: r.id, status: r.status })));
        setRequests(updatedRequests);

        // Also refresh the data from server to ensure consistency
        console.log('Refreshing requests from server...');
        setTimeout(() => {
          fetchRequests();
        }, 500);
      } else {
        const errorText = await response.text();
        console.error('Delete request failed - Status:', response.status);
        console.error('Delete request failed - Response:', errorText);

        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.detail || 'Unknown error';
        } catch (e) {
          errorMessage = errorText || 'Unknown error';
        }

        alert(`❌ Failed to delete request: ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Error deleting request:', error);
      alert('❌ Error deleting request. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const openRatingModal = (request: any) => {
    setSelectedRequest(request);
    setShowRatingModal(true);
    setRating(0);
    setReview('');
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedRequest(null);
    setRating(0);
    setReview('');
  };

  const submitRating = async () => {
    if (!selectedRequest || rating === 0) {
      alert('Please select a rating');
      return;
    }

    setRatingLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please log in to rate the service.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/bookings/rate-provider/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          booking_id: selectedRequest.id,
          rating: rating,
          review: review
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert("✅ Thank you for your rating!");

        // Update the request to show it has been rated
        const updatedRequests = requests.map(req =>
          req.id === selectedRequest.id
            ? { ...req, rating: rating }
            : req
        );
        setRequests(updatedRequests);

        closeRatingModal();
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to submit rating: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert("❌ Network error. Please try again.");
    } finally {
      setRatingLoading(false);
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
        <div style={{ display: 'grid', gap: '8px', position: 'relative', zIndex: 1 }}>
          {requests.map((request: any, index: number) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 10,
              padding: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: getStatusColor(request.status),
                borderRadius: '10px 10px 0 0'
              }}></div>

              {/* Compact Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  {/* Compact Service Title */}
                  <div style={{ flex: 1 }}>
                    {(() => {
                      const bookingData = parseBookingNotes(request.notes || '');

                      if (bookingData.isMultiService) {
                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                🛍️ Multi-Service ({bookingData.serviceCount})
                              </span>
                              {request.provider && (
                                <span style={{
                                  background: '#e8f5e8',
                                  color: '#155724',
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontSize: '10px',
                                  fontWeight: 600
                                }}>
                                  👨‍🔧 {request.provider}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#495057', lineHeight: 1.3 }}>
                              {bookingData.servicesList.join(' • ')}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#333'
                              }}>
                                🔧 {request.subcategory?.name || 'Service Request'}
                              </h4>
                              {request.provider && (
                                <span style={{
                                  background: '#e8f5e8',
                                  color: '#155724',
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontSize: '10px',
                                  fontWeight: 600
                                }}>
                                  👨‍🔧 {request.provider}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
                <div style={{
                  background: getStatusColor(request.status),
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {request.status}
                </div>
              </div>
              
              {/* Compact Info Row */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: 8,
                fontSize: '12px'
              }}>
                <span style={{
                  background: '#e8f5e8',
                  color: '#155724',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  fontWeight: 600
                }}>
                  💰 ${request.total_price}
                </span>
                <span style={{
                  background: '#e3f2fd',
                  color: '#1565c0',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  fontWeight: 600
                }}>
                  📅 {new Date(request.service_date).toLocaleDateString()}
                </span>
                {(() => {
                  // Extract time from notes first, then fallback to service_date
                  let timeSlot = '';

                  // Debug: Log the notes content to see what's available
                  console.log('Request notes for time extraction:', request.notes);

                  // First try to extract time from notes using enhanced parser (PRIORITY)
                  const bookingData = parseBookingNotes(request.notes || '');
                  console.log('Parsed booking data:', bookingData);

                  if (bookingData.timeSlot) {
                    timeSlot = bookingData.timeSlot;
                    console.log('Using time from notes:', timeSlot);
                  } else {
                    // Fallback to service_date time only if notes don't contain time
                    const serviceDate = new Date(request.service_date);
                    const hours = serviceDate.getHours();
                    const minutes = serviceDate.getMinutes();

                    // Only use service_date time if it has meaningful time (not just 00:00)
                    if (hours !== 0 || minutes !== 0) {
                      timeSlot = serviceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      console.log('Using time from service_date:', timeSlot);
                    }
                  }

                  return timeSlot ? (
                    <span style={{
                      background: '#f3e5f5',
                      color: '#7b1fa2',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontWeight: 600
                    }}>
                      🕐 {timeSlot}
                    </span>
                  ) : null;
                })()}
                <span style={{
                  background: '#fff3e0',
                  color: '#ef6c00',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  fontWeight: 600
                }}>
                  💳 {request.payment_status || 'unpaid'}
                </span>
                {(() => {
                  const bookingData = parseBookingNotes(request.notes || '');
                  let address = bookingData.address || request.address || (request as any).service_address || (request as any).customer_address;

                  // If no address found, try to extract from notes directly
                  if (!address && request.notes) {
                    const directMatch = request.notes.match(/([^,\n\r]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|place|pl|court|ct|way|circle|cir)[^,\n\r]*)/i);
                    if (directMatch) {
                      address = directMatch[1].trim();
                    }
                  }

                  return address && address !== 'No address provided' ? (
                    <span style={{
                      background: '#f3e5f5',
                      color: '#7b1fa2',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      maxWidth: '300px', // Increased from 200px to 300px
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      📍 {address}
                    </span>
                  ) : null;
                })()}
              </div>
              {/* Compact Action Buttons */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  onClick={() => {
                    setSelectedInvoice(request);
                    setShowInvoiceModal(true);
                  }}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📄 Invoice
                </button>

                {/* Cancel Button - only show for pending or accepted requests AND if user has permission */}
                {(request.status?.toLowerCase() === 'pending' || request.status?.toLowerCase() === 'accepted') && hasPermission('cancel_bookings') && (
                  <button
                    onClick={() => handleCancelRequest(request.id.toString())}
                    disabled={cancelLoading === request.id.toString()}
                    style={{
                      background: cancelLoading === request.id.toString() ? '#6c757d' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: cancelLoading === request.id.toString() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {cancelLoading === request.id.toString() ? '⏳' : '❌'}
                  </button>
                )}
              </div>



              {/* Permission denied message for cancel */}
              {(request.status?.toLowerCase() === 'pending' || request.status?.toLowerCase() === 'accepted') && !hasPermission('cancel_bookings') && (
                <div style={{
                  marginTop: 20,
                  textAlign: 'center',
                  padding: '12px 20px',
                  background: 'rgba(220, 53, 69, 0.1)',
                  borderRadius: 8,
                  border: '1px solid rgba(220, 53, 69, 0.2)'
                }}>
                  <small style={{ color: '#dc3545', fontSize: '0.85rem' }}>
                    🔒 You don't have permission to cancel bookings. Contact your administrator.
                  </small>
                </div>
              )}

              {/* Delete Button - only show for completed or cancelled requests AND if user has permission */}
              {(request.status?.toLowerCase() === 'completed' || request.status?.toLowerCase() === 'cancelled') && hasPermission('delete_bookings') && (
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <button
                    onClick={() => handleDeleteRequest(request.id.toString())}
                    disabled={deleteLoading === request.id.toString()}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 8,
                      background: deleteLoading === request.id.toString()
                        ? '#6c757d'
                        : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: deleteLoading === request.id.toString() ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={e => {
                      if (deleteLoading !== request.id.toString()) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (deleteLoading !== request.id.toString()) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                      }
                    }}
                  >
                    {deleteLoading === request.id.toString() ? '⏳ Deleting...' : '🗑️ Delete Booking'}
                  </button>
                </div>
              )}

              {/* Permission denied message for delete */}
              {(request.status?.toLowerCase() === 'completed' || request.status?.toLowerCase() === 'cancelled') && !hasPermission('delete_bookings') && (
                <div style={{
                  marginTop: 20,
                  textAlign: 'center',
                  padding: '12px 20px',
                  background: 'rgba(220, 53, 69, 0.1)',
                  borderRadius: 8,
                  border: '1px solid rgba(220, 53, 69, 0.2)'
                }}>
                  <small style={{ color: '#dc3545', fontSize: '0.85rem' }}>
                    🔒 You don't have permission to delete bookings. Contact your administrator.
                  </small>
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
                    {request.status?.toLowerCase() === 'completed' && (
                      <div>
                        <span>✅ This service has been completed</span>
                        {!request.rating && (
                          <div style={{ marginTop: '10px' }}>
                            <button
                              onClick={() => openRatingModal(request)}
                              style={{
                                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              ⭐ Rate Service
                            </button>
                          </div>
                        )}
                        {request.rating && (
                          <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#4CAF50' }}>
                            ⭐ You rated this service: {request.rating}/5 stars
                          </div>
                        )}
                      </div>
                    )}
                    {request.status?.toLowerCase() === 'in_progress' && '🔄 This service is currently in progress'}
                    {request.status?.toLowerCase() === 'confirmed' && 'ℹ️ This request is confirmed and cannot be cancelled'}
                    {!['cancelled', 'declined', 'completed', 'in_progress', 'confirmed'].includes(request.status?.toLowerCase()) &&
                      `ℹ️ Requests with status "${request.status}" cannot be cancelled`}
                  </small>
                </div>
              )}

              <div style={{
                marginTop: 6,
                paddingTop: 6,
                borderTop: '1px solid rgba(0,0,0,0.05)',
                fontSize: '9px',
                color: '#999',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>ID: #{request.id}</span>
                <span>{new Date(request.created_at || request.booking_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
              Rate Your Service Experience
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>
                Service: <strong>{selectedRequest.subcategory_name}</strong>
              </p>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Provider: <strong>{selectedRequest.provider}</strong>
              </p>
            </div>

            {/* Star Rating */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Rating *
              </label>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: star <= rating ? '#FFD700' : '#ddd',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <small style={{ color: '#666' }}>
                {rating === 0 && 'Please select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </small>
            </div>

            {/* Review Text */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this service provider..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeRatingModal}
                disabled={ratingLoading}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: ratingLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={ratingLoading || rating === 0}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: rating === 0 ? '#ccc' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  color: 'white',
                  cursor: (ratingLoading || rating === 0) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {ratingLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '0',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '30px',
              borderRadius: '20px 20px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowInvoiceModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>
                  📄 Invoice
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
                  Booking ID: #{selectedInvoice.id}
                </p>
              </div>
            </div>

            {/* Invoice Content */}
            <div style={{ padding: '30px' }}>
              {/* Service Provider Info */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '18px' }}>
                  👤 Service Provider
                </h3>
                <div style={{ fontSize: '16px', color: '#495057' }}>
                  <strong>{selectedInvoice.provider || 'To be assigned'}</strong>
                </div>
              </div>

              {/* Service Details */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '18px' }}>
                  🛍️ Service Details
                </h3>

                {(() => {
                  const servicesText = selectedInvoice.notes || '';
                  const servicesMatch = servicesText.match(/Services included: ([^\\n]+)/);
                  const serviceCount = servicesText.match(/Total services: (\\d+)/);

                  if (servicesMatch && serviceCount && parseInt(serviceCount[1]) > 1) {
                    // Multi-service booking
                    const servicesList = servicesMatch[1].split(', ');
                    return (
                      <div>
                        <div style={{
                          background: '#667eea',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'inline-block',
                          marginBottom: '16px'
                        }}>
                          {serviceCount[1]} Services
                        </div>
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {servicesList.map((service, index) => (
                            <div key={index} style={{
                              background: 'white',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: '1px solid #dee2e6',
                              fontSize: '15px',
                              color: '#495057'
                            }}>
                              • {service.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    // Single service booking
                    return (
                      <div style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        fontSize: '16px',
                        color: '#495057'
                      }}>
                        {selectedInvoice.subcategory?.name || 'Service Request'}
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Booking Information */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '18px' }}>
                  📅 Booking Information
                </h3>
                <div style={{ display: 'grid', gap: '12px', fontSize: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Service Date:</span>
                    <span style={{ fontWeight: '600', color: '#495057' }}>
                      {new Date(selectedInvoice.service_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Service Time:</span>
                    <span style={{ fontWeight: '600', color: '#495057' }}>
                      {(() => {
                        // Smart time extraction for invoice - prioritize notes over service_date
                        const bookingData = parseBookingNotes(selectedInvoice.notes || '');
                        if (bookingData.timeSlot) {
                          return bookingData.timeSlot;
                        }

                        // Fallback to service_date time only if it has meaningful time
                        const serviceDate = new Date(selectedInvoice.service_date);
                        const hours = serviceDate.getHours();
                        const minutes = serviceDate.getMinutes();

                        if (hours !== 0 || minutes !== 0) {
                          return serviceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        } else {
                          return 'Not specified';
                        }
                      })()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Status:</span>
                    <span style={{
                      fontWeight: '600',
                      color: selectedInvoice.status === 'completed' ? '#28a745' :
                             selectedInvoice.status === 'accepted' ? '#007bff' :
                             selectedInvoice.status === 'cancelled' ? '#dc3545' : '#ffc107',
                      textTransform: 'capitalize'
                    }}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Booking Date:</span>
                    <span style={{ fontWeight: '600', color: '#495057' }}>
                      {formatDate(selectedInvoice.booking_date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                borderRadius: '12px',
                padding: '24px',
                color: 'white',
                marginBottom: '24px'
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>
                  💰 Payment Summary
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '4px' }}>
                      Total Amount
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>
                      ${selectedInvoice.total_price}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                      Payment Status
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {selectedInvoice.payment_status || 'Pending'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedInvoice.notes && (
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#856404', fontSize: '16px' }}>
                    📝 Additional Notes
                  </h3>
                  <p style={{ margin: 0, color: '#856404', fontSize: '14px', lineHeight: 1.5 }}>
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🖨️ Print Invoice
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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

  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

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

  // Filter and sort functions
  const getFilteredAndSortedSubcategories = () => {
    if (!selectedCategory || !categoryData[selectedCategory]) return [];

    let filtered = categoryData[selectedCategory].subcategories;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((sub: any) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.priceRange.replace('$', ''));
          bValue = parseFloat(b.priceRange.replace('$', ''));
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return Object.keys(categoryData);

    return Object.keys(categoryData).filter(category =>
      category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryData[category].subcategories.some((sub: any) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
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

  const categoryIcons: Record<string, { icon: string; color: string; gradient: string }> = {
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

      {/* Search and Sort Controls */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        marginBottom: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        alignItems: 'center'
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 600
        }}>
          <input
            type="text"
            placeholder="Search services globally..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              borderRadius: 25,
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              fontSize: '16px',
              fontWeight: 500,
              color: '#333',
              outline: 'none',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          />
          <div style={{
            position: 'absolute',
            left: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: '#666'
          }}>
            🔍
          </div>
        </div>

        {/* Sort Controls - Only show when category is selected */}
        {selectedCategory && (
          <div style={{
            display: 'flex',
            gap: 15,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              Sort by:
            </span>



            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
              style={{
                padding: '8px 12px',
                borderRadius: 15,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.95)',
                color: '#333',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="name">Service Name</option>
              <option value="price">Price</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '8px 12px',
                borderRadius: 15,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.95)',
                color: '#333',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        )}
      </div>

      {!selectedCategory ? (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 20 
          }}>
            {getFilteredCategories().map((category, index) => {
              const iconData = categoryIcons[category] || {
                icon: getCategoryIcon(category),
                gradient: 'linear-gradient(135deg,rgb(122, 77, 245) 0%, #764ba2 100%)',
                color: '#667eea'
              };
              return (
                <div
                  key={index}
                  onClick={() => handleCategorySelect(category)}
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

          {/* No Categories Found Message */}
          {getFilteredCategories().length === 0 && searchQuery.trim() && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 25,
              marginTop: 20,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔍</div>
              <h3 style={{ color: '#666', marginBottom: 10, fontSize: '1.5rem' }}>
                No categories found
              </h3>
              <p style={{ color: '#999', fontSize: '1rem', marginBottom: 20 }}>
                No categories or services match your search "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  padding: '12px 24px',
                  borderRadius: 20,
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Clear Search
              </button>
            </div>
          )}
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
              {getCategoryIcon(selectedCategory || '')}
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
            {getFilteredAndSortedSubcategories().map((sub: { id: number; name: string; description: string; priceRange: string; icon: string }, index: number) => (
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

          {/* No Results Message */}
          {getFilteredAndSortedSubcategories().length === 0 && searchQuery.trim() && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 25,
              marginTop: 20,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔍</div>
              <h3 style={{ color: '#666', marginBottom: 10, fontSize: '1.5rem' }}>
                No services found
              </h3>
              <p style={{ color: '#999', fontSize: '1rem', marginBottom: 20 }}>
                No services match your search "{searchQuery}" in {selectedCategory}
              </p>
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  padding: '12px 24px',
                  borderRadius: 20,
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Clear Search
              </button>
            </div>
          )}
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

function CartSection({ user }: { user: User }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularAddOns, setPopularAddOns] = useState<any[]>([]);
  const [allProviderServices, setAllProviderServices] = useState<any[]>([]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('userCart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        setCartItems(cart.items || []);

        // Load popular add-ons if there are items in cart
        if (cart.items && cart.items.length > 0) {
          loadPopularAddOns(cart.provider_id, cart.items);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('userCart');
      }
    }
    setLoading(false);
  }, []);

  const loadPopularAddOns = async (providerId: string, currentCartItems?: CartItem[]) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/marketplace/provider/${providerId}/services/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const services = await response.json();
        console.log('Loaded provider services:', services);

        // Use current cart items or state cart items
        const itemsToCheck = currentCartItems || cartItems;
        const cartServiceIds = itemsToCheck.map(item => item.subcategory_id);
        console.log('Cart service IDs:', cartServiceIds);

        const availableServices = services.filter((service: any) =>
          !cartServiceIds.includes(service.subcategory_id)
        );

        console.log('Available services for add-ons:', availableServices);
        setPopularAddOns(availableServices.slice(0, 4));
        setAllProviderServices(availableServices);
      } else {
        console.error('Failed to load provider services:', response.status);
      }
    } catch (error) {
      console.error('Error loading popular add-ons:', error);
    }
  };

  const addToCart = (service: any) => {
    const currentCart = JSON.parse(localStorage.getItem('userCart') || '{"items": [], "provider_id": null, "provider_name": null}');

    // Check if adding service from different provider
    if (currentCart.provider_id && currentCart.provider_id !== service.provider_id) {
      const confirmClear = window.confirm(
        `The service you want to add is provided by a different provider (${service.provider_name}). Do you want to clear the cart and add this service?`
      );

      if (!confirmClear) return;

      // Clear cart and start fresh
      currentCart.items = [];
      currentCart.provider_id = service.provider_id;
      currentCart.provider_name = service.provider_name;
    }

    // Set provider if cart is empty
    if (!currentCart.provider_id) {
      currentCart.provider_id = service.provider_id;
      currentCart.provider_name = service.provider_name;
    }

    // Add new item
    const newItem: CartItem = {
      id: `${service.subcategory_id}_${Date.now()}`,
      subcategory_id: service.subcategory_id,
      subcategory_name: service.subcategory_name,
      provider_id: service.provider_id,
      provider_name: service.provider_name,
      price: service.provider_price,
      description: service.description,
      category_name: service.category_name || 'Service',
      added_at: new Date().toISOString(),
      // Popular add-ons don't have booking details - they'll use the same details as the main booking
      booking_details: undefined
    };

    currentCart.items.push(newItem);
    currentCart.total_price = currentCart.items.reduce((sum: number, item: CartItem) => sum + item.price, 0);
    currentCart.total_items = currentCart.items.length;

    localStorage.setItem('userCart', JSON.stringify(currentCart));
    setCartItems(currentCart.items);

    // Dispatch cart update event
    window.dispatchEvent(new Event('cartUpdated'));

    // Refresh popular add-ons
    loadPopularAddOns(currentCart.provider_id, currentCart.items);

    alert(`✅ ${service.subcategory_name} added to cart!`);
  };

  const removeFromCart = (itemId: string) => {
    const currentCart = JSON.parse(localStorage.getItem('userCart') || '{"items": []}');
    currentCart.items = currentCart.items.filter((item: CartItem) => item.id !== itemId);

    if (currentCart.items.length === 0) {
      currentCart.provider_id = null;
      currentCart.provider_name = null;
      currentCart.total_price = 0;
      currentCart.total_items = 0;
    } else {
      currentCart.total_price = currentCart.items.reduce((sum: number, item: CartItem) => sum + item.price, 0);
      currentCart.total_items = currentCart.items.length;
    }

    localStorage.setItem('userCart', JSON.stringify(currentCart));
    setCartItems(currentCart.items);

    // Dispatch cart update event
    window.dispatchEvent(new Event('cartUpdated'));

    // Refresh popular add-ons
    if (currentCart.provider_id) {
      loadPopularAddOns(currentCart.provider_id, currentCart.items);
    }
  };

  const confirmBooking = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setConfirmLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      // Create booking with multiple services
      const response = await fetch('http://localhost:8000/api/bookings/create-cart/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cart_items: cartItems,
          notes: (() => {
            // Extract booking details from cart items
            const itemWithDetails = cartItems.find(item => item.booking_details);
            const address = itemWithDetails?.booking_details?.address || '';
            const timeSlot = itemWithDetails?.booking_details?.selected_time || '';
            const servicesList = cartItems.map(item => item.subcategory_name).join(', ');

            // Create comprehensive notes with address and time
            let notes = '';

            if (cartItems.length === 1) {
              // Single service booking
              notes = `Single service booking: ${servicesList}`;
            } else {
              // Multi-service booking
              notes = `Multi-service booking with ${cartItems.length} services`;
              notes += ` Services included: ${servicesList}`;
              notes += ` Total services: ${cartItems.length}`;
            }

            if (address) {
              notes += ` Address: ${address}`;
            }
            if (timeSlot) {
              notes += ` Time Slot: ${timeSlot}`;
            }
            if (itemWithDetails?.booking_details?.notes) {
              notes += ` Description: ${itemWithDetails.booking_details.notes}`;
            }
            return notes;
          })(),
          // Extract address from the first cart item with booking details
          address: (() => {
            const itemWithAddress = cartItems.find(item => item.booking_details?.address);
            return itemWithAddress?.booking_details?.address || '';
          })(),
          // Extract service date and time from the first cart item with booking details
          service_date: (() => {
            const itemWithDate = cartItems.find(item => item.booking_details?.selected_date);
            return itemWithDate?.booking_details?.selected_date || '';
          })(),
          service_time: (() => {
            const itemWithTime = cartItems.find(item => item.booking_details?.selected_time);
            return itemWithTime?.booking_details?.selected_time || '';
          })()
        })
      });

      if (response.ok) {
        const booking = await response.json();

        // Clear cart
        localStorage.removeItem('userCart');
        setCartItems([]);

        alert(`✅ Booking confirmed! Your booking ID is ${booking.id}. You can track it in "My Requests".`);

        // Redirect to requests page
        window.location.href = '/end_user_dashboard/requests';
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to create booking: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <h3>Loading cart...</h3>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 32,
      maxWidth: 1200,
      margin: '0 auto',
      boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)'
    }}>
      <h2 style={{
        fontSize: '1.8rem',
        fontWeight: 700,
        marginBottom: 24,
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        🛒 My Cart
        {cartItems.length > 0 && (
          <span style={{
            background: '#667eea',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: '14px',
            fontWeight: 600
          }}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
          <h3 style={{ color: '#6c757d', marginBottom: '8px' }}>Your cart is empty</h3>
          <p style={{ color: '#8e8e8e', marginBottom: '24px' }}>
            Start by booking a service, then add more services from the same provider
          </p>
          <button
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              background: '#667eea',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/end_user_dashboard/services'}
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div>
          {/* Booking Details Summary */}
          {(() => {
            const itemWithBookingDetails = cartItems.find(item => item.booking_details);
            return itemWithBookingDetails?.booking_details ? (
              <div style={{
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                border: '2px solid #4CAF50'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#2e7d32', fontSize: '1.1rem', fontWeight: 700 }}>
                  📅 Booking Details
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
                  <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                    📅 Date: {new Date(itemWithBookingDetails.booking_details.selected_date).toLocaleDateString()}
                  </span>
                  <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                    🕐 Time: {itemWithBookingDetails.booking_details.selected_time}
                  </span>
                  <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                    📍 Address: {itemWithBookingDetails.booking_details.address}
                  </span>
                </div>
                {itemWithBookingDetails.booking_details.notes && (
                  <div style={{ marginTop: 8, fontSize: '13px', color: '#388e3c', fontStyle: 'italic' }}>
                    💬 Notes: {itemWithBookingDetails.booking_details.notes}
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  ℹ️ All services in this cart will be scheduled for the same date, time, and address.
                </div>
              </div>
            ) : null;
          })()}

          {/* Cart Items */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 16, color: '#495057' }}>
              Services from {cartItems[0]?.provider_name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{
                  background: '#f8f9fa',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.1rem' }}>
                      {item.subcategory_name}
                    </h4>
                    <p style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px' }}>
                      {item.description}
                    </p>

                    {/* Show if this is the main service with booking details */}
                    {item.booking_details && (
                      <div style={{
                        background: '#e8f5e8',
                        color: '#2e7d32',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'inline-block',
                        marginBottom: 8
                      }}>
                        📅 Main Service (with booking details)
                      </div>
                    )}

                    <span style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {item.category_name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#28a745' }}>
                        ${item.price.toFixed(2)}
                      </div>
                    </div>

                    <button
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Popular Add-ons Section */}
          {popularAddOns.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 16, color: '#495057' }}>
                🌟 Popular Add-ons from {cartItems[0]?.provider_name}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {popularAddOns.map((service) => (
                  <div key={service.subcategory_id} style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    border: '2px solid #e9ecef',
                    transition: 'all 0.3s ease'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1rem' }}>
                      {service.subcategory_name}
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: '#6c757d', fontSize: '14px', lineHeight: 1.4 }}>
                      {service.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#28a745' }}>
                        ${service.provider_price}
                      </span>
                      <button
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                        onClick={() => addToCart(service)}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {allProviderServices.length > popularAddOns.length && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    style={{
                      background: 'transparent',
                      color: '#667eea',
                      border: '2px solid #667eea',
                      borderRadius: 8,
                      padding: '12px 24px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                    onClick={() => setShowAllServices(!showAllServices)}
                  >
                    {showAllServices ? 'Show Less' : `View More (${allProviderServices.length - popularAddOns.length} more services)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* All Services Section */}
          {showAllServices && allProviderServices.length > popularAddOns.length && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 16, color: '#495057' }}>
                🔧 All Services from {cartItems[0]?.provider_name}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {allProviderServices.slice(popularAddOns.length).map((service) => (
                  <div key={service.subcategory_id} style={{
                    background: '#f8f9fa',
                    borderRadius: 12,
                    padding: 16,
                    border: '1px solid #e9ecef'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1rem' }}>
                      {service.subcategory_name}
                    </h4>
                    <p style={{ margin: '0 0 8px 0', color: '#6c757d', fontSize: '14px' }}>
                      {service.description}
                    </p>
                    <span style={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '12px',
                      fontWeight: 500,
                      marginBottom: 12,
                      display: 'inline-block'
                    }}>
                      {service.category_name}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#28a745' }}>
                        ${service.provider_price}
                      </span>
                      <button
                        style={{
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                        onClick={() => addToCart(service)}
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total and Confirm Button */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            padding: 24,
            color: 'white',
            marginBottom: 32
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>Total Amount</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>{cartItems.length} service{cartItems.length !== 1 ? 's' : ''}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
                  ${totalPrice.toFixed(2)}
                </div>
                <button
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: 8,
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '16px',
                    backdropFilter: 'blur(10px)'
                  }}
                  onClick={confirmBooking}
                  disabled={confirmLoading}
                >
                  {confirmLoading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}