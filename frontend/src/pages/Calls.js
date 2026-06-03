import { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

function Calls({ calls, setCalls }) {
  const [selectedCall, setSelectedCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  // 🔥 AUTO TIMER
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

  
  // 📜 LOAD CALL HISTORY FROM DATABASE
useEffect(() => {
  fetch("http://127.0.0.1:8000/api/call/history")
    .then((res) => res.json())
    .then((data) => {
      setCallHistory(data);
    })
    .catch((err) => {
      console.error(err);
    });
}, []);

  useEffect(() => {
  localStorage.setItem(
    "callHistory",
    JSON.stringify(callHistory)
  );
}, [callHistory]);

  // ❌ END CALL
  const handleEndCall = (id) => {
    const endedCall = calls.find((c) => c.id === id);

    if (endedCall) {
      setCallHistory((prev) => [
        {
          ...endedCall,
          phone: endedCall.phone,
          duration: endedCall.time,
          sentiment: endedCall.sentiment || "Neutral",
          
          transcript: `
Customer: Looking for 2BHK

Budget: 60 Lakhs

Location: Hyderabad
          `,

          endedAt: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    }
    try {
      console.log({
        name: endedCall.name,
        phone: endedCall.phone,
        duration: endedCall.time,
        sentiment: endedCall.sentiment || "Neutral",
        transcript: `
Customer: Looking for 2BHK

Budget: 60 Lakhs

Location: Hyderabad
`    ,
    status: "Completed",
});


  fetch(
    "http://127.0.0.1:8000/api/call/save-history",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: endedCall.name,

        phone: endedCall.phone,

        duration: endedCall.time,

        sentiment:
          endedCall.sentiment || "Neutral",

        transcript: `
Customer: Looking for 2BHK

Budget: 60 Lakhs

Location: Hyderabad
        `,

        status: "Completed",
      }),
    }
  );
} catch (err) {
  console.error(err);
}

    setCalls((prev) => prev.filter((c) => c.id !== id));
    setSelectedCall(null);
  };

  // ⭐ INTERESTED
  const handleInterested = () => {
    alert("Lead marked as Interested 🔥");
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-wrap">
          <h1 className="page-title">Call Center 📞</h1>

          {/* TOP SECTION */}
          <div className="calls-container">

            {/* LEFT */}
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

            {/* RIGHT */}
            <div className="calls-right">
              {selectedCall ? (
                <>
                  <h2>{selectedCall.name}</h2>

                  <p>
                    <b>Status:</b> {selectedCall.status}
                  </p>

                  <h3>🎙️ Live Transcript</h3>

                  <div className="transcript">
                    <p>Waiting for Twilio transcription...</p>
                  </div>

                  <div className="call-info">
                    <p>
                      <b>Phone:</b> {selectedCall.phone}
                    </p>

                    <p>
                      <b>Duration:</b> {selectedCall.time}s
                    </p>

                    <p>
                      <b>Status:</b> {selectedCall.status}
                    </p>
                  </div>

                  <h3>Sentiment</h3>

                  <p>
                    {selectedCall.sentiment === "Positive" &&
                      "😊 Positive"}

                    {selectedCall.sentiment === "Neutral" &&
                      "😐 Neutral"}

                    {selectedCall.sentiment === "Negative" &&
                      "😡 Negative"}
                  </p>

                  <div className="call-actions">
                    <button disabled>
                      🎧 Listen (Coming Soon)
                    </button>

                    <button
                      onClick={() =>
                        handleEndCall(selectedCall.id)
                      }
                    >
                      ❌ End Call
                    </button>

                    <button
                      onClick={handleInterested}
                    >
                      ⭐ Mark Interested
                    </button>
                  </div>
                </>
              ) : (
                <p>Select a call to view details</p>
              )}
            </div>
          </div>

          {/* CALL HISTORY */}
          <div className="call-history-card">
            <h2>📜 Recent Call History</h2>

            {callHistory.length === 0 ? (
              <p>No completed calls yet</p>
            ) : (
              callHistory.map((call, index) => (
                <div
                  key={index}
                  className="history-item"
                >
                  <b>{call.name}</b>
                  <span>
  📞 {call.phone}
</span>

                  <span>
                    Duration: {call.duration}s
                  </span>

                  <span>
                    {call.sentiment}
                  </span>

                  <span>
                    {call.endedAt}
                  </span>

                  <button
                    onClick={() =>
                      setSelectedTranscript(call.transcript)
                    }
                  >
                    View Transcript
                  </button>
                </div>
              ))
            )}
          </div>

          {/* TRANSCRIPT VIEWER */}
          {selectedTranscript && (
            <div className="call-history-card">
              <h2>📄 Transcript</h2>

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  color: "white",
                }}
              >
                {selectedTranscript}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calls;