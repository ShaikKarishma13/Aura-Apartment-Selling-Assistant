import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import ChartSection from "../components/ChartSection";

function Dashboard({ leads = [], activities = [] }) {
  console.log("Dashboard loaded");
  console.log("Leads data:", leads);
  console.log("Activities:", activities);

  const totalLeads = leads.length;

  const hotLeads = leads.filter((l) => l.status === "Hot").length;
  const warmLeads = leads.filter((l) => l.status === "Warm").length;
  const coldLeads = leads.filter((l) => l.status === "Cold").length;

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <h1>Dashboard Overview 🚀</h1>

        {/* ================= CARDS ================= */}
        <div className="cards">
          <div className="card">
            <h3>Total Leads</h3>
            <p>{totalLeads}</p>
          </div>

          <div className="card">
            <h3>Hot Leads 🔥</h3>
            <p>{hotLeads}</p>
          </div>

          <div className="card">
            <h3>Warm Leads 🌤️</h3>
            <p>{warmLeads}</p>
          </div>

          <div className="card">
            <h3>Cold Leads ❄️</h3>
            <p>{coldLeads}</p>
          </div>
        </div>

        {/* ================= CHARTS ================= */}
        <div className="charts-section">
          <ChartSection leads={leads} />
        </div>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="bottom-section">

          {/* LEFT → LEADS TABLE */}
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

          {/* RIGHT → ACTIVITY FEED */}
          <div className="activity-feed">
            <h2>Activity Feed 🔔</h2>

            {activities.length === 0 ? (
              <p>No activity yet</p>
            ) : (
              activities.slice(0, 5).map((act, index) => (
                <div key={index} className="activity-item">
                  <b>
                    {new Date(act.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </b>{" "}
                  - {act.text}
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;