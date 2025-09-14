// src/screens/TimeMachineScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { runRiskEngine } from "../engine/engine";
import runChat from "../config/gemini";

/* ===== Design Tokens (aligns with Dashboard) ===== */
const T = {
  bg: "#0f1117",
  text: "#EAF2FF",
  textDim: "#AAB6D3",
  cardBg: "rgba(255,255,255,0.06)",     // solid “glass”
  cardStroke: "rgba(255,255,255,0.14)",
  chipBg: "rgba(255,255,255,0.08)",
  chipStroke: "rgba(255,255,255,0.16)",
  warn: "#ff6b6b",
  grad: ["#34FFD1", "#5B8EFF", "#BC6FFF", "#FF7AC3"],
};

function GlassCard({ children, style }) {
  return (
    <View style={[st.card, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: T.cardBg }]} />
      <View style={{ padding: 14 }}>{children}</View>
    </View>
  );
}

function GradientButton({ title, onPress, style, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ borderRadius: 14 }, style]}>
      <LinearGradient
        colors={T.grad}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          {
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 14,
            opacity: disabled ? 0.7 : 1,
            shadowColor: "#000",
            shadowOpacity: 0.35,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 },
            elevation: 6,
          },
        ]}
      >
        <Text style={{ color: "#0b0c10", fontWeight: "800" }}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function GhostButton({ title, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[st.ghostBtn, style]}>
      <Text style={{ color: T.text, fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}

export default function TimeMachineScreen({
  todayMetrics = {},
  negativeDrivers = [],
  horizonMonths = 12,
}) {
  const [inputMetrics, setInputMetrics] = useState(todayMetrics);
  const [horizon, setHorizon] = useState(horizonMonths);
  const [negDrivers, setNegDrivers] = useState(negativeDrivers);
  const [cards, setCards] = useState([]); // reserved: if you later render engine cards
  const [narrative, setNarrative] = useState("");
  const [futureMetrics, setFutureMetrics] = useState({});
  const [riskChanges, setRiskChanges] = useState([]);
  const [watchList, setWatchList] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rawGeminiResponse, setRawGeminiResponse] = useState("");
  const [missingFields, setMissingFields] = useState([]);

  const handleMetricChange = (key, delta) => {
    setInputMetrics((prev) => {
      const next = (Number(prev[key]) || 0) + delta;
      return { ...prev, [key]: next };
    });
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
        const requiredFields = [
          "horizon_months",
          "today_metrics",
          "future_metrics",
          "risk_changes",
          "watch",
          "warnings",
          "narrative",
        ];
        const missing = requiredFields.filter((f) => !(f in parsed));
        setMissingFields(missing);

        const fm = { ...inputMetrics, ...(parsed.future_metrics || {}) };
        const rc =
          parsed.risk_changes?.length
            ? parsed.risk_changes
            : [
                {
                  risk: "General health decline",
                  direction: "worsen",
                  confidence: 0.5,
                  drivers: ["unknown"],
                },
              ];
        const watchItems =
          parsed.watch?.length
            ? parsed.watch
            : ["Sleep quality", "Physical activity", "Diet consistency"];

        setFutureMetrics(fm);
        setRiskChanges(rc);
        setWatchList(watchItems);
        setWarnings(parsed.warnings || []);
        setNarrative(parsed.narrative || "No narrative generated.");
      } else {
        setNarrative(errorMsg || "No scenario returned. Try again or adjust inputs.");
        setFutureMetrics(inputMetrics);
        setRiskChanges([
          { risk: "General health decline", direction: "worsen", confidence: 0.5, drivers: ["unknown"] },
        ]);
        setWatchList(["Sleep quality", "Physical activity", "Diet consistency"]);
        setWarnings([]);
      }
    } catch {
      setNarrative("AI simulation failed due to a network or API error. Try again later.");
      setFutureMetrics(inputMetrics);
      setRiskChanges([
        { risk: "General health decline", direction: "worsen", confidence: 0.5, drivers: ["unknown"] },
      ]);
      setWatchList(["Sleep quality", "Physical activity", "Diet consistency"]);
      setWarnings([]);
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Hero gradient */}
      <LinearGradient
        colors={T.grad}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={st.hero}
      />

      <ScrollView contentContainerStyle={st.wrap}>
        {/* Header chip */}
        <View style={st.headerChip}>
          <Text style={st.h1}>Personal Health Time-Machine</Text>
        </View>

        {/* Controls: metrics & horizon */}
        <GlassCard style={{ marginTop: 12 }}>
          <Text style={st.sectionTitle}>Adjust Today’s Metrics</Text>
          {Object.keys(inputMetrics).length ? (
            Object.keys(inputMetrics).map((key) => (
              <View key={key} style={st.metricRow}>
                <Text style={st.metricLabel}>
                  {formatMetricLabel(key)}
                </Text>
                <View style={st.metricActions}>
                  <GhostButton title="–" onPress={() => handleMetricChange(key, -1)} />
                  <Text style={st.metricValue}>{String(inputMetrics[key])}</Text>
                  <GhostButton title="+" onPress={() => handleMetricChange(key, +1)} />
                </View>
              </View>
            ))
          ) : (
            <Text style={st.muted}>
              No metrics provided. Pass an object to <Text style={{ fontWeight: "800" }}>todayMetrics</Text>.
            </Text>
          )}

          <View style={{ marginTop: 10 }}>
            <Text style={st.label}>
              Horizon:{" "}
              <Text style={{ fontWeight: "900", color: T.text }}>
                {horizon} months
              </Text>{" "}
              ({(horizon / 12).toFixed(1)} yrs)
            </Text>
            <Slider
              style={{ width: "100%", height: 40, marginTop: 6 }}
              minimumValue={0}
              maximumValue={480}
              step={1}
              value={horizon}
              onValueChange={setHorizon}
              minimumTrackTintColor="#5B8EFF"
              maximumTrackTintColor="rgba(255,255,255,0.2)"
              thumbTintColor="#BC6FFF"
            />
          </View>

          {!!negDrivers?.length && (
            <View style={{ marginTop: 8 }}>
              <Text style={st.label}>Negative Drivers</Text>
              <View style={st.chipsWrap}>
                {negDrivers.map((d, i) => (
                  <View key={i} style={st.chip}>
                    <Text style={st.chipText}>{d}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <GradientButton
            title={loading ? "Simulating…" : "Simulate"}
            onPress={simulate}
            disabled={loading}
            style={{ alignSelf: "flex-start", marginTop: 10 }}
          />
        </GlassCard>

        {/* Narrative */}
        <GlassCard style={{ marginTop: 12 }}>
          <Text style={st.sectionTitle}>Scenario Narrative</Text>
          <Text style={st.body}>{narrative}</Text>

          {(missingFields.length > 0 || narrative.startsWith("AI")) && (
            <Text style={[st.body, { color: T.warn, marginTop: 8 }]}>
              {missingFields.length > 0
                ? `Missing fields: ${missingFields.join(", ")}`
                : narrative}
            </Text>
          )}

          {rawGeminiResponse && (missingFields.length > 0 || narrative.startsWith("AI")) && (
            <View style={{ marginTop: 10 }}>
              <Text style={[st.cardTitle, { color: "#5B8EFF" }]}>Raw Response</Text>
              <Text style={[st.code]}>{rawGeminiResponse}</Text>
            </View>
          )}
        </GlassCard>

        {/* Future Metrics */}
        <GlassCard style={{ marginTop: 12 }}>
          <Text style={st.sectionTitle}>Future Metrics</Text>
          {Object.keys(futureMetrics).length ? (
            <View>
              {Object.entries(futureMetrics).map(([key, value]) => (
                <View key={key} style={st.rowBetween}>
                  <Text style={st.metricLabel}>{formatMetricLabel(key)}</Text>
                  <Text style={st.metricValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={st.muted}>No future metrics returned.</Text>
          )}
        </GlassCard>

        {/* Risk Changes */}
        <GlassCard style={{ marginTop: 12 }}>
          <Text style={st.sectionTitle}>Risk Changes</Text>
          {riskChanges.length ? (
            riskChanges.map((r, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={[st.cardTitle, { color: T.warn }]}>{r.risk}</Text>
                <Text style={st.body}>
                  {r.direction} (confidence: {r.confidence})
                </Text>
                <Text style={[st.body, { opacity: 0.9 }]}>
                  Drivers: {r.drivers?.join(", ")}
                </Text>
              </View>
            ))
          ) : (
            <Text style={st.muted}>No risk changes returned.</Text>
          )}
        </GlassCard>

        {/* Watch List */}
        <GlassCard style={{ marginTop: 12 }}>
          <Text style={st.sectionTitle}>Things to Monitor</Text>
          {watchList.length ? (
            <View style={{ gap: 6 }}>
              {watchList.map((w, i) => (
                <Text key={i} style={st.body}>
                  • {w}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={st.muted}>No watch items returned.</Text>
          )}
        </GlassCard>

        {/* Disclaimers */}
        <GlassCard style={{ marginTop: 12, marginBottom: 24 }}>
          <Text style={st.sectionTitle}>Disclaimers</Text>
          {warnings.length ? (
            <View style={{ gap: 6 }}>
              {warnings.map((w, i) => (
                <Text key={i} style={[st.body, { color: T.warn }]}>
                  • {w}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={st.muted}>No disclaimers returned.</Text>
          )}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

/* ===== Styles ===== */
const st = StyleSheet.create({
  hero: {
    position: "absolute",
    top: -120,
    left: -80,
    right: -80,
    height: 280,
    transform: [{ rotate: "-6deg" }],
    opacity: 0.18,
  },
  wrap: { padding: 16, paddingTop: 24 },
  headerChip: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.cardStroke,
    backgroundColor: T.cardBg,
  },
  h1: { fontSize: 22, fontWeight: "900", color: T.text },

  sectionTitle: { color: T.text, fontWeight: "800", marginBottom: 8, fontSize: 16 },
  body: { color: T.textDim, fontSize: 15 },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.cardStroke,
    backgroundColor: T.cardBg,
  },

  // Metrics
  label: { color: T.text, fontWeight: "700", marginBottom: 4 },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  metricLabel: { color: T.text, fontWeight: "700" },
  metricActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  metricValue: { color: T.text, fontWeight: "800", width: 56, textAlign: "center" },

  // Buttons
  ghostBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.cardStroke,
    backgroundColor: T.cardBg,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  // Lists
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: T.chipStroke,
    backgroundColor: T.chipBg,
  },
  chipText: { color: T.text, fontSize: 12 },

  cardTitle: { color: T.text, fontWeight: "800", fontSize: 16 },
  code: {
    color: T.textDim,
    fontSize: 12,
    marginTop: 4,
  },
});

function formatMetricLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
