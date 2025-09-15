import React from "react";
import { useRouter } from "next/navigation";

interface ServiceProviderSidebarProps {
  userPermissions?: { [key: string]: boolean };
}

export default function ServiceProviderSidebar({ userPermissions = {} }: ServiceProviderSidebarProps) {
  const router = useRouter();

  // Helper function to check permissions
  const hasPermission = (permissionCode: string): boolean => {
    return userPermissions[permissionCode] === true;
  };
  return (
    <aside style={{
      width: 260,
      background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
      borderRight: "1px solid rgba(255,255,255,0.1)",
      padding: "20px 0",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
      zIndex: 1000,
      color: "white",
      overflowY: "auto"
    }}>
      {/* Compact Header */}
      <div style={{
        padding: "0 20px",
        marginBottom: 24,
        textAlign: "center"
      }}>
        <div style={{
          fontSize: 40,
          background: "rgba(255,255,255,0.2)",
          borderRadius: "50%",
          width: 70,
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          margin: "0 auto 12px auto",
          border: "2px solid rgba(255,255,255,0.3)"
        }}>🔧</div>

        <h2 style={{
          margin: 0,
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "4px"
        }}>
          Service Provider
        </h2>
        <p style={{
          margin: 0,
          opacity: 0.8,
          fontSize: "12px",
          fontWeight: 500
        }}>
          Dashboard
        </p>
      </div>
      <nav style={{ width: "100%" }}>
        {/* Dashboard - Always visible */}
        <SidebarNavItem label="Dashboard" icon="🛠️" onClick={() => router.push('/service_provider_dashboard')} />

        {/* Profile - Check view_own_profile permission */}
        {hasPermission('view_own_profile') && (
          <SidebarNavItem label="My Profile" icon="👤" onClick={() => router.push('/service_provider_dashboard/profile')} />
        )}

        {/* Services - Check register_for_services permission */}
        {hasPermission('register_for_services') && (
          <SidebarNavItem label="My Services" icon="🔧" onClick={() => router.push('/service_provider_dashboard/services')} />
        )}

        {/* Incoming Requests - Check view_booking_requests permission */}
        {hasPermission('view_booking_requests') && (
          <SidebarNavItem label="Incoming Requests" icon="📥" onClick={() => router.push('/service_provider_dashboard/requests')} />
        )}

        {/* Active Bookings - Check view_active_bookings permission */}
        {hasPermission('view_active_bookings') && (
          <SidebarNavItem label="Active Bookings" icon="🟢" onClick={() => router.push('/service_provider_dashboard/active')} />
        )}

        {/* Previous Bookings - Check view_previous_bookings permission */}
        {hasPermission('view_previous_bookings') && (
          <SidebarNavItem label="Previous Bookings" icon="📚" onClick={() => router.push('/service_provider_dashboard/previous')} />
        )}

        {/* Availability - Check view_availability OR manage_availability permission */}
        {(hasPermission('view_availability') || hasPermission('manage_availability')) && (
          <SidebarNavItem label="Availability" icon="📅" onClick={() => router.push('/service_provider_dashboard/availability')} />
        )}

        {/* Ratings - Check view_own_ratings permission */}
        {hasPermission('view_own_ratings') && (
          <SidebarNavItem label="Ratings & Reviews" icon="⭐" onClick={() => router.push('/service_provider_dashboard/ratings')} />
        )}

        {/* Analytics - Check view_analytics permission */}
        {hasPermission('view_analytics') && (
          <SidebarNavItem label="Analytics" icon="📊" onClick={() => router.push('/service_provider_dashboard/analytics')} />
        )}

        {/* Earnings - Check view_earnings permission */}
        {hasPermission('view_earnings') && (
          <SidebarNavItem label="Earnings" icon="💰" onClick={() => router.push('/service_provider_dashboard/earnings')} />
        )}

        {/* Payments - Check request_payments permission */}
        {hasPermission('request_payments') && (
          <SidebarNavItem label="Payment Requests" icon="💳" onClick={() => router.push('/service_provider_dashboard/payments')} />
        )}

        {/* Logout - Always visible */}
        <SidebarNavItem label="Logout" icon="🚪" onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          router.replace('/login');
        }} />
      </nav>
    </aside>
  );
}

function SidebarNavItem({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 20px",
        cursor: "pointer",
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
        borderRadius: 8,
        margin: "3px 12px",
        transition: "all 0.2s ease",
        userSelect: "none",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontWeight: 500
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.2)";
        e.currentTarget.style.transform = "translateX(4px)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        e.currentTarget.style.transform = "translateX(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <span style={{
        fontSize: 16,
        marginRight: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
        height: "20px"
      }}>{icon}</span>
      <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
  );
}