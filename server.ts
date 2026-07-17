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

  console.log("AI Analysis Request received");

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    console.error("Gemini API key is not configured or is placeholder.");
    return res.status(500).json({ error: "Gemini API key is not configured in Secrets." });
  }

  if (!metadata || !stats) {
    return res.status(400).json({ error: "Missing metadata or analysis statistics." });
  }

  try {
    const prompt = `
      As a Power Electronics R&D Engineer, analyze the following power test data and provide a concise professional summary.
      
      Test Conditions:
      - Voltage: ${metadata.voltage || 'N/A'}
      - Temperature: ${metadata.temperature || 'N/A'}
      - Load: ${metadata.load || 'N/A'}
      
      Analysis Metrics:
      - Peak-to-Peak Voltage: ${stats.peakValue?.toFixed(2) || '0.00'}V
      - RMS Voltage: ${stats.rmsValue?.toFixed(2) || '0.00'}V
      - Ripple Factor: ${stats.ripple?.toFixed(2) || '0.00'}%
      - Verdict: ${stats.passFail || 'PENDING'}
      
      Please provide:
      1. A brief interpretation of the results.
      2. Any potential risks or observations (e.g., noise, efficiency).
      3. A final recommendation.
      
      Format the response in clear bullet points and keep it professional.
    `;

    console.log("Generating content with Gemini...");
    const result = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!result || !result.text) {
      throw new Error("Empty response from Gemini");
    }

    console.log("Analysis generated successfully");
    res.json({ summary: result.text });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: `AI Error: ${error.message || "Failed to generate analysis"}` });
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
