
import React, { useState } from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import SurveyStep1Profile from "./Survey/SurveyStep1Profile";
import SurveyStep2Lifestyle from "./Survey/SurveyStep2Lifestyle";
import SurveyStep3Medical from "./Survey/SurveyStep3Medical";
import SurveyStep4Mood from "./Survey/SurveyStep4Mood";
import SurveyStep5DeviceEnv from "./Survey/SurveyStep5DeviceEnv";

export default function SurveyScreen() {
  const nav = useNavigation();
  const [step, setStep] = useState(1);
  const [surveyData, setSurveyData] = useState({});

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const save = async () => {
    await AsyncStorage.setItem("lifelens_survey_v1", JSON.stringify(surveyData));
    nav.replace("Dashboard");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.h1}>Personal Health Survey</Text>
        {step === 1 && (
          <SurveyStep1Profile
            data={surveyData}
            setData={setSurveyData}
            onNext={next}
          />
        )}
        {step === 2 && (
          <SurveyStep2Lifestyle
            data={surveyData}
            setData={setSurveyData}
            onNext={next}
            back={back}
          />
        )}
        {step === 3 && (
          <SurveyStep3Medical
            data={surveyData}
            setData={setSurveyData}
            onNext={next}
            back={back}
          />
        )}
        {step === 4 && (
          <SurveyStep4Mood
            data={surveyData}
            setData={setSurveyData}
            next={next}
            back={back}
          />
        )}
        {step === 5 && (
          <SurveyStep5DeviceEnv
            data={surveyData}
            setData={setSurveyData}
            onNext={next}
            back={back}
          />
        )}
        {step === 6 && (
          <View style={{ alignItems: "center", marginTop: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              All done! Ready to generate insights.
            </Text>
            <Pressable onPress={save} style={s.btn}>
              <Text style={s.btnText}>Save & Continue</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ...existing code...

const s = StyleSheet.create({
  wrap: { padding: 16 },
  h1: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  btn: { backgroundColor: "#1a73e8", padding: 14, borderRadius: 10, marginTop: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" }
});
