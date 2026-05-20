function LeadList({ leads, onDelete }) {
  return (
    <div>
      <h2>Leads List</h2>

      {leads.length === 0 ? (
        <p>No leads yet...</p>
      ) : (
        leads.map((lead, index) => (
          <div key={index} className="lead-item">
            <span>{lead.name}</span>
            <span>{lead.phone}</span>

            <button
              onClick={() => onDelete(index)}
              style={{ width: "auto", padding: "5px 10px", marginLeft: "10px" }}
            >
              ❌
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default LeadList;

