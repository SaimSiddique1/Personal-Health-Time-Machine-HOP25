import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function SurveyScreen() {
  const nav = useNavigation();
  const [age, setAge] = useState("");
  const [sexAtBirth, setSex] = useState("male");
  const [heightCm, setHeight] = useState("");
  const [weightKg, setWeight] = useState("");
  const [famHTN, setFamHTN] = useState("0");
  const [famT2D, setFamT2D] = useState("0");

  const save = async () => {
    const data = {
      age: Number(age || 0),
      sexAtBirth,
      heightCm: Number(heightCm || 0),
      weightKg: Number(weightKg || 0),
      famHxHypertension: Number(famHTN || 0),
      famHxDiabetes: Number(famT2D || 0)
    };
    await AsyncStorage.setItem("lifelens_survey_v1", JSON.stringify(data));
    nav.replace("Dashboard");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.h1}>Quick Survey</Text>
        <Field label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
        <Field label="Sex at birth (male/female)" value={sexAtBirth} onChangeText={setSex} />
        <Field label="Height (cm)" value={heightCm} onChangeText={setHeight} keyboardType="numeric" />
        <Field label="Weight (kg)" value={weightKg} onChangeText={setWeight} keyboardType="numeric" />
        <Field label="Family hx Hypertension (0-2)" value={famHTN} onChangeText={setFamHTN} keyboardType="numeric" />
        <Field label="Family hx Type 2 Diabetes (0-2)" value={famT2D} onChangeText={setFamT2D} keyboardType="numeric" />
        <Pressable onPress={save} style={s.btn}><Text style={s.btnText}>Save & Continue</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: "700", marginBottom: 6 }}>{label}</Text>
      <TextInput
        {...props}
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12 }}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  btn: { backgroundColor: "#1a73e8", padding: 14, borderRadius: 10, marginTop: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" }
});
