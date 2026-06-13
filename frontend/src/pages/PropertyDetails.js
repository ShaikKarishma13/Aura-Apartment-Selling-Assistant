import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import { PROPERTIES_DATA } from "../data/propertiesData";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find property by ID
  const property = PROPERTIES_DATA.find((p) => p.id === parseInt(id));

  // Gallery active index state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleBack = () => {
    navigate("/properties");
  };

  const handleInquireCall = (propertyTitle) => {
    navigate(`/calls?phone=9515834907&name=${encodeURIComponent(propertyTitle + " Inquiry")}`);
  };

  const getAvailabilityClass = (status) => {
    if (status === "Available") return "avail-available";
    if (status === "Limited Units") return "avail-limited";
    return "avail-soldout";
  };

  if (!property) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div className="page-wrap" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2 style={{ color: "#ef4444" }}>Property Not Found</h2>
            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
              The property listing you are looking for does not exist or has been removed.
            </p>
            <button className="property-action-secondary-btn" onClick={handleBack}>
              ← Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if images array is not defined
  const gallery = property.images && property.images.length > 0
    ? property.images
    : [{ url: property.image, caption: "Exterior View" }];

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-wrap">
          {/* Back Button and Quick Header */}
          <div className="property-details-header-bar">
            <button className="property-back-btn" onClick={handleBack}>
              ← Back to Catalog
            </button>
            <div className="property-details-id-tag">
              ID: {property.propId}
            </div>
          </div>

          <div className="property-details-container">
            {/* Grid Layout: Left Image Gallery Area, Right Core Info */}
            <div className="property-details-grid">
              
              {/* Left Column: Image Gallery Box */}
              <div className="property-details-image-section">
                <div className="property-details-gallery">
                  {/* Active Stage */}
                  <div className="gallery-stage">
                    <img 
                      src={gallery[currentImageIndex].url} 
                      alt={gallery[currentImageIndex].caption} 
                      className="gallery-active-image properties-fade-in"
                      key={currentImageIndex} // forces remount for smooth fade-in
                    />
                    
                    {/* Navigation Arrows */}
                    {gallery.length > 1 && (
                      <>
                        <button className="gallery-nav-btn prev" onClick={handlePrevImage} aria-label="Previous image">
                          ‹
                        </button>
                        <button className="gallery-nav-btn next" onClick={handleNextImage} aria-label="Next image">
                          ›
                        </button>
                      </>
                    )}

                    {/* Image Info Text Badge Overlays */}
                    <div className="gallery-info-overlay">
                      <span className="gallery-caption-badge">
                        🏢 {gallery[currentImageIndex].caption}
                      </span>
                      <span className="gallery-counter-badge">
                        Image {currentImageIndex + 1} of {gallery.length}
                      </span>
                    </div>

                    <div className="property-details-price-badge">{property.priceLabel}</div>
                    <span className={`property-details-availability-badge ${getAvailabilityClass(property.availability)}`}>
                      {property.availability}
                    </span>
                  </div>

                  {/* Thumbnail Strip */}
                  {gallery.length > 1 && (
                    <div className="gallery-thumbnails-strip">
                      {gallery.map((img, idx) => (
                        <div 
                          key={idx} 
                          className={`gallery-thumbnail ${idx === currentImageIndex ? "active" : ""}`}
                          onClick={() => setCurrentImageIndex(idx)}
                        >
                          <img src={img.url} alt={img.caption} />
                          <div className="thumbnail-caption-label">{img.caption}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Key Details Cards */}
              <div className="property-details-info-section">
                <h1 className="property-details-title">{property.title}</h1>
                <div className="property-details-location">
                  <span>📍</span> {property.location}, Hyderabad
                </div>

                <div className="property-details-specs-grid">
                  <div className="spec-item-card">
                    <span className="spec-icon">🛏️</span>
                    <div className="spec-info">
                      <span className="spec-label">BHK Type</span>
                      <span className="spec-val">{property.bhk}</span>
                    </div>
                  </div>

                  <div className="spec-item-card">
                    <span className="spec-icon">📐</span>
                    <div className="spec-info">
                      <span className="spec-label">Super Area</span>
                      <span className="spec-val">{property.size}</span>
                    </div>
                  </div>

                  <div className="spec-item-card">
                    <span className="spec-icon">💰</span>
                    <div className="spec-info">
                      <span className="spec-label">Guide Price</span>
                      <span className="spec-val">{property.priceLabel}</span>
                    </div>
                  </div>

                  <div className="spec-item-card">
                    <span className="spec-icon">🔑</span>
                    <div className="spec-info">
                      <span className="spec-label">Status</span>
                      <span className={`spec-val ${getAvailabilityClass(property.availability)}`}>
                        {property.availability}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="property-details-actions">
                  <button 
                    className="property-details-inquire-btn"
                    onClick={() => handleInquireCall(property.title)}
                  >
                    📞 Initiate AI Voice Agent Call
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Section: Description & Amenities */}
            <div className="property-details-description-block">
              <h2>Property Description</h2>
              <p>{property.description}</p>
              <p style={{ marginTop: "12px" }}>
                Designed by award-winning architects, this apartment has been crafted to offer a comfortable and
                spacious atmosphere, showcasing modern architectural detailing and premium specifications. With 
                high-speed infrastructure and premium utilities, it offers everything needed for high-quality luxury living.
              </p>
            </div>

            <div className="property-details-amenities-block">
              <h2>Building & Community Amenities</h2>
              <div className="detailed-amenities-grid">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="detailed-amenity-card">
                    <span className="detailed-amenity-bullet">✦</span>
                    <span className="detailed-amenity-text">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
