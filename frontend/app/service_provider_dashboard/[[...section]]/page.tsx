"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ServiceProviderSidebar from "../../components/ServiceProviderSidebar";

interface User {
  id: string;
  username: string;
  user_type: string;
  role: string;
  is_active: boolean;
  registered_services: string[];
  statistics?: {
    total_bookings: number;
    completed_bookings: number;
    active_bookings: number;
    total_earnings: number;
    completion_rate: number;
  };
}

interface DashboardStats {
  pending_requests_count: number;
  active_bookings_count: number;
  completed_bookings_count: number;
  total_bookings_count: number;
  completion_rate: number;
  registered_services_count: number;
  recent_activity: any[];
  average_rating?: number;
  total_reviews?: number;
}

interface Booking {
  id: string;
  customer: string;
  provider?: string;
  subcategory: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: {
      id: string;
      name: string;
      description: string;
    };
  };
  booking_date: string;
  service_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  notes: string;
  address: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to extract service names from multi-service bookings
const getServiceDisplayName = (booking: any) => {
  const notesText = booking.notes || '';
  const servicesMatch = notesText.match(/Services included: ([^\n\r]+)/);
  const serviceCount = notesText.match(/Total services: (\d+)/);

  if (servicesMatch && serviceCount && parseInt(serviceCount[1]) > 1) {
    // Multi-service booking - show all services
    return servicesMatch[1];
  } else {
    // Single service booking - show subcategory name
    return booking.subcategory?.name || 'Service Request';
  }
};

// Helper function to get service count
const getServiceCount = (booking: any) => {
  const notesText = booking.notes || '';
  const serviceCount = notesText.match(/Total services: (\d+)/);
  return serviceCount ? parseInt(serviceCount[1]) : 1;
};

// Helper function to check if booking is multi-service
const isMultiServiceBooking = (booking: any) => {
  const notesText = booking.notes || '';
  const serviceCount = notesText.match(/Total services: (\d+)/);
  return serviceCount && parseInt(serviceCount[1]) > 1;
};

// Helper function to get services list
const getServicesList = (booking: any) => {
  const notesText = booking.notes || '';
  const servicesMatch = notesText.match(/Services included: ([^\n\r]+)/);
  return servicesMatch ? servicesMatch[1].split(', ') : [];
};

