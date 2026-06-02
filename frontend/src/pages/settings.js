import { useState } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

function Settings() {

  // ================= NOTIFICATIONS =================

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [callAlerts, setCallAlerts] = useState(true);
  const [followUpReminders, setFollowUpReminders] = useState(true);
  const [hotLeadAlerts, setHotLeadAlerts] = useState(true);

  // ================= CALL SETTINGS =================

  const [callTime, setCallTime] = useState("09:00");
  const [retries, setRetries] = useState(3);

  const handleSave = () => {
    console.log({
      emailNotifications,
      callAlerts,
      followUpReminders,
      hotLeadAlerts,
      callTime,
      retries,
    });

    alert("Settings saved successfully");
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-wrap">

          <h1 className="page-title">
            Settings ⚙️
          </h1>

          {/* ================= NOTIFICATION SETTINGS ================= */}

          <div className="settings-card">
            <h2>Notification Settings 🔔</h2>

            <div className="notification-row">
              <span className="notification-label">
                Email Notifications
              </span>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={() =>
                    setEmailNotifications(!emailNotifications)
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-row">
              <span className="notification-label">
              Call Alerts
              </span>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={callAlerts}
                  onChange={() =>
                    setCallAlerts(!callAlerts)
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-row">
              <span className="notification-label">
                Follow-up Reminders
              </span>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={followUpReminders}
                  onChange={() =>
                    setFollowUpReminders(!followUpReminders)
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-row">
              <span className="notification-label">
                Hot Lead Alerts
              </span>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={hotLeadAlerts}
                  onChange={() =>
                    setHotLeadAlerts(!hotLeadAlerts)
                  }
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* ================= CALL SETTINGS ================= */}

          <div className="settings-card">
            <h2>Call Settings 📞</h2>

            <div className="settings-field"></div>

            <label>Call Start Time</label>

            <input
              className="settings-input"
              type="time"
              value={callTime}
              onChange={(e) =>
                setCallTime(e.target.value)
              }
            />
            <div className="settings-field"></div>

            <label>Retry Attempts</label>

            <input
              className="settings-input"
              type="number"
              value={retries}
              onChange={(e) =>
                setRetries(e.target.value)
              }
            />
          </div>

          {/* ================= SAVE BUTTON ================= */}

          <button
            className="save-btn"
            onClick={handleSave}
          >
            Save Settings
          </button>

        </div>
      </div>
    </div>
  );
}

export default Settings;