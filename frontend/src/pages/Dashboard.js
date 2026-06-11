import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import ChartSection from "../components/ChartSection";
import ConfirmationModal from "../components/ConfirmationModal";

function Dashboard({ leads = [], activities = [], calls = [] }) {
  const [stats, setStats] = useState({
    totalChats: 0,
    totalLeads: 0,
    siteVisits: 0,
    highIntentLeads: 0,
  });
  const [localLeads, setLocalLeads] = useState(leads);
  const [localActivities, setLocalActivities] = useState([]);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLead, setConfirmLead] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(
          "http://127.0.0.1:8000/api/dashboard/stats"
        );
        setStats(statsRes.data);

        const leadsRes = await axios.get(
          "http://127.0.0.1:8000/api/chat/all-leads"
        );
        const fetchedLeads = leadsRes.data.map((item) => ({
          name: item.name || "Unknown",
          phone: item.phone || "N/A",
          status: item.status || "Interested",
          property_name: item.property_name || "",
          budget: item.budget || "",
          location: item.location || "",
          followUpDate: item.follow_up_date || "",
          visitDate: item.visit_date || "",
          notes: item.notes || "",
          createdAt: item.created_at,
          userMessage: `Interested in ${item.property_name || "Property"}`,
          aiResponse: "Lead captured from chatbot",
          sentiment: "Chatbot Lead"
        }));
        setLocalLeads(fetchedLeads);

        const callsRes = await axios.get(
          "http://127.0.0.1:8000/api/call/history"
        );
        const fetchedCalls = callsRes.data;

        const events = [];

        fetchedLeads.forEach(lead => {
          if (lead.createdAt) {
            events.push({
              time: lead.createdAt,
              text: `Lead captured: ${lead.name} (${lead.status})`,
              rawTime: new Date(lead.createdAt).getTime()
            });
          }
        });

        fetchedCalls.forEach(call => {
          if (call.created_at) {
            events.push({
              time: call.created_at,
              text: `Call completed with ${call.name} - Status: ${call.status}, Sentiment: ${call.sentiment || 'N/A'}`,
              rawTime: new Date(call.created_at).getTime()
            });
          }
        });

        events.sort((a, b) => b.rawTime - a.rawTime);
        setLocalActivities(events);

      } catch (error) {
        console.error("Dashboard fetch failed", error);
      }
    };

    fetchData();
  }, []);

 

  // ================= AI INSIGHTS =================
  const getInsights = () => {
    if (localLeads.length === 0) return [];

    const locationCount = {};
    localLeads.forEach((l) => {
      if (!l.location) return;
      locationCount[l.location] = (locationCount[l.location] || 0) + 1;
    });

    const bestLocation = Object.keys(locationCount).length
      ? Object.keys(locationCount).reduce((a, b) =>
          locationCount[a] > locationCount[b] ? a : b
        )
      : "N/A";

    const budgetCount = {};
    localLeads.forEach((l) => {
      if (!l.budget) return;
      budgetCount[l.budget] = (budgetCount[l.budget] || 0) + 1;
    });

    const bestBudget = Object.keys(budgetCount).length
      ? Object.keys(budgetCount).reduce((a, b) =>
          budgetCount[a] > budgetCount[b] ? a : b
        )
      : "N/A";

    const hotCount = localLeads.filter((l) => l.status === "Hot").length;

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
    if (localLeads.length === 0) return null;

    const priority = { Hot: 3, Warm: 2, Cold: 1 };

    return [...localLeads].sort(
      (a, b) => (priority[b.status] || 0) - (priority[a.status] || 0)
    )[0];
  };

  const bestLead = getBestLead();

  // ================= NEXT ACTION =================
  const getNextAction = () => {
    if (localLeads.length === 0) return "No actions yet";

    const hotLead = localLeads.find((l) => l.status === "Hot");
    if (hotLead) return `🔥 Close deal with ${hotLead.name}`;

    const warmLead = localLeads.find((l) => l.status === "Warm");
    if (warmLead) return `📅 Follow up ${warmLead.name}`;

    const coldLead = localLeads.find((l) => l.status === "Cold");
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
              <h3>Total Chats 💬</h3>
              <p>{stats.totalChats}</p>
            </div>

            <div className="card">
              <h3>Total Leads 🏠</h3>
              <p>{stats.totalLeads}</p>
            </div>

            <div className="card">
              <h3>High-Intent Leads 🔥</h3>
              <p>{stats.highIntentLeads}</p>
            </div>

            <div className="card">
              <h3>Booked site Visits 📅</h3>
              <p>{stats.siteVisits}</p>
            </div>
          </div>

          {/* ================= CHART ================= */}
          <div className="charts-section">
            <ChartSection leads={localLeads} />
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
                  {localLeads.length === 0 ? (
                    <tr>
                      <td colSpan="7">No leads yet</td>
                    </tr>
                  ) : (
                    localLeads.slice(-5).reverse().map((lead) => (
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
                          <button className="view-btn" title="View Details">👁</button>
                          <button 
                            className="confirm-btn" 
                            title="Send Confirmation"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmLead(lead);
                              setIsConfirmOpen(true);
                            }}
                          >
                            💬
                          </button>
                          <button className="delete-btn" title="Delete Lead">❌</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="activity-feed">
              <h2>AI Activity Feed 🤖</h2>

              {localActivities.length === 0 ? (
                <p>No activity yet</p>
              ) : (
                localActivities.slice(0, 5).map((act, index) => {
                  let icon = "📌";

                  if (act.text.includes("Calling") || act.text.includes("Call")) icon = "📞";
                  else if (act.text.includes("captured") || act.text.includes("Captured")) icon = "📥";
                  else if (act.text.includes("responded")) icon = "💬";
                  else if (act.text.includes("HOT") || act.text.includes("Hot") || act.text.includes("Warm")) icon = "🔥";
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

      {toast.message && (
        <div className={`premium-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"} {toast.message}
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        lead={confirmLead}
        onClose={() => {
          setIsConfirmOpen(false);
          setConfirmLead(null);
        }}
        showToast={showToast}
      />
    </div>
  );
}

export default Dashboard;