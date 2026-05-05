import { useState } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Analytics({ leads = [] }) {
  const [filter, setFilter] = useState("All");

  // 🔹 SIMPLE METRICS
  const total = leads.length;
  const hot = leads.filter(l => l.status === "Hot").length;
  const converted = hot; // (simulate conversion using Hot leads)

  const highIntentRate = total === 0 ? 0 : Math.round((hot / total) * 100);

  const callSuccess = Math.min(100, highIntentRate + 20); // simulated

  // 🔹 PIE DATA
  const data = [
    { name: "Converted", value: converted },
    { name: "Remaining", value: total - converted }
  ];

  const COLORS = ["#00f5ff", "#444"];

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <h1>Analytics 📊</h1>

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

          {/* Conversion */}
          <div className="chart-container">
            <h3>High-Intent Leads %</h3>
            <h2>{highIntentRate}%</h2>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} dataKey="value">
                  {data.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Call Success */}
          <div className="chart-container">
            <h3>Call Success Rate</h3>
            <h2>{callSuccess}%</h2>
          </div>

        </div>

        {/* 🔹 INSIGHTS */}
        <div className="insights-panel">
          <h2>Insights 💡</h2>

          {total === 0 ? (
            <p>No data available</p>
          ) : (
            <>
              <p>🔥 Hot leads drive most conversions</p>
              <p>📞 Higher engagement improves success rate</p>
              <p>📊 Total Leads: {total}</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Analytics;