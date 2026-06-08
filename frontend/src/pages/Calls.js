import { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

function Calls() {

  const [callHistory, setCallHistory] = useState([]);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [selectedCallData, setSelectedCallData] = useState(null);

  // LOAD CALL HISTORY FROM DATABASE
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

  return (
    <div className="dashboard">

      <Sidebar />

      <div className="main-content">

        <Topbar />

        <div className="page-wrap">

          <h1 className="page-title">
            📞 Call Analytics & History
          </h1>

          {/* CALL HISTORY */}

          <div className="call-history-card">

            <h2>Call History</h2>

            {callHistory.length === 0 ? (

              <p>No completed calls available</p>

            ) : (

              callHistory.map((call) => (

                <div
                  key={call.id}
                  className="history-item"
                >

                  <span>
                    <b>{call.name}</b>
                  </span>

                  <span>
                    📞 {call.phone}
                  </span>

                  <span>
                    ⏱️ {call.duration}s
                  </span>

                  <span>
                    ✅ {call.status}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedTranscript(
                        call.transcript
                      );

                      setSelectedCallData(call);
                    }}
                  >
                    View Transcript
                  </button>

                </div>

              ))
            )}

          </div>

          {/* TRANSCRIPT */}

          {selectedTranscript && (

            <div className="call-history-card">

              <h2>📄 Transcript</h2>

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  color: "white"
                }}
              >
                {selectedTranscript}
              </pre>

              <hr />

              <h2>🤖 AI Analysis</h2>

              <p>
                🏠 Property Type:
                {" "}
                {selectedCallData?.property_type || "N/A"}
              </p>

              <p>
                💰 Budget:
                {" "}
                {selectedCallData?.budget || "N/A"}
              </p>

              <p>
                📍 Location:
                {" "}
                {selectedCallData?.location || "N/A"}
              </p>

              <p>
                🎯 Intent:
                {" "}
                {selectedCallData?.intent || "N/A"}
              </p>

              <p>
                😊 Sentiment:
                {" "}
                {selectedCallData?.sentiment || "N/A"}
              </p>

              <hr />

              <h2>🎧 Recording</h2>

              {selectedCallData?.recording_url ? (
                <audio
                  controls
                  src={selectedCallData.recording_url}
                  style={{
                    width: "100%",
                    marginTop: "10px"
                  }}
                >
                  Your browser does not support audio playback.
                </audio>
              ) : (
                <p>
                  No recording available
                </p>
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Calls;
