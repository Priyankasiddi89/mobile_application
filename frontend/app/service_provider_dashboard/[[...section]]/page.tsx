"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ServiceProviderSidebar from "../../components/ServiceProviderSidebar";

interface User {
  id: string;
  username: string;
  user_type: string;
  role: string;
  is_active: boolean;
  registered_services: string[];
  statistics?: {
    total_bookings: number;
    completed_bookings: number;
    active_bookings: number;
    total_earnings: number;
    completion_rate: number;
  };
}

interface DashboardStats {
  pending_requests_count: number;
  active_bookings_count: number;
  completed_bookings_count: number;
  total_bookings_count: number;
  completion_rate: number;
  registered_services_count: number;
  recent_activity: any[];
}

interface Booking {
  id: string;
  customer: string;
  provider?: string;
  subcategory: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: {
      id: string;
      name: string;
      description: string;
    };
  };
  booking_date: string;
  service_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function ProviderDashboardCatchAll() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;

  // Fetch notifications
  const fetchNotifications = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/service_provider_dashboard/requests/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Create notifications for new requests
        const newNotifications = data.slice(0, 5).map((request: any) => ({
          id: request.id,
          type: 'new_request',
          title: 'New Booking Request',
          message: `New request for ${request.subcategory.name} from ${request.customer}`,
          time: new Date(request.created_at).toLocaleTimeString(),
          isRead: false
        }));
        setNotifications(newNotifications);
      })
      .catch(() => {
        // Handle error silently
      });
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
        // Redirect if not a service provider
        if (data.user_type !== "Service Provider") {
          if (data.user_type === "End User") {
            router.push("/end_user_dashboard");
          } else if (data.user_type === "Platform Provider" || data.user_type === "Admin") {
            router.push("/platform_provider_dashboard");
          }
          return;
        }
        setUser(data);
        setLoading(false);

        // Start fetching notifications
        fetchNotifications();
        // Set up periodic notification fetching
        const notificationInterval = setInterval(fetchNotifications, 30000); // Every 30 seconds

        return () => clearInterval(notificationInterval);
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
      <ServiceProviderSidebar />
      <main style={{ flex: 1, padding: "32px", background: "#f8f9fa" }}>
        {/* Notification Bell */}
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          background: 'white',
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setShowNotifications(!showNotifications)}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        >
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            {notifications.length > 0 && (
              <div style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {notifications.length}
              </div>
            )}
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div style={{
            position: 'fixed',
            top: 90,
            right: 20,
            width: 350,
            maxHeight: 400,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e9ecef',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Notifications</h4>
            </div>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
                  <p style={{ margin: 0 }}>No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8f9fa',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                  }}
                  onClick={() => {
                    router.push('/service_provider_dashboard/requests');
                    setShowNotifications(false);
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        width: 8,
                        height: 8,
                        marginTop: 6,
                        flexShrink: 0
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#2c3e50' }}>
                          {notification.title}
                        </h5>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6c757d', lineHeight: 1.4 }}>
                          {notification.message}
                        </p>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    router.push('/service_provider_dashboard/requests');
                    setShowNotifications(false);
                  }}
                >
                  View All Requests
                </button>
              </div>
            )}
          </div>
        )}
        {/* Home page for service providers */}
        {!section && <ServiceProviderHome user={user} />}

        {/* Incoming requests section */}
        {section === "requests" && <IncomingRequests user={user} />}
        
        {/* Services section */}
        {section === "services" && <ServicesSection user={user} />}

        {/* Active bookings section */}
        {section === "active" && <ActiveBookings user={user} />}

        {/* Previous bookings section */}
        {section === "previous" && <PreviousBookings user={user} />}

        {/* Earnings section */}
        {section === "earnings" && <EarningsSection user={user} />}

        {/* Default service provider dashboard */}
        {section && !["requests", "services", "active", "previous", "earnings"].includes(section) && <ServiceProviderDashboard user={user} />}
      </main>
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
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#28a745', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/service_provider_dashboard/requests')}>View Requests</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#17a2b8', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/service_provider_dashboard/services')}>Manage Services</button>
      </div>
    </div>
  );
}

