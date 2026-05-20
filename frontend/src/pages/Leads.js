import { useState } from "react";
import PieChartSection from "../components/PieChartSection";
import axios from "axios";

function Leads({ leads, setLeads, setActivities }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Hot");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editLead, setEditLead] = useState(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");

  // 🔥 HELPER → AI STYLE LOG
  const logActivity = (message) => {
    setActivities((prev) => [
      {
        text: message,
        time: new Date(),
      },
      ...prev,
    ]);
  };

  // ✅ START EDIT
  const startEdit = (lead) => {
    setEditLead(lead);
    setName(lead.name);
    setPhone(lead.phone);
    setStatus(lead.status);
    setBudget(lead.budget || "");
    setLocation(lead.location || "");
    setFollowUpDate(lead.followUpDate || "");
  };

  // ✅ ADD / EDIT
  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      alert("All fields required");
      return;
    }

    if (!/^[a-zA-Z ]+$/.test(name)) {
      alert("Name should contain only letters");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Phone must be exactly 10 digits");
      return;
    }

    // ===== EDIT MODE =====
    if (editLead) {
      const updatedLeads = leads.map((l) =>
        l.phone === editLead.phone
          ? {
              ...l,
              name,
              phone,
              status,
              budget: budget || "Low",
              location: location || "Hyderabad",
              followUpDate: followUpDate || null,
            }
          : l
      );

      setLeads(updatedLeads);

      // 🔥 AI STYLE LOGS
      logActivity(`AI updated lead ${name} → Status changed to ${status}`);
      
      if (followUpDate) {
        logActivity(`Follow-up scheduled for ${name} on ${followUpDate}`);
      }

      setEditLead(null);
    }

    // ===== ADD MODE =====
    else {
      if (leads.some((lead) => lead.phone === phone)) {
        alert("Duplicate phone number not allowed");
        return;
      }

      const saveLeadToBackend = async () => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/chat/process-input",
      {
        session_id: phone,
        user_input: `Hi, I am ${name}. Looking for apartment in ${location} with ${budget} budget.`,
        history: [],
      }
    );

    console.log(response.data);

    const newLead = {
      name,
      phone,
      status: response.data.detected_intent,
      aiResponse: response.data.response_text,
      sentiment: response.data.sentiment,
      budget: budget || "Low",
      location: location || "Hyderabad",
      createdAt: new Date(),
      followUpDate: followUpDate || null,
    };

    setLeads((prev) => [...prev, newLead]);

    logActivity(`AI analyzed ${name}`);
    logActivity(`Lead classified as ${response.data.detected_intent}`);

  } catch (error) {
    console.error(error);
    alert("Backend connection failed");
  }
};

saveLeadToBackend();

      if (followUpDate) {
        logActivity(`AI scheduled follow-up for ${name} on ${followUpDate}`);
      }
    }

    // RESET
    setName("");
    setPhone("");
    setStatus("Hot");
    setFollowUpDate("");
    setBudget("");
    setLocation("");
  };

  // ✅ DELETE
  const handleDelete = (phone) => {
    const leadToDelete = leads.find((l) => l.phone === phone);

    setLeads(leads.filter((lead) => lead.phone !== phone));

    // 🔥 AI STYLE LOG
    logActivity(`AI removed lead: ${leadToDelete.name}`);
  };

  // ✅ FILTER + SEARCH
  const filteredLeads = leads.filter((lead) => {
  const matchesSearch =
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone.includes(search);

  const matchesFilter =
    filter === "All" || lead.status === filter;

  const matchesBudget =
    budgetFilter === "All" || lead.budget === budgetFilter;

  const matchesLocation =
    locationFilter === "All" || lead.location === locationFilter;

  return matchesSearch && matchesFilter && matchesBudget && matchesLocation;
});

  // 🔥 FOLLOW-UP STATUS
  const getFollowUpStatus = (date) => {
    if (!date) return "none";

    const today = new Date();
    const d = new Date(date);

    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    if (d < today) return "overdue";
    if (d.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  return (
    <div className="main-content">
      <h1>Leads Management 📋</h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name or number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {/* FILTER */}
      <div className="filters-row">

  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
    <option value="All">All Leads</option>
    <option value="Hot">🔥 Hot</option>
    <option value="Warm">🌤️ Warm</option>
    <option value="Cold">❄️ Cold</option>
  </select>

  
  <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
    <option value="All">All Budget</option>
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  </select>
  
  


  
  <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
    <option value="All">All Location</option>
    <option value="Hyderabad">Hyderabad</option>
    <option value="Bangalore">Bangalore</option>
    <option value="Mumbai">Mumbai</option>
  </select>
  
  

</div>

      <div className="leads-container">

        {/* LEFT */}
        <div className="leads-left">

          {/* FORM */}
          <div className="lead-form">
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter Phone"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value)}
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">🌤️ Warm</option>
              <option value="Cold">❄️ Cold</option>
            </select>

            <input
              type="date"
              value={followUpDate || ""}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
  <option value="">Select Budget</option>
  <option value="Low">Low</option>
  <option value="Medium">Medium</option>
  <option value="High">High</option>
</select>

<select value={location} onChange={(e) => setLocation(e.target.value)}>
  <option value="">Select Location</option>
  <option value="Hyderabad">Hyderabad</option>
  <option value="Bangalore">Bangalore</option>
  <option value="Mumbai">Mumbai</option>
</select>

            <button onClick={handleSave}>
              {editLead ? "Update Lead" : "Add Lead"}
            </button>
          </div>

          {/* LIST */}
          {filteredLeads.map((lead) => (
            <div
             key={lead.phone} 
             className="lead-item"
             onClick={() => setSelectedLead(lead)}
             >
              <span>
                {lead.name} ({lead.phone})
                <span className={`status ${lead.status.toLowerCase()}`}>
                  {" "}{lead.status}
                </span>

                {lead.followUpDate && (
                  <span className={`follow-tag ${getFollowUpStatus(lead.followUpDate)}`}>
                    📅 {lead.followUpDate}
                  </span>
                )}
              </span>

              <div>
                <button onClick={(e) => { e.stopPropagation(); startEdit(lead); }}>✏️</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.phone); }}>❌</button>
              </div>
            </div>
          ))}

        </div>

        {/* RIGHT */}
        <div className="leads-right">

  {/* TOP → CHART */}
  <div className="chart-box">
    <PieChartSection leads={leads} setFilter={setFilter} />
  </div>

  {/* BOTTOM → LEAD DETAIL */}
  {selectedLead && (
    <div className="lead-detail">
      <h3>Lead Details 👤</h3>

      <p><b>Name:</b> {selectedLead.name}</p>
      <p><b>Phone:</b> {selectedLead.phone}</p>
      <p><b>Status:</b> {selectedLead.status}</p>

      <hr />

      <h4>Call History 📞</h4>
      <p>10:30 AM - 2 min - Interested</p>
      <p>Yesterday - No Response</p>

      <hr />

      <h4>Conversation 💬</h4>
      <div className="chat-box">
        <p><b>AI:</b> Hello, looking for apartment?</p>
        <p><b>User:</b> Yes, 2BHK</p>
        <p><b>AI:</b> Suggesting options...</p>
      </div>
    </div>
  )}

</div>
        </div>

      </div>
    
  );
}

export default Leads;