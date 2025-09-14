// src/screens/TimeMachineScreen.jsx
import React, { useState } from "react";
import { View, Text, Button, ScrollView, StyleSheet } from "react-native";
import Slider from '@react-native-community/slider';
import { runRiskEngine } from "../engine/engine";
import runChat from "../config/gemini";

export default function TimeMachineScreen({ todayMetrics = {}, negativeDrivers = [], horizonMonths = 12 }) {
  const [inputMetrics, setInputMetrics] = useState(todayMetrics);
  const [horizon, setHorizon] = useState(horizonMonths);
  const [negDrivers, setNegDrivers] = useState(negativeDrivers);
  const [cards, setCards] = useState([]);
  const [narrative, setNarrative] = useState("");
  const [futureMetrics, setFutureMetrics] = useState({});
  const [riskChanges, setRiskChanges] = useState([]);
  const [watchList, setWatchList] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rawGeminiResponse, setRawGeminiResponse] = useState("");
  const [missingFields, setMissingFields] = useState([]);

  const handleMetricChange = (key, value) => {
    setInputMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const simulate = async () => {
    setLoading(true);
    setRawGeminiResponse("");
    setMissingFields([]);
    let errorMsg = "";

    const prompt = `You are HealthLens, a cautious, non-diagnostic health explainer.

Inputs:
- TODAY_METRICS: ${JSON.stringify(inputMetrics)}
- HORIZON: ${horizon} months into the future (up to 480 months / 40 years, with month precision).

Your task:
- Infer negative drivers from TODAY_METRICS.
- Project FUTURE_METRICS for each metric, based on TODAY_METRICS and negative drivers.
- Write a comparison-based narrative (150–220 words).
- Begin with: “Today, you are here…”
- Then contrast with: “But in ${horizon} months, if nothing changes, here’s how things may look…”
- Emphasize what gets worse, by how much, and why.
- Show differences between TODAY vs FUTURE (not just repeat today’s insights).
- Highlight future risks tied to specific negative drivers.
- Use cautious language (may, could, likely).
- Provide 3–5 things to monitor over time (with focus on change).
- End with 1–2 disclaimers (illustrative only, not medical advice).

Constraints:
- Do NOT leave 'future_metrics', 'risk_changes', or 'watch' empty.
- Always include ALL keys from TODAY_METRICS in 'future_metrics'.
- Ensure 'risk_changes' has at least 3 entries.
- Ensure 'watch' has at least 3 entries.

IMPORTANT: In your JSON output, ESCAPE ALL NEWLINES as \\n in string values, especially in 'narrative'.
Return ONLY valid JSON, no prose, no markdown, no explanation, matching this exact structure:
{
  "horizon_months": ${horizon},
  "today_metrics": { ... },
  "future_metrics": { ... },
  "risk_changes": [ { "risk": "...", "direction": "worsen|unchanged|improve", "confidence": 0-1, "drivers": ["..."] } ],
  "watch": [ "thing to monitor", ... ],
  "warnings": [ "disclaimer or caveat", ... ],
  "narrative": "150–220 word plain-English scenario, with ALL newlines escaped as \\n"
}`;

    try {
      const response = await runChat(prompt);
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.replace(/^```/, "").replace(/```$/, "").trim();
      }
      setRawGeminiResponse(cleanResponse);

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      let parsed = null;
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          errorMsg = "AI returned invalid JSON. Try again or adjust your inputs.";
        }
      } else {
        errorMsg = "AI did not return JSON. Try again or adjust your inputs.";
      }

      if (parsed) {
        const requiredFields = ["horizon_months","today_metrics","future_metrics","risk_changes","watch","warnings","narrative"];
        const missing = requiredFields.filter(f => !(f in parsed));
        setMissingFields(missing);

        // Fallback defaults
        const fm = { ...inputMetrics, ...(parsed.future_metrics || {}) };
        const rc = parsed.risk_changes?.length ? parsed.risk_changes : [
          { risk: "General health decline", direction: "worsen", confidence: 0.5, drivers: ["unknown"] }
        ];
        const watchItems = parsed.watch?.length ? parsed.watch : [
          "Sleep quality", "Physical activity", "Diet consistency"
        ];

        setFutureMetrics(fm);
        setRiskChanges(rc);
        setWatchList(watchItems);
        setWarnings(parsed.warnings || []);
        setNarrative(parsed.narrative || "No narrative generated.");
      } else {
        setNarrative(errorMsg || "No scenario returned. Try again or adjust inputs.");
        setFutureMetrics(inputMetrics); // default: future = today
        setRiskChanges([
          { risk: "General health decline", direction: "worsen", confidence: 0.5, drivers: ["unknown"] }
        ]);
        setWatchList(["Sleep quality", "Physical activity", "Diet consistency"]);
        setWarnings([]);
      }
    } catch {
      setNarrative("AI simulation failed due to a network or API error. Try again later.");
      setFutureMetrics(inputMetrics);
      setRiskChanges([
        { risk: "General health decline", direction: "worsen", confidence: 0.5, drivers: ["unknown"] }
      ]);
      setWatchList(["Sleep quality", "Physical activity", "Diet consistency"]);
      setWarnings([]);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>Time Machine</Text>

      {Object.keys(inputMetrics).map((key) => (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.label}>{key}: {inputMetrics[key]}</Text>
          <Button title={"Increase " + key} onPress={() => handleMetricChange(key, inputMetrics[key] + 1)} />
          <Button title={"Decrease " + key} onPress={() => handleMetricChange(key, inputMetrics[key] - 1)} />
        </View>
      ))}

      <Text style={styles.label}>Horizon: {horizon} months ({(horizon/12).toFixed(1)} years)</Text>
      <Slider
        style={{ width: '100%', height: 40, marginBottom: 12 }}
        minimumValue={0}
        maximumValue={480}
        step={1}
        value={horizon}
        onValueChange={setHorizon}
        minimumTrackTintColor="#1a73e8"
        maximumTrackTintColor="#ddd"
        thumbTintColor="#1a73e8"
      />

      <Text style={styles.label}>Negative Drivers: {negDrivers.join(", ")}</Text>
      <Button title={loading ? "Simulating..." : "Simulate"} onPress={simulate} disabled={loading} />

      <Text style={styles.h2}>Scenario Narrative</Text>
      <View style={styles.narrativeBox}>
        <Text style={styles.narrativeText}>{narrative}</Text>
        {(missingFields.length > 0 || narrative.startsWith("AI")) && (
          <Text style={{ color: '#e53e3e', marginTop: 8 }}>
            {missingFields.length > 0
              ? `Missing fields: ${missingFields.join(", ")}`
              : narrative}
          </Text>
        )}
        {rawGeminiResponse && (missingFields.length > 0 || narrative.startsWith("AI")) && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: '700', color: '#1a73e8' }}>Raw Gemini Response:</Text>
            <Text style={{ fontSize: 12, color: '#444' }}>{rawGeminiResponse}</Text>
          </View>
        )}
      </View>

      <Text style={styles.h2}>Future Metrics</Text>
      {Object.keys(futureMetrics).length ? (
        <View style={styles.metricsBox}>
          {Object.entries(futureMetrics).map(([key, value]) => (
            <View key={key} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{formatMetricLabel(key)}:</Text>
              <Text style={styles.metricValue}>{value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ opacity: 0.7 }}>No future metrics returned.</Text>
      )}

      <Text style={styles.h2}>Risk Changes</Text>
      {riskChanges.length ? (
        <View style={styles.riskBox}>
          {riskChanges.map((r, i) => (
            <View key={i} style={styles.riskRow}>
              <Text style={styles.riskLabel}>{r.risk}</Text>
              <Text style={styles.riskDirection}>{r.direction} (confidence: {r.confidence})</Text>
              <Text style={styles.riskDrivers}>Drivers: {r.drivers?.join(", ")}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ opacity: 0.7 }}>No risk changes returned.</Text>
      )}

      <Text style={styles.h2}>Things to Monitor</Text>
      {watchList.length ? (
        <View style={styles.watchBox}>
          {watchList.map((w, i) => <Text key={i} style={styles.watchItem}>• {w}</Text>)}
        </View>
      ) : (
        <Text style={{ opacity: 0.7 }}>No watch items returned.</Text>
      )}

      <Text style={styles.h2}>Disclaimers</Text>
      {warnings.length ? (
        <View style={styles.warningBox}>
          {warnings.map((w, i) => <Text key={i} style={styles.warningItem}>• {w}</Text>)}
        </View>
      ) : (
        <Text style={{ opacity: 0.7 }}>No disclaimers returned.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: "700", marginTop: 18, marginBottom: 8 },
  narrativeBox: { backgroundColor: "#f6f7fb", borderRadius: 10, padding: 12, marginBottom: 12 },
  narrativeText: { fontSize: 15, color: "#222" },
  metricsBox: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  metricRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  metricLabel: { fontWeight: "700", color: "#1a73e8" },
  metricValue: { fontWeight: "600", color: "#222" },
  riskBox: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  riskRow: { marginBottom: 10 },
  riskLabel: { fontWeight: "700", color: "#e53e3e" },
  riskDirection: { fontWeight: "600", color: "#222" },
  riskDrivers: { fontSize: 13, color: "#444" },
  watchBox: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  watchItem: { fontSize: 15, color: "#222", marginBottom: 4 },
  warningBox: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  warningItem: { fontSize: 14, color: "#e53e3e", marginBottom: 4 },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 14, padding: 12, marginBottom: 10, backgroundColor: "#fff" },
  chip: { borderWidth: 1, borderColor: "#eee", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 },
  label: { fontWeight: "700", marginBottom: 4 },
});

function formatMetricLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
