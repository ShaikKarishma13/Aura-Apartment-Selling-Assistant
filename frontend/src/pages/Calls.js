import { useState } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

function Calls() {
  const [activeCalls, setActiveCalls] = useState([
    { name: "A", status: "Talking", time: 45 },
    { name: "B", status: "Ringing", time: 10 }
  ]);

  const [selectedCall, setSelectedCall] = useState(null);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <h1>Call Center 📞</h1>

        <div className="calls-container">

          {/* LEFT SIDE */}
          <div className="calls-left">
            <h2>Active Calls</h2>

            {activeCalls.map((call, i) => (
              <div
                key={i}
                className="call-item"
                onClick={() => setSelectedCall(call)}
              >
                <b>{call.name}</b>
                <span>{call.status}</span>
                <span>{call.time}s</span>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="calls-right">
            {selectedCall ? (
              <>
                <h2>Live Conversation</h2>

                <div className="transcript">
                  <p>Hello, I'm interested in this property...</p>
                  <p>Agent: Great! Let me explain details.</p>
                </div>

                <h3>Sentiment 😊</h3>

                <div className="call-actions">
                  <button>🎧 Listen</button>
                  <button>❌ End Call</button>
                  <button>⭐ Mark Interested</button>
                </div>
              </>
            ) : (
              <p>Select a call to view details</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Calls;