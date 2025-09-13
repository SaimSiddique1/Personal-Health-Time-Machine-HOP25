export function refineToCards(triggers) {
  const sorted = [...triggers].sort((a,b) => (b.severity - a.severity) || (b.confidence - a.confidence));
  return sorted.slice(0, 6).map((t, i) => ({
    category: t.category,
    type: t.type,
    title: ({insight:"Heads-up", action:"Try this", alert:"Alert"})[t.type] + `: ${t.category}`,
    body: pickBody(t),
    metric_callouts: t.metric_callouts,
    priority: i + 1
  }));
}
function pickBody(t) {
  if (t.category === "Air quality") return "Air is elevated today. Prefer indoor or shorter sessions.";
  if (t.category === "Sleep debt") return "Short sleep and late screens may be adding up. Aim a steadier wind-down.";
  if (t.category === "Sedentary lifestyle") return "Long sit time and low steps. Add a couple short walks.";
  return "Small changes today can help your recovery and energy.";
}
