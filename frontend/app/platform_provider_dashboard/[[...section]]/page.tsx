"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar";

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
            router.push("/end_user_dashboard");
          } else if (data.user_type === "Service Provider") {
            router.push("/service_provider_dashboard");
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
      <AdminSidebar />
      <main style={{ flex: 1, padding: "32px", background: "#f8f9fa" }}>
        {/* Home page for admins */}
        {!section && <AdminHome user={user} />}
        
        {/* Profile section route */}
        {section === "profile" && <ProfileSection user={user} />}
        
        {/* Users management section */}
        {section === "users" && <UsersManagement user={user} />}

        {/* User permissions section */}
        {section === "permissions" && <UserPermissionsManagement user={user} />}
        
        {/* Services management section */}
        {section === "services" && <ServicesManagement user={user} />}
        
        {/* Analytics section */}
        {section === "analytics" && <AnalyticsSection user={user} />}
        
        {/* Default admin dashboard */}
        {section && section !== "profile" && section !== "users" && section !== "services" && section !== "analytics" && <AdminDashboard user={user} />}
      </main>
    </div>
  );
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
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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

function AdminDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your platform admin dashboard.</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/platform_provider_dashboard/profile')}>View Profile</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#28a745', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/platform_provider_dashboard/users')}>Manage Users</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#17a2b8', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/platform_provider_dashboard/services')}>Manage Services</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#ffc107', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/platform_provider_dashboard/analytics')}>Analytics</button>
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
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/platform_provider_dashboard/users')}>Manage Users</button>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>🔧 Service Management</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>Manage service categories and offerings</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/platform_provider_dashboard/services')}>Manage Services</button>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>📊 Analytics</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>View platform statistics and insights</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#ffc107', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/platform_provider_dashboard/analytics')}>View Analytics</button>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>👤 Profile</h3>
          <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>Update your admin profile and settings</p>
          <button style={{ padding: '8px 16px', borderRadius: 6, background: '#667eea', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => router.push('/platform_provider_dashboard/profile')}>View Profile</button>
        </div>
      </div>
    </div>
  );
}

