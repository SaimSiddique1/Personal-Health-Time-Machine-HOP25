import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Switch } from "react-native";

const palette = {
  bg: "#E8DED3",
  card: "#F5F5F5",
  accent: "#1976F3",
  tab: "#EAEAEA",
  text: "#111",
  muted: "#888",
};

export default function SurveyStep5DeviceEnv({ onNext, data, setData }) {
  const [steps, setSteps] = useState(data.steps || "");
  const [heartRate, setHeartRate] = useState(data.heartRate || "");
  const [sleepHours, setSleepHours] = useState(data.sleepHours || "");
  const [aqi, setAqi] = useState(data.aqi || "");
  const [waterQuality, setWaterQuality] = useState(data.waterQuality || "");
  const [allergies, setAllergies] = useState(data.allergies || false);
  const [noise, setNoise] = useState(data.noise || "Low");

  const handleNext = () => {
    setData({ ...data, steps, heartRate, sleepHours, aqi, waterQuality, allergies, noise });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 5/5</Text>
      <Text style={styles.title}>Device & Environment</Text>
      <Text style={styles.desc}>This helps personalize your insights. It takes under a minute.</Text>
      <View style={styles.card}>
  <Text style={styles.label}>Steps</Text>
        <TextInput style={styles.input} value={steps} onChangeText={setSteps} keyboardType="numeric" placeholder="Steps" />
  <Text style={styles.label}>Heart Rate</Text>
        <TextInput style={styles.input} value={heartRate} onChangeText={setHeartRate} keyboardType="numeric" placeholder="Heart Rate" />
  <Text style={styles.label}>Sleep Hours</Text>
        <TextInput style={styles.input} value={sleepHours} onChangeText={setSleepHours} keyboardType="numeric" placeholder="Sleep Hours" />
        <Text style={styles.label}>Air Quality Index (AQI)</Text>
        <TextInput style={styles.input} value={aqi} onChangeText={setAqi} keyboardType="numeric" placeholder="AQI" />
        <Text style={styles.label}>Water Quality</Text>
        <TextInput style={styles.input} value={waterQuality} onChangeText={setWaterQuality} keyboardType="numeric" placeholder="Water Quality" />
        <View style={styles.row}><Text style={styles.label}>Environmental Allergies</Text><Switch value={allergies} onValueChange={setAllergies} /></View>
        <Text style={styles.label}>Noise Exposure</Text>
        <View style={styles.mcqRow}>
          {['Low', 'Moderate', 'High'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, noise === opt && styles.mcqSelected]} onPress={() => setNoise(opt)}>
              <Text style={noise === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable style={styles.nextBtn} onPress={handleNext}><Text style={styles.nextText}>→</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 18 },
  step: { fontSize: 18, color: palette.muted, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", color: palette.text },
  desc: { fontSize: 15, color: palette.muted, marginBottom: 12 },
  card: { backgroundColor: palette.card, borderRadius: 18, padding: 16, marginBottom: 18 },
  label: { fontSize: 16, fontWeight: "600", color: palette.text, marginTop: 10 },
  input: { backgroundColor: palette.tab, color: palette.text, borderRadius: 8, height: 44, paddingHorizontal: 12, fontSize: 16, marginVertical: 6 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 6 },
  mcqRow: { flexDirection: "row", marginVertical: 6 },
  mcqBtn: { backgroundColor: palette.tab, borderRadius: 8, padding: 10, marginRight: 8 },
  mcqSelected: { backgroundColor: palette.accent },
  mcqText: { color: palette.text },
  mcqTextSelected: { color: palette.bg, fontWeight: "700" },
  nextBtn: { backgroundColor: palette.accent, borderRadius: 18, padding: 12, alignSelf: "center", marginTop: 12 },
  nextText: { color: palette.bg, fontSize: 22 },
});