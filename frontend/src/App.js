import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";   // ✅ added useEffect

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import FollowUps from "./pages/FollowUps";
import Settings from "./pages/settings";
import Analytics from "./pages/Analytics";
import Calls from "./pages/Calls";

function App() {

  // ✅ STEP 1: Load from localStorage
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem("leads");
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState([]);

  // ✅ CALLS
  const [calls, setCalls] = useState([
    { id: 1, name: "Zoya", status: "Talking", time: 10, sentiment: "Positive" },
    { id: 2, name: "John", status: "Ringing", time: 5, sentiment: "Neutral" }
  ]);

  // ✅ STEP 2: Save to localStorage whenever leads change
  useEffect(() => {
    localStorage.setItem("leads", JSON.stringify(leads));
  }, [leads]);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <Dashboard
              leads={leads}
              activities={activities}
              calls={calls}
            />
          }
        />

        <Route
          path="/leads"
          element={
            <Leads
              leads={leads}
              setLeads={setLeads}
              setActivities={setActivities}
            />
          }
        />

        <Route
          path="/follow-ups"
          element={<FollowUps leads={leads} />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/analytics"
          element={<Analytics leads={leads} />}
        />

        <Route
          path="/calls"
          element={
            <Calls
              calls={calls}
              setCalls={setCalls}
              setActivities={setActivities}
              setLeads={setLeads}
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;