function UsersManagement({ user }: { user: User }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>User Management</h2>
        <button
          onClick={() => router.push('/platform_provider_dashboard/permissions')}
          style={{
            padding: '12px 20px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔐 User Permissions
        </button>
      </div>
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
        
        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', border: '1px solid #ffcc80', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#f57c00', fontSize: '2rem' }}>{analytics.totalServices}</h3>
          <p style={{ margin: 0, color: '#f57c00', fontWeight: 600 }}>Total Services</p>
        </div>
        
        <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '12px', border: '1px solid #f8bbd9', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#c2185b', fontSize: '2rem' }}>{analytics.totalBookings}</h3>
          <p style={{ margin: 0, color: '#c2185b', fontWeight: 600 }}>Total Bookings</p>
        </div>
      </div>
    </div>
  );
}

function UserPermissionsManagement({ user }: { user: User }) {
  const [permissions, setPermissions] = useState<any>({});
  const [userTypeRolePermissions, setUserTypeRolePermissions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('End User');
  const [selectedRole, setSelectedRole] = useState('Head of House');

  const userTypes = ['End User', 'Service Provider', 'Platform Provider'];

  // Define roles based on user type
  const getRolesForUserType = (userType: string) => {
    switch (userType) {
      case 'End User':
        return ['Head of House', 'Family Member'];
      case 'Service Provider':
        return ['Admin', 'Employee', 'Supervisor'];
      case 'Platform Provider':
        return ['Admin', 'Employee', 'Service Desk'];
      default:
        return [];
    }
  };

  const availableRoles = getRolesForUserType(selectedUserType);

  useEffect(() => {
    loadPermissions();
  }, []);

  // Update role when user type changes
  useEffect(() => {
    const roles = getRolesForUserType(selectedUserType);
    if (roles.length > 0 && !roles.includes(selectedRole)) {
      setSelectedRole(roles[0]);
    }
  }, [selectedUserType]);

  const loadPermissions = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error('No access token found');
      setLoading(false);
      return;
    }

    // Check current user first
    console.log('Current user:', user);
    console.log('User type:', user?.user_type);
    console.log('User role:', user?.role);

    try {
      console.log('Loading permissions...');

      // Load all permissions
      const permissionsResponse = await fetch("http://localhost:8000/api/platform_provider_dashboard/permissions/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Permissions response status:', permissionsResponse.status);

      // Load user type role permissions
      const userTypeRoleResponse = await fetch("http://localhost:8000/api/platform_provider_dashboard/user-type-role-permissions/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('User type role permissions response status:', userTypeRoleResponse.status);

      if (permissionsResponse.ok && userTypeRoleResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        const userTypeRoleData = await userTypeRoleResponse.json();

        console.log('Permissions data:', permissionsData);
        console.log('User type role data:', userTypeRoleData);

        setPermissions(permissionsData);
        setUserTypeRolePermissions(userTypeRoleData);
      } else {
        console.error('API responses not ok:');
        console.error('Permissions response status:', permissionsResponse.status);
        console.error('User type role response status:', userTypeRoleResponse.status);

        if (!permissionsResponse.ok) {
          try {
            const errorText = await permissionsResponse.text();
            console.error('Permissions API error:', errorText);
          } catch (e) {
            console.error('Could not read permissions error response');
          }
        }

        if (!userTypeRoleResponse.ok) {
          try {
            const errorText = await userTypeRoleResponse.text();
            console.error('User type role API error:', errorText);
          } catch (e) {
            console.error('Could not read user type role error response');
          }
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePermissions = async (userType: string, role: string, updatedPermissions: any) => {
    setSaving(true);
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/platform_provider_dashboard/update-permissions/", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_type: userType,
          role: role,
          permissions: updatedPermissions
        })
      });

      if (response.ok) {
        alert('✅ Permissions updated successfully!');
        await loadPermissions();
      } else {
        alert('❌ Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('❌ Error updating permissions');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionChange = (permissionId: number, isGranted: boolean) => {
    const updatedPermissions = { ...userTypeRolePermissions };

    // Find and update the permission in the current user type and role
    Object.keys(updatedPermissions[selectedUserType][selectedRole]).forEach(category => {
      updatedPermissions[selectedUserType][selectedRole][category] =
        updatedPermissions[selectedUserType][selectedRole][category].map((perm: any) =>
          perm.id === permissionId ? { ...perm, is_granted: isGranted } : perm
        );
    });

    setUserTypeRolePermissions(updatedPermissions);
  };

  const saveCurrentPermissions = () => {
    const currentPermissions = userTypeRolePermissions[selectedUserType]?.[selectedRole] || {};
    const permissionsToUpdate: any = {};

    Object.keys(currentPermissions).forEach(category => {
      currentPermissions[category].forEach((perm: any) => {
        permissionsToUpdate[perm.id] = perm.is_granted;
      });
    });

    updatePermissions(selectedUserType, selectedRole, permissionsToUpdate);
  };

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1200, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)', textAlign: 'center' }}>
        <p>Loading permissions...</p>
      </div>
    );
  }

  const currentPermissions = userTypeRolePermissions[selectedUserType]?.[selectedRole] || {};

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1200, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>🔐 User Permissions Management</h2>

      <p style={{ color: '#6c757d', marginBottom: 24 }}>
        Manage permissions for different user types and roles. Select a user type and role combination to configure their permissions.
      </p>

      {/* User Type and Role Selection */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: 30, padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#495057' }}>
            User Type
          </label>
          <select
            value={selectedUserType}
            onChange={(e) => setSelectedUserType(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ced4da',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            {userTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#495057' }}>
            Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ced4da',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            {availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Permissions Grid */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20, color: '#495057' }}>
          Permissions for {selectedUserType} - {selectedRole}
        </h3>

        {Object.keys(currentPermissions).length === 0 ? (
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '40px' }}>
            No permissions configured for this user type and role combination.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {Object.keys(currentPermissions)
              .filter(category => {
                // Filter categories based on user type
                if (selectedUserType === 'End User') {
                  // End User: Only show Booking Permissions and User Permissions (NO Analytics)
                  return ['Booking Permissions', 'User Permissions'].includes(category);
                } else if (selectedUserType === 'Service Provider') {
                  // Service Provider: Show service-related permission categories
                  return ['Services Permissions', 'User Permissions', 'Analytics', 'Booking Management', 'Availability Management'].includes(category);
                } else if (selectedUserType === 'Platform Provider') {
                  // Platform Provider: Show all permissions
                  return true;
                }
                return true; // Default: show all
              })
              .map(category => (
              <div key={category} style={{ border: '1px solid #e9ecef', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: 0, color: '#495057', fontSize: '1rem', fontWeight: 600 }}>
                    📁 {category}
                  </h4>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                    {currentPermissions[category]
                      .filter((permission: any) => {
                        // Filter out "Manage Users" permission for End Users
                        if (selectedUserType === 'End User' && permission.codename === 'manage_users') {
                          return false;
                        }
                        return true;
                      })
                      .map((permission: any) => (
                      <div key={permission.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: permission.is_granted ? '#e8f5e8' : '#fff5f5', borderRadius: '8px', border: `1px solid ${permission.is_granted ? '#c8e6c9' : '#ffcdd2'}` }}>
                        <input
                          type="checkbox"
                          checked={permission.is_granted}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          style={{ marginTop: '2px', width: '16px', height: '16px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#495057', marginBottom: '4px' }}>
                            {permission.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            {permission.description}
                          </div>
                          <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '2px' }}>
                            Code: {permission.codename}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      {Object.keys(currentPermissions).length > 0 && (
        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
          <button
            onClick={saveCurrentPermissions}
            disabled={saving}
            style={{
              padding: '15px 30px',
              borderRadius: '8px',
              background: saving ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            {saving ? '⏳ Saving...' : '💾 Save Permissions'}
          </button>
        </div>
      )}
    </div>
  );
}