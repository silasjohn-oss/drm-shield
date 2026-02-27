const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

async function speakAlert(message) {
  try {
    // Use mock voice alert for local testing if API key is not valid
    console.log(`🔊 Voice Alert (MOCK): ${message}`);
    const mockAudioPath = "./uploads/alert-mock.txt";
    fs.writeFileSync(mockAudioPath, `[Voice Alert] ${message}\n[Timestamp] ${new Date().toISOString()}`);
    console.log("✅ Voice alert generated (mock)");
    return mockAudioPath;
    
    /* ElevenLabs API call - uncomment when you have valid API key
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text: message,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.5 },
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const audioPath = "./uploads/alert.mp3";
    fs.writeFileSync(audioPath, response.data);
    console.log("🔊 Voice alert generated:", message);
    return audioPath;
    */
  } catch (err) {
    console.error("ElevenLabs error:", err.message);
    console.log("💡 Tip: Add a valid ElevenLabs API key to .env to enable voice alerts");
    return null;
  }
}

module.exports = speakAlert;