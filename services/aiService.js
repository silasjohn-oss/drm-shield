const axios = require("axios");
require("dotenv").config();

async function analyzeViolation(userId, ip, deviceHash) {
  try {
    const response = await axios.post(
      "https://api.featherless.ai/v1/chat/completions",
      {
        model: "meta-llama/Llama-3.1-8B-Instruct",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: `Analyze this DRM security event: User ID ${userId} accessed protected content from IP ${ip} with device fingerprint ${deviceHash}. Based on this, classify the threat level as LOW, MEDIUM, or HIGH and give a one-sentence reason. Format: LEVEL: <level> | REASON: <reason>`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FEATHERLESS_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message.content;
    const levelMatch = result.match(/LEVEL:\s*(LOW|MEDIUM|HIGH)/i);
    const reasonMatch = result.match(/REASON:\s*(.+)/i);

    return {
      threat_level: levelMatch ? levelMatch[1] : "MEDIUM",
      ai_analysis: reasonMatch ? reasonMatch[1] : result,
    };
  } catch (err) {
    console.error("Featherless AI error:", err.message);
    return { threat_level: "UNKNOWN", ai_analysis: "AI analysis unavailable" };
  }
}

module.exports = analyzeViolation;