// Helper function to parse booking notes (same as end user dashboard)
const parseBookingNotes = (notes: string) => {
  const result = {
    isMultiService: false,
    serviceCount: 1,
    servicesList: [] as string[],
    description: '',
    address: '',
    timeSlot: ''
  };

  if (!notes) return result;



  // Check for multi-service booking
  const servicesMatch = notes.match(/Services included: ([^\n\r]+)/);
  const serviceCountMatch = notes.match(/Total services: (\d+)/);

  if (servicesMatch && serviceCountMatch) {
    const serviceCount = parseInt(serviceCountMatch[1]);
    result.isMultiService = serviceCount > 1; // Only multi if more than 1 service
    result.serviceCount = serviceCount;
    result.servicesList = servicesMatch[1].split(', ').map(s => s.trim());
  } else {
    // Check for cart-based multi-service booking format
    const cartMatch = notes.match(/Multi-service booking with (\d+) services/);
    if (cartMatch) {
      const serviceCount = parseInt(cartMatch[1]);
      result.isMultiService = serviceCount > 1; // Only multi if more than 1 service
      result.serviceCount = serviceCount;
    }
  }

  // Extract description
  const descriptionMatch = notes.match(/Description: ([^\n\r]+)/);
  if (descriptionMatch) {
    result.description = descriptionMatch[1].trim();
  }

  // Extract address - try multiple patterns
  let addressMatch = notes.match(/Address: ([^\n\r]+)/);
  if (!addressMatch) {
    // Try alternative patterns
    addressMatch = notes.match(/address: ([^\n\r]+)/i);
  }
  if (!addressMatch) {
    // Try to find address in different format
    addressMatch = notes.match(/Service Address: ([^\n\r]+)/);
  }
  if (!addressMatch) {
    // Try to find address at the end of notes (common pattern)
    addressMatch = notes.match(/Address:\s*([^,\n\r]+?)(?:\s+Description:|$)/);
  }
  if (addressMatch) {
    result.address = addressMatch[1].trim();
  }

  // Extract time slot - try multiple patterns including time ranges
  let timeMatch = notes.match(/Time Slot: ([^\n\r]+)/);
  if (!timeMatch) {
    timeMatch = notes.match(/time slot: ([^\n\r]+)/i);
  }
  if (!timeMatch) {
    // Look for time ranges like "3pm-6pm", "3:00pm-6:00pm", "3 PM - 6 PM"
    timeMatch = notes.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*[-–]\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  }
  if (!timeMatch) {
    // Look for single times like "at 11:32 PM"
    timeMatch = notes.match(/at (\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  }
  if (!timeMatch) {
    // Look for any time format
    timeMatch = notes.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  }
  if (!timeMatch) {
    // Look for simple time formats like "3pm", "6am"
    timeMatch = notes.match(/(\d{1,2}\s*(?:am|pm))/i);
  }
  if (timeMatch) {
    result.timeSlot = timeMatch[1].trim();
  }

  return result;
};

export default function ProviderDashboardCatchAll() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userPermissions, setUserPermissions] = useState<{[key: string]: boolean}>({});
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  const subsection = Array.isArray(params.section) ? params.section[1] : undefined;

  // Function to load user permissions
  const loadUserPermissions = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setPermissionsLoading(false);
      return;
    }

    try {
      console.log('🔐 Loading Service Provider permissions...');
      const response = await fetch("http://localhost:8000/api/user/permissions/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const permissionData = await response.json();
        const flatPermissions = permissionData.flat_permissions || {};
        console.log('✅ Service Provider permissions loaded:', flatPermissions);
        setUserPermissions(flatPermissions);
      } else {
        console.error('❌ Failed to load permissions');
        // Set default permissions for Service Providers if API fails
        const fallbackPermissions = {
          'view_own_profile': true,
          'edit_own_profile': true,
          'view_booking_requests': true,
          'accept_booking_requests': true,
          'view_active_bookings': true,
          'manage_availability': true
        };
        setUserPermissions(fallbackPermissions);
      }
    } catch (error) {
      console.error('💥 Error loading permissions:', error);
      // Set fallback permissions
      const fallbackPermissions = {
        'view_own_profile': true,
        'edit_own_profile': true,
        'view_booking_requests': true,
        'accept_booking_requests': true,
        'view_active_bookings': true,
        'manage_availability': true
      };
      setUserPermissions(fallbackPermissions);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Function to check if user has a specific permission
  const hasPermission = (permissionCode: string): boolean => {
    return userPermissions[permissionCode] === true;
  };

  // Fetch notifications
  const fetchNotifications = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/bookings/provider/requests/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Create notifications for new requests
        const newNotifications = data.slice(0, 5).map((request: any) => ({
          id: request.id,
          type: 'new_request',
          title: 'New Booking Request',
          message: `New request for ${getServiceDisplayName(request)} from ${request.customer}`,
          time: new Date(request.created_at).toLocaleTimeString(),
          isRead: false
        }));
        setNotifications(newNotifications);
      })
      .catch(() => {
        // Handle error silently
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:8000/api/auth/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: User) => {
        // Redirect if not a service provider
        if (data.user_type !== "Service Provider") {
          if (data.user_type === "End User") {
            router.push("/end_user_dashboard");
          } else if (data.user_type === "Platform Provider" || data.user_type === "Admin") {
            router.push("/platform_provider_dashboard");
          }
          return;
        }
        setUser(data);
        setLoading(false);

        // Load user permissions after user data is loaded
        loadUserPermissions();

        // Start fetching notifications
        fetchNotifications();
        // Set up periodic notification fetching
        const notificationInterval = setInterval(fetchNotifications, 30000); // Every 30 seconds

        return () => clearInterval(notificationInterval);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <h3 style={{ margin: "0", color: "#333" }}>Loading your dashboard...</h3>
        </div>
      </div>
    );
  }
  if (!user) return null;

  // Permission Denied Message Component
  const PermissionDeniedMessage = ({ feature, permission, description }: {
    feature: string;
    permission: string;
    description: string;
  }) => (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '60px 40px',
        boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)',
        border: '2px solid #ffeaa7'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '24px'
        }}>🔒</div>

        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#2c3e50',
          marginBottom: '16px'
        }}>
          Access Denied
        </h2>

        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: '#e17055',
          marginBottom: '20px'
        }}>
          You don't have permission to access {feature}
        </h3>

        <p style={{
          fontSize: '1rem',
          color: '#636e72',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          {description}
        </p>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: '#636e72',
            margin: '0',
            fontWeight: '500'
          }}>
            <strong>Required Permission:</strong> {permission}
          </p>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: '#74b9ff',
          margin: '0',
          fontStyle: 'italic'
        }}>
          Contact your administrator to request access to this feature.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <ServiceProviderSidebar userPermissions={userPermissions} />
      <main style={{
        flex: 1,
        marginLeft: "260px",
        padding: "20px 24px",
        background: "#f8f9fa",
        minHeight: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        maxWidth: "calc(100vw - 260px)"
      }}>
        {/* Notification Bell */}
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          background: 'white',
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setShowNotifications(!showNotifications)}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        >
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            {notifications.length > 0 && (
              <div style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {notifications.length}
              </div>
            )}
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div style={{
            position: 'fixed',
            top: 90,
            right: 20,
            width: 350,
            maxHeight: 400,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e9ecef',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Notifications</h4>
            </div>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔕</div>
                  <p style={{ margin: 0 }}>No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8f9fa',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                  }}
                  onClick={() => {
                    router.push('/service_provider_dashboard/requests');
                    setShowNotifications(false);
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        width: 8,
                        height: 8,
                        marginTop: 6,
                        flexShrink: 0
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#2c3e50' }}>
                          {notification.title}
                        </h5>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6c757d', lineHeight: 1.4 }}>
                          {notification.message}
                        </p>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid #e9ecef',
                textAlign: 'center'
              }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    router.push('/service_provider_dashboard/requests');
                    setShowNotifications(false);
                  }}
                >
                  View All Requests
                </button>
              </div>
            )}
          </div>
        )}
        {/* Home page for service providers */}
        {!section && <ServiceProviderHome user={user} />}

        {/* Profile section */}
        {section === "profile" && !subsection && <ProfileSection user={user} hasPermission={hasPermission} />}

        {/* Profile Edit section */}
        {section === "profile" && subsection === "edit" && <ServiceProviderProfile user={user} hasPermission={hasPermission} />}

        {/* Incoming requests section */}
        {section === "requests" && (
          hasPermission('view_booking_requests') ? (
            <IncomingRequests
              user={user}
              hasPermission={hasPermission}
              setSelectedInvoice={setSelectedInvoice}
              setShowInvoiceModal={setShowInvoiceModal}
            />
          ) : (
            <PermissionDeniedMessage
              feature="Booking Requests"
              permission="view_booking_requests"
              description="You need permission to view incoming booking requests from customers."
            />
          )
        )}

        {/* Services section */}
        {section === "services" && (
          hasPermission('register_for_services') ? (
            <ServicesSection user={user} />
          ) : (
            <PermissionDeniedMessage
              feature="Service Management"
              permission="register_for_services"
              description="You need permission to manage the services you provide."
            />
          )
        )}

        {/* Active bookings section */}
        {section === "active" && (
          hasPermission('view_active_bookings') ? (
            <ActiveBookings
              user={user}
              setSelectedInvoice={setSelectedInvoice}
              setShowInvoiceModal={setShowInvoiceModal}
            />
          ) : (
            <PermissionDeniedMessage
              feature="Active Bookings"
              permission="view_active_bookings"
              description="You need permission to view your active and confirmed bookings."
            />
          )
        )}

        {/* Previous bookings section */}
        {section === "previous" && (
          hasPermission('view_previous_bookings') ? (
            <PreviousBookings user={user} />
          ) : (
            <PermissionDeniedMessage
              feature="Previous Bookings"
              permission="view_previous_bookings"
              description="You need permission to view your completed and cancelled bookings."
            />
          )
        )}

        {/* Ratings section */}
        {section === "ratings" && (
          hasPermission('view_own_ratings') ? (
            <ProviderRatings user={user} />
          ) : (
            <PermissionDeniedMessage
              feature="Ratings & Reviews"
              permission="view_own_ratings"
              description="You need permission to view ratings and reviews from customers."
            />
          )
        )}

        {/* Availability section */}
        {section === "availability" && (
          hasPermission('manage_availability') ? (
            <AvailabilityManagement user={user} />
          ) : (
            <PermissionDeniedMessage
              feature="Availability Management"
              permission="manage_availability"
              description="You need permission to manage your availability slots and off days."
            />
          )
        )}

        {/* Earnings section */}
        {section === "earnings" && (
          hasPermission('view_earnings') ? (
            <EarningsSection user={user} />
          ) : (
            <PermissionDeniedMessage
              feature="Earnings & Analytics"
              permission="view_earnings"
              description="You need permission to view your earnings and financial analytics."
            />
          )
        )}

        {/* Default service provider dashboard */}
        {section && !["requests", "services", "active", "previous", "earnings"].includes(section) && <ServiceProviderDashboard user={user} />}
      </main>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '0',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              padding: '30px',
              borderRadius: '20px 20px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowInvoiceModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>
                  📄 Service Invoice
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
                  Booking ID: #{selectedInvoice.id}
                </p>
              </div>
            </div>

            {/* Invoice Content */}
            <div style={{ padding: '30px' }}>
              {/* Customer Info */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '18px' }}>
                  👤 Customer Information
                </h3>
                <div style={{ fontSize: '16px', color: '#495057' }}>
                  <strong>{selectedInvoice.customer || 'Customer Name'}</strong>
                </div>
              </div>

              {/* Service Details */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '18px' }}>
                  🛍️ Service Details
                </h3>

                {isMultiServiceBooking(selectedInvoice) ? (
                  <div>
                    <div style={{
                      background: '#28a745',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'inline-block',
                      marginBottom: '16px'
                    }}>
                      {getServiceCount(selectedInvoice)} Services
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {getServicesList(selectedInvoice).map((service: string, index: number) => (
                        <div key={index} style={{
                          background: 'white',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          fontSize: '15px',
                          color: '#495057',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            background: '#28a745',
                            color: 'white',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700
                          }}>
                            {index + 1}
                          </span>
                          {service.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    fontSize: '16px',
                    color: '#495057'
                  }}>
                    {selectedInvoice.subcategory?.name || 'Service Request'}
                  </div>
                )}
              </div>

              {/* Booking Information */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '18px' }}>
                  📅 Booking Information
                </h3>
                <div style={{ display: 'grid', gap: '12px', fontSize: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Service Date:</span>
                    <span style={{ fontWeight: '600', color: '#495057' }}>
                      {new Date(selectedInvoice.service_date).toLocaleDateString()} at {(() => {
                        // Smart time extraction for invoice
                        const serviceDate = new Date(selectedInvoice.service_date);
                        const hours = serviceDate.getHours();
                        const minutes = serviceDate.getMinutes();

                        // If service_date has meaningful time (not just 00:00), use it
                        if (hours !== 0 || minutes !== 0) {
                          return serviceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        } else {
                          // Try to extract time from notes using enhanced parser
                          const bookingData = parseBookingNotes(selectedInvoice.notes || '');
                          return bookingData.timeSlot || 'Not specified';
                        }
                      })()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Status:</span>
                    <span style={{
                      fontWeight: '600',
                      color: selectedInvoice.status === 'completed' ? '#28a745' :
                             selectedInvoice.status === 'accepted' ? '#007bff' :
                             selectedInvoice.status === 'cancelled' ? '#dc3545' : '#ffc107',
                      textTransform: 'capitalize'
                    }}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Booking Date:</span>
                    <span style={{ fontWeight: '600', color: '#495057' }}>
                      {new Date(selectedInvoice.booking_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                borderRadius: '12px',
                padding: '24px',
                color: 'white',
                marginBottom: '24px'
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>
                  💰 Payment Summary
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '4px' }}>
                      Total Amount
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>
                      ${selectedInvoice.total_price}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                      Payment Status
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {selectedInvoice.payment_status || 'Pending'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🖨️ Print Invoice
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function ServiceProviderDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, margin: '40px auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Welcome back, {user.username}!</h2>
      <p style={{ marginBottom: 24 }}>This is your service provider dashboard.</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#28a745', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/service_provider_dashboard/requests')}>View Requests</button>
        <button style={{ padding: '10px 24px', borderRadius: 8, background: '#17a2b8', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/service_provider_dashboard/services')}>Manage Services</button>
      </div>
    </div>
  );
}

function ServiceProviderHome({ user }: { user: User }) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/analytics/provider/dashboard/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 60,
        maxWidth: 1200,
        margin: '0 auto',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>⏳</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 16, color: '#667eea' }}>
          Welcome back, {user.username}!
        </h2>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Compact Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 20,
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          margin: '0 0 8px 0'
        }}>Welcome back, {user.username}! 👋</h1>
        <p style={{
          margin: 0,
          opacity: 0.9,
          fontSize: '0.95rem'
        }}>Manage your services and track performance</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 20
      }}>


        {/* Pending Requests */}
        <div style={{
          background: 'white',
          padding: '18px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => router.push('/service_provider_dashboard/requests')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '20px', color: '#e74c3c', fontWeight: 700 }}>
                {stats?.pending_requests_count || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                Pending Requests
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>📥</div>
          </div>
        </div>

        {/* Active Bookings */}
        <div style={{
          background: 'white',
          padding: '18px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => router.push('/service_provider_dashboard/active')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '20px', color: '#27ae60', fontWeight: 700 }}>
                {stats?.active_bookings_count || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                Active Bookings
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>🟢</div>
          </div>
        </div>

        {/* Completed Jobs */}
        <div style={{
          background: 'white',
          padding: '18px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => router.push('/service_provider_dashboard/previous')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '20px', color: '#3498db', fontWeight: 700 }}>
                {stats?.completed_bookings_count || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                Completed Jobs
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>✅</div>
          </div>
        </div>

        {/* Your Rating */}
        <div style={{
          background: 'white',
          padding: '18px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => router.push('/service_provider_dashboard/ratings')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '20px', color: '#f39c12', fontWeight: 700 }}>
                {stats?.average_rating ? `${stats.average_rating}/5` : 'N/A'}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                Your Rating
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>⭐</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 40,
        margin: '40px 0',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h3 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ⚡ Quick Actions
            </h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '1rem' }}>
              Access your most important tools instantly
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <button
              style={{
                padding: '24px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => router.push('/service_provider_dashboard/services')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 16,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>🔧</div>
                <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.2rem' }}>Manage Services</div>
                <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.4 }}>Add or update your service offerings and availability</div>
              </div>
            </button>

            <button
              style={{
                padding: '24px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => router.push('/service_provider_dashboard/earnings')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(240, 147, 251, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 16,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>💰</div>
                <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.2rem' }}>View Earnings</div>
                <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.4 }}>Detailed earnings analytics and performance metrics</div>
              </div>
            </button>

            <button
              style={{
                padding: '24px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => router.push('/service_provider_dashboard/requests')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(79, 172, 254, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(79, 172, 254, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: 16,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>📥</div>
                <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '1.2rem' }}>View Requests</div>
                <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.4 }}>Check and manage incoming booking requests</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncomingRequests({ user, hasPermission, setSelectedInvoice, setShowInvoiceModal }: {
  user: User;
  hasPermission?: (permissionCode: string) => boolean;
  setSelectedInvoice: (invoice: any) => void;
  setShowInvoiceModal: (show: boolean) => void;
}) {
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/bookings/provider/requests/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (bookingId: string) => {
    console.log(`Attempting to accept booking ID: ${bookingId}`);
    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log(`Accept response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Accept response data:', data);
        alert('✅ Request accepted successfully!');
        fetchRequests(); // Refresh the list
      } else {
        const errorText = await response.text();
        console.error('Accept failed:', errorText);

        try {
          const error = JSON.parse(errorText);
          alert(`❌ Failed to accept request: ${error.error || error.detail || 'Unknown error'}`);
        } catch {
          alert(`❌ Failed to accept request: ${errorText || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/decline/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        alert('Request declined');
        fetchRequests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to decline request');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Incoming Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#2c3e50' }}>Incoming Requests</h2>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No incoming requests</h3>
            <p style={{ margin: 0 }}>New booking requests will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {requests.map((request) => (
              <div key={request.id} style={{
                border: '1px solid #e9ecef',
                borderRadius: 12,
                padding: 20,
                background: '#f8f9fa',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    {isMultiServiceBooking(request) ? (
                      <div>
                        {/* Multi-Service Heading */}
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          marginBottom: '12px',
                          textAlign: 'center'
                        }}>
                          <h4 style={{
                            margin: '0',
                            fontSize: '16px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}>
                            🛍️ Multi-Service Request
                          </h4>
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '12px',
                            opacity: 0.9
                          }}>
                            {getServiceCount(request)} Services Requested
                          </p>
                        </div>

                        {/* Services List */}
                        <div style={{ marginBottom: '12px' }}>
                          <h5 style={{
                            margin: '0 0 8px 0',
                            color: '#495057',
                            fontSize: '14px',
                            fontWeight: 600
                          }}>
                            📋 Services Requested:
                          </h5>
                          <div style={{ display: 'grid', gap: '6px' }}>
                            {getServicesList(request).map((service: string, index: number) => (
                              <div key={index} style={{
                                background: '#f8f9fa',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef',
                                fontSize: '13px',
                                color: '#495057',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  background: '#667eea',
                                  color: 'white',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 700
                                }}>
                                  {index + 1}
                                </span>
                                <span style={{ fontWeight: 600 }}>
                                  {service.trim()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>
                        🔧 {getServiceDisplayName(request)}
                      </h4>
                    )}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6c757d' }}>
                      <span><strong>Customer:</strong> {request.customer}</span>
                      <span><strong>Service Date:</strong> {new Date(request.service_date).toLocaleDateString()}</span>
                      <span><strong>Time Slot:</strong> {(() => {
                        // Smart time extraction - try service_date first, then notes
                        const serviceDate = new Date(request.service_date);
                        const hours = serviceDate.getHours();
                        const minutes = serviceDate.getMinutes();

                        // If service_date has meaningful time (not just 00:00), use it
                        if (hours !== 0 || minutes !== 0) {
                          return serviceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        } else {
                          // Try to extract time from notes using enhanced parser
                          const bookingData = parseBookingNotes(request.notes || '');
                          return bookingData.timeSlot || 'Not specified';
                        }
                      })()}</span>
                      <span><strong>Price:</strong> ${request.total_price}</span>
                    </div>
                  </div>
                  <div style={{
                    background: '#e74c3c',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {request.status.toUpperCase()}
                  </div>
                </div>

                {(() => {
                  const bookingData = parseBookingNotes(request.notes || '');
                  let address = bookingData.address || request.address || (request as any).service_address || (request as any).customer_address;

                  // If no address found, try to extract from notes directly
                  if (!address && request.notes) {
                    const directMatch = request.notes.match(/([^,\n\r]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|place|pl|court|ct|way|circle|cir)[^,\n\r]*)/i);
                    if (directMatch) {
                      address = directMatch[1].trim();
                    }
                  }

                  return address && address !== 'No address provided' ? (
                    <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                      <strong style={{ color: '#495057' }}>📍 Service Address:</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{address}</p>
                    </div>
                  ) : null;
                })()}

                {request.notes && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                    <strong style={{ color: '#495057' }}>📝 Notes:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{request.notes}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {/* Invoice button */}
                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                    onClick={() => {
                      setSelectedInvoice(request);
                      setShowInvoiceModal(true);
                    }}
                  >
                    📄 View Invoice
                  </button>

                  {/* Decline button - Check decline_booking_requests permission */}
                  {hasPermission && hasPermission('decline_booking_requests') ? (
                    <button
                      style={{
                        padding: '10px 20px',
                        borderRadius: 6,
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        cursor: actionLoading === request.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: actionLoading === request.id ? 0.6 : 1
                      }}
                      onClick={() => handleDecline(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? 'Processing...' : 'Decline'}
                    </button>
                  ) : (
                    <button
                      style={{
                        padding: '10px 20px',
                        borderRadius: 6,
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        cursor: 'not-allowed',
                        fontSize: '14px',
                        opacity: 0.6
                      }}
                      disabled
                      title="You don't have permission to decline requests"
                    >
                      🔒 Decline
                    </button>
                  )}

                  {/* Accept button - Check accept_booking_requests permission */}
                  {hasPermission && hasPermission('accept_booking_requests') ? (
                    <button
                      style={{
                        padding: '10px 20px',
                        borderRadius: 6,
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        cursor: actionLoading === request.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: actionLoading === request.id ? 0.6 : 1
                      }}
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? 'Processing...' : 'Accept'}
                    </button>
                  ) : (
                    <button
                      style={{
                        padding: '10px 20px',
                        borderRadius: 6,
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        cursor: 'not-allowed',
                        fontSize: '14px',
                        opacity: 0.6
                      }}
                      disabled
                      title="You don't have permission to accept requests"
                    >
                      🔒 Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditServiceForm({ service, onUpdate, onCancel, loading }: {
  service: any;
  onUpdate: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [providerPrice, setProviderPrice] = useState(service.provider_price?.toString() || service.price?.toString() || '');
  const [description, setDescription] = useState(service.provider_description || '');
  const [isAvailable, setIsAvailable] = useState(service.is_available !== undefined ? service.is_available : true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!providerPrice || isNaN(Number(providerPrice))) {
      alert('Please enter a valid price');
      return;
    }

    if (Number(providerPrice) <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a service description');
      return;
    }

    onUpdate({
      provider_price: Number(providerPrice),
      description: description.trim(),
      is_available: isAvailable
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
          Your Price (₹)
        </label>
        <input
          type="number"
          value={providerPrice}
          onChange={(e) => setProviderPrice(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: '1px solid #e9ecef',
            fontSize: '16px'
          }}
          placeholder="Enter your price"
          min="1"
          step="0.01"
          required
        />
        {service.base_price && (
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
            Base price: ₹{service.base_price}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#2c3e50' }}>
          Service Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: '1px solid #e9ecef',
            fontSize: '14px',
            minHeight: '80px',
            resize: 'vertical'
          }}
          placeholder="Describe your service offering..."
          required
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ fontWeight: 600, color: '#2c3e50' }}>
            Currently accepting bookings for this service
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            background: '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            background: loading ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
          disabled={loading}
        >
          {loading ? '⏳ Updating...' : '✅ Update Service'}
        </button>
      </div>
    </form>
  );
}

function ServicesSection({ user }: { user: User }) {
  const [registeredServices, setRegisteredServices] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const fetchServices = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Fetch registered services, available services, and categories
    Promise.all([
      fetch("http://localhost:8000/api/services/provider/registered/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:8000/api/services/subcategories/"),  // No auth needed for public endpoints
      fetch("http://localhost:8000/api/services/categories/")      // No auth needed for public endpoints
    ])
      .then(([registeredRes, availableRes, categoriesRes]) => {
        // Check if responses are ok
        if (!registeredRes.ok) {
          console.error('Failed to fetch registered services:', registeredRes.status);
        }
        if (!availableRes.ok) {
          console.error('Failed to fetch available services:', availableRes.status);
        }
        if (!categoriesRes.ok) {
          console.error('Failed to fetch categories:', categoriesRes.status);
        }

        return Promise.all([
          registeredRes.ok ? registeredRes.json() : [],
          availableRes.ok ? availableRes.json() : [],
          categoriesRes.ok ? categoriesRes.json() : []
        ]);
      })
      .then(([registeredData, availableData, categoriesData]) => {
        console.log('🔧 Service Provider - Fetched data:', {
          registeredData: registeredData?.length ? `${registeredData.length} registered` : registeredData,
          availableData: availableData?.length ? `${availableData.length} available services` : availableData,
          categoriesData: categoriesData?.length ? `${categoriesData.length} categories` : categoriesData
        });

        // Log sample service to check structure
        if (availableData && availableData.length > 0) {
          console.log('🔧 Sample available service:', availableData[0]);
        }

        if (registeredData && registeredData.length > 0) {
          console.log('🔧 Sample registered service:', registeredData[0]);
        }

        setRegisteredServices(Array.isArray(registeredData) ? registeredData : []);
        setAvailableServices(Array.isArray(availableData) ? availableData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching services:', error);
        setRegisteredServices([]);
        setAvailableServices([]);
        setCategories([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleRegisterService = async (serviceId: string, serviceName: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Get the base price for the service to suggest a provider price
    const selectedService = availableServices?.find(s => s.id.toString() === serviceId);
    const basePrice = selectedService?.price || 0;
    const suggestedPrice = basePrice + 50; // Suggest base price + ₹50

    // Prompt for custom pricing
    const priceInput = prompt(
      `Set your price for "${serviceName}"\n\nBase price: ₹${basePrice}\nSuggested price: ₹${suggestedPrice}\n\nEnter your price:`,
      suggestedPrice.toString()
    );

    if (!priceInput || isNaN(Number(priceInput))) {
      alert('Please enter a valid price');
      return;
    }

    const providerPrice = Number(priceInput);
    if (providerPrice <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    // Prompt for service description
    const description = prompt(
      `Add a description for your "${serviceName}" service:\n\n(This helps customers choose you)`,
      `Professional ${serviceName.toLowerCase()} service with quality guarantee`
    );

    if (!description || description.trim() === '') {
      alert('Please provide a service description');
      return;
    }

    setActionLoading(serviceId);

    try {
      const response = await fetch("http://localhost:8000/api/marketplace/register-service/", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: parseInt(serviceId),
          provider_price: providerPrice,
          description: description.trim(),
          is_available: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Show success message with pricing info
        const successMessage = `✅ Successfully registered for "${serviceName}"!\n\n💰 Your price: ₹${providerPrice}\n📋 Base price: ₹${basePrice}\n\nYou will now receive direct booking requests for this service.`;
        alert(successMessage);
        fetchServices();
        setShowAddModal(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to register for service');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnregisterService = async (serviceId: string, serviceName: string) => {
    // Confirm before removing
    const confirmMessage = `Are you sure you want to remove "${serviceName}" from your services?\n\nYou will no longer receive booking requests for this service.`;
    if (!confirm(confirmMessage)) return;

    setActionLoading(serviceId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://localhost:8000/api/services/provider/unregister/", {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ service_id: serviceId })
      });

      if (response.ok) {
        const successMessage = `✅ Successfully removed "${serviceName}" from your services.`;
        alert(successMessage);
        fetchServices();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to unregister from service');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setShowEditModal(true);
  };

  const handleUpdateService = async (updatedData: any) => {
    const token = localStorage.getItem("access_token");
    if (!token || !editingService) return;

    setActionLoading(editingService.id);

    try {
      // Use the registration_id for the API call
      const registrationId = editingService.registration_id;

      if (!registrationId) {
        alert('Registration ID not found. Please refresh and try again.');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/marketplace/service-registration/${registrationId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Service updated successfully!\n\n💰 New price: ₹${data.service.provider_price}\n📋 Available: ${data.service.is_available ? 'Yes' : 'No'}`);
        fetchServices();
        setShowEditModal(false);
        setEditingService(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update service');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter available services based on search and category
  const filteredAvailableServices = (availableServices || []).filter(service => {
    const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
    const isNotRegistered = !registeredServiceIds.includes(service.id);
    const matchesSearch = !searchTerm ||
                         service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           service.category?.id === selectedCategory ||
                           service.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase());

    return isNotRegistered && matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>My Services</h2>
        <p>Loading services...</p>
      </div>
    );
  }

  const registeredServiceIds = registeredServices.map(service => service.id);
  const unregisteredServices = availableServices.filter(service => !registeredServiceIds.includes(service.id));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#2c3e50' }}>My Registered Services</h2>
          <button
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
            onClick={() => setShowAddModal(true)}
          >
            + Add Service
          </button>
        </div>

        {registeredServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: '#6c757d' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 20px',
              color: 'white'
            }}>🔧</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: '#2c3e50' }}>No services registered yet</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '1rem' }}>
              Register for services to start receiving booking requests from customers.<br/>
              <strong>Only registered services will show incoming requests.</strong>
            </p>
            <button
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
              onClick={() => setShowAddModal(true)}
            >
              + Register Your First Service
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 20,
              border: '1px solid #d4edda'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#155724', fontSize: '16px' }}>
                    You're registered for {registeredServices.length} service{registeredServices.length !== 1 ? 's' : ''}
                  </h4>
                  <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>
                    You will receive booking requests only for these services
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {registeredServices.map((service) => (
                <div key={service.id} style={{
                  border: '1px solid #e9ecef',
                  borderRadius: 16,
                  padding: 24,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          color: 'white'
                        }}>🔧</div>
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.3rem', fontWeight: 700 }}>
                            {service.name}
                          </h4>
                          <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: 15,
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-block'
                          }}>
                            {service.category.name}
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 12px 0', color: '#6c757d', fontSize: '14px', lineHeight: 1.6 }}>
                        {service.description}
                      </p>
                      {service.provider_description && (
                        <div style={{
                          background: '#f8f9fa',
                          padding: '12px',
                          borderRadius: 8,
                          marginBottom: '16px',
                          border: '1px solid #e9ecef'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d', marginBottom: '4px' }}>
                            Your Service Description:
                          </div>
                          <div style={{ fontSize: '14px', color: '#495057' }}>
                            {service.provider_description}
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          padding: '12px 16px',
                          borderRadius: 10,
                          color: 'white'
                        }}>
                          <div style={{ fontSize: '12px', opacity: 0.9 }}>Your Price</div>
                          <span style={{ fontSize: '18px', fontWeight: 700 }}>
                            ₹{service.provider_price || service.price}
                          </span>
                        </div>
                        {service.provider_price && service.base_price && service.provider_price !== service.base_price && (
                          <div style={{
                            background: '#f8f9fa',
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: '1px solid #e9ecef'
                          }}>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>Base Price</div>
                            <span style={{ fontSize: '16px', fontWeight: 600, color: '#6c757d' }}>
                              ₹{service.base_price}
                            </span>
                          </div>
                        )}
                        {service.is_available !== undefined && (
                          <div style={{
                            background: service.is_available ? '#d4edda' : '#f8d7da',
                            color: service.is_available ? '#155724' : '#721c24',
                            padding: '8px 12px',
                            borderRadius: 20,
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {service.is_available ? '✅ Available' : '❌ Unavailable'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginLeft: '24px' }}>
                      <button
                        style={{
                          padding: '12px 20px',
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => handleEditService(service)}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 123, 255, 0.4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={{
                          padding: '12px 20px',
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: actionLoading === service.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                          opacity: actionLoading === service.id ? 0.6 : 1,
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => handleUnregisterService(service.id, service.name)}
                        disabled={actionLoading === service.id}
                        onMouseEnter={e => {
                          if (actionLoading !== service.id) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 15px rgba(220, 53, 69, 0.4)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (actionLoading !== service.id) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {actionLoading === service.id ? '⏳ Removing...' : '🗑️ Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Add Service Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 0,
            maxWidth: 800,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px 32px',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800 }}>🔧 Add New Service</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                    Choose from {filteredAvailableServices?.length || 0} available services to expand your offerings
                  </p>
                </div>
                <button
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div style={{ padding: '24px 32px 16px', borderBottom: '1px solid #e9ecef' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e9ecef',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e9ecef',
                    fontSize: '14px',
                    outline: 'none',
                    minWidth: '150px'
                  }}
                >
                  <option value="all">All Categories</option>
                  {(categories || []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                Showing {filteredAvailableServices?.length || 0} available services
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px 32px', maxHeight: 'calc(90vh - 200px)', overflow: 'auto' }}>
              {(!filteredAvailableServices || filteredAvailableServices.length === 0) ? (
                <div>
                  {searchTerm || selectedCategory !== 'all' ? (
                    // No search results - show categorized services
                    <div>
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#6c757d' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          margin: '0 auto 12px',
                          color: 'white'
                        }}>🔍</div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>No services found</h4>
                        <p style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
                          Try adjusting your search or browse all services by category below
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('all');
                            }}
                          >
                            🔄 Clear Filters
                          </button>
                        </div>
                      </div>

                      {/* Show services by category */}
                      <div style={{ marginTop: '24px' }} data-categories-section>
                        <div style={{
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          padding: '16px',
                          borderRadius: 12,
                          marginBottom: '20px',
                          border: '1px solid #e9ecef'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '16px' }}>
                            📂 Browse All Available Services
                          </h4>
                          <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                            {(() => {
                              const totalAvailable = (availableServices || []).filter(service => {
                                const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                                return !registeredServiceIds.includes(service.id);
                              }).length;
                              const totalCategories = (categories || []).filter(category => {
                                return (availableServices || []).some(service => {
                                  const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                                  return !registeredServiceIds.includes(service.id) && service.category?.id === category.id;
                                });
                              }).length;
                              return `${totalAvailable} services available across ${totalCategories} categories`;
                            })()}
                          </p>
                        </div>

                        {/* Quick Add Popular Services */}
                        {(() => {
                          const popularServices = (availableServices || [])
                            .filter(service => {
                              const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                              return !registeredServiceIds.includes(service.id);
                            })
                            .slice(0, 3); // Show first 3 as "popular"

                          if (popularServices.length === 0) return null;

                          return (
                            <div style={{ marginBottom: '24px' }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '16px',
                                borderRadius: 12,
                                marginBottom: '12px',
                                color: 'white'
                              }}>
                                <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                                  ⭐ Quick Add - Popular Services
                                </h5>
                                <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                                  Get started quickly with these commonly requested services
                                </p>
                              </div>
                              <div style={{ display: 'grid', gap: '8px' }}>
                                {popularServices.map((service) => (
                                  <div key={service.id} style={{
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                                    border: '1px solid #e9ecef',
                                    borderRadius: 8,
                                    padding: 12,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                  >
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>⭐</span>
                                        <div>
                                          <h6 style={{ margin: '0 0 2px 0', color: '#2c3e50', fontSize: '13px', fontWeight: 600 }}>
                                            {service.name}
                                          </h6>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                              background: '#e9ecef',
                                              color: '#495057',
                                              padding: '2px 6px',
                                              borderRadius: 4,
                                              fontSize: '10px',
                                              fontWeight: 600
                                            }}>
                                              {service.category?.name}
                                            </span>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#28a745' }}>
                                              ${service.price}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      style={{
                                        padding: '6px 12px',
                                        borderRadius: 6,
                                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: actionLoading === service.id ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        opacity: actionLoading === service.id ? 0.6 : 1
                                      }}
                                      onClick={() => handleRegisterService(service.id, service.name)}
                                      disabled={actionLoading === service.id}
                                    >
                                      {actionLoading === service.id ? '⏳' : '+ Quick Add'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {(() => {
                          // If no categories are loaded, group services by their category name
                          const categoriesToShow = (categories || []).length > 0 ? categories :
                            // Create categories from available services
                            Array.from(new Set((availableServices || [])
                              .filter(service => {
                                const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                                return !registeredServiceIds.includes(service.id) && service.category;
                              })
                              .map(service => service.category?.name)
                              .filter(Boolean)
                            )).map(categoryName => ({
                              id: categoryName,
                              name: categoryName
                            }));

                          return categoriesToShow.map((category) => {
                            const categoryServices = (availableServices || []).filter(service => {
                              const registeredServiceIds = (registeredServices || []).map(rs => rs.id);
                              return !registeredServiceIds.includes(service.id) &&
                                     (service.category?.id === category.id || service.category?.name === category.name);
                            });

                            if (categoryServices.length === 0) return null;

                          return (
                            <div key={category.id} style={{ marginBottom: '24px' }}>
                              <div style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                padding: '12px 16px',
                                borderRadius: 8,
                                marginBottom: '12px',
                                border: '1px solid #e9ecef'
                              }}>
                                <h5 style={{ margin: 0, color: '#2c3e50', fontSize: '14px', fontWeight: 600 }}>
                                  📂 {category.name} ({categoryServices.length} services)
                                </h5>
                              </div>
                              <div style={{ display: 'grid', gap: '12px', paddingLeft: '16px' }}>
                                {categoryServices.map((service) => (
                                  <div key={service.id} style={{
                                    border: '1px solid #e9ecef',
                                    borderRadius: 8,
                                    padding: 16,
                                    background: 'white',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <div style={{ flex: 1 }}>
                                        <h6 style={{ margin: '0 0 6px 0', color: '#2c3e50', fontSize: '14px', fontWeight: 600 }}>
                                          {service.name}
                                        </h6>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6c757d', lineHeight: 1.4 }}>
                                          {service.description}
                                        </p>
                                        <div style={{
                                          background: '#e8f5e8',
                                          padding: '4px 8px',
                                          borderRadius: 6,
                                          display: 'inline-block',
                                          border: '1px solid #d4edda'
                                        }}>
                                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#28a745' }}>
                                            ${service.price}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        style={{
                                          padding: '6px 12px',
                                          borderRadius: 6,
                                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                          color: 'white',
                                          border: 'none',
                                          cursor: actionLoading === service.id ? 'not-allowed' : 'pointer',
                                          fontSize: '12px',
                                          fontWeight: 600,
                                          opacity: actionLoading === service.id ? 0.6 : 1,
                                          marginLeft: '12px'
                                        }}
                                        onClick={() => handleRegisterService(service.id, service.name)}
                                        disabled={actionLoading === service.id}
                                      >
                                        {actionLoading === service.id ? '⏳' : '+'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        });
                        })()}
                      </div>
                    </div>
                  ) : (
                    // All services registered
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 16px',
                        color: 'white'
                      }}>✅</div>
                      <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>All Set!</h4>
                      <p style={{ margin: 0 }}>You are already registered for all available services.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {filteredAvailableServices.map((service) => (
                    <div key={service.id} style={{
                      border: '1px solid #e9ecef',
                      borderRadius: 12,
                      padding: 20,
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              color: 'white'
                            }}>🔧</div>
                            <div>
                              <h5 style={{ margin: '0 0 4px 0', color: '#2c3e50', fontSize: '1.1rem', fontWeight: 700 }}>
                                {service.name}
                              </h5>
                              <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: 10,
                                fontSize: '11px',
                                fontWeight: 600,
                                display: 'inline-block'
                              }}>
                                {service.category?.name || 'Service'}
                              </div>
                            </div>
                          </div>
                          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6c757d', lineHeight: 1.4 }}>
                            {service.description}
                          </p>
                          <div style={{
                            background: '#e8f5e8',
                            padding: '6px 10px',
                            borderRadius: 8,
                            display: 'inline-block',
                            border: '1px solid #d4edda'
                          }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#28a745' }}>
                              ${service.price}
                            </span>
                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '4px' }}>per service</span>
                          </div>
                        </div>
                        <button
                          style={{
                            padding: '10px 20px',
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: actionLoading === service.id ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            opacity: actionLoading === service.id ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                            marginLeft: '16px'
                          }}
                          onClick={() => handleRegisterService(service.id, service.name)}
                          disabled={actionLoading === service.id}
                          onMouseEnter={e => {
                            if (actionLoading !== service.id) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 15px rgba(40, 167, 69, 0.4)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (actionLoading !== service.id) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          {actionLoading === service.id ? '⏳ Adding...' : '+ Add Service'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && editingService && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem', fontWeight: 700 }}>
                ✏️ Edit Service
              </h3>
              <button
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#6c757d',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  setShowEditModal(false);
                  setEditingService(null);
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '16px',
              borderRadius: 12,
              marginBottom: '24px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.1rem' }}>
                {editingService.name}
              </h4>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 15,
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-block'
              }}>
                {editingService.category?.name}
              </div>
            </div>

            <EditServiceForm
              service={editingService}
              onUpdate={handleUpdateService}
              onCancel={() => {
                setShowEditModal(false);
                setEditingService(null);
              }}
              loading={actionLoading === editingService.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveBookings({ user, setSelectedInvoice, setShowInvoiceModal }: {
  user: User;
  setSelectedInvoice: (invoice: any) => void;
  setShowInvoiceModal: (show: boolean) => void;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);

  const fetchBookings = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/bookings/provider/?status=active", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Active bookings received:', data?.length || 0, 'bookings');
        if (data && data.length > 0) {
          console.log('Sample active booking:', data[0]);
          console.log('Booking IDs:', data.map((b: any) => b.id));
        }
        setBookings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching active bookings:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.");

    if (!confirmCancel) return;

    // Prompt for cancellation reason
    const cancellationReason = window.prompt(
      "Please provide a reason for cancellation (optional):",
      "Service provider unavailable"
    );

    // If user clicked Cancel on the prompt, don't proceed
    if (cancellationReason === null) return;

    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancellation_reason: cancellationReason || "Service provider cancelled the booking"
        })
      });

      if (response.ok) {
        alert("✅ Booking cancelled successfully!");
        fetchBookings(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to cancel booking: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert("❌ Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/status/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Booking ${newStatus} successfully!`);
        fetchBookings();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update booking');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteBooking = async (bookingId: string, paymentMethod: 'online' | 'cod') => {
    console.log('Completing booking:', { bookingId, paymentMethod });
    setActionLoading(bookingId);
    const token = localStorage.getItem("access_token");

    try {
      const url = `http://localhost:8000/api/bookings/${bookingId}/complete/`;
      console.log('API URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_method: paymentMethod })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        alert(result.message);
        fetchBookings(); // Refresh the list
        setShowPaymentModal(null);
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(error.detail || 'Failed to complete booking');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Active Bookings</h2>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#2c3e50' }}>Active Bookings</h2>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No active bookings</h3>
            <p style={{ margin: 0 }}>Accepted bookings will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{
                border: '1px solid #e9ecef',
                borderRadius: 12,
                padding: 20,
                background: booking.status === 'confirmed' ? '#e8f5e8' : '#fff3cd',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    {isMultiServiceBooking(booking) ? (
                      <div>
                        {/* Multi-Service Heading */}
                        <div style={{
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: 'white',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          marginBottom: '12px',
                          textAlign: 'center'
                        }}>
                          <h4 style={{
                            margin: '0',
                            fontSize: '16px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}>
                            🛍️ Multi-Service Booking
                          </h4>
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '12px',
                            opacity: 0.9
                          }}>
                            {getServiceCount(booking)} Services Active
                          </p>
                        </div>

                        {/* Services List */}
                        <div style={{ marginBottom: '12px' }}>
                          <h5 style={{
                            margin: '0 0 8px 0',
                            color: '#495057',
                            fontSize: '14px',
                            fontWeight: 600
                          }}>
                            📋 Services in Progress:
                          </h5>
                          <div style={{ display: 'grid', gap: '6px' }}>
                            {getServicesList(booking).map((service: string, index: number) => (
                              <div key={index} style={{
                                background: '#f8f9fa',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef',
                                fontSize: '13px',
                                color: '#495057',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  background: '#28a745',
                                  color: 'white',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 700
                                }}>
                                  {index + 1}
                                </span>
                                <span style={{ fontWeight: 600 }}>
                                  {service.trim()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>
                        🔧 {getServiceDisplayName(booking)}
                      </h4>
                    )}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6c757d' }}>
                      <span><strong>Customer:</strong> {booking.customer}</span>
                      <span><strong>Service Date:</strong> {new Date(booking.service_date).toLocaleDateString()}</span>
                      <span><strong>Time Slot:</strong> {(() => {
                        // Smart time extraction - try service_date first, then notes
                        const serviceDate = new Date(booking.service_date);
                        const hours = serviceDate.getHours();
                        const minutes = serviceDate.getMinutes();

                        // If service_date has meaningful time (not just 00:00), use it
                        if (hours !== 0 || minutes !== 0) {
                          return serviceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        } else {
                          // Try to extract time from notes using enhanced parser
                          const bookingData = parseBookingNotes(booking.notes || '');
                          return bookingData.timeSlot || 'Not specified';
                        }
                      })()}</span>
                      <span><strong>Price:</strong> ${booking.total_price}</span>
                    </div>
                  </div>
                  <div style={{
                    background: booking.status === 'confirmed' ? '#28a745' : '#ffc107',
                    color: booking.status === 'confirmed' ? 'white' : '#212529',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {booking.status.toUpperCase()}
                  </div>
                </div>

                {(() => {
                  const bookingData = parseBookingNotes(booking.notes || '');
                  let address = bookingData.address || booking.address;

                  // If no address found, try to extract from notes directly
                  if (!address && booking.notes) {
                    const directMatch = booking.notes.match(/([^,\n\r]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|place|pl|court|ct|way|circle|cir)[^,\n\r]*)/i);
                    if (directMatch) {
                      address = directMatch[1].trim();
                    }
                  }

                  return address && address !== 'No address provided' ? (
                    <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                      <strong style={{ color: '#495057' }}>📍 Service Address:</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{address}</p>
                    </div>
                  ) : null;
                })()}

                {booking.notes && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                    <strong style={{ color: '#495057' }}>📝 Notes:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{booking.notes}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {booking.status === 'accepted' && (
                    <button
                      style={{
                        padding: '10px 20px',
                        borderRadius: 6,
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        cursor: actionLoading === booking.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: actionLoading === booking.id ? 0.6 : 1
                      }}
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? 'Processing...' : 'Confirm'}
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      style={{
                        padding: '10px 20px',
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        color: 'white',
                        border: 'none',
                        cursor: actionLoading === booking.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        opacity: actionLoading === booking.id ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setShowPaymentModal(booking.id)}
                      disabled={actionLoading === booking.id}
                      onMouseEnter={e => {
                        if (actionLoading !== booking.id) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 15px rgba(40, 167, 69, 0.4)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (actionLoading !== booking.id) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {actionLoading === booking.id ? '⏳ Processing...' : '✅ Mark as Completed'}
                    </button>
                  )}
                  <button
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: actionLoading === booking.id ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      opacity: actionLoading === booking.id ? 0.6 : 1,
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={actionLoading === booking.id}
                    onMouseEnter={e => {
                      if (actionLoading !== booking.id) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(220, 53, 69, 0.4)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (actionLoading !== booking.id) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {actionLoading === booking.id ? '⏳ Cancelling...' : '❌ Cancel Booking'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 0,
            maxWidth: 500,
            width: '90%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              padding: '24px 32px',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800 }}>
                  ✅ Complete Service
                </h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                  Choose payment method to complete this booking
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px' }}>
              {(() => {
                const booking = bookings.find(b => b.id === showPaymentModal);
                if (!booking) return null;

                return (
                  <div>
                    {/* Booking Summary */}
                    <div style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      padding: '20px',
                      borderRadius: 12,
                      marginBottom: '24px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '16px' }}>
                        📋 Service Summary
                      </h4>
                      <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                        <div><strong>Service{getServiceCount(booking) > 1 ? 's' : ''}:</strong> {getServiceDisplayName(booking)}</div>
                        <div><strong>Customer:</strong> {booking.customer}</div>
                        <div><strong>Amount:</strong> <span style={{ color: '#28a745', fontWeight: 700, fontSize: '16px' }}>${booking.total_price}</span></div>
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '16px' }}>
                        💳 Payment Method
                      </h4>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {/* COD Option */}
                        <button
                          style={{
                            padding: '20px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: actionLoading === showPaymentModal ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 600,
                            opacity: actionLoading === showPaymentModal ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                            textAlign: 'left'
                          }}
                          onClick={() => handleCompleteBooking(showPaymentModal, 'cod')}
                          disabled={actionLoading === showPaymentModal}
                          onMouseEnter={e => {
                            if (actionLoading !== showPaymentModal) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.4)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (actionLoading !== showPaymentModal) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>💵</span>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                                Collect ${booking.total_price} (Cash on Delivery)
                              </div>
                              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                Payment collected in cash - mark as paid immediately
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Online Payment Option */}
                        <button
                          style={{
                            padding: '20px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: actionLoading === showPaymentModal ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 600,
                            opacity: actionLoading === showPaymentModal ? 0.6 : 1,
                            transition: 'all 0.3s ease',
                            textAlign: 'left'
                          }}
                          onClick={() => handleCompleteBooking(showPaymentModal, 'online')}
                          disabled={actionLoading === showPaymentModal}
                          onMouseEnter={e => {
                            if (actionLoading !== showPaymentModal) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 123, 255, 0.4)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (actionLoading !== showPaymentModal) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>💳</span>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                                Customer pays ${booking.total_price} online
                              </div>
                              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                Customer will receive payment link - pending until paid
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    <div style={{ textAlign: 'center' }}>
                      <button
                        style={{
                          padding: '12px 24px',
                          borderRadius: 8,
                          background: 'transparent',
                          color: '#6c757d',
                          border: '1px solid #e9ecef',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                        onClick={() => setShowPaymentModal(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviousBookings({ user }: { user: User }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/bookings/provider/?status=completed", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1000, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Previous Bookings</h2>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#2c3e50' }}>Previous Bookings</h2>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No previous bookings</h3>
            <p style={{ margin: 0 }}>Completed and cancelled bookings will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{
                border: '1px solid #e9ecef',
                borderRadius: 12,
                padding: 20,
                background: booking.status === 'completed' ? '#e8f5e8' : '#f8d7da',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    {isMultiServiceBooking(booking) ? (
                      <div>
                        {/* Multi-Service Heading */}
                        <div style={{
                          background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                          color: 'white',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          marginBottom: '12px',
                          textAlign: 'center'
                        }}>
                          <h4 style={{
                            margin: '0',
                            fontSize: '16px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}>
                            🛍️ Multi-Service Completed
                          </h4>
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '12px',
                            opacity: 0.9
                          }}>
                            {getServiceCount(booking)} Services Delivered
                          </p>
                        </div>

                        {/* Services List */}
                        <div style={{ marginBottom: '12px' }}>
                          <h5 style={{
                            margin: '0 0 8px 0',
                            color: '#495057',
                            fontSize: '14px',
                            fontWeight: 600
                          }}>
                            ✅ Services Completed:
                          </h5>
                          <div style={{ display: 'grid', gap: '6px' }}>
                            {getServicesList(booking).map((service: string, index: number) => (
                              <div key={index} style={{
                                background: '#f8f9fa',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef',
                                fontSize: '13px',
                                color: '#495057',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  background: '#28a745',
                                  color: 'white',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 700
                                }}>
                                  ✓
                                </span>
                                <span style={{ fontWeight: 600 }}>
                                  {service.trim()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>
                        ✅ {getServiceDisplayName(booking)}
                      </h4>
                    )}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6c757d' }}>
                      <span><strong>Customer:</strong> {booking.customer}</span>
                      <span><strong>Service Date:</strong> {new Date(booking.service_date).toLocaleDateString()}</span>
                      <span><strong>Time Slot:</strong> {(() => {
                        // Smart time extraction - try service_date first, then notes
                        const serviceDate = new Date(booking.service_date);
                        const hours = serviceDate.getHours();
                        const minutes = serviceDate.getMinutes();

                        // If service_date has meaningful time (not just 00:00), use it
                        if (hours !== 0 || minutes !== 0) {
                          return serviceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        } else {
                          // Try to extract time from notes using enhanced parser
                          const bookingData = parseBookingNotes(booking.notes || '');
                          return bookingData.timeSlot || 'Not specified';
                        }
                      })()}</span>
                      <span><strong>Price:</strong> ${booking.total_price}</span>
                      <span><strong>Completed:</strong> {new Date(booking.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: booking.status === 'completed' ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: booking.status === 'cancelled' && booking.cancelled_by ? '4px' : '0'
                    }}>
                      {booking.status.toUpperCase()}
                    </div>
                    {booking.status === 'cancelled' && booking.cancelled_by && (
                      <div style={{
                        fontSize: '10px',
                        color: '#6c757d',
                        fontStyle: 'italic',
                        maxWidth: '200px',
                        textAlign: 'right'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                          {booking.cancelled_by === 'customer' ? 'Customer cancelled' :
                           booking.cancelled_by === 'provider' ? 'Provider cancelled' :
                           booking.cancelled_by === 'system' ? 'Auto-cancelled (expired)' :
                           'Cancelled'}
                        </div>
                        {booking.cancellation_reason && (
                          <div style={{
                            fontSize: '9px',
                            color: '#8e8e8e',
                            lineHeight: 1.2,
                            marginTop: '2px'
                          }}>
                            {booking.cancellation_reason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {(() => {
                  const bookingData = parseBookingNotes(booking.notes || '');
                  let address = bookingData.address || booking.address;

                  // If no address found, try to extract from notes directly
                  if (!address && booking.notes) {
                    const directMatch = booking.notes.match(/([^,\n\r]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|place|pl|court|ct|way|circle|cir)[^,\n\r]*)/i);
                    if (directMatch) {
                      address = directMatch[1].trim();
                    }
                  }

                  return address && address !== 'No address provided' ? (
                    <div style={{ marginBottom: '12px', padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                      <strong style={{ color: '#495057' }}>📍 Service Address:</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{address}</p>
                    </div>
                  ) : null;
                })()}

                {booking.notes && (
                  <div style={{ padding: '12px', background: 'white', borderRadius: 8, border: '1px solid #e9ecef' }}>
                    <strong style={{ color: '#495057' }}>📝 Notes:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>{booking.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EarningsSection({ user }: { user: User }) {
  const [earnings, setEarnings] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Fetch both earnings and analytics data
    Promise.all([
      fetch("http://localhost:8000/api/analytics/provider/earnings/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:8000/api/analytics/provider/dashboard/", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ])
      .then(([earningsRes, analyticsRes]) => Promise.all([earningsRes.json(), analyticsRes.json()]))
      .then(([earningsData, analyticsData]) => {
        console.log('Earnings data received:', earningsData);
        console.log('Analytics data received:', analyticsData);
        setEarnings(earningsData);
        setAnalytics(analyticsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching earnings/analytics:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 1200, margin: '0 auto', boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Analytics & Earnings</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header with Period Selector */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 20,
        padding: 32,
        marginBottom: 24,
        color: 'white',
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              📊 Analytics & Earnings
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              Track your business performance and earnings
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['weekly', 'monthly', 'total'].map((period) => (
              <button
                key={period}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: selectedPeriod === period ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>💰</span>
            <h3 style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
              {selectedPeriod === 'weekly' ? 'Weekly' : selectedPeriod === 'monthly' ? 'Monthly' : 'Total'} Earnings
            </h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            ${selectedPeriod === 'weekly' ? earnings?.weekly_earnings || 0 :
               selectedPeriod === 'monthly' ? earnings?.monthly_earnings || 0 :
               earnings?.total_earnings || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {selectedPeriod === 'weekly' ? earnings?.weekly_completed_jobs || 0 :
             selectedPeriod === 'monthly' ? earnings?.monthly_completed_jobs || 0 :
             earnings?.total_completed_jobs || 0} completed jobs
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>📈</span>
            <h3 style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Success Rate</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {analytics?.completion_rate || 0}%
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {analytics?.completed_bookings_count || 0} of {analytics?.total_bookings_count || 0} jobs
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🎯</span>
            <h3 style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Active Jobs</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {analytics?.active_bookings_count || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            Currently in progress
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: '#2c3e50',
          boxShadow: '0 8px 25px rgba(168, 237, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🔧</span>
            <h3 style={{ margin: 0, fontSize: '16px', opacity: 0.8 }}>Services Offered</h3>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {analytics?.registered_services_count || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            Active service categories
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 15px 35px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 24, color: '#2c3e50' }}>
          📊 Performance Insights
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Average Job Value */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '16px' }}>Average Job Value</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '8px' }}>
              ${earnings?.total_completed_jobs > 0 ?
                ((earnings?.total_earnings || 0) / (earnings?.total_completed_jobs || 1)).toFixed(2) :
                '0.00'}
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
              Per completed job
            </p>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '16px' }}>Recent Activity</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
              {analytics?.recent_activity?.length || 0}
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
              Recent transactions
            </p>
          </div>
        </div>
      </div>

      {earnings?.earnings_by_service && typeof earnings.earnings_by_service === 'object' && Object.keys(earnings.earnings_by_service).length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 24, color: '#2c3e50' }}>Earnings by Service</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(earnings.earnings_by_service).map(([serviceName, data]: [string, any]) => (
              <div key={serviceName} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: 8,
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>{serviceName}</h4>
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>{data?.count || 0} jobs completed</div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  ${(data?.total || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderRatings({ user }: { user: User }) {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_ratings: 0,
    average_rating: 0,
    provider_name: ''
  });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Get user ID for ratings endpoint
      const userResponse = await fetch("http://localhost:8000/api/auth/me/", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userId = userData.id;

        // Fetch provider ratings
        const response = await fetch(`http://localhost:8000/api/bookings/provider/${userId}/ratings/`);

        if (response.ok) {
          const data = await response.json();
          setRatings(data.ratings || []);
          setStats({
            total_ratings: data.total_ratings || 0,
            average_rating: data.average_rating || 0,
            provider_name: data.provider_name || user.username
          });
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#FFD700' : '#ddd' }}>⭐</span>
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading your ratings...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '2rem', fontWeight: 700 }}>
          ⭐ Your Ratings & Reviews
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.average_rating.toFixed(1)}
            </div>
            <div style={{ opacity: 0.9 }}>Average Rating</div>
            <div style={{ marginTop: '5px' }}>
              {renderStars(Math.round(stats.average_rating))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.total_ratings}
            </div>
            <div style={{ opacity: 0.9 }}>Total Ratings</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
              {ratings.filter(rating => rating.review && rating.review.trim()).length}
            </div>
            <div style={{ opacity: 0.9 }}>Written Reviews</div>
          </div>
        </div>
      </div>

      {(() => {
        const ratingsWithReviews = ratings.filter(rating => rating.review && rating.review.trim());

        if (ratingsWithReviews.length === 0) {
          return (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⭐</div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>
                {ratings.length === 0 ? 'No Ratings Yet' : 'No Written Reviews Yet'}
              </h3>
              <p style={{ color: '#999' }}>
                {ratings.length === 0
                  ? 'Complete some services to start receiving reviews from customers!'
                  : `You have ${ratings.length} star rating${ratings.length !== 1 ? 's' : ''}, but no written reviews yet. Encourage customers to leave detailed feedback!`
                }
              </p>
            </div>
          );
        }

        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            {ratingsWithReviews.map((rating, index) => (
            <div
              key={rating.id || index}
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '1.2rem' }}>
                      {renderStars(rating.rating)}
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                      {rating.rating}/5
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    By {rating.customer} • {formatDate(rating.created_at)}
                  </div>
                </div>

              </div>

              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '10px',
                borderLeft: '4px solid #667eea',
                fontStyle: 'italic',
                color: '#555',
                lineHeight: 1.6
              }}>
                "{rating.review}"
              </div>
            </div>
          ))}
        </div>
        );
      })()}
    </div>
  );
}

function AvailabilityManagement({ user }: { user: User }) {
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [offDays, setOffDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showOffDayModal, setShowOffDayModal] = useState(false);
  const [showOffDaysViewModal, setShowOffDaysViewModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotStates, setSlotStates] = useState<{[key: string]: boolean}>({});
  const [selectedOffDays, setSelectedOffDays] = useState<string[]>([]);
  const [offDayReason, setOffDayReason] = useState('');
  const [saving, setSaving] = useState(false);

  // Default time slots - these are the 4 standard slots
  const timeSlots = [
    { start: '09:00', end: '12:00', label: '9 AM - 12 PM' },
    { start: '12:00', end: '15:00', label: '12 PM - 3 PM' },
    { start: '15:00', end: '18:00', label: '3 PM - 6 PM' },
    { start: '18:00', end: '21:00', label: '6 PM - 9 PM' }
  ];

  useEffect(() => {
    loadAvailabilityData();
  }, []);

  const loadAvailabilityData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Load availability slots
      const availabilityResponse = await fetch("http://localhost:8000/api/bookings/availability/", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      // Load off days
      const offDaysResponse = await fetch("http://localhost:8000/api/bookings/off-days/", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (availabilityResponse.ok) {
        const data = await availabilityResponse.json();
        setAvailabilityData(data.availability_slots || []);
        setBookings(data.bookings || []);
      }

      if (offDaysResponse.ok) {
        const offDaysData = await offDaysResponse.json();
        setOffDays(offDaysData.off_days || []);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const openManageModal = async (date: string) => {
    // Check if this date is marked as off day
    const isOffDay = offDays.some(offDay => offDay.date === date);

    if (isOffDay) {
      const confirmConvert = window.confirm(
        `This date (${date}) is currently marked as an "Off Day". Would you like to remove the off day status and manage individual time slots instead?`
      );

      if (confirmConvert) {
        // Remove the off day status first
        await removeOffDay(date);
      } else {
        return; // User cancelled, don't open the modal
      }
    }

    setSelectedDate(date);

    // Get current availability for this date
    const currentStates: {[key: string]: boolean} = {};

    timeSlots.forEach(slot => {
      const slotKey = `${slot.start}-${slot.end}`;

      // Find if this slot exists in availability data
      const existingSlot = availabilityData.find(item =>
        item.date === date &&
        item.start_time.substring(0, 5) === slot.start &&
        item.end_time.substring(0, 5) === slot.end
      );

      // If slot exists, use its availability status
      // If slot doesn't exist, default to available (false = available, true = off)
      currentStates[slotKey] = existingSlot ? !existingSlot.is_available : false;
    });

    setSlotStates(currentStates);
    setShowManageModal(true);
  };

  const saveSlotChanges = async () => {
    if (!selectedDate) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert('Authentication required');
        return;
      }

      console.log('=== SAVING SLOTS ===');
      console.log('Date:', selectedDate);
      console.log('Slot states:', slotStates);

      let successCount = 0;
      let errorCount = 0;

      // Update each time slot
      for (const slot of timeSlots) {
        const slotKey = `${slot.start}-${slot.end}`;
        const isOff = slotStates[slotKey] || false;
        const isAvailable = !isOff; // Convert: checked = off, unchecked = available

        console.log(`\nUpdating ${slot.label}:`);
        console.log(`- Slot key: ${slotKey}`);
        console.log(`- Is OFF: ${isOff}`);
        console.log(`- Is Available: ${isAvailable}`);

        const requestBody = {
          date: selectedDate,
          start_time: slot.start,
          end_time: slot.end,
          is_available: isAvailable
        };

        console.log('- Request body:', requestBody);

        try {
          const response = await fetch("http://localhost:8000/api/bookings/availability/", {
            method: 'POST',
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
          });

          console.log(`- Response status: ${response.status}`);

          if (response.ok) {
            const result = await response.json();
            console.log(`- Success:`, result);
            successCount++;
          } else {
            const errorData = await response.json();
            console.error(`- Error response:`, errorData);

            // Show specific validation errors
            if (response.status === 400 && errorData.error) {
              console.error(`  Validation error for ${slot.label}: ${errorData.error}`);
            }

            errorCount++;
          }
        } catch (fetchError) {
          console.error(`- Network error:`, fetchError);
          errorCount++;
        }
      }

      console.log(`\n=== RESULTS ===`);
      console.log(`Success: ${successCount}, Errors: ${errorCount}`);

      if (successCount > 0) {
        // Close modal and refresh data
        setShowManageModal(false);
        setSlotStates({});
        setSelectedDate('');

        // Reload data to show changes
        await loadAvailabilityData();

        if (errorCount === 0) {
          alert('✅ All slots updated successfully!');
        } else {
          alert(`⚠️ Partially updated: ${successCount} successful, ${errorCount} failed. Check console for details.`);
        }
      } else {
        alert('❌ Failed to update any slots. Check console for error details.');
      }

    } catch (error) {
      console.error('Critical error saving changes:', error);
      alert('❌ Critical error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get slot status for display
  const getSlotStatus = (date: string, slot: any) => {
    // Check if this date is marked as off day
    const isOffDay = offDays.some(offDay => offDay.date === date);
    if (isOffDay) {
      return { type: 'off_day', reason: offDays.find(od => od.date === date)?.reason };
    }

    // Find existing slot in data
    const existingSlot = availabilityData.find(item =>
      item.date === date &&
      item.start_time.substring(0, 5) === slot.start &&
      item.end_time.substring(0, 5) === slot.end
    );

    // Check for bookings in this slot
    const slotBookings = bookings.filter(booking => {
      if (booking.date !== date) return false;
      const bookingTime = booking.time.substring(0, 5);
      return bookingTime >= slot.start && bookingTime < slot.end;
    });

    if (slotBookings.length > 0) {
      return { type: 'booked', bookings: slotBookings };
    } else if (existingSlot && existingSlot.is_available) {
      return { type: 'available' };
    } else {
      return { type: 'off' };
    }
  };

  // Open off day calendar modal
  const openOffDayModal = () => {
    setSelectedOffDays([]);
    setOffDayReason('');
    setShowOffDayModal(true);
  };

  // Open off days view modal
  const openOffDaysViewModal = () => {
    setShowOffDaysViewModal(true);
  };

  // Function to remove an off day
  const removeOffDay = async (date: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert('Authentication required');
        return false;
      }

      console.log(`🗑️ Removing off day for date: ${date}`);

      const response = await fetch(`http://localhost:8000/api/bookings/off-days/`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ date: date })
      });

      if (response.ok) {
        console.log('✅ Off day removed successfully');
        // Refresh the data to reflect changes
        await loadAvailabilityData();
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to remove off day:', errorData);
        alert(`Failed to remove off day: ${errorData.error || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('💥 Error removing off day:', error);
      alert('Network error while removing off day');
      return false;
    }
  };

  // Get upcoming off days and off slots
  const getUpcomingOffDaysAndSlots = () => {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    // Get off days in next 30 days
    const upcomingOffDays = offDays.filter(offDay => {
      const offDate = new Date(offDay.date);
      return offDate >= today && offDate <= next30Days;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get off slots in next 30 days
    const upcomingOffSlots = availabilityData.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= today && slotDate <= next30Days && !slot.is_available;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { upcomingOffDays, upcomingOffSlots };
  };

  // Save selected off days
  const saveOffDays = async () => {
    if (selectedOffDays.length === 0) {
      alert('Please select at least one date');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert('Authentication required');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const date of selectedOffDays) {
        try {
          const response = await fetch("http://localhost:8000/api/bookings/off-days/", {
            method: 'POST',
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              date: date,
              reason: offDayReason || 'Off day'
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setShowOffDayModal(false);
        setSelectedOffDays([]);
        setOffDayReason('');
        await loadAvailabilityData();

        if (errorCount === 0) {
          alert(`✅ Successfully marked ${successCount} day(s) as off!`);
        } else {
          alert(`⚠️ Marked ${successCount} day(s) as off, ${errorCount} failed.`);
        }
      } else {
        alert('❌ Failed to mark any days as off. Please try again.');
      }
    } catch (error) {
      console.error('Error saving off days:', error);
      alert('❌ Failed to save off days');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Main component render
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading availability data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '2rem', fontWeight: 700 }}>
          📅 Availability Management
        </h2>
        <p style={{ opacity: 0.9, fontSize: '1.1rem', margin: '0 0 20px 0' }}>
          Manage your working hours and off days to control when customers can book your services
        </p>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '15px 20px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {bookings.filter(b => ['pending', 'accepted', 'confirmed'].includes(b.status)).length}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Upcoming Bookings</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '15px 20px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {availabilityData.filter(s => s.is_available).length}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Available Slots</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '15px 20px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {availabilityData.filter(s => !s.is_available).length}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Off Slots</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>




        <button
          onClick={openOffDaysViewModal}
          style={{
            padding: '15px 25px',
            borderRadius: '15px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          👁️ View Off Days & Slots
        </button>

        <button
          onClick={openOffDayModal}
          style={{
            padding: '15px 25px',
            borderRadius: '15px',
            border: 'none',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          📅 Mark Off Days
        </button>

        <button
          onClick={loadAvailabilityData}
          style={{
            padding: '15px 25px',
            borderRadius: '15px',
            border: 'none',
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          🔄 Refresh
        </button>




      </div>

      {/* Availability Slots */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ color: '#333', marginBottom: '20px', fontSize: '1.5rem' }}>
          ⏰ Available Time Slots
        </h3>

        {availabilityData.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏰</div>
            <h4 style={{ color: '#666', marginBottom: '10px' }}>No availability slots set</h4>
            <p style={{ color: '#999' }}>
              Add your available time slots so customers know when they can book your services
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {(() => {
              // Group slots by date
              const slotsByDate = availabilityData.reduce((acc, slot) => {
                if (!acc[slot.date]) acc[slot.date] = [];
                acc[slot.date].push(slot);
                return acc;
              }, {} as {[key: string]: any[]});

              return Object.entries(slotsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(0, 10) // Show only next 10 days
                .map(([date, slots]) => (
                  <div
                    key={date}
                    style={{
                      background: 'white',
                      borderRadius: '15px',
                      padding: '20px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#333', marginBottom: '5px' }}>
                          📅 {formatDate(date)}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openManageModal(date);
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid #667eea',
                          background: 'white',
                          color: '#667eea',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#667eea';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#667eea';
                        }}
                      >
                        ⚙️ Manage
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      {timeSlots.map(timeSlot => {
                        const status = getSlotStatus(date, timeSlot);

                        let backgroundColor, borderColor, textColor, statusText;

                        if (status.type === 'off_day') {
                          backgroundColor = '#fff3e0';
                          borderColor = '#ff9800';
                          textColor = '#f57c00';
                          statusText = `🚫 Off Day${status.reason ? ` - ${status.reason}` : ''}`;
                        } else if (status.type === 'booked') {
                          backgroundColor = '#e3f2fd';
                          borderColor = '#2196F3';
                          textColor = '#1976D2';
                          statusText = `📅 ${status.bookings?.length || 0} Booking${(status.bookings?.length || 0) > 1 ? 's' : ''}`;
                        } else if (status.type === 'available') {
                          backgroundColor = '#e8f5e8';
                          borderColor = '#4CAF50';
                          textColor = '#4CAF50';
                          statusText = '✅ Available';
                        } else {
                          backgroundColor = '#ffeaea';
                          borderColor = '#f44336';
                          textColor = '#f44336';
                          statusText = '❌ Off';
                        }

                        return (
                          <div
                            key={`${timeSlot.start}-${timeSlot.end}`}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              background: backgroundColor,
                              border: `1px solid ${borderColor}`,
                              textAlign: 'center'
                            }}
                          >
                            <div style={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: textColor,
                              marginBottom: '4px'
                            }}>
                              {timeSlot.label}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              color: textColor,
                              marginBottom: status.type === 'booked' ? '8px' : '0'
                            }}>
                              {statusText}
                            </div>
                            {status.type === 'booked' && (
                              <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                {status.bookings?.map((booking: any, idx: number) => (
                                  <div key={idx} style={{ marginBottom: '2px' }}>
                                    {booking.customer} - {booking.service}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
            })()}
          </div>
        )}
      </div>



      {/* Manage Slots Modal */}
      {showManageModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
              ⚙️ Manage Time Slots for {formatDate(selectedDate)}
            </h3>

            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              Check the boxes for time slots you want to mark as OFF. Unchecked slots will be available for booking.
            </p>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'grid', gap: '15px' }}>
                {timeSlots.map(slot => {
                  const slotKey = `${slot.start}-${slot.end}`;
                  const isOff = slotStates[slotKey] || false;

                  return (
                    <div
                      key={slotKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '10px',
                        background: isOff ? '#ffeaea' : '#e8f5e8',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        id={slotKey}
                        checked={isOff}
                        onChange={(e) => {
                          setSlotStates(prev => ({
                            ...prev,
                            [slotKey]: e.target.checked
                          }));
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          marginRight: '15px',
                          cursor: 'pointer'
                        }}
                      />
                      <label
                        htmlFor={slotKey}
                        style={{
                          flex: 1,
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: isOff ? '#f44336' : '#4CAF50'
                        }}
                      >
                        {slot.label}
                      </label>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: isOff ? '#f44336' : '#4CAF50',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {isOff ? '❌ OFF' : '✅ AVAILABLE'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                <strong>Summary:</strong>
              </div>
              <div style={{ fontSize: '14px', color: '#4CAF50' }}>
                ✅ Available slots: {Object.values(slotStates).filter(state => !state).length}
              </div>
              <div style={{ fontSize: '14px', color: '#f44336' }}>
                ❌ Off slots: {Object.values(slotStates).filter(state => state).length}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setSlotStates({});
                }}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveSlotChanges}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: saving ? '#ccc' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off Day Calendar Modal */}
      {showOffDayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
              📅 Mark Off Days
            </h3>

            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              Select multiple dates to mark as off days. You can select individual dates or date ranges.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Select Dates *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (selectedDate && !selectedOffDays.includes(selectedDate)) {
                    setSelectedOffDays(prev => [...prev, selectedDate].sort());
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  marginBottom: '10px'
                }}
              />

              {/* Selected dates display */}
              {selectedOffDays.length > 0 && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                    Selected Dates ({selectedOffDays.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedOffDays.map(date => (
                      <div
                        key={date}
                        style={{
                          background: '#f093fb',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {formatDate(date)}
                        <button
                          onClick={() => setSelectedOffDays(prev => prev.filter(d => d !== date))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: '0',
                            marginLeft: '3px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Reason (Optional)
              </label>
              <input
                type="text"
                value={offDayReason}
                onChange={(e) => setOffDayReason(e.target.value)}
                placeholder="e.g., Personal leave, Holiday, Vacation..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowOffDayModal(false);
                  setSelectedOffDays([]);
                  setOffDayReason('');
                }}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveOffDays}
                disabled={saving || selectedOffDays.length === 0}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: saving || selectedOffDays.length === 0 ? '#ccc' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  cursor: saving || selectedOffDays.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                {saving ? 'Saving...' : `Mark ${selectedOffDays.length} Day${selectedOffDays.length !== 1 ? 's' : ''} Off`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off Days View Modal */}
      {showOffDaysViewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
              👁️ Upcoming Off Days & Time Slots
            </h3>

            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              View your upcoming off days and off time slots for the next 30 days.
            </p>

            {(() => {
              const { upcomingOffDays, upcomingOffSlots } = getUpcomingOffDaysAndSlots();

              return (
                <div>
                  {/* Off Days Section */}
                  <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2rem' }}>
                      🚫 Full Off Days ({upcomingOffDays.length})
                    </h4>

                    {upcomingOffDays.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        color: '#666'
                      }}>
                        No full off days scheduled in the next 30 days
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {upcomingOffDays.map((offDay, index) => (
                          <div
                            key={index}
                            style={{
                              background: '#fff3e0',
                              border: '1px solid #ff9800',
                              borderRadius: '10px',
                              padding: '15px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, color: '#f57c00', marginBottom: '5px' }}>
                                📅 {formatDate(offDay.date)}
                              </div>
                              {offDay.reason && (
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                  📝 {offDay.reason}
                                </div>
                              )}
                            </div>
                            <div style={{
                              background: '#ff9800',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              Full Day Off
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Off Time Slots Section */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2rem' }}>
                      ⏰ Off Time Slots ({upcomingOffSlots.length})
                    </h4>

                    {upcomingOffSlots.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        color: '#666'
                      }}>
                        No off time slots scheduled in the next 30 days
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {upcomingOffSlots.map((slot, index) => (
                          <div
                            key={index}
                            style={{
                              background: '#ffeaea',
                              border: '1px solid #f44336',
                              borderRadius: '10px',
                              padding: '15px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, color: '#f44336', marginBottom: '5px' }}>
                                📅 {formatDate(slot.date)}
                              </div>
                              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                ⏰ {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                              </div>
                            </div>
                            <div style={{
                              background: '#f44336',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              Time Slot Off
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowOffDaysViewModal(false)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600
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

// Modern Profile Section Component
function ProfileSection({ user, hasPermission }: { user: User; hasPermission: (permission: string) => boolean }) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8000/api/auth/me/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 60,
        maxWidth: 1200,
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 48,
          marginBottom: 20,
          animation: 'pulse 2s infinite'
        }}>⏳</div>
        <div style={{
          fontSize: 20,
          color: '#667eea',
          fontWeight: 600
        }}>Loading your profile...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: 32,
        maxWidth: 1200,
        margin: '0 auto 24px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 20px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            👤
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            marginBottom: 12,
            color: 'white',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            {profileData?.first_name} {profileData?.last_name}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.2rem',
            marginBottom: 8,
            fontWeight: 500
          }}>
            Service Provider
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1rem',
            marginBottom: 0
          }}>
            @{profileData?.username}
          </p>
        </div>
      </div>

      {/* Profile Content */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 32,
        maxWidth: 1200,
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: 30,
          color: '#2c3e50',
          textAlign: 'center'
        }}>Profile Information</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          {/* Personal Information */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: 12,
            padding: 24,
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              marginBottom: 20,
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📋 Personal Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <strong style={{ color: '#6c757d' }}>Email:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50' }}>{profileData?.email}</div>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>Phone:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50' }}>{profileData?.phone || 'Not provided'}</div>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>Address:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50' }}>{profileData?.address || 'Not provided'}</div>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>User Type:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {profileData?.user_type || user.user_type}
                  </span>
                </div>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>Role:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {profileData?.role || user.role}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
                    (Determines permissions)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: 12,
            padding: 24,
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              marginBottom: 20,
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🛠️ Professional Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <strong style={{ color: '#6c757d' }}>Experience:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50' }}>
                  {profileData?.experience_years ? `${profileData.experience_years} years` : 'Not specified'}
                </div>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>Specializations:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50' }}>
                  {profileData?.specializations || 'Not specified'}
                </div>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>Bio:</strong>
                <div style={{ marginTop: 4, color: '#2c3e50', lineHeight: 1.5 }}>
                  {profileData?.bio || 'No bio provided'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        {hasPermission('edit_own_profile') && (
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <button
              onClick={() => router.push('/service_provider_dashboard/profile/edit')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: 12,
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              ✏️ Edit Profile
            </button>
          </div>
        )}

        {/* Permission Info */}
        {!hasPermission('edit_own_profile') && (
          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#fff3cd',
            borderRadius: 8,
            border: '1px solid #ffeaa7',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: '#856404' }}>
              ⚠️ You don't have permission to edit your profile. Contact your administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Service Provider Profile Component (Legacy - keeping for edit functionality)
function ServiceProviderProfile({ user, hasPermission }: { user: User; hasPermission: (permission: string) => boolean }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    bio: '',
    experience_years: '',
    specializations: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Check permissions
  const canViewProfile = hasPermission('view_own_profile');
  const canEditProfile = hasPermission('edit_own_profile');

  useEffect(() => {
    if (!canViewProfile) {
      setLoading(false);
      return;
    }
    loadProfileData();
  }, [canViewProfile]);

  const loadProfileData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("http://localhost:8000/api/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || '',
          experience_years: data.experience_years || '',
          specializations: data.specializations || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!canEditProfile) {
      alert('You do not have permission to edit your profile. Contact your administrator to grant "Edit Own Profile" permission.');
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Prepare update data
      const updateData: any = { ...formData };

      // Add password data if changing password
      if (showChangePassword) {
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
          alert('❌ Please fill in all password fields');
          return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          alert('❌ New passwords do not match');
          return;
        }
        if (passwordData.newPassword.length < 6) {
          alert('❌ New password must be at least 6 characters long');
          return;
        }

        updateData.old_password = passwordData.oldPassword;
        updateData.new_password = passwordData.newPassword;
      }

      const response = await fetch("http://localhost:8000/api/auth/me/update/", {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        alert('✅ Profile updated successfully!');
        setEditing(false);
        setShowChangePassword(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        loadProfileData();
      } else {
        const error = await response.json();
        alert(`❌ Failed to update profile: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Network error occurred while updating profile');
    }
  };

  // Permission denied view
  if (!canViewProfile) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '12px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ color: '#856404', marginBottom: '16px' }}>Access Denied</h2>
        <p style={{ color: '#856404', fontSize: '16px', lineHeight: '1.5' }}>
          You do not have permission to view your profile.<br />
          Contact your administrator to grant "View Own Profile" permission.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px' }}>⏳ Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '2rem', fontWeight: 700 }}>
          👤 My Profile
        </h2>
        <p style={{ opacity: 0.9, fontSize: '1.1rem', margin: '0' }}>
          Manage your personal information and service provider details
        </p>
      </div>

      {/* Profile Content */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#2c3e50', fontWeight: 700 }}>
            👤 Profile Information
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {canEditProfile && (
              <>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  style={{
                    background: editing ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #007bff, #0056b3)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {editing ? '💾 Save Changes' : '✏️ Edit Profile'}
                </button>

                {editing && (
                  <>
                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      style={{
                        background: showChangePassword
                          ? 'linear-gradient(135deg, #ffc107, #e0a800)'
                          : 'linear-gradient(135deg, #17a2b8, #138496)',
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(23,162,184,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🔐 {showChangePassword ? 'Hide Password' : 'Change Password'}
                    </button>

                    <button
                      onClick={() => {
                        setEditing(false);
                        setShowChangePassword(false);
                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                        loadProfileData();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #6c757d, #5a6268)',
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(108,117,125,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Profile Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <ProfileField
            label="Username"
            value={formData.username}
            editing={editing}
            onChange={(value) => setFormData({...formData, username: value})}
            disabled={true} // Username usually can't be changed
          />
          <ProfileField
            label="Email"
            value={formData.email}
            editing={editing}
            onChange={(value) => setFormData({...formData, email: value})}
            type="email"
          />
          <ProfileField
            label="First Name"
            value={formData.first_name}
            editing={editing}
            onChange={(value) => setFormData({...formData, first_name: value})}
          />
          <ProfileField
            label="Last Name"
            value={formData.last_name}
            editing={editing}
            onChange={(value) => setFormData({...formData, last_name: value})}
          />
          <ProfileField
            label="Phone"
            value={formData.phone}
            editing={editing}
            onChange={(value) => setFormData({...formData, phone: value})}
            type="tel"
          />
          <ProfileField
            label="Address"
            value={formData.address}
            editing={editing}
            onChange={(value) => setFormData({...formData, address: value})}
          />
        </div>

        {/* Bio and Experience */}
        <div style={{ marginTop: '32px' }}>
          <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>Professional Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <ProfileField
              label="Bio"
              value={formData.bio}
              editing={editing}
              onChange={(value) => setFormData({...formData, bio: value})}
              multiline={true}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <ProfileField
                label="Years of Experience"
                value={formData.experience_years}
                editing={editing}
                onChange={(value) => setFormData({...formData, experience_years: value})}
                type="number"
              />
              <ProfileField
                label="Specializations"
                value={formData.specializations}
                editing={editing}
                onChange={(value) => setFormData({...formData, specializations: value})}
                placeholder="e.g., Plumbing, Electrical, Carpentry"
              />
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        {editing && showChangePassword && (
          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            borderRadius: '16px',
            border: '2px solid #dee2e6'
          }}>
            <h4 style={{
              marginBottom: '20px',
              color: '#2c3e50',
              fontSize: '1.3rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔐 Change Password
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#495057'
                }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#495057'
                }}>
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#495057'
                }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? '#dc3545' : '#dee2e6'}`,
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  placeholder="Confirm your new password"
                />
                {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <div style={{
                    color: '#dc3545',
                    fontSize: '14px',
                    marginTop: '4px',
                    fontWeight: 500
                  }}>
                    ❌ Passwords do not match
                  </div>
                )}
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(13, 202, 240, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(13, 202, 240, 0.3)'
            }}>
              <div style={{ fontSize: '14px', color: '#0dcaf0', fontWeight: 500 }}>
                💡 Password Requirements:
              </div>
              <ul style={{
                margin: '8px 0 0 0',
                paddingLeft: '20px',
                fontSize: '13px',
                color: '#6c757d'
              }}>
                <li>At least 6 characters long</li>
                <li>Must match the confirmation field</li>
                <li>Current password is required for verification</li>
              </ul>
            </div>
          </div>
        )}

        {/* Permission Info */}
        {!canEditProfile && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            color: '#856404'
          }}>
            <strong>ℹ️ Note:</strong> You can view your profile but cannot edit it. Contact your administrator to grant "Edit Own Profile" permission.
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Field Component
function ProfileField({
  label,
  value,
  editing,
  onChange,
  type = 'text',
  disabled = false,
  multiline = false,
  placeholder = ''
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const baseStyle = {
    width: '100%',
    padding: '12px',
    border: editing && !disabled ? '2px solid #007bff' : '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    background: disabled ? '#f8f9fa' : 'white',
    color: disabled ? '#6c757d' : '#333',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const textareaStyle = {
    ...baseStyle,
    resize: 'vertical' as const,
    minHeight: '80px'
  };

  const inputStyle = {
    ...baseStyle,
    minHeight: 'auto'
  };

  return (
    <div>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontWeight: 600,
        color: '#2c3e50',
        fontSize: '14px'
      }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!editing || disabled}
          placeholder={placeholder}
          style={textareaStyle}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!editing || disabled}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
}