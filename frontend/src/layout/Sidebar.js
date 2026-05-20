import { Link, useNavigate } from "react-router-dom";

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
        <li><Link to="/dashboard">🏠 Dashboard</Link></li>
        <li><Link to="/leads">👥 Leads</Link></li>
        <li><Link to="/calls">📞 Calls</Link></li>
        <li><Link to="/analytics">📊 Analytics</Link></li>
        <li><Link to="/follow-ups">📅 Follow-ups</Link></li>
        <li><Link to="/settings">⚙️ Settings</Link></li>
      </ul>

      {/* 🔥 LOGOUT BUTTON */}
      <div className="logout" onClick={handleLogout}>
        🚪 Logout
      </div>

    </div>
  );
}

export default Sidebar;