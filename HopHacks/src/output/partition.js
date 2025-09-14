export function partitionPayload(appJson) {
  const cards = Array.isArray(appJson?.cards) ? appJson.cards : [];

  // Everything goes through flagged for now
  const flagged = cards;

  // "Extreme" alerts based on content rules
  const extremes = cards.filter(c =>
    /Alert:|Air quality|Smoking/.test(c.title ?? "") ||
    c.metric_callouts?.some(m =>
      (/AQI\s*(1[5-9]\d|\d{3,})/.test(m)) ||
      (/Sleep debt\s*(\d+(\.\d+)?)h/.test(m) && parseFloat(m.match(/Sleep debt\s*(\d+(\.\d+)?)h/)?.[1] ?? "0") >= 2.5) ||
      (/Steps\s*(\d+)/.test(m) && parseInt(m.match(/Steps\s*(\d+)/)?.[1] ?? "0", 10) < 3000) ||
      (/Caffeine\s*(\d+)mg/.test(m) && parseInt(m.match(/Caffeine\s*(\d+)mg/)?.[1] ?? "0", 10) >= 350)
    )
  );

  // Suggestions get normalized actionIds
  const suggestions = cards
    .filter(c => /Try this:|action/i.test(c.title ?? "") || c.type === "action")
    .map((c, idx) => ({
      ...c,
      actionable: true,
      actionId: `${String(c.category ?? "action")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${idx}`,
    }));

  return { flagged, extremes, suggestions };
}
