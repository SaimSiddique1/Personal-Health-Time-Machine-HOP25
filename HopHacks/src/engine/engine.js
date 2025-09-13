import { deriveDrivers } from "./deriveDrivers";
import { evaluateRules } from "./rules";

// ADD: simple dedupe helper
function uniqBy(arr, keyFn) {
  const seen = new Set();
  return arr.filter((item) => {
    const k = keyFn(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function runRiskEngine(inputs) {
  const drivers = deriveDrivers(inputs);
  const rawTriggers = evaluateRules(drivers);

  // NEW: dedupe triggers by a stable signature
  const triggers = uniqBy(
    rawTriggers,
    (t) =>
      `${t.category}|${t.type}|${t.severity}|${t.confidence}|${(t.metric_callouts || []).join(",")}`
  );

  return { drivers, triggers };
}
