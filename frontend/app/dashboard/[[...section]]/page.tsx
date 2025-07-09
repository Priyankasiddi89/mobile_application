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

export default function DashboardCatchAll() {
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

  // Home page for each user type
  if (!section) {
    if (user.user_type === "End User") {
      return <EndUserHome user={user} />;
    } else if (user.user_type === "Service Provider") {
      return <ServiceProviderHome user={user} />;
    } else if (user.user_type === "Platform Provider" || user.user_type === "Admin") {
      return <AdminHome user={user} />;
    }
  }

  // Profile section route
  if (section === "profile") {
    return <ProfileSection user={user} />;
  }
  // Add more sections as needed (e.g., 'incoming', 'services', etc.)

  // Render different dashboard based on user type
  if (user.user_type === "End User") {
    return <CustomerDashboard user={user} />;
  } else if (user.user_type === "Service Provider") {
    return <ServiceProviderDashboard user={user} />;
  } else if (user.user_type === "Platform Provider") {
    return <PlatformAdminDashboard user={user} />;
  }
  return null;
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

function CustomerDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Hello, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>Welcome to your customer dashboard.</p>
      <button style={{ padding: '10px 24px', borderRadius: 8, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/dashboard/profile')}>View Profile</button>
    </div>
  );
}

function ServiceProviderDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome back, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your service provider dashboard.</p>
      <button style={{ padding: '10px 24px', borderRadius: 8, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/dashboard/profile')}>View Profile</button>
    </div>
  );
}

function PlatformAdminDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your platform admin dashboard.</p>
      <button style={{ padding: '10px 24px', borderRadius: 8, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/dashboard/profile')}>View Profile</button>
    </div>
  );
}

function EndUserHome({ user }: { user: User }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Hello, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>Welcome to your customer dashboard home.</p>
    </div>
  );
}

function ServiceProviderHome({ user }: { user: User }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome back, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your service provider dashboard home.</p>
    </div>
  );
}

function AdminHome({ user }: { user: User }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your admin dashboard home.</p>
    </div>
  );
} 