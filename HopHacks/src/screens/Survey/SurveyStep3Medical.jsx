import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Switch } from "react-native";

const palette = {
  bg: "#FFF",
  card: "#F8E3DD",
  accent: "#E8A87C",
  tab: "#F3F3F3",
  text: "#111",
  muted: "#888",
};

export default function SurveyStep3Medical({ onNext, data, setData }) {
  const [highBP, setHighBP] = useState(data.highBP || false);
  const [highChol, setHighChol] = useState(data.highChol || false);
  const [prediabetes, setPrediabetes] = useState(data.prediabetes || false);
  const [diabetes, setDiabetes] = useState(data.diabetes || false);
  const [gestational, setGestational] = useState(data.gestational || false);
  const [famHypertension, setFamHypertension] = useState(data.famHypertension || "None");
  const [famDiabetes, setFamDiabetes] = useState(data.famDiabetes || "None");
  const [smoking, setSmoking] = useState(data.smoking || "Never");
  const [alcohol, setAlcohol] = useState(data.alcohol || "None");

  const handleNext = () => {
    setData({ ...data, highBP, highChol, prediabetes, diabetes, gestational, famHypertension, famDiabetes, smoking, alcohol });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 3/5</Text>
      <Text style={styles.title}>Medical & Family History</Text>
      <Text style={styles.desc}>This helps personalize your insights. It takes under a minute.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Diagnoses</Text>
        <View style={styles.row}><Text style={styles.label}>High Blood Pressure</Text><Switch value={highBP} onValueChange={setHighBP} /></View>
        <View style={styles.row}><Text style={styles.label}>High Cholesterol</Text><Switch value={highChol} onValueChange={setHighChol} /></View>
        <View style={styles.row}><Text style={styles.label}>Prediabetes</Text><Switch value={prediabetes} onValueChange={setPrediabetes} /></View>
        <View style={styles.row}><Text style={styles.label}>Diabetes</Text><Switch value={diabetes} onValueChange={setDiabetes} /></View>
        <View style={styles.row}><Text style={styles.label}>Gestational Diabetes</Text><Switch value={gestational} onValueChange={setGestational} /></View>
        <Text style={styles.label}>Family History of Hypertension</Text>
        <View style={styles.mcqRow}>
          {['None', 'One', 'Multiple'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, famHypertension === opt && styles.mcqSelected]} onPress={() => setFamHypertension(opt)}>
              <Text style={famHypertension === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Family History of Diabetes</Text>
        <View style={styles.mcqRow}>
          {['None', 'One', 'Multiple'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, famDiabetes === opt && styles.mcqSelected]} onPress={() => setFamDiabetes(opt)}>
              <Text style={famDiabetes === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Smoking Status</Text>
        <View style={styles.mcqRow}>
          {['Never', 'Former', 'Current'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, smoking === opt && styles.mcqSelected]} onPress={() => setSmoking(opt)}>
              <Text style={smoking === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Alcohol Use</Text>
        <View style={styles.mcqRow}>
          {['None', 'Social', 'Regular'].map(opt => (
            <Pressable key={opt} style={[styles.mcqBtn, alcohol === opt && styles.mcqSelected]} onPress={() => setAlcohol(opt)}>
              <Text style={alcohol === opt ? styles.mcqTextSelected : styles.mcqText}>{opt}</Text>
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
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 6 },
  mcqRow: { flexDirection: "row", marginVertical: 6 },
  mcqBtn: { backgroundColor: palette.tab, borderRadius: 8, padding: 10, marginRight: 8 },
  mcqSelected: { backgroundColor: palette.accent },
  mcqText: { color: palette.text },
  mcqTextSelected: { color: palette.bg, fontWeight: "700" },
  nextBtn: { backgroundColor: palette.accent, borderRadius: 18, padding: 12, alignSelf: "center", marginTop: 12 },
  nextText: { color: palette.bg, fontSize: 22 },
});