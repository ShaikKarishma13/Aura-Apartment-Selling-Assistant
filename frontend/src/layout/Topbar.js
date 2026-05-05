import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added

function Topbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate(); // ✅ added

  // ✅ Step 3: Logout function
  const handleLogout = () => {
    localStorage.clear(); // future ready
    navigate("/");
  };

  // ✅ Step 2: Go to settings
  const goToSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="topbar">

      {/* LEFT */}
      <input type="text" placeholder="Search..." className="search-bar" />

      {/* RIGHT SIDE */}
      <div className="topbar-right">

        {/* 🔔 NOTIFICATIONS */}
        <div className="icon-wrapper">
          <span onClick={() => {
            setShowNotif(!showNotif);
            setShowProfile(false);
          }}>
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
          <span onClick={() => {
            setShowProfile(!showProfile);
            setShowNotif(false);
          }}>
            👤
          </span>

          {showProfile && (
            <div className="dropdown">
              <p>My Profile</p>
              <p onClick={goToSettings}>Settings</p> {/* ✅ fixed */}
              <p onClick={handleLogout}>Logout</p>   {/* ✅ fixed */}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Topbar;