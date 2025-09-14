import React, { useState, useEffect, useMemo } from "react";
import { Modal, TextInput } from "react-native";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { scenarios } from "../data/scenarios";
import { runRiskEngine } from "../engine/engine";
import { toAppJsonAsync } from "../output/serializer";
import {
  addTodoFromCard,
  getTodos,
  toggleTodo,
  removeTodo,
  clearTodos,
} from "../state/todos";

const AIRNOW_KEY = "E1B651E0-0ED4-4D1F-9D2F-2B19E2C6D302";

/* ========= Design Tokens ========= */
const T = {
  bg: "#0f1117",
  bg2: "#131627",
  text: "#EAF2FF",
  textDim: "#AAB6D3",
  white: "#ffffff",
  glass: "rgba(255,255,255,0.06)",
  glassStroke: "rgba(255,255,255,0.14)",
  chipBg: "rgba(255,255,255,0.08)",
  chipStroke: "rgba(255,255,255,0.16)",
  ok: "#9AE6B4",
  danger: "#ff6b6b",

  /* modern “Apple” gradient */
  grad: ["#34FFD1", "#5B8EFF", "#BC6FFF", "#FF7AC3"],
};

/* ========= Small UI Primitives ========= */
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
        <Text style={{ color: "#0B0C10", fontWeight: "800" }}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function GlassCard({ children, style }) {
  return (
    <View style={[st.card, style]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={{ opacity: 1 }}>{children}</View>
    </View>
  );
}

function Pill({ label, onPress, active }) {
  return (
    <Pressable onPress={onPress} style={[st.pill, active && st.pillActive]}>
      <Text style={[st.pillText, active && { color: "#0b0c10", fontWeight: "800" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Nav({ label, value, tab, setTab }) {
  const active = tab === value;
  return (
    <Pressable onPress={() => setTab(value)} style={[st.nav, active ? st.navActive : st.navIdle]}>
      <Text style={{ color: active ? "#0b0c10" : T.text, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ========= Main Screen ========= */
export default function DashboardScreen() {
  const [scenarioKey, setScenarioKey] = useState("low-sleep-high-aqi");
  const [showUserInput, setShowUserInput] = useState(false);
  const [userMetrics, setUserMetrics] = useState({
    age: "",
    sex: "",
    height: "",
    weight: "",
    bloodPressure: "",
    heartRate: "",
    steps: "",
    sleep: "",
    activities: "",
    sedentary: "",
    familyHistory: "",
    mood: "",
    caffeine: "",
    hydration: "",
    screenTime: "",
    alcohol: "",
    smoking: "",
  });
  const [userMetricsActive, setUserMetricsActive] = useState(null);
  const [payload, setPayload] = useState(null);

  const [tab, setTab] = useState("Insights"); // "Insights" | "ToDo"
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [airQuality, setAirQuality] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    getTodos().then(setTodos);
  }, []);

  useEffect(() => {
    if (userMetricsActive) {
      setPayload((prev) => {
        const merged = { ...prev, userMetrics: userMetricsActive };
        return merged;
      });
    }
  }, [userMetricsActive]);

  const runScenario = async () => {
    setLoading(true);
    try {
      let inputs;
      let engineOutput;
      if (scenarioKey === "user-input" && userMetricsActive) {
        inputs = { ...userMetricsActive };
        engineOutput = runRiskEngine(inputs);
        if (!engineOutput.triggers || engineOutput.triggers.length === 0) {
          engineOutput.triggers = [
            {
              category: "Sleep debt",
              type: "insight",
              title: "Heads-up: Sleep debt",
              body: "Short sleep detected. Try a steadier wind-down tonight.",
              metric_callouts: [inputs.sleep ? `Sleep: ${inputs.sleep}h` : "Sleep: N/A"],
              priority: 1,
            },
            {
              category: "Sedentary lifestyle",
              type: "action",
              title: "Try this: Sedentary lifestyle",
              body: "Long sit time. Add a couple short walks today.",
              metric_callouts: [inputs.sedentary ? `Sedentary: ${inputs.sedentary}h` : "Sedentary: N/A"],
              priority: 2,
            },
          ];
        }
      } else {
        inputs = scenarios[scenarioKey];
        engineOutput = runRiskEngine(inputs);
      }
      const context = scenarioKey === "user-input" && userMetricsActive ? userMetricsActive : null;
      const finalJson = await toAppJsonAsync(engineOutput, "soft_pastel", context);
      setPayload(finalJson);
    } finally {
      setLoading(false);
    }
  };

  const addToTodo = async (card) => {
    const next = await addTodoFromCard(card);
    setTodos(next);
    setTab("ToDo");
  };
  const onToggleTodo = async (id) => setTodos(await toggleTodo(id));
  const onRemoveTodo = async (id) => setTodos(await removeTodo(id));
  const onClear = async () => setTodos(await clearTodos());

  const cards = useMemo(() => dedupeCards(payload?.cards || []), [payload]);

  useEffect(() => {
    const fetchAirNowAQI = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Location permission denied");
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;

        const url = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${latitude}&longitude=${longitude}&distance=25&API_KEY=${AIRNOW_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setErrorMsg("No air quality data available for your location");
          return;
        }

        const maxAQI = data.reduce((max, obs) => (obs.AQI > max.AQI ? obs : max), { AQI: -1 });
        setAirQuality({ allReadings: data, worst: maxAQI });
      } catch (error) {
        setErrorMsg("Error fetching air quality data");
        console.error(error);
      }
    };
    fetchAirNowAQI();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Hero gradient header */}
      <LinearGradient
        colors={T.grad}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={st.hero}
      />
      <ScrollView contentContainerStyle={st.wrap}>
        {/* Title over glass chip */}
        <View style={st.headerRow}>
          <View style={st.headerChip}>
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={st.h1}>Dashboard</Text>
          </View>

          <View style={st.navRow}>
            <Nav label="Insights" value="Insights" tab={tab} setTab={setTab} />
            <Nav label="To-Do" value="ToDo" tab={tab} setTab={setTab} />
          </View>
        </View>

        {/* Scenario picker chips */}
        <View style={st.pillRow}>
          <Pill
            active={scenarioKey === "low-sleep-high-aqi"}
            onPress={() => setScenarioKey("low-sleep-high-aqi")}
            label="Low Sleep + High AQI"
          />
          <Pill
            active={scenarioKey === "user-input"}
            onPress={() => {
              setScenarioKey("user-input");
              setShowUserInput(true);
            }}
            label="User Input"
          />
          <Pill
            active={scenarioKey === "very-sedentary-high-caffeine"}
            onPress={() => setScenarioKey("very-sedentary-high-caffeine")}
            label="Sedentary + High Caffeine"
          />
        </View>

        {/* Run button */}
        <GradientButton
          title={loading ? "Refining…" : "Run Rubric"}
          onPress={runScenario}
          disabled={loading}
          style={{ alignSelf: "flex-start", marginBottom: 10 }}
        />

        {tab === "Insights" ? (
          <>
            <Text style={st.sectionTitle}>Insights</Text>
            {cards.length ? (
              cards.map((c, i) => (
                <GlassCard key={makeKey(c, i)} style={{ marginBottom: 12 }}>
                  <View style={{ padding: 14 }}>
                    <Text style={st.cardTitle}>{c.title}</Text>
                    <Text style={st.cardBody}>{c.body}</Text>

                    <View style={st.chipsWrap}>
                      {(c.metric_callouts || []).map((m, j) => (
                        <View key={j} style={st.chip}>
                          <Text style={st.chipText}>{m}</Text>
                        </View>
                      ))}
                    </View>

                    {isAction(c) && (
                      <Pressable onPress={() => addToTodo(c)} style={st.smallBtn}>
                        <LinearGradient
                          colors={T.grad}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={st.smallBtnBg}
                        >
                          <Text style={{ color: "#0b0c10", fontWeight: "800" }}>
                            + Add to To-Do
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    )}
                  </View>
                </GlassCard>
              ))
            ) : (
              <Text style={st.muted}>None</Text>
            )}

            {/* Air Quality */}
            <Text style={[st.sectionTitle, { marginTop: 16 }]}>Air Quality Index</Text>
            <GlassCard>
              <View style={{ padding: 14 }}>
                {errorMsg ? (
                  <Text style={[st.cardBody, { color: T.danger }]}>{errorMsg}</Text>
                ) : airQuality ? (
                  <>
                    <Text style={st.cardTitle}>
                      Worst AQI: {airQuality.worst.AQI}
                    </Text>
                    <Text style={st.cardBody}>
                      Category: {airQuality.worst.Category.Name}
                    </Text>
                  </>
                ) : (
                  <Text style={st.muted}>Fetching air quality data…</Text>
                )}
              </View>
            </GlassCard>
          </>
        ) : (
          <>
            <View style={st.todoHeader}>
              <Text style={st.sectionTitle}>To-Do</Text>
              <Pressable onPress={onClear} style={st.clearBtn}>
                <Text style={{ color: T.text, fontWeight: "700" }}>Clear</Text>
              </Pressable>
            </View>

            {todos.length ? (
              todos.map((t) => (
                <GlassCard key={String(t.actionId)} style={{ marginBottom: 12 }}>
                  <View style={{ padding: 14 }}>
                    <View style={st.todoRow}>
                      <Text
                        style={[
                          st.cardTitle,
                          {
                            textDecorationLine: t.done ? "line-through" : "none",
                            opacity: t.done ? 0.6 : 1,
                          },
                        ]}
                      >
                        {t.title}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Pressable onPress={() => onToggleTodo(t.actionId)} style={st.todoBtn}>
                          <Text style={{ color: "#0b0c10", fontWeight: "800" }}>
                            {t.done ? "Undo" : "Done"}
                          </Text>
                        </Pressable>
                        <Pressable onPress={() => onRemoveTodo(t.actionId)} style={st.todoBtnGhost}>
                          <Text style={{ color: T.text }}>Remove</Text>
                        </Pressable>
                      </View>
                    </View>

                    {t.note ? <Text style={st.cardBody}>{t.note}</Text> : null}

                    <View style={st.chipsWrap}>
                      {(t.chips || []).map((m, j) => (
                        <View key={j} style={st.chip}>
                          <Text style={st.chipText}>{m}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </GlassCard>
              ))
            ) : (
              <Text style={[st.muted, { marginTop: 8 }]}>
                No tasks yet. Add actions from “Insights”.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* User Input Modal — glass */}
      <Modal visible={showUserInput} animationType="fade" transparent>
        <View style={st.modalWrap}>
          <View style={st.modalCard}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={st.modalTitle}>Enter Your Health Metrics</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {[
                { key: "age", label: "Age", type: "numeric" },
                { key: "sex", label: "Sex (M/F/Other)", type: "default" },
                { key: "height", label: "Height (cm)", type: "numeric" },
                { key: "weight", label: "Weight (kg)", type: "numeric" },
                { key: "bloodPressure", label: "Blood Pressure", type: "default" },
                { key: "heartRate", label: "Heart Rate", type: "numeric" },
                { key: "steps", label: "Steps (per day)", type: "numeric" },
                { key: "sleep", label: "Sleep (hours)", type: "numeric" },
                { key: "activities", label: "Activities (comma separated)", type: "default" },
                { key: "sedentary", label: "Sedentary (hours)", type: "numeric" },
                { key: "familyHistory", label: "Family History", type: "default" },
                { key: "mood", label: "Mood", type: "default" },
                { key: "caffeine", label: "Caffeine (mg)", type: "numeric" },
                { key: "hydration", label: "Hydration (cups)", type: "numeric" },
                { key: "screenTime", label: "Screen Time (hours)", type: "numeric" },
                { key: "alcohol", label: "Alcohol (drinks/week)", type: "numeric" },
                { key: "smoking", label: "Smoking (cigs/day)", type: "numeric" },
              ].map(({ key, label, type }) => (
                <View key={key} style={{ marginBottom: 10 }}>
                  <Text style={{ color: T.text, marginBottom: 6 }}>{label}</Text>
                  <View style={st.inputWrap}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <TextInput
                      placeholderTextColor={T.textDim}
                      style={st.input}
                      keyboardType={type}
                      value={userMetrics[key]}
                      onChangeText={(v) => setUserMetrics((m) => ({ ...m, [key]: v }))}
                      placeholder={label}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <GradientButton
                title="Save"
                onPress={() => {
                  setShowUserInput(false);
                  setUserMetricsActive({ ...userMetrics });
                }}
                style={{ flex: 1 }}
              />
              <Pressable
                onPress={() => setShowUserInput(false)}
                style={[st.todoBtnGhost, { flex: 1, justifyContent: "center", alignItems: "center" }]}
              >
                <Text style={{ color: T.text, fontWeight: "700" }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ========= helpers ========= */
function isAction(c) {
  return /action/i.test(c?.type || "") || /^Try this:/i.test(c?.title || "");
}

function dedupeCards(list) {
  const seen = new Set();
  const out = [];
  for (const c of list) {
    const key = cardIdentity(c);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function cardIdentity(c) {
  if (c?.id) return `id:${String(c.id)}`;
  if (c?.actionId) return `action:${String(c.actionId)}`;
  const title = (c?.title || "").trim();
  const body = (c?.body || "").trim();
  return `sig:${title}|${body}`;
}

function makeKey(c, i) {
  if (c?.id) return `id-${String(c.id)}`;
  if (c?.actionId) return `act-${String(c.actionId)}`;
  return `idx-${i}-${hashStr((c?.title || "") + "|" + (c?.body || ""))}`;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/* ========= styles ========= */
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.glassStroke,
    backgroundColor: T.glass,
  },
  h1: { fontSize: 22, fontWeight: "900", color: T.text },

  navRow: { flexDirection: "row", gap: 8 },
  nav: {
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  navIdle: { borderColor: T.glassStroke, backgroundColor: T.glass },
  navActive: {
    borderColor: "transparent",
    backgroundColor: "#ffffff",
  },

  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  pill: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: T.chipStroke,
    backgroundColor: T.chipBg,
  },
  pillActive: {
    borderColor: "transparent",
    backgroundColor: "#ffffff",
  },
  pillText: { color: T.text },

  sectionTitle: { color: T.text, fontWeight: "800", marginBottom: 6 },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.glassStroke,
    backgroundColor: T.glass,
  },
  cardTitle: { color: T.text, fontWeight: "800", fontSize: 16 },
  cardBody: { color: T.textDim, marginTop: 4 },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: T.chipStroke,
    backgroundColor: T.chipBg,
  },
  chipText: { color: T.text, fontSize: 12 },

  smallBtn: { borderRadius: 12, overflow: "hidden", alignSelf: "flex-start" },
  smallBtnBg: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },

  muted: { color: T.textDim },

  todoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  clearBtn: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: T.glassStroke,
    backgroundColor: T.glass,
  },

  todoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  todoBtn: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  todoBtnGhost: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.glassStroke,
    backgroundColor: T.glass,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  /* Modal */
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.glassStroke,
    backgroundColor: T.bg,
    padding: 18,
  },
  modalTitle: { color: T.text, fontWeight: "900", fontSize: 18, marginBottom: 12 },
  inputWrap: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.glassStroke,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  input: {
    color: T.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
});
