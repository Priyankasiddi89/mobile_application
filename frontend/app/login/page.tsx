"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError("Invalid username or password");
        return;
      }
      const data = await res.json();
      // Store tokens in localStorage (or cookies for production)
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      // Fetch user info to determine user_type
      const userRes = await fetch("http://localhost:8000/api/auth/me/", {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      const user = await userRes.json();

      // Check if user is a superuser - redirect to Django admin
      if (user.is_superuser) {
        window.location.href = "http://localhost:8000/admin/";
        return;
      }

      // Regular user redirects
      if (user.user_type === "Service Provider") {
        router.push("/service_provider_dashboard");
      } else if (user.user_type === "Platform Provider" || user.user_type === "Admin") {
        router.push("/platform_provider_dashboard");
      } else {
        router.push("/end_user_dashboard");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    setError("");

    console.log("🔐 Forgot Password - Starting request");
    console.log("📧 Email:", forgotEmail);

    try {
      console.log("🔗 Making request to:", "http://localhost:8000/api/auth/forgot-password/");

      const res = await fetch("http://localhost:8000/api/auth/forgot-password-clean/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      console.log("📥 Response status:", res.status);
      console.log("📥 Response ok:", res.ok);

      let data;
      try {
        data = await res.json();
        console.log("📥 Response data:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", parseError);
        const textResponse = await res.text();
        console.log("📥 Raw response:", textResponse);

        // Handle HTML error pages (like Django 404 pages)
        if (textResponse.includes('<!DOCTYPE html>') || textResponse.includes('<html>')) {
          setError(`❌ Service Unavailable\n\nThe forgot password service is not responding properly.\n\nPlease try again later or contact support.\n\nStatus: ${res.status}`);
        } else if (res.status === 400 || res.status === 404) {
          // Handle unregistered email case even when JSON parsing fails
          setError(`❌ Email Not Registered\n\nThe email address "${forgotEmail}" is not registered with our platform.\n\nPlease check your email spelling or register for a new account.\n\n🔗 Need an account? Click "Register here" below.`);
        } else {
          setError(`❌ Server Error\n\n${textResponse || 'Invalid response format'}\n\nStatus: ${res.status}`);
        }
        setForgotLoading(false);
        return;
      }

      if (res.ok) {
        console.log("✅ Forgot password successful:", data);

        // Secure response - password only sent via email
        let message = data.message || "Password reset successful!";

        if (data.email_sent) {
          message = `🎉 Password Reset Successful!\n\n📧 A new password has been sent to your email address.\n\n👤 Username: ${data.username}\n\n💡 Please check your email for the new password and use it to login.\n\n📬 If you don't see the email, check your spam folder.`;
        } else {
          message = `🎉 Password Reset Successful!\n\n👤 Username: ${data.username}\n\n⚠️ Email sending failed, but your password has been reset.\n\n💡 Please contact support for your new password.`;
        }

        setForgotMessage(message);

        // Clear form and close modal after 5 seconds
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotEmail("");
          setForgotMessage("");
        }, 5000);
      } else {
        console.log("❌ Request failed with status:", res.status);
        // Handle different error cases with clean API response
        if (res.status === 404) {
          // Email not registered error from clean API
          if (data.code === 'EMAIL_NOT_REGISTERED') {
            setError(`❌ Email Not Registered\n\n${data.message}\n\n💡 ${data.suggestion}\n\n🔗 Need an account? Click "Register here" below.`);
          } else {
            setError(`❌ Email Not Registered\n\nThe email address "${forgotEmail}" is not registered with our platform.\n\nPlease check your email spelling or register for a new account.`);
          }
        } else if (res.status === 400) {
          // Bad request errors (invalid email format, missing email, unregistered email, etc.)
          if (data.code === 'EMAIL_NOT_REGISTERED') {
            setError(`❌ Email Not Registered\n\n${data.message}\n\n💡 ${data.suggestion}\n\n🔗 Need an account? Click "Register here" below.`);
          } else if (data.code === 'EMAIL_REQUIRED') {
            setError("❌ Email Required\n\nPlease enter your email address.");
          } else if (data.code === 'INVALID_EMAIL_FORMAT') {
            setError("❌ Invalid Email\n\nPlease enter a valid email address.");
          } else {
            setError(`❌ Invalid Request\n\n${data.message || 'Please check your input and try again.'}`);
          }
        } else if (res.status === 500) {
          setError("❌ Server Error\n\nSomething went wrong on our end. Please try again later or contact support.");
        } else if (res.status === 0) {
          setError("❌ Connection Error\n\nCannot connect to server. Please check if the Django server is running.");
        } else {
          setError(`❌ Error\n\n${data.message || data.error || `Failed to reset password (Error ${res.status}). Please try again.`}`);
        }
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError("Cannot connect to server. Please check if the Django server is running at http://localhost:8000");
      } else {
        setError(`Network error: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, border: "1px solid #eee", borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>
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
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 10, background: "#0070f3", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600 }}>Login</button>
      </form>

      {/* Forgot Password Link */}
      <div style={{ marginTop: 12, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          style={{
            background: "none",
            border: "none",
            color: "#0070f3",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Forgot Password?
        </button>
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        New user? <a href="/signup" style={{ color: "#0070f3", textDecoration: "underline" }}>Sign up</a>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            maxWidth: "400px",
            width: "90%",
            position: "relative"
          }}>
            {/* Close Button */}
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotEmail("");
                setForgotMessage("");
                setError("");
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#666"
              }}
            >
              ×
            </button>

            <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>Reset Password</h3>



            {forgotMessage ? (
              <div style={{
                background: "#f0f9ff",
                border: "1px solid #0ea5e9",
                borderRadius: "6px",
                padding: "15px",
                marginBottom: "20px",
                color: "#0369a1",
                whiteSpace: "pre-line",
                fontSize: "14px"
              }}>
                {forgotMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <p style={{ marginBottom: "15px", color: "#666", fontSize: "14px" }}>
                  Enter your registered email address and we'll send you a new password.
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="forgotEmail" style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                    Email Address
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  />
                </div>

                {/* Error Display */}
                {error && (
                  <div style={{
                    color: "#dc3545",
                    background: "#f8d7da",
                    border: "1px solid #f5c6cb",
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "15px",
                    fontSize: "14px",
                    whiteSpace: "pre-line"
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: forgotLoading ? "#ccc" : "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: forgotLoading ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  {forgotLoading ? "Sending..." : "Reset Password"}
                </button>

                {/* Register link for new users */}
                <div style={{
                  marginTop: "15px",
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#666"
                }}>
                  Don't have an account?{" "}
                  <a
                    href="/signup"
                    style={{
                      color: "#0070f3",
                      textDecoration: "underline",
                      fontWeight: "500"
                    }}
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail("");
                      setForgotMessage("");
                      setError("");
                    }}
                  >
                    Register here
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 