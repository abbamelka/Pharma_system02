// server/routes/ai.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

const HF_API_TOKEN = process.env.HF_API_TOKEN;
if (!HF_API_TOKEN) {
  console.warn("⚠️ HF_API_TOKEN is not set");
}

// ✅ Correct inference endpoint (no "/models" in path)
const HF_API_URL = "https://api-inference.huggingface.co/pipeline/text2text-generation/google/flan-t5-large";

/**
 * POST /api/ai/medicine-chat
 * Uses Hugging Face's Flan-T5 model for medicine Q&A
 */
router.post('/medicine-chat', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        response: "Invalid or missing query."
      });
    }

    // System prompt
    const systemPrompt = `
You are a pharmacy assistant. Provide accurate and safe information about medicines.
Rules:
- Only answer questions related to medications, uses, side effects, interactions, storage.
- Never give dosage advice without prescription context.
- If unsure, advise consulting a pharmacist or doctor.
- Keep responses concise (under 150 words), clear, and professional.
`;

    const fullInput = `${systemPrompt}\n\nQuestion: ${query}\nAnswer:`;

    let hfRes;
    try {
      hfRes = await axios.post(
        HF_API_URL,
        { inputs: fullInput },
        {
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
    } catch (err) {
      if (err.response?.status === 503) {
        return res.status(503).json({
          success: false,
          response: "Model is loading. Please wait a moment and try again."
        });
      }
      if (err.response?.status === 429) {
        return res.status(429).json({
          success: false,
          response: "Too many requests. Try again later."
        });
      }
      throw err;
    }

    // ✅ Parse response correctly
    const output = Array.isArray(hfRes.data) ? hfRes.data[0]?.generated_text : hfRes.data.generated_text;

    if (!output) {
      return res.status(500).json({
        success: false,
        response: "No response from AI model."
      });
    }

    // Extract only the answer part after "Answer:"
    const answerText = output.split("Answer:")?.pop()?.trim() || output.trim();

    res.json({
      success: true,
      response: answerText
    });

  } catch (err) {
    console.error("Hugging Face API Error:", err.message);
    res.status(500).json({
      success: false,
      response: "AI service temporarily unavailable."
    });
  }
});

module.exports = router;