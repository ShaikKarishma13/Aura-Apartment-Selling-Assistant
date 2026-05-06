import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import FollowUps from "./pages/FollowUps";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Calls from "./pages/Calls";

function App() {
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);

  // ✅ GLOBAL SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ CALLS
  const [calls, setCalls] = useState([
    { id: 1, name: "A", status: "Talking", time: 10, sentiment: "Positive" },
    { id: 2, name: "B", status: "Ringing", time: 5, sentiment: "Neutral" }
  ]);

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
              searchQuery={searchQuery}   // ✅ PASS
              setSearchQuery={setSearchQuery}
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
              searchQuery={searchQuery}   // ✅ PASS
              setSearchQuery={setSearchQuery}
            />
          }
        />

        <Route
          path="/follow-ups"
          element={
            <FollowUps
              leads={leads}
              searchQuery={searchQuery}   // (optional future use)
              setSearchQuery={setSearchQuery}
            />
          }
        />

        <Route
          path="/settings"
          element={
            <Settings
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          }
        />

        <Route
          path="/analytics"
          element={
            <Analytics
              leads={leads}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          }
        />

        <Route
          path="/calls"
          element={
            <Calls
              calls={calls}
              setCalls={setCalls}
              setActivities={setActivities}
              setLeads={setLeads}
              searchQuery={searchQuery}   // ✅ PASS
              setSearchQuery={setSearchQuery}
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;