import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Topbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowNotif(false);
        setShowProfile(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const goToSettings = () => {
    navigate("/settings");
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredLeads([]);
      setShowSearchDropdown(false);
      return;
    }

    try {
      let activeLeads = leads;
      if (leads.length === 0) {
        const response = await axios.get("http://127.0.0.1:8000/api/chat/all-leads");
        setLeads(response.data);
        activeLeads = response.data;
      }

      const q = query.toLowerCase();
      const filtered = activeLeads.filter(
        (lead) =>
          (lead.name && lead.name.toLowerCase().includes(q)) ||
          (lead.phone && lead.phone.includes(q)) ||
          (lead.location && lead.location.toLowerCase().includes(q)) ||
          (lead.property_name && lead.property_name.toLowerCase().includes(q))
      );

      setFilteredLeads(filtered);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error("Search fetch failed", error);
    }
  };

  return (
    <div className="topbar">

      {/* 🔹 LEFT SECTION */}
      <div className="topbar-left" ref={searchRef} style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchQuery.trim()) setShowSearchDropdown(true);
          }}
          className="search-bar"
        />

        {showSearchDropdown && (
          <div className="search-dropdown">
            {filteredLeads.length === 0 ? (
              <p className="search-no-results">No leads found</p>
            ) : (
              filteredLeads.map((lead, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery("");
                    navigate("/leads");
                  }}
                >
                  <div className="search-lead-header">
                    <span className="search-lead-name">{lead.name}</span>
                    <span className={`status ${lead.status ? lead.status.toLowerCase().split(':')[0] : 'warm'}`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="search-lead-details">
                    {lead.phone && <span>📞 {lead.phone}</span>}
                    {lead.location && <span>📍 {lead.location}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 🔹 RIGHT SECTION */}
      <div className="topbar-right" ref={dropdownRef}>

        {/* 🔔 NOTIFICATIONS */}
        <div className="icon-wrapper">
          <span
            className="icon"
            onClick={() => {
              setShowNotif(!showNotif);
              setShowProfile(false);
            }}
          >
            🔔
          </span>

          {showNotif && (
            <div className="dropdown">
              <p>New lead added</p>
              <p>Follow-up due today</p>
              <p>Call completed</p>
            </div>
          )}
        </div>

        {/* 👤 PROFILE */}
        <div className="icon-wrapper">
          <span
            className="icon"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotif(false);
            }}
          >
            👤
          </span>

          {showProfile && (
            <div className="dropdown">
              <p>My Profile</p>
              <p onClick={goToSettings}>Settings</p>
              <p onClick={handleLogout}>Logout</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Topbar;