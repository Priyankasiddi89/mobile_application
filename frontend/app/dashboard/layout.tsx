"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EndUserSidebar from "../components/EndUserSidebar";
import ServiceProviderSidebar from "../components/ServiceProviderSidebar";
import AdminSidebar from "../components/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    async function fetchRole() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setRole("end_user"); // fallback
        console.log("No token found, defaulting to end_user");
        return;
      }
      const res = await fetch("/api/auth/me/", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const user = await res.json();
        console.log("/api/auth/me/ response:", user);
        if (user.user_type === "Service Provider") {
          setRole("service_provider");
          console.log("Detected role: service_provider");
        } else {
          setRole("end_user");
          console.log("Detected role: end_user");
        }
      } else {
        setRole("end_user");
        console.log("/api/auth/me/ failed, defaulting to end_user");
      }
    }
    fetchRole();
  }, []);
  if (!role) return <div>Loading...</div>;
  let SidebarComponent = EndUserSidebar;
  if (role === "service_provider") SidebarComponent = ServiceProviderSidebar;
  if (role === "admin") SidebarComponent = AdminSidebar;
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex"
    }}>
      <SidebarComponent />
      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", maxWidth: 1200, margin: "0 auto" }}>{children}</main>
    </div>
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