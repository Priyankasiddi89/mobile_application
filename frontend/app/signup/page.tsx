"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const userTypeOptions = [
  { value: "End User", label: "End User" },
  { value: "Service Provider", label: "Service Provider" },
];

const roleOptions: Record<string, { value: string; label: string }[]> = {
  "End User": [
    { value: "Head of House", label: "Head of House" },
    { value: "Family Member", label: "Family Member" },
  ],
  "Service Provider": [
    { value: "Admin", label: "Admin" },
    { value: "Employee", label: "Employee" },
    { value: "Supervisor", label: "Supervisor" },
  ],
};

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, user_type: userType, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.msg || "Registration failed");
        return;
      }
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  // Reset role when userType changes
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(e.target.value);
    setRole("");
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, border: "1px solid #eee", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
      <h2 style={{ textAlign: "center" }}>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="userType">User Type</label>
          <select
            id="userType"
            value={userType}
            onChange={handleUserTypeChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            <option value="">Select user type</option>
            {userTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {userType && (
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="">Select role</option>
              {roleOptions[userType].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: "green", marginBottom: 12 }}>{success}</div>}
        <button type="submit" style={{ width: "100%", padding: 10, background: "#0070f3", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600 }}>Sign Up</button>
      </form>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        Already have an account? <a href="/login" style={{ color: "#0070f3", textDecoration: "underline" }}>Login</a>
      </div>
    </div>
  );
} 