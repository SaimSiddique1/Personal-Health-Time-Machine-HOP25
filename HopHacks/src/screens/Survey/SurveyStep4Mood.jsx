
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

// Color palette
const BG_BEIGE = "#F5F5DC";
const CARD_WHITE = "#fff";
const TEXT_MUTED = "#888";
const TRACK_BLUE = "#0A2342";
const BTN_GREEN = "#6EE7B7";



export default function SurveyStep4Mood({ next, back, data, setData }) {
  const [moodScale, setMoodScale] = useState(data.moodScale || 0);
  const [interest, setInterest] = useState(data.interest || 0);
  const [hopeless, setHopeless] = useState(data.hopeless || 0);
  const [anxiety, setAnxiety] = useState(data.anxiety || "None");
  const [stress, setStress] = useState(data.stress || 0);
  const [socialIsolation, setSocialIsolation] = useState(data.socialIsolation || "Never");

  const handleNext = () => {
    setData({ ...data, moodScale, interest, hopeless, anxiety, stress, socialIsolation });
    next();
  };

  return (
    <View style={styles.safe}>
      <Text style={styles.step}>Step 4/5</Text>
      <Text style={styles.title}>Mood & Stress</Text>
      <Text style={styles.desc}>This helps personalize your insights. It takes under a minute.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Mood Scale</Text>
        <MCQ
          options={[0, 1, 2, 3]}
          value={moodScale}
          setValue={setMoodScale}
          labels={["Not At All", "Several Days", "More than Half", "Almost Everyday"]}
        />
        <Text style={styles.label}>Interest in Doing Stuff</Text>
        <MCQ
          options={[0, 1, 2, 3]}
          value={interest}
          setValue={setInterest}
          labels={["None", "Mild", "Moderate", "Severe"]}
        />
        <Text style={styles.label}>Feeling Hopeless</Text>
        <MCQ
          options={[0, 1, 2, 3]}
          value={hopeless}
          setValue={setHopeless}
          labels={["None", "Mild", "Moderate", "Severe"]}
        />
        <Text style={styles.label}>Anxiety</Text>
        <MCQ
          options={["None", "Mild", "Moderate", "Severe"]}
          value={anxiety}
          setValue={setAnxiety}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
          <Pressable style={styles.navBtn} onPress={back}>
            <Text style={styles.navText}>←</Text>
          </Pressable>
          <Pressable style={styles.navBtn} onPress={handleNext}>
            <Text style={styles.navText}>→</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function MCQ({ options, value, setValue, labels }) {
  return (
    <View style={styles.mcqRow}>
      {options.map((opt, i) => (
        <Pressable
          key={opt}
          style={[styles.mcqBtn, value === opt && styles.mcqSelected]}
          onPress={() => setValue(opt)}
        >
          <Text style={value === opt ? styles.mcqTextSelected : styles.mcqText}>
            {labels ? labels[i] : opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_BEIGE, padding: 24 },
  step: { fontSize: 16, color: TEXT_MUTED, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: CARD_WHITE },
  desc: { fontSize: 14, color: CARD_WHITE, marginBottom: 16 },
  card: { backgroundColor: TRACK_BLUE, borderRadius: 18, padding: 18, marginBottom: 18 },
  label: { fontWeight: "700", color: BTN_GREEN, marginBottom: 6, marginTop: 8 },
  mcqRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  mcqBtn: { backgroundColor: BTN_GREEN, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8, marginBottom: 8 },
  mcqSelected: { backgroundColor: TRACK_BLUE },
  mcqText: { color: TRACK_BLUE, fontWeight: "600" },
  mcqTextSelected: { color: CARD_WHITE, fontWeight: "700" },
  navBtn: { backgroundColor: BTN_GREEN, borderRadius: 8, padding: 10 },
  navText: { color: TRACK_BLUE, fontSize: 18, fontWeight: "bold" },
});

// ...existing code...