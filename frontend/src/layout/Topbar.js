import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const goToSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="topbar">

      {/* 🔹 LEFT SECTION */}
      <div className="topbar-left">
        <input
          type="text"
          placeholder="Search..."
          className="search-bar"
        />
      </div>

      {/* 🔹 RIGHT SECTION */}
      <div className="topbar-right">

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