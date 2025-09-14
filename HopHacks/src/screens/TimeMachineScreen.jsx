// src/screens/TimeMachineScreen.jsx
import React, { useState } from "react";
import { View, Text, Button, ScrollView, StyleSheet } from "react-native";
import Slider from '@react-native-community/slider';
import { runRiskEngine } from "../engine/engine";
import runChat from "../config/gemini";


export default function TimeMachineScreen({ todayMetrics = {}, negativeDrivers = [], horizonMonths = 12 }) {
  // Flexible state for any input metric
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

  // Generic input handler
  const handleMetricChange = (key, value) => {
    setInputMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const simulate = async () => {
    setLoading(true);
    setRawGeminiResponse("");
    setMissingFields([]);
    let errorMsg = "";
  const prompt = `You are HealthLens, a cautious, non-diagnostic health explainer.\n\nInputs:\n- TODAY_METRICS: ${JSON.stringify(inputMetrics)}\n- HORIZON: ${horizon} months into the future (up to 480 months / 40 years, with month precision).\n\nYour task:\n- Infer negative drivers from TODAY_METRICS.\n- Project FUTURE_METRICS for each metric, based on TODAY_METRICS and negative drivers.\n- Write a comparison-based narrative (150–220 words).\n- Begin with: “Today, you are here…”\n- Then contrast with: “But in ${horizon} months, if nothing changes, here’s how things may look…”\n- Emphasize what gets worse, by how much, and why.\n- Show differences between TODAY vs FUTURE (not just repeat today’s insights).\n- Highlight future risks tied to specific negative drivers.\n- Use cautious language (may, could, likely).\n- Provide 3–5 things to monitor over time (with focus on change).\n- End with 1–2 disclaimers (illustrative only, not medical advice).\n\nIMPORTANT: In your JSON output, ESCAPE ALL NEWLINES as \\n (double backslash n) in string values, especially in the 'narrative' field. Do NOT use literal line breaks.\n\nReturn ONLY valid JSON, no prose, no markdown, no explanation, matching this exact structure:\n{\n  "horizon_months": ${horizon},\n  "today_metrics": { ... },\n  "future_metrics": { ... },\n  "risk_changes": [ { "risk": "...", "direction": "worsen|unchanged|improve", "confidence": 0-1, "drivers": ["..."] } ],\n  "watch": [ "thing to monitor", ... ],\n  "warnings": [ "disclaimer or caveat", ... ],\n  "narrative": "150–220 word plain-English scenario, with ALL newlines escaped as \\n"\n}`;
    try {
      const response = await runChat(prompt);
      // Remove markdown if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```/, '').replace(/```$/, '').trim();
      }
      setRawGeminiResponse(cleanResponse);
      // Try to extract JSON from response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      let parsed = null;
      if (!jsonMatch) {
        errorMsg = "AI did not return JSON. Try again or adjust your inputs.";
      } else {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (parseErr) {
          errorMsg = "AI returned invalid JSON. Try again or adjust your inputs.";
        }
      }
      if (parsed) {
        // Strictly check for all required fields
        const requiredFields = ["horizon_months","today_metrics","future_metrics","risk_changes","watch","warnings","narrative"];
        const missing = requiredFields.filter(f => !(f in parsed));
        setMissingFields(missing);
        if (missing.length) {
          errorMsg = `AI response missing required fields: ${missing.join(", ")}. Try again or provide more health metrics.`;
        }
        setNarrative(parsed.narrative || "");
        setFutureMetrics(parsed.future_metrics || {});
        setRiskChanges(parsed.risk_changes || []);
        setWatchList(parsed.watch || []);
        setWarnings(parsed.warnings || []);
      } else {
        setNarrative(errorMsg || "No scenario returned. Try again or adjust inputs.");
        setFutureMetrics({});
        setRiskChanges([]);
        setWatchList([]);
        setWarnings([]);
      }
    } catch (e) {
      setNarrative("AI simulation failed due to a network or API error. Try again later.");
      setFutureMetrics({});
      setRiskChanges([]);
      setWatchList([]);
      setWarnings([]);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>Time Machine</Text>
      {/* Render sliders for each metric in inputMetrics */}
      {Object.keys(inputMetrics).map((key) => (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.label}>{key}: {inputMetrics[key]}</Text>
          {/* Example: numeric slider, can be replaced with appropriate input */}
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
      {/* Could add UI to edit negDrivers if needed */}
      <Button title={loading ? "Simulating..." : "Simulate"} onPress={simulate} disabled={loading} />
      <Text style={styles.h2}>Scenario Narrative</Text>
      <View style={styles.narrativeBox}>
        <Text style={styles.narrativeText}>{narrative}</Text>
        {/* NOTE: Here is where we can wire in future metrics for deeper narrative integration */}
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
  // Format keys like 'blood_pressure_systolic' to 'Blood Pressure Systolic'
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}