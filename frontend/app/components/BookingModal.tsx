"use client";
import { useState, useEffect } from "react";

interface Provider {
  provider_id: number;
  provider_name: string;
  provider_email: string;
  provider_price: number;
  base_price: number;
  price_difference: number;
  description: string;
  rating: number;
  total_reviews: number;
  completed_bookings: number;
  registered_at: string;
}

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
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedProviderReviews, setSelectedProviderReviews] = useState<any>(null);
  const [providerReviews, setProviderReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [step, setStep] = useState<'providers' | 'booking'>('providers');

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  // Fetch available providers when modal opens
  useEffect(() => {
    if (isOpen && subcategory) {
      fetchProviders();
    }
  }, [isOpen, subcategory]);

  const fetchProviders = async () => {
    setLoadingProviders(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please login to view providers");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/marketplace/service/${subcategory.id}/providers/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || []);
        if (data.providers && data.providers.length === 0) {
          setError("No providers available for this service at the moment.");
        }
      } else {
        setError("Failed to load providers. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setStep('booking');
  };

  const handleBackToProviders = () => {
    setStep('providers');
    setSelectedProvider(null);
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
    setAddress("");
    setError("");
  };

  const handleViewReviews = async (provider: any) => {
    setSelectedProviderReviews(provider);
    setShowReviewsModal(true);
    setReviewsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/bookings/provider/${provider.provider_id}/ratings/`);

      if (response.ok) {
        const data = await response.json();
        setProviderReviews(data.ratings || []);
      } else {
        console.error('Failed to fetch reviews');
        setProviderReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setProviderReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeReviewsModal = () => {
    setShowReviewsModal(false);
    setSelectedProviderReviews(null);
    setProviderReviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    if (!address.trim()) {
      setError("Please enter the service address");
      return;
    }

    if (!selectedProvider) {
      setError("Please select a provider");
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
      
      const response = await fetch("http://localhost:8000/api/marketplace/book-provider/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider_id: selectedProvider.provider_id,
          service_id: parseInt(subcategory.id),
          service_date: serviceDateTime.toISOString(),
          notes: notes,
          address: address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Booking request sent to ${selectedProvider.provider_name}!\n\n💰 Total: ₹${selectedProvider.provider_price}\n📅 Date: ${selectedDate} at ${selectedTime}\n\nThe provider will review your request and respond soon. You can check the status in "My Requests" section.`);
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create booking");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
    setAddress("");
    setSelectedProvider(null);
    setStep('providers');
    setError("");
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
        maxWidth: "600px",
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
            {step === 'providers' ? `Choose Provider for ${subcategory.name}` : `Book with ${selectedProvider?.provider_name}`}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#999",
              padding: "0",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
            fontSize: "14px",
            opacity: 0.9,
            marginTop: "8px",
          }}>
            Compare providers and choose the best option for you
          </div>
        </div>

        {step === 'providers' ? (
          // Provider Selection Step
          <div>
            {loadingProviders ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>🔍</div>
                <div>Finding available providers...</div>
              </div>
            ) : providers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>😔</div>
                <div>No providers available for this service at the moment.</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Please try again later or contact support.</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
                  Found {providers.length} provider{providers.length !== 1 ? 's' : ''} available for this service
                </div>
                <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {providers.map((provider) => (
                    <div
                      key={provider.provider_id}
                      onClick={() => handleProviderSelect(provider)}
                      style={{
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e9ecef';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '16px', fontWeight: '600' }}>
                              {provider.provider_name}
                            </h4>
                            {provider.rating > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: '#ffc107' }}>⭐</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewReviews(provider);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '14px',
                                    color: '#667eea',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0
                                  }}
                                >
                                  {provider.rating} ({provider.total_reviews} reviews)
                                </button>
                              </div>
                            )}
                          </div>
                          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                            {provider.description}
                          </p>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            ✅ {provider.completed_bookings} completed bookings
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontWeight: '600'
                          }}>
                            ₹{provider.provider_price}
                          </div>
                          {/* Price difference hidden from end users */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: "#f8d7da",
                color: "#721c24",
                padding: "12px",
                borderRadius: "8px",
                marginTop: "16px",
                border: "1px solid #f5c6cb",
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
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
            </div>
          </div>
        ) : (
          // Booking Form Step
          <div>
            {selectedProvider && (
              <div style={{
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #d4edda'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#155724', fontSize: '16px' }}>
                      {selectedProvider.provider_name}
                    </h4>
                    <div style={{ fontSize: '14px', color: '#155724' }}>
                      Total: ₹{selectedProvider.provider_price}
                    </div>
                  </div>
                  <button
                    onClick={handleBackToProviders}
                    style={{
                      background: 'none',
                      border: '1px solid #28a745',
                      color: '#28a745',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Change Provider
                  </button>
                </div>
              </div>
            )}

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

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#333",
                }}>
                  Service Address *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter the complete address where the service will be performed..."
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    minHeight: "80px",
                    resize: "vertical",
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
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or instructions..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: "#f8d7da",
                  color: "#721c24",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid #f5c6cb",
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
                  onClick={handleBackToProviders}
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
                  Back
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
        )}
      </div>

      {/* Reviews Modal */}
      {showReviewsModal && selectedProviderReviews && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                Reviews for {selectedProviderReviews.provider_name}
              </h3>
              <button
                onClick={closeReviewsModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <span style={{ fontSize: '24px', color: '#ffc107' }}>⭐</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {selectedProviderReviews.rating}/5
                </span>
                <span style={{ color: '#666' }}>
                  ({selectedProviderReviews.total_ratings} ratings, {selectedProviderReviews.total_reviews} reviews)
                </span>
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                ✅ {selectedProviderReviews.completed_bookings} completed bookings
              </div>
            </div>

            {reviewsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Loading reviews...
              </div>
            ) : (() => {
              const reviewsWithText = providerReviews.filter(review => review.review && review.review.trim());

              if (reviewsWithText.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
                    <h4>No written reviews yet</h4>
                    <p>
                      {providerReviews.length === 0
                        ? "This provider hasn't received any ratings yet."
                        : `This provider has ${providerReviews.length} star rating${providerReviews.length !== 1 ? 's' : ''} but no written reviews yet.`
                      }
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {reviewsWithText.map((review, index) => (
                  <div
                    key={review.id || index}
                    style={{
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      padding: '15px',
                      background: '#fafafa'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} style={{ color: i < review.rating ? '#ffc107' : '#ddd' }}>⭐</span>
                          ))}
                          <span style={{ marginLeft: '5px', fontWeight: 'bold' }}>
                            {review.rating}/5
                          </span>
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          By {review.customer}
                        </div>
                      </div>
                      <div style={{ color: '#999', fontSize: '0.8rem' }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      background: 'white',
                      borderRadius: '8px',
                      fontStyle: 'italic',
                      color: '#555',
                      lineHeight: 1.5
                    }}>
                      "{review.review}"
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={closeReviewsModal}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#667eea',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
