// src/screens/DashboardScreen.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Modal, TextInput, Button } from "react-native";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

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
    smoking: ""
  });
  // Store user metrics for insights
  const [userMetricsActive, setUserMetricsActive] = useState(null);
  const [payload, setPayload] = useState(null);

  // prod features
  const [tab, setTab] = useState("Insights"); // "Insights" | "ToDo"
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  // main features
  const [airQuality, setAirQuality] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    getTodos().then(setTodos);
  }, []);

  // watch for userMetricsActive changes
  useEffect(() => {
    console.log("Effect triggered, userMetricsActive:", userMetricsActive);
    if (userMetricsActive) {
      setPayload(prev => {
        const merged = { ...prev, userMetrics: userMetricsActive };
        console.log("Updated payload:", merged);
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
        // If no triggers, force some mock triggers for demo
        if (!engineOutput.triggers || engineOutput.triggers.length === 0) {
          engineOutput.triggers = [
            {
              category: "Sleep debt",
              type: "insight",
              title: "Heads-up: Sleep debt",
              body: "Short sleep detected. Try a steadier wind-down tonight.",
              metric_callouts: [inputs.sleep ? `Sleep: ${inputs.sleep}h` : "Sleep: N/A"],
              priority: 1
            },
            {
              category: "Sedentary lifestyle",
              type: "action",
              title: "Try this: Sedentary lifestyle",
              body: "Long sit time. Add a couple short walks today.",
              metric_callouts: [inputs.sedentary ? `Sedentary: ${inputs.sedentary}h` : "Sedentary: N/A"],
              priority: 2
            }
          ];
        }
      } else {
        inputs = scenarios[scenarioKey];
        engineOutput = runRiskEngine(inputs);
      }
      // Pass user metrics as context for Gemini if user-input
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

  // Build a single deduped list from payload.cards
  const cards = useMemo(() => dedupeCards(payload?.cards || []), [payload]);

  // fetch AirNow AQI
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

        if (data.length === 0) {
          setErrorMsg("No air quality data available for your location");
          return;
        }

        const maxAQI = data.reduce(
          (max, obs) => (obs.AQI > max.AQI ? obs : max),
          { AQI: -1 }
        );
        setAirQuality({ allReadings: data, worst: maxAQI });
      } catch (error) {
        setErrorMsg("Error fetching air quality data");
        console.error(error);
      }
    };

    fetchAirNowAQI();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.wrap}>
        <Text style={st.h1}>Dashboard</Text>

        {/* top nav */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <Nav label="Insights" value="Insights" tab={tab} setTab={setTab} />
          <Nav label="To-Do" value="ToDo" tab={tab} setTab={setTab} />
        </View>

        {/* scenario picker */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 8,
          }}
        >
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
          {/* User Input Modal */}
          <Modal visible={showUserInput} animationType="slide" transparent>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0008" }}>
              <View style={{ backgroundColor: "#fff", padding: 24, borderRadius: 12, width: 340, maxHeight: 500 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Enter Your Health Metrics</Text>
                <ScrollView style={{ maxHeight: 340 }}>
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
                    { key: "smoking", label: "Smoking (cigs/day)", type: "numeric" }
                  ].map(({ key, label, type }) => (
                    <View key={key} style={{ marginBottom: 10 }}>
                      <Text>{label}:</Text>
                      <TextInput
                        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
                        keyboardType={type}
                        value={userMetrics[key]}
                        onChangeText={v => setUserMetrics(m => ({ ...m, [key]: v }))}
                      />
                    </View>
                  ))}
                </ScrollView>
                <Button
                  title="Save"
                  onPress={() => {
                    setShowUserInput(false);
                    setUserMetricsActive({ ...userMetrics });
                  }}
                />
                <Button title="Cancel" color="#cc0000" onPress={() => setShowUserInput(false)} />
              </View>
            </View>
          </Modal>
          <Pill
            active={scenarioKey === "very-sedentary-high-caffeine"}
            onPress={() => setScenarioKey("very-sedentary-high-caffeine")}
            label="Sedentary + High Caffeine"
          />
        </View>

        <Pressable
          onPress={runScenario}
          style={[st.btn, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          <Text style={st.btnText}>{loading ? "Refining…" : "Run Rubric"}</Text>
        </Pressable>

        {tab === "Insights" ? (
          <>
            <Text style={{ fontWeight: "800", marginBottom: 6 }}>Insights</Text>
            {cards.length ? (
              cards.map((c, i) => (
                <View key={makeKey(c, i)} style={st.card}>
                  <Text style={{ fontWeight: "700" }}>{c.title}</Text>
                  <Text style={{ opacity: 0.9, marginVertical: 4 }}>
                    {c.body}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 8,
                    }}
                  >
                    {(c.metric_callouts || []).map((m, j) => (
                      <View key={j} style={st.chip}>
                        <Text style={{ fontSize: 12 }}>{m}</Text>
                      </View>
                    ))}
                  </View>
                  {isAction(c) && (
                    <Pressable
                      onPress={() => addToTodo(c)}
                      style={[st.smallBtn, { backgroundColor: "#1a73e8" }]}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        + Add to To-Do
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))
            ) : (
              <Text style={{ opacity: 0.7 }}>None</Text>
            )}

            {/* Air Quality Section */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: "800", marginBottom: 6 }}>
                Air Quality Index
              </Text>
              {errorMsg ? (
                <Text style={{ color: "red" }}>{errorMsg}</Text>
              ) : airQuality ? (
                <View>
                  <Text style={{ fontWeight: "700" }}>
                    Worst AQI: {airQuality.worst.AQI}
                  </Text>
                  <Text style={{ opacity: 0.9, marginVertical: 4 }}>
                    Category: {airQuality.worst.Category.Name}
                  </Text>
                </View>
              ) : (
                <Text style={{ opacity: 0.7 }}>Fetching air quality data...</Text>
              )}
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ fontWeight: "800" }}>To-Do</Text>
              <Pressable onPress={onClear} style={[st.pill, { borderColor: "#ddd" }]}>
                <Text>Clear</Text>
              </Pressable>
            </View>

            {todos.length ? (
              todos.map((t) => (
                <View key={String(t.actionId)} style={st.card}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        textDecorationLine: t.done ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pressable
                        onPress={() => onToggleTodo(t.actionId)}
                        style={[
                          st.smallBtn,
                          { backgroundColor: "#9AE6B4" },
                        ]}
                      >
                        <Text>{t.done ? "Undo" : "Done"}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onRemoveTodo(t.actionId)}
                        style={[st.smallBtn, { backgroundColor: "#eee" }]}
                      >
                        <Text>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                  {t.note ? (
                    <Text style={{ opacity: 0.9, marginTop: 6 }}>{t.note}</Text>
                  ) : null}
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    {(t.chips || []).map((m, j) => (
                      <View key={j} style={st.chip}>
                        <Text style={{ fontSize: 12 }}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ opacity: 0.7, marginTop: 8 }}>
                No tasks yet. Add actions from “Insights”.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* helpers */
function isAction(c) {
  return /action/i.test(c?.type || "") || /^Try this:/i.test(c?.title || "");
}

function Pill({ label, onPress, active }) {
  return (
    <Pressable
      onPress={onPress}
      style={[st.pill, active && { backgroundColor: "#9AE6B4" }]}
    >
      <Text>{label}</Text>
    </Pressable>
  );
}

function Nav({ label, value, tab, setTab }) {
  const active = tab === value;
  return (
    <Pressable
      onPress={() => setTab(value)}
      style={[
        st.nav,
        active
          ? { backgroundColor: "#7BA6FF" }
          : { backgroundColor: "transparent", borderColor: "#ddd", borderWidth: 1 },
      ]}
    >
      <Text style={{ color: active ? "#fff" : "#111", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* de-dupe + key helpers */
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

const st = StyleSheet.create({
  wrap: { padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  btn: {
    backgroundColor: "#1a73e8",
    padding: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  btnText: { color: "#fff", fontWeight: "800" },
  pill: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  nav: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  chip: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  smallBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
