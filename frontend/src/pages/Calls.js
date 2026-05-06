import { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

function Calls({ calls, setCalls, setActivities }) {
  const [selectedCall, setSelectedCall] = useState(null);

  // 🔥 AUTO TIMER (updates global calls)
  useEffect(() => {
    const interval = setInterval(() => {
      setCalls((prev) =>
        prev.map((call) => ({
          ...call,
          time: call.time + 1,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [setCalls]);

  // ❌ END CALL
  const handleEndCall = (id) => {
    setCalls((prev) => prev.filter((c) => c.id !== id));
    setSelectedCall(null);
  };

  // ⭐ MARK INTERESTED
  const handleInterested = () => {
    alert("Lead marked as Interested 🔥");
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        {/* ✅ WRAPPER ADDED */}
        <div className="page-wrap">
          <h1 className="page-title">Call Center 📞</h1>

          <div className="calls-container">

            {/* LEFT SIDE */}
            <div className="calls-left">
              <h2>Active Calls</h2>

              {calls.length === 0 ? (
                <p>No active calls</p>
              ) : (
                calls.map((call) => (
                  <div
                    key={call.id}
                    className={`call-item ${
                      selectedCall?.id === call.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedCall(call)}
                  >
                    <b>{call.name}</b>
                    <span>{call.status}</span>
                    <span>{call.time}s</span>
                  </div>
                ))
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="calls-right">
              {selectedCall ? (
                <>
                  <h2>{selectedCall.name}</h2>
                  <p>Status: {selectedCall.status}</p>

                  {/* TRANSCRIPT */}
                  <h3>Live Conversation</h3>
                  <div className="transcript">
                    <p><b>AI:</b> Hello, looking for apartment?</p>
                    <p><b>User:</b> Yes, 2BHK</p>
                    <p><b>AI:</b> Suggesting best options...</p>
                  </div>

                  {/* SENTIMENT */}
                  <h3>Sentiment</h3>
                  <p>
                    {selectedCall.sentiment === "Positive" && "😊 Positive"}
                    {selectedCall.sentiment === "Neutral" && "😐 Neutral"}
                    {selectedCall.sentiment === "Negative" && "😡 Negative"}
                  </p>

                  {/* ACTIONS */}
                  <div className="call-actions">
                    <button>🎧 Listen</button>

                    <button onClick={() => handleEndCall(selectedCall.id)}>
                      ❌ End Call
                    </button>

                    <button onClick={handleInterested}>
                      ⭐ Mark Interested
                    </button>
                  </div>
                </>
              ) : (
                <p>Select a call to view details</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Calls;