import { GoogleGenerativeAI } from "@google/generative-ai";

// ===== Setup =====
const apiKey = "AIzaSyCNpLel9NcuGa_4JvAK5qbO-RWoEeBznLI"; // consider moving to .env later
const genAI = new GoogleGenerativeAI(apiKey);

// Primary + fallback models
const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

// Shared generation config
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Simple sleep
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Exponential backoff with jitter
async function withRetries(fn, { attempts = 3, base = 600 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err);
      if (!/(429|500|502|503|504)/.test(msg)) break;
      const delay = Math.round(base * Math.pow(2, i) + Math.random() * 150);
      await wait(delay);
    }
  }
  throw lastErr;
}

async function callModel(modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const chat = model.startChat({ generationConfig, history: [] });
  const result = await chat.sendMessage(prompt);
  return result?.response?.text()?.trim() ?? "";
}

/**
 * Run chat with backoff and model fallback:
 * - Tries PRIMARY_MODEL a few times (with backoff)
 * - If it still fails, tries FALLBACK_MODEL
 */
export default async function runChat(prompt) {
  try {
    return await withRetries(() => callModel(PRIMARY_MODEL, prompt), { attempts: 3 });
  } catch (e1) {
    try {
      return await withRetries(() => callModel(FALLBACK_MODEL, prompt), { attempts: 2, base: 800 });
    } catch (e2) {
      const err = new Error(
        `Gemini call failed (primary & fallback). Last error: ${e2?.message || e2}`
      );
      err.cause = e1;
      throw err;
    }
  }
}
