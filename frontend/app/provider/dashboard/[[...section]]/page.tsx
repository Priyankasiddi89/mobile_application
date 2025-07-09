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

export default function ProviderDashboardCatchAll() {
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
        // Redirect if not a service provider
        if (data.user_type !== "Service Provider") {
          if (data.user_type === "End User") {
            router.push("/user/dashboard");
          } else if (data.user_type === "Platform Provider" || data.user_type === "Admin") {
            router.push("/admin/dashboard");
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

  // Home page for service providers
  if (!section) {
    return <ServiceProviderHome user={user} />;
  }

  // Profile section route
  if (section === "profile") {
    return <ProfileSection user={user} />;
  }

  // Incoming requests section
  if (section === "requests") {
    return <IncomingRequests user={user} />;
  }

  // Services section
  if (section === "services") {
    return <ServicesSection user={user} />;
  }

  // Default service provider dashboard
  return <ServiceProviderDashboard user={user} />;
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

function ServiceProviderDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome back, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your service provider dashboard.</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/provider/dashboard/profile')}>View Profile</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#28a745', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/provider/dashboard/requests')}>View Requests</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#17a2b8', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/provider/dashboard/services')}>Manage Services</button>
      </div>
    </div>
  );
}

function ServiceProviderHome({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 800, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome back, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your service provider dashboard home.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>📋 Incoming Requests</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>View and manage booking requests from customers</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/provider/dashboard/requests')}>View Requests</button>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>🔧 My Services</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>Manage your offered services and availability</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/provider/dashboard/services')}>Manage Services</button>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>👤 Profile</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>Update your profile and account settings</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#667eea', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/provider/dashboard/profile')}>View Profile</button>
        </div>
      </div>
    </div>
  );
}

function IncomingRequests({ user }: { user: User }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/service_provider_dashboard/requests/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 800, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Incoming Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 800, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Incoming Requests</h2>
      {requests.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No incoming requests at the moment.</p>
      ) : (
        <div>
          {requests.map((request: any, index: number) => (
            <div key={index} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>Request #{request.id}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Service: {request.service_name}</p>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Customer: {request.customer_name}</p>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Date: {request.booking_date}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '6px 12px', borderRadius: 4, background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Accept</button>
                <button style={{ padding: '6px 12px', borderRadius: 4, background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesSection({ user }: { user: User }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/service_provider_dashboard/services/", {
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
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 800, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>My Services</h2>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 800, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>My Services</h2>
      {services.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No services registered yet.</p>
      ) : (
        <div>
          {services.map((service: any, index: number) => (
            <div key={index} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{service.name}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Category: {service.category}</p>
              <p style={{ margin: '0 0 8px 0', color: '#6c757d' }}>Price: ${service.price}</p>
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