import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

// Import shared properties mock data
import { PROPERTIES_DATA } from "../data/propertiesData";

function Properties() {
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedBhk, setSelectedBhk] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [loading, setLoading] = useState(true);

  const bhkCategories = ["All", "2 BHK", "3 BHK", "4 BHK", "5 BHK"];

  // Simulate loading on initial mount and whenever filter choices change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedLocation, selectedBhk, selectedPriceRange]);

  const handleInquireCall = (propertyTitle) => {
    // Navigate to calls page with pre-filled parameters for inquiry demo
    navigate(`/calls?phone=9515834907&name=${encodeURIComponent(propertyTitle + " Inquiry")}`);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("All");
    setSelectedBhk("All");
    setSelectedPriceRange("All");
  };

  // Filter logic
  const filteredProperties = PROPERTIES_DATA.filter((property) => {
    // 1. Search term check (works on Property Name, Location, and Property ID)
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.propId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Location check
    const matchesLocation = selectedLocation === "All" || property.location === selectedLocation;

    // 3. BHK check
    const matchesBhk = selectedBhk === "All" || property.bhk === selectedBhk;

    // 4. Price range check
    let matchesPrice = true;
    if (selectedPriceRange === "under-1cr") {
      matchesPrice = property.price < 10000000;
    } else if (selectedPriceRange === "1cr-2cr") {
      matchesPrice = property.price >= 10000000 && property.price <= 20000000;
    } else if (selectedPriceRange === "over-2cr") {
      matchesPrice = property.price > 20000000;
    }

    return matchesSearch && matchesLocation && matchesBhk && matchesPrice;
  });

  const getAvailabilityClass = (status) => {
    if (status === "Available") return "avail-available";
    if (status === "Limited Units") return "avail-limited";
    return "avail-soldout";
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, idx) => (
      <div key={idx} className="property-card skeleton-card">
        <div className="property-image-wrapper skeleton-shimmer" style={{ height: "200px" }}></div>
        <div className="property-info-content" style={{ gap: "16px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="skeleton-shimmer" style={{ height: "22px", width: "65%", borderRadius: "6px" }}></div>
            <div className="skeleton-shimmer" style={{ height: "18px", width: "25%", borderRadius: "4px" }}></div>
          </div>
          <div className="skeleton-shimmer" style={{ height: "14px", width: "45%", borderRadius: "4px" }}></div>
          <div style={{ display: "flex", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 0" }}>
            <div className="skeleton-shimmer" style={{ height: "14px", width: "30%", borderRadius: "4px" }}></div>
            <div className="skeleton-shimmer" style={{ height: "14px", width: "30%", borderRadius: "4px" }}></div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <div className="skeleton-shimmer" style={{ height: "18px", width: "20%", borderRadius: "4px" }}></div>
            <div className="skeleton-shimmer" style={{ height: "18px", width: "20%", borderRadius: "4px" }}></div>
            <div className="skeleton-shimmer" style={{ height: "18px", width: "20%", borderRadius: "4px" }}></div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <div className="skeleton-shimmer" style={{ height: "38px", flex: 1, borderRadius: "8px" }}></div>
            <div className="skeleton-shimmer" style={{ height: "38px", flex: 1, borderRadius: "8px" }}></div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-wrap">
          <div className="properties-header-wrap">
            <h1 className="page-title" style={{ margin: 0 }}>🏢 Property Catalog</h1>
            <span className="properties-counter-badge">
              Showing {filteredProperties.length} of {PROPERTIES_DATA.length} Curated Listings
            </span>
          </div>

          <div className="properties-container">
            {/* Filter Bar */}
            <div className="properties-filters-bar">
              <div className="properties-filter-group" style={{ minWidth: "220px" }}>
                <label>Search Properties</label>
                <input
                  type="text"
                  placeholder="Search by name, location, ID..."
                  className="properties-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="properties-filter-group">
                <label>Location</label>
                <select
                  className="properties-filter-select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="All">All Locations</option>
                  <option value="Gachibowli">Gachibowli</option>
                  <option value="Hitec City">Hitec City</option>
                  <option value="Madhapur">Madhapur</option>
                  <option value="Kondapur">Kondapur</option>
                  <option value="Kokapet">Kokapet</option>
                  <option value="Jubilee Hills">Jubilee Hills</option>
                  <option value="Manikonda">Manikonda</option>
                </select>
              </div>

              <div className="properties-filter-group" style={{ flex: 1.5, minWidth: "280px" }}>
                <label>BHK Type</label>
                <div className="properties-bhk-tabs">
                  {bhkCategories.map((cat) => (
                    <button
                      key={cat}
                      className={`properties-bhk-tab ${selectedBhk === cat ? "active" : ""}`}
                      onClick={() => setSelectedBhk(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="properties-filter-group">
                <label>Max Budget</label>
                <select
                  className="properties-filter-select"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                >
                  <option value="All">Any Price</option>
                  <option value="under-1cr">Under ₹1 Crore</option>
                  <option value="1cr-2cr">₹1 Cr - ₹2 Cr</option>
                  <option value="over-2cr">Above ₹2 Crores</option>
                </select>
              </div>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className="properties-grid">
                {renderSkeletons()}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="properties-empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3 className="empty-state-title">No Properties Found</h3>
                <p className="empty-state-text">
                  We couldn't find any listings matching your search terms or filter configurations.
                  Try clearing your search query or selecting other properties.
                </p>
                <button className="empty-state-reset-btn" onClick={handleResetFilters}>
                  🔄 Reset Catalog Filters
                </button>
              </div>
            ) : (
              <div className="properties-grid properties-fade-in">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="property-card">
                    <div className="property-image-wrapper">
                      <img src={property.image} alt={property.title} className="property-image" />
                      <div className="property-price-badge">{property.priceLabel}</div>
                      <span className={`property-availability-badge ${getAvailabilityClass(property.availability)}`}>
                        {property.availability}
                      </span>
                    </div>

                    <div className="property-info-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <h3 className="property-title">{property.title}</h3>
                        <span className="property-id-badge">{property.propId}</span>
                      </div>
                      
                      <div className="property-location-info">
                        📍 {property.location}
                      </div>

                      <div className="property-details-row">
                        <div className="property-detail-item">🛏️ {property.bhk}</div>
                        <div className="property-detail-item">📐 {property.size}</div>
                      </div>

                      <div className="property-amenities-list">
                        {property.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="property-amenity-tag">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="property-amenity-tag" style={{ background: "transparent", border: "1px dashed rgba(255,255,255,0.15)" }}>
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="property-card-actions">
                        <button 
                          className="property-action-secondary-btn"
                          onClick={() => navigate(`/properties/${property.id}`)}
                          style={{ flex: 1 }}
                        >
                          View Details
                        </button>
                        <button 
                          className="property-action-button"
                          onClick={() => handleInquireCall(property.title)}
                          style={{ flex: 1 }}
                        >
                          📞 Inquire
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Properties;
