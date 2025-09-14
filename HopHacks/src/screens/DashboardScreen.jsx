import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';

import { scenarios } from "../data/scenarios";
import { runRiskEngine } from "../engine/engine";
import { toAppJson } from "../output/serializer";
import { partitionPayload } from "../output/partition";

const AIRNOW_KEY = 'E1B651E0-0ED4-4D1F-9D2F-2B19E2C6D302';

export default function DashboardScreen() {
  const [scenarioKey, setScenarioKey] = React.useState("low-sleep-high-aqi");
  const [payload, setPayload] = React.useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
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

  useEffect(() => {
    const fetchAirNowAQI = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied');
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = coords;

        const url = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${latitude}&longitude=${longitude}&distance=25&API_KEY=${AIRNOW_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.length === 0) {
          setErrorMsg('No air quality data available for your location');
          return;
        }

        const maxAQI = data.reduce((max, obs) => (obs.AQI > max.AQI ? obs : max), { AQI: -1 });
        setAirQuality({ allReadings: data, worst: maxAQI });
      } catch (error) {
        setErrorMsg('Error fetching air quality data');
        console.error(error);
      }
    };

    fetchAirNowAQI();
  }, []);

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

        {/* Air Quality Section */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: "800", marginBottom: 6 }}>Air Quality Index</Text>
          {errorMsg ? (
            <Text style={{ color: 'red' }}>{errorMsg}</Text>
          ) : airQuality ? (
            <View>
              <Text style={{ fontWeight: "700" }}>Worst AQI: {airQuality.worst.AQI}</Text>
              <Text style={{ opacity: 0.9, marginVertical: 4 }}>Category: {airQuality.worst.Category.Name}</Text>
            </View>
          ) : (
            <Text style={{ opacity: 0.7 }}>Fetching air quality data...</Text>
          )}
        </View>
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

const BG_BEIGE = "#E8DED3";
const CARD_WHITE = "#FFFFFF";
const TRACK_GRAY = "#EAEAEA";
const BTN_DARK = "#1976F3";
const TEXT_PRIMARY = "#111";
const TEXT_MUTED = "#888";

const st = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: BG_BEIGE },
  h1: { fontSize: 24, fontWeight: "800", marginBottom: 16, textAlign: "center", color: TEXT_PRIMARY },
  btn: { backgroundColor: BTN_DARK, padding: 14, borderRadius: 10, alignSelf: "flex-start" },
  btnText: { color: CARD_WHITE, fontWeight: "800" },
  pill: { borderWidth:1, borderColor:TRACK_GRAY, borderRadius: 999, paddingVertical:6, paddingHorizontal:10, backgroundColor: CARD_WHITE },
  card: { borderWidth:0, borderRadius: 18, padding: 16, marginBottom: 12, backgroundColor:CARD_WHITE, shadowColor: BG_BEIGE, shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  chip: { borderWidth:1, borderColor:TRACK_GRAY, borderRadius:999, paddingVertical:4, paddingHorizontal:8, backgroundColor: CARD_WHITE }
});
