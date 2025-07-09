"use client";
import { useState, useEffect } from "react";
import BookingModal from "../../components/BookingModal";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  subcategories?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
  }>;
}



export default function HomeServices() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    subcategory: any;
    categoryName: string;
  }>({
    isOpen: false,
    subcategory: null,
    categoryName: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/bookings/categories/");
      if (response.ok) {
        const categoriesData = await response.json();
        
        // Fetch subcategories for each category
        const categoriesWithSubcategories = await Promise.all(
          categoriesData.map(async (category: any) => {
            const subResponse = await fetch(`http://127.0.0.1:8000/api/bookings/subcategories/?category_id=${category.id}`);
            if (subResponse.ok) {
              const subcategories = await subResponse.json();
              return {
                ...category,
                subcategories: subcategories
              };
            }
            return category;
          })
        );
        
        setCategories(categoriesWithSubcategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: ServiceCategory) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const handleBookService = (subcategory: any) => {
    setBookingModal({
      isOpen: true,
      subcategory: subcategory,
      categoryName: selectedCategory?.name || "",
    });
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      subcategory: null,
      categoryName: "",
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
            <p>Loading services...</p>
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
        {!selectedCategory ? (
          <>
            {/* Header Section */}
            <div style={{
              textAlign: "center",
              marginBottom: "50px",
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <h1 style={{
                margin: "0 0 16px 0",
                color: "#333",
                fontSize: "36px",
                fontWeight: "700"
              }}>
                Home Services
              </h1>
              <p style={{
                margin: "0",
                color: "#666",
                fontSize: "18px",
                lineHeight: "1.6"
              }}>
                Choose from our wide range of professional home services
              </p>
            </div>

            {/* Service Categories Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "25px",
              marginBottom: "50px"
            }}>
              {categories.map((category) => (
                <ServiceCategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                />
              ))}
            </div>

            {/* How it works Section */}
            <div style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <h3 style={{
                textAlign: "center",
                margin: "0 0 30px 0",
                color: "#333",
                fontSize: "28px",
                fontWeight: "600"
              }}>
                How it works
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "30px"
              }}>
                <StepCard
                  number="1"
                  title="Choose Service"
                  description="Select from our wide range of professional services"
                  icon="🎯"
                />
                <StepCard
                  number="2"
                  title="Book Appointment"
                  description="Pick your preferred date and time slot"
                  icon="📅"
                />
                <StepCard
                  number="3"
                  title="Get Service"
                  description="Professional service provider arrives at your doorstep"
                  icon="✅"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={handleBack}
              style={{
                marginBottom: 24,
                background: selectedCategory.gradient,
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              ← Back to Services
            </button>
            <div style={{
              background: "white",
              borderRadius: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              padding: 32,
              marginBottom: 32
            }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                <div style={{
                  fontSize: 48,
                  background: selectedCategory.gradient,
                  borderRadius: "50%",
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  marginRight: 24
                }}>{selectedCategory.icon}</div>
                <div>
                  <h2 style={{ margin: 0, color: "#333" }}>{selectedCategory.name}</h2>
                  <p style={{ margin: "8px 0 0 0", color: "#666" }}>{selectedCategory.description}</p>
                </div>
              </div>
              {selectedCategory.subcategories ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: selectedCategory.gradient, color: "white" }}>
                        <th style={{ padding: 12, textAlign: "left", borderRadius: 8 }}>Subcategory</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Description</th>
                        <th style={{ padding: 12, textAlign: "left" }}>Price</th>
                        <th style={{ padding: 12, textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCategory.subcategories.map((sub, idx) => (
                        <tr key={sub.id} style={{ background: idx % 2 === 0 ? "#f8f9fa" : "#fff" }}>
                          <td style={{ padding: 12, fontWeight: 600 }}>{sub.name}</td>
                          <td style={{ padding: 12 }}>{sub.description}</td>
                          <td style={{ padding: 12, color: "#28a745", fontWeight: "600" }}>
                            ${Number(sub.price).toFixed(2)}
                          </td>
                          <td style={{ padding: 12, textAlign: "center" }}>
                            <button
                              onClick={() => handleBookService(sub)}
                              style={{
                                background: selectedCategory.gradient,
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600"
                              }}
                            >
                              Send Request
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: "#888", fontStyle: "italic" }}>No subcategories available for this service.</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Booking Modal */}
      {bookingModal.isOpen && bookingModal.subcategory && (
        <BookingModal
          isOpen={bookingModal.isOpen}
          onClose={closeBookingModal}
          subcategory={bookingModal.subcategory}
          categoryName={bookingModal.categoryName}
        />
      )}
    </div>
  );
}

function ServiceCategoryCard({ 
  category, 
  onClick 
}: { 
  category: ServiceCategory; 
  onClick: () => void; 
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "30px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-10px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
      }}
    >
      <div style={{ 
        position: "absolute", 
        top: "0", 
        left: "0", 
        right: "0", 
        height: "4px", 
        background: category.gradient 
      }} />
      
      <div style={{ textAlign: "center" }}>
        <div style={{ 
          fontSize: "64px", 
          marginBottom: "20px",
          background: category.gradient,
          borderRadius: "50%",
          width: "100px",
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px auto",
          color: "white"
        }}>
          {category.icon}
        </div>
        <h3 style={{ 
          margin: "0 0 16px 0", 
          color: "#333", 
          fontSize: "24px",
          fontWeight: "600"
        }}>
          {category.name}
        </h3>
        <p style={{ 
          margin: "0 0 24px 0", 
          color: "#666", 
          lineHeight: "1.6",
          fontSize: "16px"
        }}>
          {category.description}
        </p>
        <button
          style={{
            background: category.gradient,
            color: "white",
            border: "none",
            padding: "14px 28px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Browse Services
        </button>
      </div>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description, 
  icon 
}: { 
  number: string; 
  title: string; 
  description: string; 
  icon: string; 
}) {
  return (
    <div style={{ 
      textAlign: "center",
      padding: "20px"
    }}>
      <div style={{ 
        fontSize: "48px", 
        marginBottom: "16px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "50%",
        width: "80px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px auto",
        color: "white"
      }}>
        {icon}
      </div>
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px auto",
        fontSize: "18px",
        fontWeight: "bold"
      }}>
        {number}
      </div>
      <h4 style={{ 
        margin: "0 0 12px 0", 
        color: "#333",
        fontSize: "20px",
        fontWeight: "600"
      }}>
        {title}
      </h4>
      <p style={{ 
        margin: "0", 
        color: "#666",
        lineHeight: "1.6",
        fontSize: "14px"
      }}>
        {description}
      </p>
    </div>
  );
} 