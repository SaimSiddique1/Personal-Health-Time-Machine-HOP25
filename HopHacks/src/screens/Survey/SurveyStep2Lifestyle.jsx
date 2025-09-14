
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Slider from '@react-native-community/slider';

const palette = {
  bg: "#333333",
  card: "#CBB68A",
  input: "#333",
  accent: "#1976F3",
  tab: "#EAEAEA",
  text: "#111",
  muted: "#888",
};

export default function SurveyStep2Lifestyle({ onNext, data, setData }) {
  const [sleepHours, setSleepHours] = useState(data.sleepHours || 7);
  const [activity, setActivity] = useState(data.activity || "");
  const [alcohol, setAlcohol] = useState(data.alcohol || "");
  const [screenTime, setScreenTime] = useState(data.screenTime || "");
  const [caffeine, setCaffeine] = useState(data.caffeine || 0);

  const handleNext = () => {
    setData(prev => ({ ...prev, sleepHours, activity, alcohol, screenTime, caffeine }));
    setTimeout(onNext, 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 2/5</Text>
      <Text style={styles.title}>Lifestyle</Text>
      <Text style={styles.desc}>This helps personalize your insights. It takes under a minute.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Sleep Hours / Night</Text>
        <Slider
          minimumValue={4}
          maximumValue={10}
          step={0.5}
          value={sleepHours}
          onValueChange={setSleepHours}
          style={styles.slider}
        />
        <Text style={styles.sliderValue}>{sleepHours}h</Text>
        <Text style={styles.label}>Physical Activity</Text>
        <View style={styles.mcqRow}>
          {['No', 'Sometimes', 'Often'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, activity === opt && styles.mcqSelected]} onPress={() => setActivity(opt)}>
              <Text style={activity === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Alcohol Drinks/Week</Text>
        <View style={styles.mcqRow}>
          {['No', 'Sometimes', 'Often'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, alcohol === opt && styles.mcqSelected]} onPress={() => setAlcohol(opt)}>
              <Text style={alcohol === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Screen time after 11pm</Text>
        <View style={styles.mcqRow}>
          {['No', 'Sometimes', 'Often'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, screenTime === opt && styles.mcqSelected]} onPress={() => setScreenTime(opt)}>
              <Text style={screenTime === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Caffeine Intake</Text>
        <Slider
          minimumValue={0}
          maximumValue={600}
          step={10}
          value={caffeine}
          onValueChange={setCaffeine}
          style={styles.slider}
        />
        <Text style={styles.sliderValue}>{caffeine} mg</Text>
      </View>
      <Pressable style={styles.nextBtn} onPress={handleNext}><Text style={styles.nextText}>→</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg, padding: 18 },
  step: { fontSize: 18, color: palette.muted, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", color: palette.card },
  desc: { fontSize: 15, color: palette.muted, marginBottom: 12 },
  card: { backgroundColor: palette.card, borderRadius: 18, padding: 16, marginBottom: 18 },
  label: { fontSize: 16, fontWeight: "600", color: palette.text, marginTop: 10 },
  slider: { marginVertical: 8 },
  sliderValue: { fontSize: 16, color: palette.text, marginBottom: 8 },
  mcqRow: { flexDirection: "row", marginVertical: 6 },
  mcqBtn: { backgroundColor: palette.input, borderRadius: 8, padding: 10, marginRight: 8 },
  mcqSelected: { backgroundColor: palette.accent },
  mcqText: { color: palette.card },
  mcqTextSelected: { color: palette.bg, fontWeight: "700" },
  nextBtn: { backgroundColor: palette.input, borderRadius: 18, padding: 12, alignSelf: "center", marginTop: 12 },
  nextText: { color: palette.card, fontSize: 22 },
});