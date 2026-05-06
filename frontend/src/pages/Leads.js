import { useState } from "react";
import PieChartSection from "../components/PieChartSection";

function Leads({ leads, setLeads, setActivities, searchQuery }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Hot");
  const [filter, setFilter] = useState("All");

  const [editLead, setEditLead] = useState(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");

  // 🔥 ACTIVITY LOG
  const logActivity = (message) => {
    setActivities((prev) => [
      { text: message, time: new Date() },
      ...prev,
    ]);
  };

  // ✅ EDIT
  const startEdit = (lead) => {
    setEditLead(lead);
    setName(lead.name);
    setPhone(lead.phone);
    setStatus(lead.status);
    setBudget(lead.budget || "");
    setLocation(lead.location || "");
    setFollowUpDate(lead.followUpDate || "");
  };

  // ✅ SAVE
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

    // EDIT
    if (editLead) {
      const updated = leads.map((l) =>
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

      setLeads(updated);
      logActivity(`AI updated lead ${name} → Status ${status}`);

      if (followUpDate) {
        logActivity(`Follow-up for ${name} on ${followUpDate}`);
      }

      setEditLead(null);
    }

    // ADD
    else {
      if (leads.some((l) => l.phone === phone)) {
        alert("Duplicate phone not allowed");
        return;
      }

      const newLead = {
        name,
        phone,
        status,
        budget: budget || "Low",
        location: location || "Hyderabad",
        createdAt: new Date(),
        followUpDate: followUpDate || null,
      };

      setLeads([...leads, newLead]);

      logActivity(`Calling ${name}...`);
      logActivity(`User responded: ${status}`);
      logActivity(`Lead marked ${status.toUpperCase()} 🔥`);

      if (followUpDate) {
        logActivity(`Follow-up set for ${name}`);
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
    const lead = leads.find((l) => l.phone === phone);
    setLeads(leads.filter((l) => l.phone !== phone));
    logActivity(`AI removed ${lead.name}`);
  };

  // ✅ GLOBAL SEARCH + FILTER
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);

    const matchesFilter =
      filter === "All" || lead.status === filter;

    const matchesBudget =
      budgetFilter === "All" || lead.budget === budgetFilter;

    const matchesLocation =
      locationFilter === "All" || lead.location === locationFilter;

    return (
      matchesSearch &&
      matchesFilter &&
      matchesBudget &&
      matchesLocation
    );
  });

  // FOLLOW STATUS
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

      {/* FILTERS */}
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
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} placeholder="Phone" />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>

            <input type="date" value={followUpDate || ""} onChange={(e) => setFollowUpDate(e.target.value)} />

            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Budget</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Location</option>
              <option>Hyderabad</option>
              <option>Bangalore</option>
              <option>Mumbai</option>
            </select>

            <button onClick={handleSave}>
              {editLead ? "Update" : "Add"}
            </button>
          </div>

          {/* LIST */}
          {filteredLeads.map((lead) => (
            <div key={lead.phone} className="lead-item" onClick={() => setSelectedLead(lead)}>
              <span>
                {lead.name} ({lead.phone})
                <span className={`status ${lead.status.toLowerCase()}`}>
                  {lead.status}
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

          <div className="chart-box">
            <PieChartSection leads={leads} setFilter={setFilter} />
          </div>

          {selectedLead && (
            <div className="lead-detail">
              <h3>Lead Details 👤</h3>
              <p><b>Name:</b> {selectedLead.name}</p>
              <p><b>Phone:</b> {selectedLead.phone}</p>
              <p><b>Status:</b> {selectedLead.status}</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Leads;