import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import FollowUps from "./pages/FollowUps";
import Settings from "./pages/settings";
import Analytics from "./pages/Analytics";
import Calls from "./pages/Calls";
import AIAssistant from "./pages/AIAssistant";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";

function App() {

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem("leads");
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    localStorage.setItem(
      "leads",
      JSON.stringify(leads)
    );
  }, [leads]);

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Auth />}
        />

        <Route
          path="/dashboard"
          element={
            <Dashboard
              leads={leads}
              activities={activities}
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
          element={
            <FollowUps
              leads={leads}
            />
          }
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/analytics"
          element={
            <Analytics
              leads={leads}
            />
          }
        />

        <Route
          path="/ai-assistant"
          element={<AIAssistant />}
        />

        <Route
          path="/calls"
          element={<Calls />}
        />

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route
          path="/properties/:id"
          element={<PropertyDetails />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;