import React from "react";
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { scenarios } from "../data/scenarios";
import { runRiskEngine } from "../engine/engine";
import { toAppJson } from "../output/serializer";
import { partitionPayload } from "../output/partition";

export default function DashboardScreen() {
  const [scenarioKey, setScenarioKey] = React.useState("low-sleep-high-aqi");
  const [payload, setPayload] = React.useState(null);
  const sections = partitionPayload(payload || { cards: [] });

  const runScenario = async () => {
    // (optional) read survey for future use
    const surveyRaw = await AsyncStorage.getItem("lifelens_survey_v1");
    const survey = surveyRaw ? JSON.parse(surveyRaw) : null;

    // merge survey into scenario if you want later. For now, just demo the scenarios:
    const inputs = scenarios[scenarioKey];
    const engineOutput = runRiskEngine(inputs);
    const finalJson = toAppJson(engineOutput, "soft_pastel");
    setPayload(finalJson);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.wrap}>
        <Text style={st.h1}>Dashboard</Text>

        {/* scenario picker */}
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom: 8 }}>
          <Pill active={scenarioKey==="low-sleep-high-aqi"} onPress={()=>setScenarioKey("low-sleep-high-aqi")} label="Low Sleep + High AQI" />
          <Pill active={scenarioKey==="balanced"} onPress={()=>setScenarioKey("balanced")} label="Balanced" />
          <Pill active={scenarioKey==="very-sedentary-high-caffeine"} onPress={()=>setScenarioKey("very-sedentary-high-caffeine")} label="Sedentary + High Caffeine" />
        </View>

        <Pressable onPress={runScenario} style={st.btn}><Text style={st.btnText}>Run Rubric</Text></Pressable>

        {/* Sections */}
        <Section title="Flagged" items={sections.flagged} />
        <Section title="Extremes" items={sections.extremes} />
        <Section title="Suggestions" items={sections.suggestions} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Pill({ label, onPress, active }) {
  return (
    <Pressable onPress={onPress} style={[st.pill, active && { backgroundColor: "#9AE6B4" }]}>
      <Text>{label}</Text>
    </Pressable>
  );
}

function Section({ title, items }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontWeight: "800", marginBottom: 6 }}>{title}</Text>
      {items?.length ? items.map((c, i) => (
        <View key={`${title}-${i}`} style={st.card}>
          <Text style={{ fontWeight: "700" }}>{c.title}</Text>
          <Text style={{ opacity: 0.9, marginVertical: 4 }}>{c.body}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
            {(c.metric_callouts||[]).map((m,j)=>(
              <View key={j} style={st.chip}><Text style={{ fontSize: 12 }}>{m}</Text></View>
            ))}
          </View>
        </View>
      )) : <Text style={{ opacity: 0.7 }}>None</Text>}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  btn: { backgroundColor: "#1a73e8", padding: 12, borderRadius: 10, alignSelf: "flex-start" },
  btnText: { color: "#fff", fontWeight: "800" },
  pill: { borderWidth:1, borderColor:"#ddd", borderRadius: 999, paddingVertical:6, paddingHorizontal:10 },
  card: { borderWidth:1, borderColor:"#eee", borderRadius: 14, padding: 12, marginBottom: 10, backgroundColor:"#fff" },
  chip: { borderWidth:1, borderColor:"#eee", borderRadius:999, paddingVertical:4, paddingHorizontal:8 }
});