function ServiceProviderHome({ user }: { user: User }) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/service_provider_dashboard/stats/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1200, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 24, color: '#2c3e50' }}>Welcome back, {user.username}!</h2>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16, padding: 32, marginBottom: 24, color: 'white' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8, margin: 0 }}>Welcome back, {user.username}!</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>Manage your services and track your business performance</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>📥</div>
            <h3 style={{ margin: 0, color: '#495057', fontSize: '16px' }}>Pending Requests</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '8px' }}>
            {stats?.pending_requests_count || 0}
          </div>
          <button
            style={{ padding: '8px 16px', borderRadius: 6, background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%' }}
            onClick={() => router.push('/service_provider_dashboard/requests')}
          >
            View Requests
          </button>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>🟢</div>
            <h3 style={{ margin: 0, color: '#495057', fontSize: '16px' }}>Active Bookings</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60', marginBottom: '8px' }}>
            {stats?.active_bookings_count || 0}
          </div>
          <button
            style={{ padding: '8px 16px', borderRadius: 6, background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%' }}
            onClick={() => router.push('/service_provider_dashboard/active')}
          >
            View Active
          </button>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>✅</div>
            <h3 style={{ margin: 0, color: '#495057', fontSize: '16px' }}>Completed Jobs</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db', marginBottom: '8px' }}>
            {stats?.completed_bookings_count || 0}
          </div>
          <button
            style={{ padding: '8px 16px', borderRadius: 6, background: '#3498db', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%' }}
            onClick={() => router.push('/service_provider_dashboard/previous')}
          >
            View History
          </button>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', marginRight: '12px' }}>📊</div>
            <h3 style={{ margin: 0, color: '#495057', fontSize: '16px' }}>Completion Rate</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9b59b6', marginBottom: '8px' }}>
            {stats?.completion_rate || 0}%
          </div>
          <button
            style={{ padding: '8px 16px', borderRadius: 6, background: '#9b59b6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%' }}
            onClick={() => router.push('/service_provider_dashboard/earnings')}
          >
            View Earnings
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ⚡ Quick Actions
            </h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '1rem' }}>
              Access your most important tools instantly
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <button
              style={{
                padding: '24px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => router.push('/service_provider_dashboard/services')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 16,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>🔧</div>
                <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.2rem' }}>Manage Services</div>
                <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.4 }}>Add or update your service offerings and availability</div>
              </div>
            </button>

            <button
              style={{
                padding: '24px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => router.push('/service_provider_dashboard/earnings')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(240, 147, 251, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 16,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>💰</div>
                <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.2rem' }}>View Earnings</div>
                <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.4 }}>Detailed earnings analytics and performance metrics</div>
              </div>
            </button>

            <button
              style={{
                padding: '24px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => router.push('/service_provider_dashboard/requests')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(79, 172, 254, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(79, 172, 254, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 16,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>📥</div>
                <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.2rem' }}>View Requests</div>
                <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.4 }}>Check and manage incoming booking requests</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncomingRequests({ user }: { user: User }) {
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = () => {
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
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (bookingId: string) => {
    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://localhost:8000/api/service_provider_dashboard/accept/${bookingId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        alert('Request accepted successfully!');
        fetchRequests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to accept request');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://localhost:8000/api/service_provider_dashboard/decline/${bookingId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        alert('Request declined');
        fetchRequests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to decline request');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Incoming Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#2c3e50' }}>Incoming Requests</h2>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No incoming requests</h3>
            <p style={{ margin: 0 }}>New booking requests will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {requests.map((request) => (
              <div key={request.id} style={{
                border: '1px solid #e9ecef',
                borderRadius: 12,
                padding: 20,
                background: '#f8f9fa',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>
                      {request.subcategory.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6c757d' }}>
                      <span><strong>Customer:</strong> {request.customer}</span>
                      <span><strong>Service Date:</strong> {new Date(request.service_date).toLocaleDateString()}</span>
                      <span><strong>Price:</strong> ${request.total_price}</span>
                    </div>
                  </div>
                  <div style={{
                    background: '#e74c3c',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {request.status.toUpperCase()}
                  </div>
                </div>

                {request.notes && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                    <strong style={{ color: '#495057' }}>Notes:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{request.notes}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      cursor: actionLoading === request.id ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: actionLoading === request.id ? 0.6 : 1
                    }}
                    onClick={() => handleDecline(request.id)}
                    disabled={actionLoading === request.id}
                  >
                    {actionLoading === request.id ? 'Processing...' : 'Decline'}
                  </button>
                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      cursor: actionLoading === request.id ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: actionLoading === request.id ? 0.6 : 1
                    }}
                    onClick={() => handleAccept(request.id)}
                    disabled={actionLoading === request.id}
                  >
                    {actionLoading === request.id ? 'Processing...' : 'Accept'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ServicesSection({ user }: { user: User }) {
  const [registeredServices, setRegisteredServices] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);

  const fetchServices = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Fetch registered services, available services, and categories
    Promise.all([
      fetch("http://localhost:8000/api/service_provider_dashboard/services/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:8000/api/bookings/subcategories/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:8000/api/bookings/categories/", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ])
      .then(([registeredRes, availableRes, categoriesRes]) => {
        // Check if responses are ok
        if (!registeredRes.ok) {
          console.error('Failed to fetch registered services:', registeredRes.status);
        }
        if (!availableRes.ok) {
          console.error('Failed to fetch available services:', availableRes.status);
        }
        if (!categoriesRes.ok) {
          console.error('Failed to fetch categories:', categoriesRes.status);
        }

        return Promise.all([
          registeredRes.ok ? registeredRes.json() : [],
          availableRes.ok ? availableRes.json() : [],
          categoriesRes.ok ? categoriesRes.json() : []
        ]);
      })
      .then(([registeredData, availableData, categoriesData]) => {
        console.log('Fetched data:', {
          registeredData,
          availableData: availableData?.length ? `${availableData.length} services` : availableData,
          categoriesData: categoriesData?.length ? `${categoriesData.length} categories` : categoriesData
        });

        // Log sample service to check structure
        if (availableData && availableData.length > 0) {
          console.log('Sample service:', availableData[0]);
        }

        setRegisteredServices(Array.isArray(registeredData) ? registeredData : []);
        setAvailableServices(Array.isArray(availableData) ? availableData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching services:', error);
        setRegisteredServices([]);
        setAvailableServices([]);
        setCategories([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleRegisterService = async (serviceId: string, serviceName: string) => {
    setActionLoading(serviceId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://localhost:8000/api/service_provider_dashboard/services/", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ service_id: serviceId })
      });

      if (response.ok) {
        // Show success message with service name
        const successMessage = `✅ Successfully registered for "${serviceName}"! You will now receive booking requests for this service.`;
        alert(successMessage);
        fetchServices();
        setShowAddModal(false);
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to register for service');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnregisterService = async (serviceId: string, serviceName: string) => {
    // Confirm before removing
    const confirmMessage = `Are you sure you want to remove "${serviceName}" from your services?\n\nYou will no longer receive booking requests for this service.`;
    if (!confirm(confirmMessage)) return;

    setActionLoading(serviceId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://localhost:8000/api/service_provider_dashboard/services/", {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ service_id: serviceId })
      });

      if (response.ok) {
        const successMessage = `✅ Successfully removed "${serviceName}" from your services.`;
        alert(successMessage);
        fetchServices();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to unregister from service');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter available services based on search and category
  const filteredAvailableServices = (availableServices || []).filter(service => {
    const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
    const isNotRegistered = !registeredServiceIds.includes(service.id);
    const matchesSearch = !searchTerm ||
                         service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           service.category?.id === selectedCategory ||
                           service.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase());

    return isNotRegistered && matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>My Services</h2>
        <p>Loading services...</p>
      </div>
    );
  }

  const registeredServiceIds = registeredServices.map(service => service.id);
  const unregisteredServices = availableServices.filter(service => !registeredServiceIds.includes(service.id));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#2c3e50' }}>My Registered Services</h2>
          <button
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
            onClick={() => setShowAddModal(true)}
          >
            + Add Service
          </button>
        </div>

        {registeredServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: '#6c757d' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 20px',
              color: 'white'
            }}>🔧</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: '#2c3e50' }}>No services registered yet</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '1rem' }}>
              Register for services to start receiving booking requests from customers.<br/>
              <strong>Only registered services will show incoming requests.</strong>
            </p>
            <button
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
              onClick={() => setShowAddModal(true)}
            >
              + Register Your First Service
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 20,
              border: '1px solid #d4edda'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#155724', fontSize: '16px' }}>
                    You're registered for {registeredServices.length} service{registeredServices.length !== 1 ? 's' : ''}
                  </h4>
                  <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>
                    You will receive booking requests only for these services
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {registeredServices.map((service) => (
                <div key={service.id} style={{
                  border: '1px solid #e9ecef',
                  borderRadius: 16,
                  padding: 24,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          color: 'white'
                        }}>🔧</div>
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.3rem', fontWeight: 700 }}>
                            {service.name}
                          </h4>
                          <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: 15,
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-block'
                          }}>
                            {service.category.name}
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 16px 0', color: '#6c757d', fontSize: '14px', lineHeight: 1.6 }}>
                        {service.description}
                      </p>
                      <div style={{
                        background: '#e8f5e8',
                        padding: '12px 16px',
                        borderRadius: 10,
                        display: 'inline-block',
                        border: '1px solid #d4edda'
                      }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#28a745' }}>
                          ${service.price}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6c757d', marginLeft: '6px' }}>per service</span>
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '12px 20px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                        color: 'white',
                        border: 'none',
                        cursor: actionLoading === service.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        opacity: actionLoading === service.id ? 0.6 : 1,
                        transition: 'all 0.3s ease',
                        marginLeft: '24px'
                      }}
                      onClick={() => handleUnregisterService(service.id, service.name)}
                      disabled={actionLoading === service.id}
                      onMouseEnter={e => {
                        if (actionLoading !== service.id) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 15px rgba(220, 53, 69, 0.4)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (actionLoading !== service.id) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {actionLoading === service.id ? '⏳ Removing...' : '🗑️ Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Add Service Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 0,
            maxWidth: 800,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px 32px',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800 }}>🔧 Add New Service</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                    Choose from {filteredAvailableServices?.length || 0} available services to expand your offerings
                  </p>
                </div>
                <button
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div style={{ padding: '24px 32px 16px', borderBottom: '1px solid #e9ecef' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e9ecef',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e9ecef',
                    fontSize: '14px',
                    outline: 'none',
                    minWidth: '150px'
                  }}
                >
                  <option value="all">All Categories</option>
                  {(categories || []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Showing {filteredAvailableServices?.length || 0} available services
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px 32px', maxHeight: 'calc(90vh - 200px)', overflow: 'auto' }}>
              {(!filteredAvailableServices || filteredAvailableServices.length === 0) ? (
                <div>
                  {searchTerm || selectedCategory !== 'all' ? (
                    // No search results - show categorized services
                    <div>
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#6c757d' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          margin: '0 auto 12px',
                          color: 'white'
                        }}>🔍</div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>No services found</h4>
                        <p style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
                          Try adjusting your search or browse all services by category below
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('all');
                            }}
                          >
                            🔄 Clear Filters
                          </button>
                          <button
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('all');
                              // Scroll to categories section
                              setTimeout(() => {
                                const categoriesSection = document.querySelector('[data-categories-section]');
                                if (categoriesSection) {
                                  categoriesSection.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 100);
                            }}
                          >
                            📂 Browse Categories
                          </button>
                        </div>
                      </div>

                      {/* Show services by category */}
                      <div style={{ marginTop: '24px' }} data-categories-section>
                        <div style={{
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          padding: '16px',
                          borderRadius: 12,
                          marginBottom: '20px',
                          border: '1px solid #e9ecef'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '16px' }}>
                            📂 Browse All Available Services
                          </h4>
                          <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                            {(() => {
                              const totalAvailable = (availableServices || []).filter(service => {
                                const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                                return !registeredServiceIds.includes(service.id);
                              }).length;
                              const totalCategories = (categories || []).filter(category => {
                                return (availableServices || []).some(service => {
                                  const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                                  return !registeredServiceIds.includes(service.id) && service.category?.id === category.id;
                                });
                              }).length;
                              return `${totalAvailable} services available across ${totalCategories} categories`;
                            })()}
                          </p>
                        </div>

                        {/* Quick Add Popular Services */}
                        {(() => {
                          const popularServices = (availableServices || [])
                            .filter(service => {
                              const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                              return !registeredServiceIds.includes(service.id);
                            })
                            .slice(0, 3); // Show first 3 as "popular"

                          if (popularServices.length === 0) return null;

                          return (
                            <div style={{ marginBottom: '24px' }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '16px',
                                borderRadius: 12,
                                marginBottom: '12px',
                                color: 'white'
                              }}>
                                <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                                  ⭐ Quick Add - Popular Services
                                </h5>
                                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                                  Get started quickly with these commonly requested services
                                </p>
                              </div>
                              <div style={{ display: 'grid', gap: '8px' }}>
                                {popularServices.map((service) => (
                                  <div key={service.id} style={{
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                                    border: '1px solid #e9ecef',
                                    borderRadius: 8,
                                    padding: 12,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                  >
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>⭐</span>
                                        <div>
                                          <h6 style={{ margin: '0 0 2px 0', color: '#2c3e50', fontSize: '13px', fontWeight: 600 }}>
                                            {service.name}
                                          </h6>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                              background: '#e9ecef',
                                              color: '#495057',
                                              padding: '2px 6px',
                                              borderRadius: 4,
                                              fontSize: '10px',
                                              fontWeight: 600
                                            }}>
                                              {service.category?.name}
                                            </span>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#28a745' }}>
                                              ${service.price}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      style={{
                                        padding: '6px 12px',
                                        borderRadius: 6,
                                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: actionLoading === service.id ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        opacity: actionLoading === service.id ? 0.6 : 1
                                      }}
                                      onClick={() => handleRegisterService(service.id, service.name)}
                                      disabled={actionLoading === service.id}
                                    >
                                      {actionLoading === service.id ? '⏳' : '+ Quick Add'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {(() => {
                          // If no categories are loaded, group services by their category name
                          const categoriesToShow = (categories || []).length > 0 ? categories :
                            // Create categories from available services
                            Array.from(new Set((availableServices || [])
                              .filter(service => {
                                const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                                return !registeredServiceIds.includes(service.id) && service.category;
                              })
                              .map(service => service.category?.name)
                              .filter(Boolean)
                            )).map(categoryName => ({
                              id: categoryName,
                              name: categoryName
                            }));

                          return categoriesToShow.map((category) => {
                            const categoryServices = (availableServices || []).filter(service => {
                              const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                              return !registeredServiceIds.includes(service.id) &&
                                     (service.category?.id === category.id || service.category?.name === category.name);
                            });

                            if (categoryServices.length === 0) return null;

                          return (
                            <div key={category.id} style={{ marginBottom: '24px' }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                padding: '12px 16px',
                                borderRadius: 8,
                                marginBottom: '12px',
                                border: '1px solid #e9ecef'
                              }}>
                                <h5 style={{ margin: 0, color: '#2c3e50', fontSize: '14px', fontWeight: 600 }}>
                                  📂 {category.name} ({categoryServices.length} services)
                                </h5>
                              </div>
                              <div style={{ display: 'grid', gap: '12px', paddingLeft: '16px' }}>
                                {categoryServices.map((service) => (
                                  <div key={service.id} style={{
                                    border: '1px solid #e9ecef',
                                    borderRadius: 8,
                                    padding: 16,
                                    background: 'white',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <div style={{ flex: 1 }}>
                                        <h6 style={{ margin: '0 0 6px 0', color: '#2c3e50', fontSize: '14px', fontWeight: 600 }}>
                                          {service.name}
                                        </h6>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6c757d', lineHeight: 1.4 }}>
                                          {service.description}
                                        </p>
                                        <div style={{
                                          background: '#e8f5e8',
                                          padding: '4px 8px',
                                          borderRadius: 6,
                                          display: 'inline-block',
                                          border: '1px solid #d4edda'
                                        }}>
                                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#28a745' }}>
                                            ${service.price}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        style={{
                                          padding: '6px 12px',
                                          borderRadius: 6,
                                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                          color: 'white',
                                          border: 'none',
                                          cursor: actionLoading === service.id ? 'not-allowed' : 'pointer',
                                          fontSize: '12px',
                                          fontWeight: 600,
                                          opacity: actionLoading === service.id ? 0.6 : 1,
                                          marginLeft: '12px'
                                        }}
                                        onClick={() => handleRegisterService(service.id, service.name)}
                                        disabled={actionLoading === service.id}
                                      >
                                        {actionLoading === service.id ? '⏳' : '+'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        });
                        })()}
                      </div>
                    </div>
                  ) : (
                    // All services registered
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 16px',
                        color: 'white'
                      }}>✅</div>
                      <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>All Set!</h4>
                      <p style={{ margin: 0 }}>You are already registered for all available services.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {filteredAvailableServices.map((service) => (
                    <div key={service.id} style={{
                      border: '1px solid #e9ecef',
                      borderRadius: 12,
                      padding: 20,
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              color: 'white'
                            }}>🔧</div>
                            <div>
                              <h5 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '1.1rem', fontWeight: 700 }}>
                                {service.name}
                              </h5>
                              <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: 10,
                                fontSize: '11px',
                                fontWeight: 600,
                                display: 'inline-block'
                              }}>
                                {service.category?.name || 'Service'}
                              </div>
                            </div>
                          </div>
                          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6c757d', lineHeight: 1.4 }}>
                            {service.description}
                          </p>
                          <div style={{
                            background: '#e8f5e8',
                            padding: '6px 10px',
                            borderRadius: 8,
                            display: 'inline-block',
                            border: '1px solid #d4edda'
                          }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#28a745' }}>
                              ${service.price}
                            </span>
                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '4px' }}>per service</span>
                          </div>
                        </div>
                        <button
                          style={{
                            padding: '10px 20px',
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: actionLoading === service.id ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            opacity: actionLoading === service.id ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                            marginLeft: '16px'
                          }}
                          onClick={() => handleRegisterService(service.id, service.name)}
                          disabled={actionLoading === service.id}
                          onMouseEnter={e => {
                            if (actionLoading !== service.id) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 15px rgba(40, 167, 69, 0.4)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (actionLoading !== service.id) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          {actionLoading === service.id ? '⏳ Adding...' : '+ Add Service'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveBookings({ user }: { user: User }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);

  const fetchBookings = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/service_provider_dashboard/bookings/?status=accepted,confirmed", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Active bookings received:', data?.length || 0, 'bookings');
        if (data && data.length > 0) {
          console.log('Sample active booking:', data[0]);
          console.log('Booking IDs:', data.map((b: any) => b.id));
        }
        setBookings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching active bookings:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://localhost:8000/api/service_provider_dashboard/booking/${bookingId}/status/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Booking ${newStatus} successfully!`);
        fetchBookings();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update booking');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteBooking = async (bookingId: string, paymentMethod: 'online' | 'cod') => {
    console.log('Completing booking:', { bookingId, paymentMethod });
    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const url = `http://localhost:8000/api/service_provider_dashboard/booking/${bookingId}/complete/`;
      console.log('API URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_method: paymentMethod })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        alert(result.message);
        fetchBookings(); // Refresh the list
        setShowPaymentModal(null);
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(error.detail || 'Failed to complete booking');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Active Bookings</h2>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#2c3e50' }}>Active Bookings</h2>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No active bookings</h3>
            <p style={{ margin: 0 }}>Accepted bookings will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{
                border: '1px solid #e9ecef',
                borderRadius: 12,
                padding: 20,
                background: booking.status === 'confirmed' ? '#e8f5e8' : '#fff3cd',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>
                      {booking.subcategory.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6c757d' }}>
                      <span><strong>Customer:</strong> {booking.customer}</span>
                      <span><strong>Service Date:</strong> {new Date(booking.service_date).toLocaleDateString()}</span>
                      <span><strong>Price:</strong> ${booking.total_price}</span>
                    </div>
                  </div>
                  <div style={{
                    background: booking.status === 'confirmed' ? '#28a745' : '#ffc107',
                    color: booking.status === 'confirmed' ? 'white' : '#212529',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {booking.status.toUpperCase()}
                  </div>
                </div>

                {booking.notes && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                    <strong style={{ color: '#495057' }}>Notes:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{booking.notes}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {booking.status === 'accepted' && (
                    <button
                      style={{
                        padding: '10px 20px',
                        borderRadius: 6,
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        cursor: actionLoading === booking.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: actionLoading === booking.id ? 0.6 : 1
                      }}
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? 'Processing...' : 'Confirm'}
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      style={{
                        padding: '10px 20px',
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        color: 'white',
                        border: 'none',
                        cursor: actionLoading === booking.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        opacity: actionLoading === booking.id ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setShowPaymentModal(booking.id)}
                      disabled={actionLoading === booking.id}
                      onMouseEnter={e => {
                        if (actionLoading !== booking.id) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 15px rgba(40, 167, 69, 0.4)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (actionLoading !== booking.id) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {actionLoading === booking.id ? '⏳ Processing...' : '✅ Mark as Completed'}
                    </button>
                  )}
                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      cursor: actionLoading === booking.id ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: actionLoading === booking.id ? 0.6 : 1
                    }}
                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? 'Processing...' : 'Cancel'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 0,
            maxWidth: 500,
            width: '90%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              padding: '24px 32px',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800 }}>
                  ✅ Complete Service
                </h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                  Choose payment method to complete this booking
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px' }}>
              {(() => {
                const booking = bookings.find(b => b.id === showPaymentModal);
                if (!booking) return null;

                return (
                  <div>
                    {/* Booking Summary */}
                    <div style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      padding: '20px',
                      borderRadius: 12,
                      marginBottom: '24px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '16px' }}>
                        📋 Service Summary
                      </h4>
                      <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                        <div><strong>Service:</strong> {booking.subcategory.name}</div>
                        <div><strong>Customer:</strong> {booking.customer}</div>
                        <div><strong>Amount:</strong> <span style={{ color: '#28a745', fontWeight: 700, fontSize: '16px' }}>${booking.total_price}</span></div>
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '16px' }}>
                        💳 Payment Method
                      </h4>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {/* COD Option */}
                        <button
                          style={{
                            padding: '20px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: actionLoading === showPaymentModal ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 600,
                            opacity: actionLoading === showPaymentModal ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                            textAlign: 'left'
                          }}
                          onClick={() => handleCompleteBooking(showPaymentModal, 'cod')}
                          disabled={actionLoading === showPaymentModal}
                          onMouseEnter={e => {
                            if (actionLoading !== showPaymentModal) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.4)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (actionLoading !== showPaymentModal) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>💵</span>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                                Collect ${booking.total_price} (Cash on Delivery)
                              </div>
                              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                Payment collected in cash - mark as paid immediately
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Online Payment Option */}
                        <button
                          style={{
                            padding: '20px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: actionLoading === showPaymentModal ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 600,
                            opacity: actionLoading === showPaymentModal ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                            textAlign: 'left'
                          }}
                          onClick={() => handleCompleteBooking(showPaymentModal, 'online')}
                          disabled={actionLoading === showPaymentModal}
                          onMouseEnter={e => {
                            if (actionLoading !== showPaymentModal) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 123, 255, 0.4)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (actionLoading !== showPaymentModal) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>💳</span>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                                Customer pays ${booking.total_price} online
                              </div>
                              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                Customer will receive payment link - pending until paid
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    <div style={{ textAlign: 'center' }}>
                      <button
                        style={{
                          padding: '12px 24px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: '#6c757d',
                          border: '1px solid #e9ecef',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                        onClick={() => setShowPaymentModal(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviousBookings({ user }: { user: User }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/service_provider_dashboard/bookings/?status=completed,cancelled", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Previous Bookings</h2>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#2c3e50' }}>Previous Bookings</h2>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No previous bookings</h3>
            <p style={{ margin: 0 }}>Completed and cancelled bookings will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{
                border: '1px solid #e9ecef',
                borderRadius: 12,
                padding: 20,
                background: booking.status === 'completed' ? '#e8f5e8' : '#f8d7da',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>
                      {booking.subcategory.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6c757d' }}>
                      <span><strong>Customer:</strong> {booking.customer}</span>
                      <span><strong>Service Date:</strong> {new Date(booking.service_date).toLocaleDateString()}</span>
                      <span><strong>Price:</strong> ${booking.total_price}</span>
                      <span><strong>Completed:</strong> {new Date(booking.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{
                    background: booking.status === 'completed' ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {booking.status.toUpperCase()}
                  </div>
                </div>

                {booking.notes && (
                  <div style={{ padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                    <strong style={{ color: '#495057' }}>Notes:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{booking.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EarningsSection({ user }: { user: User }) {
  const [earnings, setEarnings] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Fetch both earnings and analytics data
    Promise.all([
      fetch("http://localhost:8000/api/service_provider_dashboard/earnings/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:8000/api/service_provider_dashboard/stats/", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ])
      .then(([earningsRes, analyticsRes]) => Promise.all([earningsRes.json(), analyticsRes.json()]))
      .then(([earningsData, analyticsData]) => {
        setEarnings(earningsData);
        setAnalytics(analyticsData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1200, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Analytics & Earnings</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header with Period Selector */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 20,
        padding: 32,
        marginBottom: 24,
        color: 'white',
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              📊 Analytics & Earnings
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              Track your business performance and earnings
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['weekly', 'monthly', 'total'].map((period) => (
              <button
                key={period}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: selectedPeriod === period ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>💰</span>
            <h3 style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
              {selectedPeriod === 'weekly' ? 'Weekly' : selectedPeriod === 'monthly' ? 'Monthly' : 'Total'} Earnings
            </h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            ${selectedPeriod === 'weekly' ? earnings?.weekly_earnings || 0 :
               selectedPeriod === 'monthly' ? earnings?.monthly_earnings || 0 :
               earnings?.total_earnings || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {selectedPeriod === 'weekly' ? earnings?.weekly_completed_jobs || 0 :
             selectedPeriod === 'monthly' ? earnings?.monthly_completed_jobs || 0 :
             earnings?.total_completed_jobs || 0} completed jobs
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>📈</span>
            <h3 style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Success Rate</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {analytics?.completion_rate || 0}%
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {analytics?.completed_bookings_count || 0} of {analytics?.total_bookings_count || 0} jobs
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🎯</span>
            <h3 style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Active Jobs</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {analytics?.active_bookings_count || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            Currently in progress
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: '#2c3e50',
          boxShadow: '0 8px 25px rgba(168, 237, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🔧</span>
            <h3 style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Services Offered</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {analytics?.registered_services_count || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            Active service categories
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 15px 35px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 24, color: '#2c3e50' }}>
          📊 Performance Insights
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Average Job Value */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '16px' }}>Average Job Value</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '8px' }}>
              ${earnings?.total_completed_jobs > 0 ?
                ((earnings?.total_earnings || 0) / (earnings?.total_completed_jobs || 1)).toFixed(2) :
                '0.00'}
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
              Per completed job
            </p>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '16px' }}>Recent Activity</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
              {analytics?.recent_activity?.length || 0}
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
              Recent transactions
            </p>
          </div>
        </div>
      </div>

      {earnings?.earnings_by_service && Object.keys(earnings.earnings_by_service).length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 24, color: '#2c3e50' }}>Earnings by Service</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(earnings.earnings_by_service).map(([serviceName, data]: [string, any]) => (
              <div key={serviceName} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: 8,
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>{serviceName}</h4>
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>{data.count} jobs completed</div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  ${data.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}