"use client";
import { useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
  categoryName: string;
}

export default function BookingModal({ isOpen, onClose, subcategory, categoryName }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please login to book a service");
        return;
      }

      const serviceDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      const response = await fetch("http://127.0.0.1:8000/api/bookings/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          subcategory_id: subcategory.id,
          service_date: serviceDateTime.toISOString(),
          notes: notes,
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        alert(`Booking created successfully! Booking ID: ${booking.id}`);
        onClose();
        // Reset form
        setSelectedDate("");
        setSelectedTime("");
        setNotes("");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to create booking");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "30px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}>
          <h2 style={{
            margin: 0,
            color: "#333",
            fontSize: "24px",
            fontWeight: "600",
          }}>
            Book Service
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
            {subcategory.name}
          </h3>
          <p style={{ margin: "0 0 8px 0", opacity: 0.9 }}>
            {categoryName} • {subcategory.description}
          </p>
          <div style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginTop: "12px",
          }}>
            ${subcategory.price.toFixed(2)}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#333",
            }}>
              Service Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#333",
            }}>
              Service Time *
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
              }}
            >
              <option value="">Select a time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#333",
            }}>
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or requirements..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                resize: "vertical",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#fee",
              color: "#c33",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #fcc",
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 24px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "white",
                color: "#666",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "600",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 