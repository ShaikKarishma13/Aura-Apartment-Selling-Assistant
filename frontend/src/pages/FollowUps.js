import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

function FollowUps({ leads = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = [];
  const todayList = [];
  const upcoming = [];

  leads.forEach((lead) => {
    if (!lead.followUpDate) return;

    const date = new Date(lead.followUpDate);
    if (isNaN(date)) return;

    date.setHours(0, 0, 0, 0);

    if (date < today) overdue.push(lead);
    else if (date.getTime() === today.getTime()) todayList.push(lead);
    else upcoming.push(lead);
  });

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="followups-page-wrap">
          <h1 className="followups-page-title">Follow-ups 📅</h1>

          <Section title="Overdue 🔴" leads={overdue} />
          <Section title="Today 🟡" leads={todayList} />
          <Section title="Upcoming 🟢" leads={upcoming} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, leads }) {
  return (
    <div className="follow-section">
      <h2>{title}</h2>

      {leads.length === 0 ? (
        <p>No leads</p>
      ) : (
        leads.map((lead) => (
          <div key={lead.phone} className="follow-item">
            <span>
              <b>{lead.name}</b> ({lead.phone})
              <span className={`status ${lead.status.toLowerCase()}`}>
                {" "}
                {lead.status}
              </span>
            </span>

            <span className="date">{lead.followUpDate}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default FollowUps;