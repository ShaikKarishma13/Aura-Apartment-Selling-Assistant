import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // later you can clear token/localStorage
    navigate("/");
  };

  return (
    <div className="sidebar">
      
      <h2 className="logo">🏢 AI Agent</h2>

      <ul className="menu">
        <li><NavLink to="/dashboard">🏠 Dashboard</NavLink></li>
        <li><NavLink to="/leads">👥 Leads</NavLink></li>
        <li><NavLink to="/calls">📞 Calls</NavLink></li>
        <li><NavLink to="/properties">🏢 Properties</NavLink></li>
        <li><NavLink to="/analytics">📊 Analytics</NavLink></li>
        <li><NavLink to="/ai-assistant">🤖 AI Assistant</NavLink></li>
        <li><NavLink to="/follow-ups">📅 Follow-ups</NavLink></li>
        <li><NavLink to="/settings">⚙️ Settings</NavLink></li>
      </ul>

      {/* 🔥 LOGOUT BUTTON */}
      <div className="logout" onClick={handleLogout}>
        🚪 Logout
      </div>

    </div>
  );
}

export default Sidebar;