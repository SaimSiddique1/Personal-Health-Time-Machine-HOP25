import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function SurveyScreen() {
  const nav = useNavigation();
  // Profile & Medical Baseline
  const [age, setAge] = useState("");
  const [sexAtBirth, setSex] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [heightCm, setHeight] = useState("");
  const [weightKg, setWeight] = useState("");
  const [famHTN, setFamHTN] = useState("");
  const [famT2D, setFamT2D] = useState("");
  const [diagnoses, setDiagnoses] = useState("");
  // Lifestyle
  const [screenTime, setScreenTime] = useState("");
  const [caffeine, setCaffeine] = useState("");
  const [exercise, setExercise] = useState("");
  const [diet, setDiet] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [smoking, setSmoking] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [mood, setMood] = useState("");
  // Device Data
  const [steps, setSteps] = useState("");
  const [heartRate, setHeartRate] = useState("");
  // Environment Data
  const [aqi, setAQI] = useState("");
  const [waterQuality, setWaterQuality] = useState("");
  const [allergens, setAllergens] = useState("");
  const [noise, setNoise] = useState("");
  // Social & Other
  const [socialIsolation, setSocialIsolation] = useState("");
  const [circadian, setCircadian] = useState("");
  const [gerd, setGERD] = useState("");

  const save = async () => {
    const data = {
      age: Number(age || 0),
      sexAtBirth,
      ethnicity,
      heightCm: Number(heightCm || 0),
      weightKg: Number(weightKg || 0),
      famHxHypertension: famHTN,
      famHxDiabetes: famT2D,
      diagnoses,
      screenTime,
      caffeine,
      exercise,
      diet,
      alcohol,
      smoking,
      sleepHours,
      mood,
      steps,
      heartRate,
      aqi,
      waterQuality,
      allergens,
      noise,
      socialIsolation,
      circadian,
      gerd
    };
    await AsyncStorage.setItem("lifelens_survey_v1", JSON.stringify(data));
    nav.replace("Dashboard");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.h1}>Personal Health Time Machine Survey</Text>
        <Text style={s.section}>Profile & Medical Baseline</Text>
        <Field label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
        <Field label="Sex at birth" value={sexAtBirth} onChangeText={setSex} placeholder="male/female" />
        <Field label="Ethnicity" value={ethnicity} onChangeText={setEthnicity} placeholder="e.g. Asian, Black, White, Hispanic" />
        <Field label="Height (cm)" value={heightCm} onChangeText={setHeight} keyboardType="numeric" />
        <Field label="Weight (kg)" value={weightKg} onChangeText={setWeight} keyboardType="numeric" />
        <Field label="Family history of Hypertension" value={famHTN} onChangeText={setFamHTN} placeholder="e.g. parent, sibling, none" />
        <Field label="Family history of Type 2 Diabetes" value={famT2D} onChangeText={setFamT2D} placeholder="e.g. parent, sibling, none" />
        <Field label="Diagnoses (comma separated)" value={diagnoses} onChangeText={setDiagnoses} placeholder="e.g. high blood pressure, prediabetes" />

        <Text style={s.section}>Lifestyle</Text>
        <Field label="Screen time (avg hours/day)" value={screenTime} onChangeText={setScreenTime} keyboardType="numeric" />
        <Field label="Caffeine (mg/day)" value={caffeine} onChangeText={setCaffeine} keyboardType="numeric" />
        <Field label="Exercise (min/week)" value={exercise} onChangeText={setExercise} keyboardType="numeric" />
        <Field label="Diet notes" value={diet} onChangeText={setDiet} placeholder="e.g. vegetarian, high protein, etc." />
        <Field label="Alcohol use (drinks/week)" value={alcohol} onChangeText={setAlcohol} keyboardType="numeric" />
        <Field label="Smoking (cigarettes/week)" value={smoking} onChangeText={setSmoking} keyboardType="numeric" />
        <Field label="Sleep hours (avg/night)" value={sleepHours} onChangeText={setSleepHours} keyboardType="numeric" />
        <Field label="Mood (1-10)" value={mood} onChangeText={setMood} keyboardType="numeric" />

        <Text style={s.section}>Device Data</Text>
        <Field label="Steps (avg/day)" value={steps} onChangeText={setSteps} keyboardType="numeric" />
        <Field label="Heart rate (resting bpm)" value={heartRate} onChangeText={setHeartRate} keyboardType="numeric" />

        <Text style={s.section}>Environment Data</Text>
        <Field label="Air Quality Index (AQI)" value={aqi} onChangeText={setAQI} keyboardType="numeric" />
        <Field label="Water quality (score 1-10)" value={waterQuality} onChangeText={setWaterQuality} keyboardType="numeric" />
        <Field label="Environmental allergies (notes)" value={allergens} onChangeText={setAllergens} placeholder="e.g. pollen, dust, etc." />
        <Field label="Noise exposure (score 1-10)" value={noise} onChangeText={setNoise} keyboardType="numeric" />

        <Text style={s.section}>Other Factors</Text>
        <Field label="Social isolation (score 1-10)" value={socialIsolation} onChangeText={setSocialIsolation} keyboardType="numeric" />
        <Field label="Circadian disruption (score 1-10)" value={circadian} onChangeText={setCircadian} keyboardType="numeric" />
        <Field label="GERD (acid reflux) diagnosis?" value={gerd} onChangeText={setGERD} placeholder="yes/no" />

        <Pressable onPress={save} style={s.btn}><Text style={s.btnText}>Save & Continue</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: "700", marginBottom: 6, color: TEXT_PRIMARY }}>{label}</Text>
      <TextInput
        {...props}
        style={{
          backgroundColor: TRACK_GRAY,
          color: TEXT_PRIMARY,
          borderWidth: 2,
          borderColor: BTN_DARK,
          borderRadius: 10,
          padding: 12,
          fontSize: 16,
        }}
        placeholderTextColor={TEXT_MUTED}
      />
    </View>
  );
}

const BG_BEIGE = "#E8DED3";
const CARD_WHITE = "#FFFFFF";
const TRACK_GRAY = "#EAEAEA";
const INPUT_DARK = "#333333";
const BTN_DARK = "#1976F3";
const TEXT_PRIMARY = "#111";
const TEXT_MUTED = "#888";

const s = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: BG_BEIGE },
  h1: { fontSize: 24, fontWeight: "800", marginBottom: 16, textAlign: "center", color: TEXT_PRIMARY },
  section: { fontSize: 18, fontWeight: "700", marginTop: 18, marginBottom: 8, color: BTN_DARK },
  btn: { backgroundColor: BTN_DARK, padding: 14, borderRadius: 10, marginTop: 18, alignItems: "center" },
  btnText: { color: CARD_WHITE, fontWeight: "800" },
});
