"use client";
import { useState, useEffect } from "react";

interface Booking {
  id: string;
  subcategory: {
    name: string;
    description: string;
    price: number;
  };
  service_date: string;
  total_price: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please login to view your bookings");
        setLoading(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/bookings/user-bookings/", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please login to manage bookings");
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/bookings/booking/${bookingId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        // Refresh bookings
        fetchBookings();
      } else {
        setError("Failed to cancel booking");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#ffc107";
      case "confirmed":
        return "#28a745";
      case "completed":
        return "#17a2b8";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <p>Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "50px",
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}>
          <h1 style={{
            margin: "0 0 16px 0",
            color: "#333",
            fontSize: "36px",
            fontWeight: "700"
          }}>
            My Bookings
          </h1>
          <p style={{
            margin: "0",
            color: "#666",
            fontSize: "18px",
            lineHeight: "1.6"
          }}>
            View and manage your service bookings
          </p>
        </div>

        {error && (
          <div style={{
            background: "#fee",
            color: "#c33",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
            border: "1px solid #fcc",
          }}>
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div style={{
            background: "white",
            padding: "60px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
            <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
              No bookings found
            </h3>
            <p style={{ margin: "0", color: "#666" }}>
              You haven't made any bookings yet. 
              <br />
              <a href="/services/home-services" style={{ color: "#667eea", textDecoration: "none" }}>
                Browse our services
              </a>{" "}
              to get started!
            </p>
          </div>
        ) : (
          <div style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "30px",
              borderBottom: "1px solid #eee",
            }}>
              <h2 style={{ margin: 0, color: "#333" }}>
                Booking History ({bookings.length})
              </h2>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>
                      Service
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>
                      Service Date
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #eee" }}>
                      Price
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                      Status
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "16px", fontWeight: "500" }}>
                        {booking.subcategory?.name || "-"}
                      </td>
                      <td style={{ padding: "16px", color: "#666" }}>
                        {formatDate(booking.service_date)}
                      </td>
                      <td style={{ padding: "16px", fontWeight: "600", color: "#28a745" }}>
                        ₹{Number(booking.total_price).toFixed(2)}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{
                          background: getStatusColor(booking.status),
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {booking.status === "pending" && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            style={{
                              background: "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "600"
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        {booking.status === "cancelled" && (
                          <span style={{ color: "#666", fontSize: "14px" }}>
                            Cancelled
                          </span>
                        )}
                        {booking.status === "completed" && (
                          <span style={{ color: "#28a745", fontSize: "14px", fontWeight: "600" }}>
                            ✓ Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 