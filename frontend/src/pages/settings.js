import { useState } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

function Settings() {
  // AI Config
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Friendly");

  // Call settings
  const [callTime, setCallTime] = useState("09:00");
  const [retries, setRetries] = useState(3);

  const handleSave = () => {
    console.log({
      prompt,
      tone,
      callTime,
      retries
    });

    alert("Settings saved (frontend only)");
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        {/* ✅ WRAPPER ADDED */}
        <div className="page-wrap">

          <h1 className="page-title">Settings ⚙️</h1>

          {/* ================= AI CONFIG ================= */}
          <div className="settings-card">
            <h2>AI Configuration 🤖</h2>

            <textarea
              placeholder="Enter AI prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Friendly</option>
              <option>Professional</option>
              <option>Aggressive</option>
            </select>
          </div>

          {/* ================= CALL SETTINGS ================= */}
          <div className="settings-card">
            <h2>Call Settings 📞</h2>

            <label>Call Start Time</label>
            <input
              type="time"
              value={callTime}
              onChange={(e) => setCallTime(e.target.value)}
            />

            <label>Retry Attempts</label>
            <input
              type="number"
              value={retries}
              onChange={(e) => setRetries(e.target.value)}
            />
          </div>

          {/* ================= DATA ================= */}
          <div className="settings-card">
            <h2>Data Management 📂</h2>

            <input type="file" />

            <button className="export-btn">Export Leads</button>
          </div>

          {/* SAVE BUTTON */}
          <button className="save-btn" onClick={handleSave}>
            Save Settings
          </button>

        </div>
      </div>
    </div>
  );
}

export default Settings;