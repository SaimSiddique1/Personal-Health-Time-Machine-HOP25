import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

const palette = {
  bg: "#E8DED3",
  card: "#F5F5F5",
  input: "#333",
  accent: "#1976F3",
  tab: "#EAEAEA",
  text: "#111",
  muted: "#888",
};

export default function SurveyStep1Profile({ onNext, data, setData }) {
  const [age, setAge] = useState(data.age || "");
  const [sex, setSex] = useState(data.sex || "");
  const [ethnicity, setEthnicity] = useState(data.ethnicity || "");
  const [heightFt, setHeightFt] = useState(data.heightFt || "");
  const [heightIn, setHeightIn] = useState(data.heightIn || "");
  const [weight, setWeight] = useState(data.weight || "");

  // Simple BMI calculation
  const bmi = (heightFt && heightIn && weight)
    ? (703 * parseFloat(weight) / Math.pow((parseFloat(heightFt) * 12 + parseFloat(heightIn)), 2)).toFixed(1)
    : "";

  const handleNext = () => {
    setData(prev => ({ ...prev, age, sex, ethnicity, heightFt, heightIn, weight, bmi }));
    setTimeout(onNext, 0); // ensure state update before navigation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 1/5</Text>
      <Text style={styles.title}>Basic Profile</Text>
      <Text style={styles.desc}>This helps personalize your insights. It takes under a minute.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Age</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Age" />
        <Text style={styles.label}>Sex assigned at birth</Text>
        <View style={styles.mcqRow}>
          {['Male', 'Female'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, sex === opt && styles.mcqSelected]} onPress={() => setSex(opt)}>
              <Text style={sex === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Ethnicity</Text>
        <View style={styles.mcqRow}>
          {['Asian', 'Black/African', 'Hispanic/Latino', 'White', 'Other'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, ethnicity === opt && styles.mcqSelected]} onPress={() => setEthnicity(opt)}>
              <Text style={ethnicity === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Height and Weight</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.smallInput]} value={heightFt} onChangeText={setHeightFt} keyboardType="numeric" placeholder="Feet" />
          <TextInput style={[styles.input, styles.smallInput]} value={heightIn} onChangeText={setHeightIn} keyboardType="numeric" placeholder="Inches" />
          <TextInput style={[styles.input, styles.smallInput]} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Weight (lbs)" />
        </View>
        <Text style={styles.label}>BMI</Text>
        <View style={styles.bmiBox}><Text style={styles.bmiText}>{bmi || ""}</Text></View>
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
  input: { backgroundColor: palette.input, color: palette.card, borderRadius: 8, height: 44, paddingHorizontal: 12, fontSize: 16, marginVertical: 6 },
  smallInput: { flex: 1, marginRight: 8 },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  mcqRow: { flexDirection: "row", marginVertical: 6 },
  mcqBtn: { backgroundColor: palette.tab, borderRadius: 8, padding: 10, marginRight: 8 },
  mcqSelected: { backgroundColor: palette.input },
  mcqText: { color: palette.text },
  mcqTextSelected: { color: palette.card, fontWeight: "700" },
  bmiBox: { backgroundColor: palette.tab, borderRadius: 8, padding: 10, alignItems: "center", marginVertical: 6 },
  bmiText: { fontSize: 18, color: palette.text },
  nextBtn: { backgroundColor: palette.input, borderRadius: 18, padding: 12, alignSelf: "center", marginTop: 12 },
  nextText: { color: palette.card, fontSize: 22 },
});