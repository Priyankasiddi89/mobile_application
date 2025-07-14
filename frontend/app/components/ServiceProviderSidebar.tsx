import React from "react";
import { useRouter } from "next/navigation";

export default function ServiceProviderSidebar() {
  const router = useRouter();
  return (
    <aside style={{
      width: 280,
      background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
      borderRight: "none",
      padding: "32px 0 32px 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "sticky",
      top: 0,
      height: "100vh",
      boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
      zIndex: 2,
      color: "white"
    }}>
      {/* Header Section */}
      <div style={{
        padding: "0 24px",
        marginBottom: 32,
        textAlign: "center",
        position: "relative"
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }}></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: 56,
            background: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            marginBottom: 16,
            margin: "0 auto 16px auto",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255,255,255,0.3)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
          }}>🔧</div>

          <div style={{
            background: "rgba(255,255,255,0.15)",
            padding: "12px 16px",
            borderRadius: "12px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "1.3rem",
              fontWeight: 800,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              marginBottom: "4px"
            }}>
              Service Provider
            </h2>
            <p style={{
              margin: 0,
              opacity: 0.9,
              fontSize: "13px",
              fontWeight: 500
            }}>
              Professional Dashboard
            </p>
          </div>
        </div>
      </div>
      <nav style={{ width: "100%" }}>
        <SidebarNavItem label="Dashboard" icon="🛠️" onClick={() => router.push('/service_provider_dashboard')} />
        <SidebarNavItem label="My Services" icon="🔧" onClick={() => router.push('/service_provider_dashboard/services')} />
        <SidebarNavItem label="Incoming Requests" icon="📥" onClick={() => router.push('/service_provider_dashboard/requests')} />
        <SidebarNavItem label="Active Bookings" icon="🟢" onClick={() => router.push('/service_provider_dashboard/active')} />
        <SidebarNavItem label="Previous Bookings" icon="📚" onClick={() => router.push('/service_provider_dashboard/previous')} />
        <SidebarNavItem label="Earnings" icon="💰" onClick={() => router.push('/service_provider_dashboard/earnings')} />
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
        padding: "16px 24px",
        cursor: "pointer",
        fontSize: 16,
        color: "rgba(255,255,255,0.9)",
        borderRadius: 12,
        margin: "6px 16px",
        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        userSelect: "none",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.15)",
        fontWeight: 600
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.25)";
        e.currentTarget.style.transform = "translateX(8px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.2)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        e.currentTarget.style.transform = "translateX(0) scale(1)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
      }}
    >
      <span style={{
        fontSize: 20,
        marginRight: 14,
        background: "rgba(255,255,255,0.2)",
        padding: "6px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px"
      }}>{icon}</span>
      <span style={{ fontWeight: 600 }}>{label}</span>
    </div>
  );
}