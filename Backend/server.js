require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "..", "Frontend")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    aiConfigured: !!process.env.GEMINI_API_KEY
  });
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

app.post("/api/ai", async (req, res) => {
  const message = String(req.body?.message || "").trim();

  const language = {
    en: "English",
    te: "Telugu",
    hi: "Hindi"
  }[req.body?.language] || "English";

  if (!message || message.length > 1200) {
    return res.status(400).json({
      error: "Enter a question under 1,200 characters."
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "Gemini API key is missing. Check Backend/.env."
    });
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.7-flash";

  const system = `
You are Femora, a compassionate health education assistant.

Prioritize women's health and also answer general wellness questions.
Reply in ${language}.
Be empathetic, clear and concise.

Never diagnose, prescribe medication or claim certainty.
Give general next steps and encourage professional medical advice.

For pregnancy, postpartum, children, chronic illness or persistent
symptoms, encourage consultation with a qualified clinician.

For chest pain, breathing difficulty, fainting, severe bleeding,
severe abdominal pain, seizure, suicidal thoughts or pregnancy
emergencies, advise urgent local medical care immediately.

AI is not a substitute for a licensed clinician.
`;

  let lastError = null;

  // Try up to 3 times for temporary failures.
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: system }]
            },
            contents: [
              {
                role: "user",
                parts: [{ text: message }]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 700
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);

      const data = await response.json();

      if (response.ok) {
        const reply = data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("")
          .trim();

        if (!reply) {
          return res.status(502).json({
            error: "The AI returned an empty response. Please try again."
          });
        }

        return res.json({ reply });
      }

      lastError = data.error?.message || "Gemini request failed.";

      console.error("Gemini error:", response.status, data);

      const temporaryError = [429, 500, 502, 503, 504]
        .includes(response.status);

      if (!temporaryError) {
        return res.status(502).json({
          error: lastError
        });
      }

    } catch (error) {
      clearTimeout(timeout);

      lastError = error.name === "AbortError"
        ? "Gemini took too long to respond."
        : "Network error while contacting Gemini.";

      console.error("AI connection error:", error.message);
    }

    if (attempt < 3) {
      await sleep(attempt * 2000);
    }
  }

  return res.status(503).json({
    error: lastError ||
      "FEMORA AI is temporarily unavailable. Please try again shortly."
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Femora running at http://localhost:" + port);
});