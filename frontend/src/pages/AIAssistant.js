import { useState } from "react";
import axios from "axios";

function AIAssistant() {
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
  let recognition;
  const [language, setLanguage] = useState("English");

  // 🎤 VOICE INPUT
  const startVoiceInput = () => {

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

    recognition.start();

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
      console.log("🎤Voice recognition ended");
    };
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

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/api/chat/ai-chat",
        {
          message: userInput,
          language: language
        }
      );

      const aiText = response.data.reply;

      const aiReply = {
        sender: "ai",
        text: aiText
      };

      setMessages((prev) => [...prev, aiReply]);
      // 🔊 AI VOICE OUTPUT

window.speechSynthesis.cancel();

const speech = new SpeechSynthesisUtterance(aiText);
let cleanText = aiText;

// REMOVE SYMBOLS FOR BETTER VOICE
cleanText = cleanText
  .replace(/AURA/g, "ऑरा")
  .replace(/EVA AI/g, "ईवा ए आई")
  .replace(/\*/g, "")
  .replace(/#/g, "");

speech.text = cleanText;
// 🌍 LANGUAGE BASED AI VOICE
if (language === "Hindi") {
     speech.lang = "hi-IN";
}
else if (language === "Telugu") {
    speech.lang = "te-IN";
}
else {
        

speech.lang = "en-US";
}

speech.volume = 1;

speech.rate = 0.8;

speech.pitch = 1;
const voices = window.speechSynthesis.getVoices();

console.log(voices);

// 🌍 MULTI LANGUAGE VOICE SELECTION

if (language === "Hindi") {

  speech.voice =
    voices.find((voice) =>
      voice.lang.includes("hi")
    ) || voices[0];
}

else if (language === "Telugu") {

  speech.voice =
    voices.find((voice) =>
      voice.lang.includes("te")
    ) || voices[0];
}

else {

  speech.voice =
    voices.find((voice) =>
      voice.name.includes("Google UK English Female")
    ) ||

    voices.find((voice) =>
      voice.name.includes("Google US English")
    ) ||

    voices[0];
}
// STOP MIC BEFORE AI SPEAKS
if (recognition) {
  recognition.stop();
}

window.speechSynthesis.speak(speech);





    } catch (error) {

      console.error(error);

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
          maxWidth: "900px",
          margin: "40px auto",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "25px",
          backdropFilter: "blur(20px)",
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >

        <h1
          style={{
            color: "white",
            marginBottom: "5px",
            fontsize: "42px",
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
        }}
        >
    
    
        Powered by EVA AI
        </p>
        

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
                    ? "#4da6ff"
                    : "rgba(255,255,255,0.15)",

                color: "white",

                padding: "12px 18px",

                borderRadius: "15px",

                maxWidth: "70%",
              }}
            >
              {msg.text}
            </div>

          ))}

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
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "white",
    fontWeight: "bold",
  }}
>
  <option value="English">🇺🇸 English</option>
  <option value="Hindi">🇮🇳 Hindi</option>
  <option value="Telugu">🇮🇳 Telugu</option>
</select>

          <input
            type="text"
            placeholder="Ask about apartments..."
            value={input}
            onChange={(e) => setInput(e.target.value)}

            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              outline: "none",
              fontSize: "16px",
            }}
          />



          {/* SEND BUTTON */}
          <button
            onClick={handleSend}

            style={{
              background: "#00c6ff",
              color: "white",
              border: "none",
              padding: "14px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Send
          </button>



          {/* MIC BUTTON */}
          <button
            onClick={startVoiceInput}

            style={{
              background: "#ff9800",
              color: "white",
              border: "none",
              padding: "14px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
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