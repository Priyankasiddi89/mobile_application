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
            router.push("/provider/dashboard");
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

  // Home page for end users
  if (!section) {
    return <EndUserHome user={user} />;
  }

  // Profile section route
  if (section === "profile") {
    return <ProfileSection user={user} />;
  }

  // Default end user dashboard
  return <EndUserDashboard user={user} />;
}

function ProfileSection({ user }: { user: User }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 500, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#2c3e50' }}>Profile Information</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong style={{ color: '#495057' }}>Username:</strong>
          <div style={{ marginTop: 4, color: '#2c3e50' }}>{user.username}</div>
        </div>

        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong style={{ color: '#495057' }}>User Type:</strong>
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

        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong style={{ color: '#495057' }}>Role:</strong>
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

        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong style={{ color: '#495057' }}>Status:</strong>
          <div style={{ marginTop: 8 }}>
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
  );
}

function EndUserDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Hello, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>Welcome to your customer dashboard.</p>
      <button style={{ padding: '10px 24px', borderRadius: 8, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/user/dashboard/profile')}>View Profile</button>
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