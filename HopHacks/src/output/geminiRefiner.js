import runChat from "../config/gemini";
import { refineToCards as mockRefiner } from "./mockRefiner";

const ALLOWED = new Set([
  "Migraine","Sleep apnea","Hypertension","Depression","Diabetes (type 2)","Anxiety",
  "Sleep debt","Screen time","Caffeine","Hydration","Exercise","Stress","Mood",
  "Sedentary lifestyle","Heart rate","Weight management","Air quality","Water quality",
  "Prediabetes","Alcohol use","Smoking","Circadian disruption","Environmental allergies",
  "Social isolation","GERD (acid reflux)"
]);

export async function refineWithGemini({ triggers, extremes = [], todos = [] }, palette = "soft_pastel") {
  // Trim + dedupe triggers (keep ≤12)
  const uniq = new Set();
  const top = [];
  for (const t of triggers) {
    const k = `${t.category}|${t.type}|${t.severity}|${(t.metric_callouts||[]).join(",")}`;
    if (uniq.has(k)) continue;
    uniq.add(k);
    top.push(t);
    if (top.length >= 12) break;
  }

  const system = `
You are LifeLens’ card refiner. You receive rule-based wellness triggers.
Return 4–6 JSON objects only (no prose), each shaped as:
{ "category": "<one of the 25>", "type": "insight|action|alert", "title": "…", "body": "…", "metric_callouts": ["…"], "priority": <number> }

Hard rules:
- No medical advice or diagnosis; wellness tone only.
- Category MUST be one of the 25 provided. Do not invent new categories.
- Use the triggers' facts. Keep metric_callouts truthful and brief.
- Titles ≤ 60 chars. 1–2 sentence bodies. Prioritize “doable today” actions.
- Prefer a diverse mix (not all from the same category) and avoid duplicates.
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
