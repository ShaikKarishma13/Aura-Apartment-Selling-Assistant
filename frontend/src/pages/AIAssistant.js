import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  speakWithElevenLabs,
  stopElevenLabsAudio
} from "../services/elevenlabs";

function AIAssistant() {
  const audioRef = useRef(null);
    const getWelcomeMessage = (lang) => {

  if (lang === "Hindi") {
    return "नमस्ते 👋 मैं आपकी AI Apartment Sales Assistant हूँ। मैं आपकी कैसे सहायता कर सकती हूँ?";
  }

  else if (lang === "Telugu") {
    return "హలో 👋 నేను మీ AI Apartment Sales Assistant ని. మీకు ఎలా సహాయం చేయగలను?";
  }

  else {
    return "Hello 👋 I am your AI Apartment Sales Assistant. How can I help you today?";
  }
};

const [messages, setMessages] = useState([
  {
    sender: "ai",
    text: getWelcomeMessage("English")
  }
]);

  

  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = 
      "visitor_" +
      Math.random().toString(36).substring(2, 10);
      localStorage.setItem(
        "visitor_id",
        visitorId
      );
    }


  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth"
  });

}, [messages, isTyping]);
useEffect(() => {

  const loadHistory = async () => {

    try {

      const visitorId =
        localStorage.getItem("visitor_id");

      if (!visitorId) return;

      const response = await axios.get(
        `http://127.0.0.1:8000/api/chat/chat-history/${visitorId}`
      );

      const formattedMessages =
        response.data.map(chat => ({
          sender:
            chat.role === "user"
              ? "user"
              : "bot",
          text: chat.message
        }));

      if (formattedMessages.length > 0) {
        setMessages(formattedMessages);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
            });
          }, 200);
        
      }

    } catch (error) {
      console.error(
        "History load error:",
        error
      );
    }
  };

  loadHistory();

}, []);
  const [isListening, setIsListening] = useState(false);
  let recognition;
  const [language, setLanguage] = useState("English");

  // 🎤 VOICE INPUT

  const startVoiceInput = () => {
    stopElevenLabsAudio();

    window.speechSynthesis.cancel();
    


    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    setIsListening(true);


    // WAIT SLIGHTLY BEFORE STARTING MIC
setTimeout(() => {
  recognition.start();
}, 400);

   

    recognition.onstart = () => {
      console.log("🎤 Listening...");
    };

    recognition.onresult = (event) => {

      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }

        

      setInput(transcript);
    };

    recognition.onerror = (event) => {
        console.log("Mic error:", event.error);
        if (event.error === "not-allowed") {
            alert("Please allow microphone access");
        }
        if (event.error === "no-speech") {
             alert("No speech detected");
        }
      

    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("🎤Voice recognition ended");
    };
  };
  const clearChat = () => {
    // STOP ELEVENLABS AUDIO
    stopElevenLabsAudio();

 // STOP BROWSER VOICE
    window.speechSynthesis.cancel();

  

  setMessages([
    {
      sender: "ai",
      text: getWelcomeMessage(language),
    },
  ]);

};



  // 🤖 SEND MESSAGE
  const handleSend = async () => {

    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;

    setInput("");
    setIsTyping(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/chat/ai-chat",
        {
          message: input,
          language: language,
          visitor_id: localStorage.getItem("visitor_id")
        }
      );

      
      setIsTyping(false);

      const aiReply = {
        sender: "ai",
        text: response.data.reply,
      };

      setMessages((prev) => [...prev, aiReply]);
      await speakWithElevenLabs(aiReply.text,language);
      
      // 🔊 AI VOICE OUTPUT







    } catch (error) {

      console.error(error);
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Failed to connect with AI Assistant"
        }
      ]);
      
    }
  };



  return (
    <div className="main-content">

      <div
        style={{
          maxWidth: "980px",
          margin: "40px auto",
          background: darkMode
  ? "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))"
  : "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))",
  transition: "0.5s ease",
          border: "1.5px solid rgba(255,255,255,0.22)",
          borderRadius: "32px",
          padding: "32px",
          backdropFilter: "blur(45px)",
          WebkitBackdropFilter: "blur(35px)",
          minHeight: "84vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(31, 38, 135, 0.45)",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >

        <h1
          style={{
            color: "white",
            marginBottom: "5px",
            fontsize: "50px",
            fontWeight: "bold",
          }}
        >
          AURA ✨ 
        </h1>
        <p
        style={{
            color:"rgba(255,255,255,0,7)",
            marginBottom: "20px",
            fontsize: "16px",
            color: "white",
            fontWeight: "bold",
            
        }}
        >
    
    
        Powered by EVA AI
        </p>
        <button
  onClick={() => setDarkMode(!darkMode)}

  style={{
    position: "absolute",
    top: "25px",
    right: "25px",

    width: "52px",
    height: "52px",

    borderRadius: "14px",

    border: "none",

    background: "white",

    color: "#111",

    fontSize: "22px",

    cursor: "pointer",
    fontWeight: "bold",

    

    boxShadow: "0 4px 15px rgba(0,0,0,0.18)",

    transition: "all 0.3s ease",

    zIndex: 10,
  }}
>
  {darkMode ? "☀️ " : "🌙 "}
</button>

<button
  onClick={clearChat}

  style={{
    position: "absolute",
    top: "25px",
    right: "95px",

    height: "52px",

    padding: "0 18px",

    borderRadius: "14px",

    border: "none",

    background: "white",

    color: "#111",

    fontSize: "15px",

    cursor: "pointer",

    fontWeight: "bold",

    boxShadow: "0 4px 15px rgba(0,0,0,0.18)",

    transition: "all 0.3s ease",

    zIndex: 10,
  }}
>
  🗑 Clear
</button>
        
        

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            padding: "10px",
          }}
        >

          {messages.map((msg, index) => (

            <div
              key={index}
              style={{
                alignSelf:
                  msg.sender === "user"
                    ? "flex-end"
                    : "flex-start",

                background:
                  msg.sender === "user"
                    ? "linear-gradient(135deg, #00c6ff, #0072ff)"
                    : "rgba(255,255,255,0.12)",

                color: "white",

                padding: "12px 18px",

                borderRadius: "18px",
                border:
  msg.sender === "user"
    ? "1px solid rgba(255,255,255,0.2)"
    : "1px solid rgba(255,255,255,0.12)",

backdropFilter: "blur(15px)",

boxShadow:
  msg.sender === "user"
    ? "0 4px 20px rgba(0,198,255,0.35)"
    : "0 4px 18px rgba(255,255,255,0.08)",

                maxWidth: "85%",
                
                
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
            </div>

          ))}
          {isTyping && (

  <div
    style={{
      alignSelf: "flex-start",

      background:
        "rgba(255,255,255,0.12)",

      color: "white",

      padding: "12px 18px",

      borderRadius: "15px",

      maxWidth: "200px",

      fontStyle: "italic",

      animation: "pulse 1.5s infinite",
    }}
  >
    Aura is typing...
    
  </div>

)}
<div ref={messagesEndRef} />

        </div>

        <div
          style={{  
            display: "flex",
            gap: "10px",
            marginTop: "20px",
          }}
        >
            <select
  value={language}
  onChange={(e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setMessages([
        {
            sender: "ai",
            text: getWelcomeMessage(selectedLang)
        }
    ]);
}}

  style={{
    padding: "14px 18px",
    borderRadius: "18px",
    border: "2px solid white",
    background: "#ffffff",
    color: "#000000",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    outline: "none",
    minWidth: "150px",
    
    appearance: "auto",
    WebkitAppearance: "menulist",
    MozAppearance: "menulist",

    transition: "all 0.3s ease",
  }}
>
  <option value="English" style={{ backgroundColor: "white",color: "black",}}>
  🇺🇸 English
</option>

<option value="Hindi" style={{backgroundColor: "white", color: "black", }}>
  🇮🇳 Hindi
</option>

<option value="Telugu" style={{ backgroundColor: "white",color: "black", }}>
  🇮🇳 Telugu
</option>
  
</select>

          <input
          className="aura-input"
            type="text"
            placeholder="Ask about apartments..."
            
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {

  if (e.key === "Enter") {

    handleSend();

  }

}}
            

            style={{
              flex: 1,
              padding: "16px",
              borderRadius: "16px",
              border: "2px solid transparent",
              outline: "none",
              fontSize: "16px",
              background: darkMode ? "white" : "#1e293b",
              color: darkMode ? "black" : "white",
              transition: "all 0.3s ease",
              
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            }}
          />



          {/* SEND BUTTON */}
          <button
            onClick={handleSend}

            style={{
              background: "#00c6ff",
              color: "white",
              border: "1.5px solid rgba(255,255,255,0.25)",
              padding: "14px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 0 12px rgba(0,198,255,0.5)",
              
            }}
          >
            Send
          </button>



          {/* MIC BUTTON */}
          <button
            onClick={startVoiceInput}

            style={{
  background: isListening
    ? "#00e676"
    : "#ff9800",

  color: "white",

  border: isListening
  ? "1.5px solid #00ffd5"
  : "1.5px solid rgba(255,255,255,0.25)",

  padding: "14px 18px",

  borderRadius: "14px",

  cursor: "pointer",

  fontWeight: "bold",

  fontSize: "20px",

  boxShadow: isListening
    ? "0 0 30px #00e676"
    : "0 0 12px rgba(255,152,0,0.5)",

  transform: isListening
    ? "scale(1.08)"
    : "scale(1)",

  transition: "all 0.3s ease",
}}

            
              
          >
            🎤
          </button>

        </div>

      </div>

    </div>
  );
}

export default AIAssistant;