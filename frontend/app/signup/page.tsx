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
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Common input styling
  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.2s"
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#0070f3";
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#ddd";
  };

  // Common label styling
  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#333",
    fontSize: "14px"
  };

  // Helper function to format field names for better error display
  const formatFieldName = (fieldName: string) => {
    const fieldMap: Record<string, string> = {
      'username': 'Username',
      'email': 'Email Address',
      'password': 'Password',
      'user_type': 'User Type',
      'role': 'Role',
      'first_name': 'First Name',
      'last_name': 'Last Name'
    };
    return fieldMap[fieldName] || fieldName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (!userType) {
      setError("Please select a user type");
      return;
    }
    if (!role) {
      setError("Please select a role");
      return;
    }

    try {
      const requestData = {
        username,
        email,
        password,
        user_type: userType,
        role,
        first_name: firstName,
        last_name: lastName
      };

      console.log("Registration request:", requestData);

      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      console.log("Registration response status:", res.status);
      if (!res.ok) {
        let data;
        try {
          data = await res.json();
          console.log("Error response data:", data);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          const textResponse = await res.text();
          console.log("Raw error response:", textResponse);
          setError(`Registration failed (${res.status}): ${textResponse || 'Unknown error'}`);
          return;
        }

        // Handle different types of error responses
        if (data.error) {
          setError(data.error);
        } else if (data.msg) {
          setError(data.msg);
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.details) {
          // Handle validation errors (field-specific errors)
          const errorMessages = [];
          for (const [field, messages] of Object.entries(data.details)) {
            const fieldName = formatFieldName(field);
            if (Array.isArray(messages)) {
              errorMessages.push(`${fieldName}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${fieldName}: ${messages}`);
            }
          }
          setError(errorMessages.join('\n'));
        } else if (data.username || data.email || data.password) {
          // Handle Django model validation errors
          const errorMessages = [];
          for (const [field, messages] of Object.entries(data)) {
            if (Array.isArray(messages)) {
              const fieldName = formatFieldName(field);
              errorMessages.push(`${fieldName}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              const fieldName = formatFieldName(field);
              errorMessages.push(`${fieldName}: ${messages}`);
            }
          }
          setError(errorMessages.join('\n'));
        } else if (typeof data === 'string') {
          setError(data);
        } else {
          // Try to extract any error message from the response
          const errorText = JSON.stringify(data, null, 2);
          setError(`Registration failed (${res.status}):\n${errorText}`);
        }
        return;
      }
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error("Registration error:", err);

      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError("Network error: Unable to connect to the server. Please check your connection and try again.");
      } else if (err instanceof Error) {
        setError(`Registration failed: ${err.message}`);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  // Reset role when userType changes
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(e.target.value);
    setRole("");
  };

  return (
    <div style={{
      maxWidth: 450,
      margin: "40px auto",
      padding: 32,
      border: "1px solid #e1e5e9",
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      background: "white"
    }}>
      <h2 style={{
        textAlign: "center",
        marginBottom: "24px",
        color: "#333",
        fontSize: "28px",
        fontWeight: "600"
      }}>Create Account</h2>
      <p style={{
        textAlign: "center",
        color: "#666",
        marginBottom: "24px",
        fontSize: "14px"
      }}>Join our home services platform</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="username" style={labelStyle}>Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Enter your username"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={labelStyle}>Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Enter your email address"
          />
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="firstName" style={labelStyle}>First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="First name"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="lastName" style={labelStyle}>Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Last name"
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Enter your password (min 6 characters)"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="userType" style={labelStyle}>User Type</label>
          <select
            id="userType"
            value={userType}
            onChange={handleUserTypeChange}
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          >
            <option value="">Select user type</option>
            {userTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {userType && (
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="role" style={labelStyle}>Role</label>
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              <option value="">Select role</option>
              {roleOptions[userType].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
        {error && (
          <div style={{
            color: "#dc3545",
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "6px",
            fontSize: "14px",
            whiteSpace: "pre-line"
          }}>
            <strong>Registration Failed:</strong>
            <br />
            {error}
          </div>
        )}
        {success && (
          <div style={{
            color: "#155724",
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "6px",
            fontSize: "14px"
          }}>
            {success}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #0070f3 0%, #0051cc 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,112,243,0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,112,243,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,112,243,0.3)";
          }}
        >
          Create Account
        </button>
      </form>
      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "#666" }}>
        Already have an account?{" "}
        <a
          href="/login"
          style={{
            color: "#0070f3",
            textDecoration: "none",
            fontWeight: "500",
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
        >
          Sign in here
        </a>
      </div>
    </div>
  );
} 