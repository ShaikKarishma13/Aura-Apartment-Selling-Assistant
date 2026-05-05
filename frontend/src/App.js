import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import FollowUps from "./pages/FollowUps";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Calls from "./pages/Calls"; // ✅ FIXED (capital C)

function App() {
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Auth />} />

        <Route
          path="/dashboard"
          element={<Dashboard leads={leads} activities={activities} />}
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

        {/* ✅ ADD CALLS ROUTE */}
        <Route
          path="/calls"
          element={<Calls />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;