import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const renderHistoryTranscript = (transcriptText, leadName) => {
  if (!transcriptText) return null;
  const lines = transcriptText.split("\n").map((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const speaker = line.substring(0, colonIdx).trim();
      const text = line.substring(colonIdx + 1).trim();
      return { speaker, text };
    }
    return { speaker: "System", text: line };
  });

  return (
    <div className="live-transcript-box" style={{ 
      height: "350px", 
      border: "1.5px solid rgba(255, 255, 255, 0.12)", 
      boxShadow: "inset 0 4px 20px rgba(0, 0, 0, 0.35)", 
      marginTop: "10px", 
      marginBottom: "25px" 
    }}>
      {lines.map((line, idx) => {
        const isAura = line.speaker === "Aura";
        const isSystem = line.speaker === "System";
        return (
          <div 
            key={idx} 
            className={`transcript-bubble-wrapper ${isAura ? "assistant" : isSystem ? "system" : "lead"}`}
            style={isSystem ? { alignSelf: "center", maxWidth: "90%", margin: "8px 0" } : {}}
          >
            <div className="bubble-speaker-label">
              {isAura ? "AURA AI ✨" : isSystem ? "SYSTEM ⚙️" : (leadName || "LEAD 👤")}
            </div>
            <div className="transcript-bubble">
              {line.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

function Calls() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryPhone = searchParams.get("phone");
  const queryName = searchParams.get("name");

  const [callHistory, setCallHistory] = useState([]);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [selectedCallData, setSelectedCallData] = useState(null);

  // Active call states
  const [callMode, setCallMode] = useState("twilio"); // demo, sandbox, twilio
  const [callStatus, setCallStatus] = useState(""); // "", Calling, Ringing, Answered, In Progress, Completed, Failed
  const [transcriptLines, setTranscriptLines] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [summaryData, setSummaryData] = useState(null);


  // Refs for socket / scrolling
  const socketRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const transcriptBoxRef = useRef(null);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nextPlayTimeRef = useRef(0);

  const fetchHistory = () => {
    fetch("http://localhost:8000/api/call/history")
      .then((res) => res.json())
      .then((data) => {
        setCallHistory(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleDeleteHistory = (callId) => {
    if (window.confirm("Are you sure you want to delete this call record?")) {
      fetch(`http://localhost:8000/api/call/history/${callId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            setCallHistory((prev) => prev.filter((call) => call.id !== callId));
            if (selectedCallData && selectedCallData.id === callId) {
              setSelectedTranscript(null);
              setSelectedCallData(null);
            }
          }
        })
        .catch((err) => {
          console.error("Error deleting call history:", err);
        });
    }
  };

  // LOAD CALL HISTORY FROM DATABASE
  useEffect(() => {
    fetchHistory();
  }, []);

  // Cleanup websocket, timer, speech, and audio context on component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Playback function for live mulaw audio packets
  const playLiveAudio = (base64Mulaw) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 8000 });
        nextPlayTimeRef.current = audioCtxRef.current.currentTime;
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      // Convert base64 to binary byte array
      const binaryString = window.atob(base64Mulaw);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode 8-bit mulaw to 32-bit float PCM
      const pcm = new Float32Array(len);
      for (let i = 0; i < len; i++) {
        let u = ~bytes[i];
        let sign = (u & 0x80) ? -1 : 1;
        let exponent = (u & 0x70) >> 4;
        let mantissa = u & 0x0f;
        let sample = (mantissa << 3) + 132;
        sample <<= exponent;
        sample = (sample - 132) * sign;
        pcm[i] = sample / 32768.0;
      }

      // Create Audio Buffer
      const buffer = audioCtx.createBuffer(1, pcm.length, 8000);
      buffer.getChannelData(0).set(pcm);

      // Create Buffer Source and play
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      const startTime = Math.max(audioCtx.currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + buffer.duration;
    } catch (err) {
      console.error("Error playing live audio:", err);
    }
  };



  // Scroll transcript to bottom (box container only)
  useEffect(() => {
    if (transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTo({
        top: transcriptBoxRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [transcriptLines]);

  // Auto-initiation on mount was removed to prevent browser autoplay blocks (which suspend Web Audio Context if there is no user gesture)
  // and to avoid React 18 Strict Mode double-calling race conditions.
  // Instead, the user manually initiates the call by clicking the "Start Twilio Call" button.




  const startActiveCall = (modeToUse) => {
    setCallMode(modeToUse);
    setCallStatus("Calling");
    setTranscriptLines([]);
    setSummaryData(null);
    setCallDuration(0);

    const wsUrl = `ws://localhost:8000/api/call/ws-active?phone=${encodeURIComponent(queryPhone)}&name=${encodeURIComponent(queryName)}&mode=${modeToUse}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected for active call");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "status") {
        setCallStatus(data.status);
        // Start timer when call is answered or moves to in-progress
        if (data.status === "Answered" || data.status === "In Progress") {
          if (!timerRef.current) {
            timerRef.current = setInterval(() => {
              setCallDuration((prev) => prev + 1);
            }, 1000);
          }
        } else if (data.status === "Completed" || data.status === "Failed") {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }

      else if (data.type === "transcript") {
        setTranscriptLines((prev) => [...prev, { speaker: data.speaker, text: data.text }]);
      }

      else if (data.type === "summary") {
        setSummaryData(data.analysis);
        fetchHistory();
      }

      else if (data.type === "audio") {
        playLiveAudio(data.payload);
      }

      else if (data.type === "error") {
        alert(data.message);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket active call closed");
      if (timerRef.current) clearInterval(timerRef.current);
    };
  };

  const endCall = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "end_call" }));
    }
    setCallStatus("Completed");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const closeActiveCallPanel = () => {
    navigate("/calls");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-wrap">
          <h1 className="page-title">📞 Call Analytics & History</h1>

          {/* ACTIVE CALL DASHBOARD */}
          {queryPhone && (
            <div className="active-call-container">
              {!callStatus ? (
                <div className="call-setup-card">
                  <div className="call-setup-header">
                    <h2>Initiate Outbound Call</h2>
                    <p>Ready to call <b>{queryName}</b> ({queryPhone}) via Twilio.</p>
                  </div>
                  <div className="setup-buttons">
                    <button className="start-call-btn" onClick={() => startActiveCall("twilio")}>
                      Start Twilio Call
                    </button>
                    <button className="cancel-call-btn" onClick={closeActiveCallPanel}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="live-call-card">
                  <div className="live-call-layout">
                    {/* Call Control Sidebar */}
                    <div className="live-call-sidebar">
                      <div className="live-call-lead-info">
                        <span className="live-avatar">👤</span>
                        <h3>{queryName}</h3>
                        <p>{queryPhone}</p>
                      </div>

                      <div className="live-status-section">
                        <div className="status-badge-container">
                          <span className={`status-dot ${callStatus.toLowerCase()}`} />
                          <span className="status-text">{callStatus}</span>
                        </div>
                        <div className="timer-display">{formatTime(callDuration)}</div>
                      </div>

                      {/* Waveform visualizer — shown when call is live */}
                      {(callStatus === "Answered" || callStatus === "In Progress") && (
                        <div className="waveform-box">
                          <div className="wave-bar bar-1" />
                          <div className="wave-bar bar-2" />
                          <div className="wave-bar bar-3" />
                          <div className="wave-bar bar-4" />
                          <div className="wave-bar bar-5" />
                          <div className="wave-bar bar-6" />
                        </div>
                      )}

                      <div className="call-action-controls">

                        {callStatus !== "Completed" && callStatus !== "Failed" ? (
                          <button className="end-call-btn-red" onClick={endCall}>
                            End Call
                          </button>
                        ) : (
                          <button className="end-call-btn-red completed" onClick={closeActiveCallPanel}>
                            Close Session
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Transcription Area */}
                    <div className="live-transcript-panel">
                      <div className="transcript-header">
                        <h4>Live Transcription</h4>
                        {callStatus !== "Completed" && (
                          <div className="live-recording-indicator">
                            <span className="record-red-dot" />
                            <span>REC</span>
                          </div>
                        )}
                      </div>

                      <div ref={transcriptBoxRef} className="live-transcript-box">
                        {transcriptLines.length === 0 ? (
                          <div className="transcript-placeholder">
                            <p>Connecting voice stream...</p>
                          </div>
                        ) : (
                          transcriptLines.map((line, idx) => (
                            <div 
                              key={idx} 
                              className={`transcript-bubble-wrapper ${line.speaker === "Aura" ? "assistant" : "lead"}`}
                            >
                              <div className="bubble-speaker-label">
                                {line.speaker === "Aura" ? "AURA AI ✨" : queryName}
                              </div>
                              <div className="transcript-bubble">
                                {line.text}
                              </div>
                            </div>
                          ))
                        )}

                        <div ref={transcriptEndRef} />
                      </div>
                    </div>
                  </div>

                  {/* Summary / Analysis panel */}
                  {summaryData && (
                    <div className="active-call-summary-panel" style={{ marginTop: "20px" }}>
                      <div className="summary-header">
                        <h3>🤖 Session Complete & Evaluated</h3>
                        <span className={`intent-badge ${summaryData.status?.toLowerCase() || "warm"}`}>
                          Intent Score: {summaryData.status}
                        </span>
                      </div>
                      <div className="summary-grid">
                        <div className="summary-cell">
                          <strong>🏠 Property Type:</strong>
                          <span>{summaryData.property_type || "N/A"}</span>
                        </div>
                        <div className="summary-cell">
                          <strong>💰 Budget:</strong>
                          <span>{summaryData.budget || "N/A"}</span>
                        </div>
                        <div className="summary-cell">
                          <strong>📍 Location:</strong>
                          <span>{summaryData.location || "N/A"}</span>
                        </div>
                        <div className="summary-cell">
                          <strong>🎯 Intent:</strong>
                          <span>{summaryData.intent || "N/A"}</span>
                        </div>
                        <div className="summary-cell">
                          <strong>😊 Sentiment:</strong>
                          <span>{summaryData.sentiment || "N/A"}</span>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "15px" }}>
                        <h4 style={{ color: "#38bdf8", marginBottom: "8px" }}>📝 Conversation Summary</h4>
                        <p style={{ color: "#e0e0e0", fontSize: "0.95rem", lineHeight: "1.4" }}>{summaryData.summary || "Generating..."}</p>
                        
                        <h4 style={{ color: "#38bdf8", marginTop: "15px", marginBottom: "8px" }}>🔑 Key Discussion Points</h4>
                        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", color: "#e0e0e0", fontSize: "0.95rem", lineHeight: "1.4" }}>
                          {summaryData.key_points || "Generating..."}
                        </pre>

                        <h4 style={{ color: "#38bdf8", marginTop: "15px", marginBottom: "8px" }}>🚀 Next Recommended Action</h4>
                        <p style={{ color: "#e0e0e0", fontSize: "0.95rem", lineHeight: "1.4" }}>{summaryData.next_action || "Generating..."}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CALL HISTORY */}
          <div className="call-history-card">
            <h2>Call History</h2>
            {callHistory.length === 0 ? (
              <p>No completed calls available</p>
            ) : (
              callHistory.map((call) => (
                <div key={call.id} className="history-item">
                  <span>
                    <b>{call.name}</b>
                  </span>
                  <span>📞 {call.phone}</span>
                  <span>⏱️ {call.duration}s</span>
                  <span className={`status-badge-history ${call.status?.toLowerCase() || "completed"}`}>
                    {call.status || "Completed"}
                  </span>
                  <div className="history-actions" style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        setSelectedTranscript(call.transcript);
                        setSelectedCallData(call);
                      }}
                    >
                      View Transcript
                    </button>
                    <button
                      className="delete-history-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHistory(call.id);
                      }}
                      title="Delete Call History"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SELECTED TRANSCRIPT */}
          {selectedTranscript && (
            <div className="call-history-card">
              <h2>📄 Transcript</h2>
              {renderHistoryTranscript(selectedTranscript, selectedCallData?.name)}
              
              <h2 style={{ marginTop: "30px", marginBottom: "15px" }}>🤖 AI Analysis & Evaluation</h2>
              <div className="summary-grid" style={{ marginBottom: "25px" }}>
                <div className="summary-cell">
                  <strong>🏠 Property Type:</strong>
                  <span>{selectedCallData?.property_type || "N/A"}</span>
                </div>
                <div className="summary-cell">
                  <strong>💰 Budget:</strong>
                  <span>{selectedCallData?.budget || "N/A"}</span>
                </div>
                <div className="summary-cell">
                  <strong>📍 Location:</strong>
                  <span>{selectedCallData?.location || "N/A"}</span>
                </div>
                <div className="summary-cell">
                  <strong>🎯 Intent:</strong>
                  <span>{selectedCallData?.intent || "N/A"}</span>
                </div>
                <div className="summary-cell">
                  <strong>😊 Sentiment:</strong>
                  <span>{selectedCallData?.sentiment || "N/A"}</span>
                </div>
                <div className="summary-cell">
                  <strong>🏷️ Lead Status:</strong>
                  <span className={`status-badge-history ${selectedCallData?.status?.toLowerCase() || "warm"}`} style={{ marginTop: "4px" }}>
                    {selectedCallData?.status || "Warm"}
                  </span>
                </div>
              </div>
              
              <div className="analysis-sub-card">
                <h4 className="analysis-sub-title">📝 Overall Conversation Summary</h4>
                <p className="analysis-sub-content">{selectedCallData?.summary || "No summary available"}</p>
              </div>
              
              <div className="analysis-sub-card">
                <h4 className="analysis-sub-title">🔑 Key Discussion Points</h4>
                <pre className="analysis-sub-content-pre">
                  {selectedCallData?.key_points || "No key points available"}
                </pre>
              </div>

              <div className="analysis-sub-card">
                <h4 className="analysis-sub-title">📋 Customer Requirements</h4>
                <p className="analysis-sub-content">{selectedCallData?.requirements || "No requirements documented"}</p>
              </div>

              <div className="analysis-sub-card">
                <h4 className="analysis-sub-title">🚀 Next Recommended Action</h4>
                <p className="analysis-sub-content">{selectedCallData?.next_action || "No next actions defined"}</p>
              </div>

              {selectedCallData?.follow_up_notes && (
                <div className="analysis-sub-card">
                  <h4 className="analysis-sub-title">📅 Follow-Up Notes</h4>
                  <p className="analysis-sub-content">{selectedCallData.follow_up_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calls;
