import React from "react";
import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();
  return (
    <aside style={{
      width: 240,
      background: "white",
      borderRight: "1px solid #eee",
      padding: "32px 0 32px 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "sticky",
      top: 0,
      height: "100vh",
      boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      zIndex: 2
    }}>
      <div style={{
        fontSize: 48,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "50%",
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        marginBottom: 24
      }}>🛡️</div>
      <nav style={{ width: "100%" }}>
        <SidebarNavItem label="Dashboard" icon="🛡️" onClick={() => router.push('/platform_provider_dashboard')} />
        <SidebarNavItem label="Users" icon="👥" onClick={() => router.push('/platform_provider_dashboard/users')} />
        <SidebarNavItem label="Services" icon="🛠️" onClick={() => router.push('/platform_provider_dashboard/services')} />
        <SidebarNavItem label="Bookings" icon="📋" onClick={() => router.push('/platform_provider_dashboard/bookings')} />
        <SidebarNavItem label="Reports" icon="📊" onClick={() => router.push('/platform_provider_dashboard/reports')} />
        <SidebarNavItem label="Profile" icon="👤" onClick={() => router.push('/platform_provider_dashboard/profile')} />
        <SidebarNavItem label="Help" icon="❓" onClick={() => router.push('/platform_provider_dashboard/help')} />
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
        padding: "16px 32px",
        cursor: "pointer",
        fontSize: 18,
        color: "#333",
        borderRadius: 8,
        margin: "8px 0",
        transition: "background 0.2s, color 0.2s",
        userSelect: "none"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "#f5f7fa";
        e.currentTarget.style.color = "#764ba2";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "white";
        e.currentTarget.style.color = "#333";
      }}
    >
      <span style={{ fontSize: 22, marginRight: 16 }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
} 