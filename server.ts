/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini API
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  const { metadata, stats } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key is not configured." });
  }

  try {
    const prompt = `
      As a Power Electronics R&D Engineer, analyze the following power test data and provide a concise professional summary.
      
      Test Conditions:
      - Voltage: ${metadata.voltage}
      - Temperature: ${metadata.temperature}
      - Load: ${metadata.load}
      
      Analysis Metrics:
      - Peak-to-Peak Voltage: ${stats.peakValue.toFixed(2)}V
      - RMS Voltage: ${stats.rmsValue.toFixed(2)}V
      - Ripple Factor: ${stats.ripple.toFixed(2)}%
      - Verdict: ${stats.passFail}
      
      Please provide:
      1. A brief interpretation of the results.
      2. Any potential risks or observations (e.g., noise, efficiency).
      3. A final recommendation.
      
      Format the response in clear bullet points and keep it professional.
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ summary: result.text });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Failed to generate AI analysis." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
