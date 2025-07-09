"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface User {
  id: number;
  username: string;
  user_type: string;
  role: string;
  is_active: boolean;
}

export default function AdminDashboardCatchAll() {
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
        // Redirect if not an admin
        if (data.user_type !== "Platform Provider" && data.user_type !== "Admin") {
          if (data.user_type === "End User") {
            router.push("/user/dashboard");
          } else if (data.user_type === "Service Provider") {
            router.push("/provider/dashboard");
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

  // Home page for admins
  if (!section) {
    return <AdminHome user={user} />;
  }

  // Profile section route
  if (section === "profile") {
    return <ProfileSection user={user} />;
  }

  // Users management section
  if (section === "users") {
    return <UsersManagement user={user} />;
  }

  // Services management section
  if (section === "services") {
    return <ServicesManagement user={user} />;
  }

  // Analytics section
  if (section === "analytics") {
    return <AnalyticsSection user={user} />;
  }

  // Default admin dashboard
  return <AdminDashboard user={user} />;
}

function ProfileSection({ user }: { user: User }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 500, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Profile</h2>
      <div style={{ marginBottom: 12 }}><b>Username:</b> {user.username}</div>
      <div style={{ marginBottom: 12 }}><b>User Type:</b> {user.user_type}</div>
      <div style={{ marginBottom: 12 }}><b>Role:</b> {user.role}</div>
      <div style={{ marginBottom: 12 }}><b>Status:</b> {user.is_active ? 'Active' : 'Inactive'}</div>
    </div>
  );
}

function AdminDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your platform admin dashboard.</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/admin/dashboard/profile')}>View Profile</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#28a745', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/admin/dashboard/users')}>Manage Users</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#17a2b8', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/admin/dashboard/services')}>Manage Services</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#ffc107', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/admin/dashboard/analytics')}>Analytics</button>
      </div>
    </div>
  );
}

function AdminHome({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your platform admin dashboard home.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>👥 User Management</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>Manage all users, providers, and customers</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/admin/dashboard/users')}>Manage Users</button>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>🔧 Service Management</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>Manage service categories and offerings</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/admin/dashboard/services')}>Manage Services</button>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>📊 Analytics</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>View platform statistics and insights</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#ffc107', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/admin/dashboard/analytics')}>View Analytics</button>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>👤 Profile</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>Update your admin profile and settings</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#667eea', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/admin/dashboard/profile')}>View Profile</button>
        </div>
      </div>
    </div>
  );
}

function UsersManagement({ user }: { user: User }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/platform_provider_dashboard/users/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>User Management</h2>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>User Management</h2>
      {users.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No users found.</p>
      ) : (
        <div>
          {users.map((user: any, index: number) => (
            <div key={index} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{user.username}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Type: {user.user_type}</p>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Status: {user.is_active ? 'Active' : 'Inactive'}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '6px 12px', borderRadius: 4, background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                <button style={{ padding: '6px 12px', borderRadius: 4, background: user.is_active ? '#dc3545' : '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesManagement({ user }: { user: User }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/platform_provider_dashboard/services/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Service Management</h2>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Service Management</h2>
      {services.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No services found.</p>
      ) : (
        <div>
          {services.map((service: any, index: number) => (
            <div key={index} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{service.name}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Category: {service.category}</p>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Provider: {service.provider_name}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '6px 12px', borderRadius: 4, background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                <button style={{ padding: '6px 12px', borderRadius: 4, background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsSection({ user }: { user: User }) {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalServices: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/platform_provider_dashboard/analytics/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Analytics</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Platform Analytics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '12px', border: '1px solid #bbdefb', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: '2rem' }}>{analytics.totalUsers}</h3>
          <p style={{ margin: 0, color: '#1976d2', fontWeight: 600 }}>Total Users</p>
        </div>
        
        <div style={{ background: '#e8f5e8', padding: '20px', borderRadius: '12px', border: '1px solid #c8e6c9', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#388e3c', fontSize: '2rem' }}>{analytics.totalProviders}</h3>
          <p style={{ margin: 0, color: '#388e3c', fontWeight: 600 }}>Service Providers</p>
        </div>
        
        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', border: '1px solid '#ffcc80', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#f57c00', fontSize: '2rem' }}>{analytics.totalServices}</h3>
          <p style={{ margin: 0, color: '#f57c00', fontWeight: 600 }}>Total Services</p>
        </div>
        
        <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '12px', border: '1px solid '#f8bbd9', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#c2185b', fontSize: '2rem' }}>{analytics.totalBookings}</h3>
          <p style={{ margin: 0, color: '#c2185b', fontWeight: 600 }}>Total Bookings</p>
        </div>
      </div>
    </div>
  );
} 