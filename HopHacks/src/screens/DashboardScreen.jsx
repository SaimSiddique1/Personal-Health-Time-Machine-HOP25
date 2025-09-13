// src/screens/DashboardScreen.jsx
import React from "react";
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";

import { scenarios } from "../data/scenarios";
import { runRiskEngine } from "../engine/engine";
import { toAppJsonAsync } from "../output/serializer";
// import { partitionPayload } from "../output/partition"; // no longer needed
import { addTodoFromCard, getTodos, toggleTodo, removeTodo, clearTodos } from "../state/todos";

export default function DashboardScreen() {
  const [scenarioKey, setScenarioKey] = React.useState("low-sleep-high-aqi");
  const [payload, setPayload] = React.useState(null);
  const [tab, setTab] = React.useState("Insights"); // "Insights" | "ToDo"
  const [todos, setTodos] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    getTodos().then(setTodos);
  }, []);

  const runScenario = async () => {
    setLoading(true);
    try {
      const inputs = scenarios[scenarioKey];
      const engineOutput = runRiskEngine(inputs);
      // IMPORTANT: don't pass current payload to avoid accumulating/duping cards
      const finalJson = await toAppJsonAsync(engineOutput, "soft_pastel");
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
  const cards = React.useMemo(() => dedupeCards(payload?.cards || []), [payload]);

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
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <Pill
            active={scenarioKey === "low-sleep-high-aqi"}
            onPress={() => setScenarioKey("low-sleep-high-aqi")}
            label="Low Sleep + High AQI"
          />
          <Pill active={scenarioKey === "balanced"} onPress={() => setScenarioKey("balanced")} label="Balanced" />
          <Pill
            active={scenarioKey === "very-sedentary-high-caffeine"}
            onPress={() => setScenarioKey("very-sedentary-high-caffeine")}
            label="Sedentary + High Caffeine"
          />
        </View>

        <Pressable onPress={runScenario} style={[st.btn, loading && { opacity: 0.7 }]} disabled={loading}>
          <Text style={st.btnText}>{loading ? "Refining…" : "Run Rubric"}</Text>
        </Pressable>

        {tab === "Insights" ? (
          <>
            <Text style={{ fontWeight: "800", marginBottom: 6 }}>Insights</Text>
            {cards.length ? (
              cards.map((c, i) => (
                <View key={makeKey(c, i)} style={st.card}>
                  <Text style={{ fontWeight: "700" }}>{c.title}</Text>
                  <Text style={{ opacity: 0.9, marginVertical: 4 }}>{c.body}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {(c.metric_callouts || []).map((m, j) => (
                      <View key={j} style={st.chip}>
                        <Text style={{ fontSize: 12 }}>{m}</Text>
                      </View>
                    ))}
                  </View>
                  {isAction(c) && (
                    <Pressable onPress={() => addToTodo(c)} style={[st.smallBtn, { backgroundColor: "#1a73e8" }]}> 
                      <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add to To-Do</Text>
                    </Pressable>
                  )}
                </View>
              ))
            ) : (
              <Text style={{ opacity: 0.7 }}>None</Text>
            )}
          </>
        ) : (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontWeight: "800" }}>To-Do</Text>
              <Pressable onPress={onClear} style={[st.pill, { borderColor: "#ddd" }]}>
                <Text>Clear</Text>
              </Pressable>
            </View>

            {todos.length ? (
              todos.map((t) => (
                <View key={String(t.actionId)} style={st.card}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "700", textDecorationLine: t.done ? "line-through" : "none" }}>
                      {t.title}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pressable
                        onPress={() => onToggleTodo(t.actionId)}
                        style={[st.smallBtn, { backgroundColor: "#9AE6B4" }]}
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
                  {t.note ? <Text style={{ opacity: 0.9, marginTop: 6 }}>{t.note}</Text> : null}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {(t.chips || []).map((m, j) => (
                      <View key={j} style={st.chip}>
                        <Text style={{ fontSize: 12 }}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ opacity: 0.7, marginTop: 8 }}>No tasks yet. Add actions from “Insights”.</Text>
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
    <Pressable onPress={onPress} style={[st.pill, active && { backgroundColor: "#9AE6B4" }]}>
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
        active ? { backgroundColor: "#7BA6FF" } : { backgroundColor: "transparent", borderColor: "#ddd", borderWidth: 1 },
      ]}
    >
      <Text style={{ color: active ? "#fff" : "#111", fontWeight: "700" }}>{label}</Text>
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
  // Prefer explicit ids; fall back to actionId; then stable text signature.
  if (c?.id) return `id:${String(c.id)}`;
  if (c?.actionId) return `action:${String(c.actionId)}`;
  const title = (c?.title || "").trim();
  const body = (c?.body || "").trim();
  return `sig:${title}|${body}`;
}

function makeKey(c, i) {
  // Stable React key (avoid index-only when possible)
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
  btn: { backgroundColor: "#1a73e8", padding: 12, borderRadius: 10, alignSelf: "flex-start" },
  btnText: { color: "#fff", fontWeight: "800" },
  pill: { borderWidth: 1, borderColor: "#ddd", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  nav: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 14, padding: 12, marginBottom: 10, backgroundColor: "#fff" },
  chip: { borderWidth: 1, borderColor: "#eee", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 },
});
