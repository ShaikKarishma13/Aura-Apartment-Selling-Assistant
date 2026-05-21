import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import ChartSection from "../components/ChartSection";

function Dashboard({ leads = [], activities = [], calls = [] }) {
 const [stats, setStats] = useState({
  total_leads: 0,
  hot_leads: 0,
  calls_today: 0,
  conversion_rate: 0,
});

useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/dashboard/stats"
      );

      setStats(response.data);

    } catch (error) {
      console.error("Dashboard fetch failed", error);
    }
  };

  fetchStats();
}, []);

 

  // ================= AI INSIGHTS =================
  const getInsights = () => {
    if (leads.length === 0) return [];

    const locationCount = {};
    leads.forEach((l) => {
      if (!l.location) return;
      locationCount[l.location] = (locationCount[l.location] || 0) + 1;
    });

    const bestLocation = Object.keys(locationCount).length
      ? Object.keys(locationCount).reduce((a, b) =>
          locationCount[a] > locationCount[b] ? a : b
        )
      : "N/A";

    const budgetCount = {};
    leads.forEach((l) => {
      if (!l.budget) return;
      budgetCount[l.budget] = (budgetCount[l.budget] || 0) + 1;
    });

    const bestBudget = Object.keys(budgetCount).length
      ? Object.keys(budgetCount).reduce((a, b) =>
          budgetCount[a] > budgetCount[b] ? a : b
        )
      : "N/A";

    const hotCount = leads.filter((l) => l.status === "Hot").length;

    const hour = new Date().getHours();
    const timeInsight =
      hour >= 18 && hour <= 21
        ? "Calls between 6–9 PM show better engagement 📈"
        : "Daytime leads show moderate response 📊";

    return [
      `🏙️ ${bestLocation} is generating most leads`,
      `💰 ${bestBudget} budget is performing best`,
      `🔥 ${hotCount} high-intent leads identified`,
      `⏰ ${timeInsight}`,
    ];
  };

  const insights = getInsights();

  // ================= AI RECOMMENDATION =================
  const getBestLead = () => {
    if (leads.length === 0) return null;

    const priority = { Hot: 3, Warm: 2, Cold: 1 };

    return [...leads].sort(
      (a, b) => priority[b.status] - priority[a.status]
    )[0];
  };

  const bestLead = getBestLead();

  // ================= NEXT ACTION =================
  const getNextAction = () => {
    if (leads.length === 0) return "No actions yet";

    const hotLead = leads.find((l) => l.status === "Hot");
    if (hotLead) return `🔥 Close deal with ${hotLead.name}`;

    const warmLead = leads.find((l) => l.status === "Warm");
    if (warmLead) return `📅 Follow up ${warmLead.name}`;

    const coldLead = leads.find((l) => l.status === "Cold");
    if (coldLead) return `📞 Re-engage ${coldLead.name}`;

    return "Monitor leads";
  };

  const nextAction = getNextAction();

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        {/* ✅ WRAPPER ADDED */}
        <div className="page-wrap">

          <h1 className="page-title">Dashboard Overview 🚀</h1>

          {/* ================= CARDS ================= */}
          <div className="cards">
            <div className="card">
              <h3>Total Leads</h3>
              <p>{stats.total_leads}</p>
            </div>

            <div className="card">
              <h3>Calls Today 📞</h3>
              <p>{stats.calls_today}</p>
            </div>

            <div className="card">
              <h3>Hot Leads 🔥</h3>
              <p>{stats.hot_leads}</p>
            </div>

            <div className="card">
              <h3>Conversion Rate %</h3>
              <p>{stats.conversion_rate}%</p>
            </div>
          </div>

          {/* ================= CHART ================= */}
          <div className="charts-section">
            <ChartSection leads={leads} />
          </div>

          {/* ================= AI INSIGHTS ================= */}
          <div className="insights-panel">
            <h2>AI Insights 💡</h2>

            {insights.length === 0 ? (
              <p>No insights yet</p>
            ) : (
              insights.map((insight, i) => (
                <p key={i} className="insight-item">
                  {insight}
                </p>
              ))
            )}
          </div>

          {/* ================= AI SECTION ================= */}
          <div className="ai-section">

            <div className="card ai-recommendation">
              <h2>AI Recommendation 🤖</h2>

              {bestLead ? (
                <>
                  <p>📞 Call <b>{bestLead.name}</b> now</p>
                  <p>Status: {bestLead.status}</p>
                  <p>Budget: {bestLead.budget || "—"}</p>
                  <p>Location: {bestLead.location || "—"}</p>
                </>
              ) : (
                <p>No leads available</p>
              )}
            </div>

            <div className="card ai-action">
              <h2>Next Best Action ⚡</h2>
              <p>{nextAction}</p>
            </div>

          </div>

          {/* ================= BOTTOM ================= */}
          <div className="bottom-section">

            <div className="leads-table">
              <h2>Recent Leads 📋</h2>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Budget</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Last Contacted</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan="7">No leads yet</td>
                    </tr>
                  ) : (
                    leads.slice(-5).reverse().map((lead) => (
                      <tr key={lead.phone}>
                        <td>{lead.name}</td>
                        <td>{lead.phone}</td>
                        <td>{lead.budget || "—"}</td>
                        <td>{lead.location || "—"}</td>

                        <td>
                          <span className={`status ${lead.status.toLowerCase()}`}>
                            {lead.status}
                          </span>
                        </td>

                        <td>{lead.lastContact || "—"}</td>

                        <td>
                          <button className="view-btn">👁</button>
                          <button className="delete-btn">❌</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="activity-feed">
              <h2>AI Activity Feed 🤖</h2>

              {activities.length === 0 ? (
                <p>No activity yet</p>
              ) : (
                activities.slice(0, 5).map((act, index) => {
                  let icon = "📌";

                  if (act.text.includes("Calling")) icon = "📞";
                  else if (act.text.includes("responded")) icon = "💬";
                  else if (act.text.includes("HOT")) icon = "🔥";
                  else if (act.text.includes("follow-up")) icon = "📅";
                  else if (act.text.includes("removed")) icon = "❌";

                  return (
                    <div key={index} className="activity-item">
                      <span className="activity-time">
                        {new Date(act.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <span className="activity-text">
                        {icon} {act.text}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;