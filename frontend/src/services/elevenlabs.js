import axios from "axios";

let currentAudio = null;

const API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;

// 🌍 BROWSER FALLBACK VOICE
const fallbackVoice = (text,language) => {

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  if (language === "Hindi") {

  speech.lang = "hi-IN";

}

else if (language === "Telugu") {

  speech.lang = "te-IN";

}

else {

  speech.lang = "en-US";
}

  

  speech.rate = 0.9;

  speech.pitch = 1;

  speech.volume = 1;

  const voices = window.speechSynthesis.getVoices();

  speech.voice =
    voices.find((voice) =>
      voice.name.includes("Google UK English Female")
    ) ||

    voices.find((voice) =>
      voice.name.includes("Google US English")
    ) ||

    voices[0];

  window.speechSynthesis.speak(speech);
};

// 🛑 STOP AUDIO
export const stopElevenLabsAudio = () => {

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  window.speechSynthesis.cancel();
};

// 🔊 MAIN SPEAK FUNCTION
export const speakWithElevenLabs = async (text,language) => {
      // CLEAN MULTILINGUAL TEXT
  let cleanText = text;

  cleanText = cleanText
    .replace(/AI/g, "")
    .replace(/Apartment/g, "అపార్ట్మెంట్")
    .replace(/Sales Assistant/g, "సహాయకురాలు")
    .replace(/2BHK/g, "టూ బీ హెచ్ కే")
    .replace(/3BHK/g, "త్రీ బీ హెచ్ కే");

  try {

    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",

      {
        text: text.slice(0, 180),

        model_id: "eleven_multilingual_v2",

        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      },

      {
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
        },

        responseType: "blob",
      }
    );

    const audioBlob = new Blob([response.data], {
      type: "audio/mpeg",
    });

    const audioUrl = URL.createObjectURL(audioBlob);

    // 🛑 STOP PREVIOUS AUDIO
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);

    currentAudio = audio;

    await audio.play();

  } catch (error) {

    console.error(
      "ElevenLabs failed → Switching to browser voice",
      error
    );

    // 🔥 FALLBACK VOICE
    fallbackVoice(text,language);
  }
};