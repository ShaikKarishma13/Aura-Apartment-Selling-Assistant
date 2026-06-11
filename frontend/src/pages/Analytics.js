import { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Analytics({ leads = [] }) {
  const [filter, setFilter] = useState("All");
  const [localLeads, setLocalLeads] = useState(leads);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/chat/all-leads"
        );
        const fetchedLeads = response.data.map((item) => ({
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
        }));
        setLocalLeads(fetchedLeads);
      } catch (error) {
        console.error("Failed fetching leads in Analytics", error);
      }
    };
    fetchLeads();
  }, []);

  // 🔹 METRICS BASED ON DYNAMIC LEADS
  const total = localLeads.length;
  const highIntentCount = localLeads.filter(
    (l) => l.status === "Hot" || l.status === "Warm"
  ).length;

  const highIntentRate =
    total === 0 ? 0 : Math.round((highIntentCount / total) * 100);

  const callSuccess = Math.min(100, highIntentRate + 20);

  // 🔹 PIE DATA
  const leadData = [
    { name: "High-Intent", value: highIntentCount },
    { name: "Other Leads", value: total - highIntentCount }
  ];

  const callData = [
    { name: "Successful", value: callSuccess },
    { name: "Remaining", value: 100 - callSuccess }
  ];

  const LEAD_COLORS = ["#00f5ff", "rgba(255, 255, 255, 0.12)"];
  const CALL_COLORS = ["#00e676", "rgba(255, 255, 255, 0.12)"];

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-wrap">
          <h1 className="page-title">Analytics 📊</h1>

          {/* 🔹 FILTER */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="analytics-filter"
          >
            <option>All</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>

          {/* 🔹 CHARTS */}
          <div className="analytics-grid">

            {/* High-Intent Card */}
            <div className="analytics-card">
              <h3>High-Intent Leads %</h3>
              <h2>{highIntentRate}%</h2>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={leadData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {leadData.map((entry, i) => (
                        <Cell key={i} fill={LEAD_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Call Success Card */}
            <div className="analytics-card">
              <h3>Call Success Rate</h3>
              <h2>{callSuccess}%</h2>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={callData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {callData.map((entry, i) => (
                        <Cell key={i} fill={CALL_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 🔹 INSIGHTS */}
          <div className="insights-panel" style={{ marginTop: "40px" }}>
            <h2>Insights 💡</h2>

            {total === 0 ? (
              <p>No data available</p>
            ) : (
              <>
                <p>🔥 Hot/Warm leads drive most conversions</p>
                <p>📞 Higher engagement improves success rate</p>
                <p>📊 Total Leads: {total}</p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;