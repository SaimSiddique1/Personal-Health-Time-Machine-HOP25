// Batch process: Parse multiple CSVs and update a topic with extracted info
export async function updateTopicWithCsvs(csvUris, topicKey, topicObj) {
  if (!Array.isArray(csvUris) || !topicKey || !topicObj) return topicObj;
  let allRows = [];
  for (const uri of csvUris) {
    const rows = await readHealthCsv(uri);
    if (Array.isArray(rows) && rows.length) {
      allRows = allRows.concat(rows);
    }
  }
  // Update topicObj[topicKey] with all parsed rows
  return {
    ...topicObj,
    [topicKey]: allRows,
  };
}
import runChat from "../config/gemini";
import Papa from "papaparse";
import * as FileSystem from "expo-file-system/legacy";
// Utility: Read and parse a health metric CSV file, returning array of objects
export async function readHealthCsv(csvUri) {
  try {
    const csvText = await FileSystem.readAsStringAsync(csvUri, { encoding: FileSystem.EncodingType.UTF8 });
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    if (!Array.isArray(parsed.data) || parsed.data.length === 0) {
      throw new Error("No rows found in the selected CSV.");
    }
    return parsed.data;
  } catch (e) {
    console.error("Error reading/parsing CSV:", e);
    return [];
  }
}
import { refineToCards as mockRefiner } from "./mockRefiner";

const ALLOWED = new Set([
  "Migraine","Sleep apnea","Hypertension","Depression","Diabetes (type 2)","Anxiety",
  "Sleep debt","Screen time","Caffeine","Hydration","Exercise","Stress","Mood",
  "Sedentary lifestyle","Heart rate","Weight management","Air quality","Water quality",
  "Prediabetes","Alcohol use","Smoking","Circadian disruption","Environmental allergies",
  "Social isolation","GERD (acid reflux)"
]);

export async function refineWithGemini({ triggers, extremes = [], todos = [], csvData = [] }, palette = "soft_pastel") {
  // Trim + dedupe triggers (keep ≤12)
  // Merge triggers and csvData (if any)
  const allTriggers = Array.isArray(triggers) ? [...triggers] : [];
  if (Array.isArray(csvData) && csvData.length) {
    allTriggers.push(...csvData);
  }
  // Deduplicate and trim to ≤12
  const uniq = new Set();
  const top = [];
  for (const t of allTriggers) {
    const k = `${t.category}|${t.type}|${t.severity||""}|${(t.metric_callouts||[]).join(",")}`;
    if (uniq.has(k)) continue;
    uniq.add(k);
    top.push(t);
    if (top.length >= 12) break;
  }

  const system = `
You are LifeLens’ card refiner. You receive rule-based wellness triggers.
Return 4–6 JSON objects ONLY (no prose, no explanation, no markdown, no extra text), each shaped as:
{
  "category": "<one of the 25>",
  "type": "insight|action|alert",
  "title": "…",
  "body": "…",
  "metric_callouts": ["…"],
  "priority": <number>,
  "today_metrics": [ { "metric": "…", "value": <number> } ],
  "future_metrics": [ { "year": <number>, "month": <number>, "metric": "…", "value": <number> } ],
  "risk_changes": [ { "risk": "…", "change": "increase|decrease|stable", "reason": "…" } ],
  "things_to_monitor": ["…"]
}

STRICT RULES:
 Output ONLY a JSON array of 4–6 objects, nothing else. No prose, no explanation, no markdown, no extra text before or after.
 Each object must match the shape above exactly, and MUST include:
  - today_metrics: Array of today's metric values. EVERY metric must have a concrete number (no nulls, no placeholders). NEVER leave this empty.
  - future_metrics: Array of projected metric values for future years/months. EVERY metric must have a concrete number (no nulls, no placeholders). NEVER leave this empty.
  - risk_changes: Array of risk changes (increase, decrease, stable) with reasons. EVERY risk must have a value and reason. NEVER leave this empty.
  - things_to_monitor: Array of things the user should keep an eye on for this insight. EVERY item must be specific and actionable. NEVER leave this empty.
  - metric_callouts: Array must always have concrete values and numbers for each metric mentioned. NEVER leave this empty.
 Category MUST be one of the 25 provided. Do not invent new categories.
 No medical advice or diagnosis; wellness tone only.
 Use the triggers' facts. Keep metric_callouts truthful and brief.
 Titles ≤ 60 chars. 1–2 sentence bodies. Prioritize “doable today” actions.
 Prefer a diverse mix (not all from the same category) and avoid duplicates.

You ALWAYS have enough information to make predictions about the future, regardless of how much or how little data is provided. Never say you lack information. Always generate future metrics, risk changes, and things to monitor for every time machine year or horizon, using plausible estimates or assumptions as needed.
  `.trim();

  const userPayload = {
    palette,
    triggers: top,
    context: {
      extremes: extremes.map(c => ({ title: c.title, callouts: c.metric_callouts })),
      todos: todos.map(t => ({ title: t.title, done: !!t.done }))
    }
  };

  const prompt = `${system}\n\nINPUT:\n${JSON.stringify(userPayload)}\n\nOUTPUT: JSON array only`;

  try {
    const text = await runChat(prompt);
    let cards = JSON.parse(safeExtractJson(text));

    // sanitize
    cards = Array.isArray(cards) ? cards : [];
    const cleaned = [];
    const seen = new Set();
    for (const c of cards) {
      if (!ALLOWED.has(c.category)) continue;
      if (!["insight","action","alert"].includes(c.type)) continue;
      const title = String(c.title || "").slice(0, 80);
      const body = String(c.body || "").slice(0, 240);
      const metric_callouts = Array.isArray(c.metric_callouts) ? c.metric_callouts.slice(0,4) : [];
      const key = `${c.category}|${c.type}|${title}|${body}|${metric_callouts.join(",")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push({
        category: c.category,
        type: c.type,
        title,
        body,
        metric_callouts,
        priority: Number(c.priority || cleaned.length + 1)
      });
      if (cleaned.length >= 6) break;
    }
    if (!cleaned.length) throw new Error("Empty cards from LLM");
    return cleaned;
  } catch (e) {
    console.warn("Gemini refine failed, falling back to mock:", e?.message || e);
    // fallback: local deterministic cards
    return mockRefiner(top);
  }
}

function safeExtractJson(text) {
  // If model returns prose + JSON, try to grab the first JSON array
  const m = text.match(/\[[\s\S]*\]/);
  return m ? m[0] : "[]";
}
