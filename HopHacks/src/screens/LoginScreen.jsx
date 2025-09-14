// src/screens/LoginScreen.jsx
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const T = {
  bg: "#0f1117",
  text: "#EAF2FF",
  textDim: "#AAB6D3",
  stroke: "rgba(255,255,255,0.14)",
  cardBg: "rgba(255,255,255,0.06)",      // solid “glass”
  inputBg: "rgba(255,255,255,0.08)",
  grad: ["#34FFD1", "#5B8EFF", "#BC6FFF", "#FF7AC3"],
  darkText: "#0b0c10",
};

export default function LoginScreen() {
  const nav = useNavigation();
  const [mode, setMode] = useState("signIn"); // "signIn" | "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onPrimary = () => {
    console.log(mode === "signIn" ? "Sign In" : "Sign Up", { email, password });
    if (mode === "signUp") {
      nav.replace("LocationPermission");
    } else {
      nav.replace("Survey"); // keep your existing flow
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {/* Hero gradient */}
      <LinearGradient
        colors={T.grad}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.hero}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Title block */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Personal Health Time-Machine</Text>
          </View>

          {/* Auth card */}
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabsTrack}>
              <Pressable
                onPress={() => setMode("signIn")}
                style={[styles.tab, mode === "signIn" && styles.tabActive]}
              >
                <Text style={[styles.tabText, mode === "signIn" && styles.tabTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode("signUp")}
                style={[styles.tab, mode === "signUp" && styles.tabActive]}
              >
                <Text style={[styles.tabText, mode === "signUp" && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={T.textDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={T.textDim}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <Pressable onPress={onPrimary} style={styles.primaryBtn}>
                <LinearGradient
                  colors={T.grad}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryBtnBg}
                >
                  <Text style={styles.primaryBtnText}>
                    {mode === "signIn" ? "Sign In" : "Create Account"}
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => nav.replace("Dashboard")}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>Continue as Guest</Text>
              </Pressable>
            </View>
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            Not medical advice. For informational purposes only.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  hero: {
    position: "absolute",
    top: -140,
    left: -80,
    right: -80,
    height: 320,
    transform: [{ rotate: "-6deg" }],
    opacity: 0.20,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: "center",
  },

  header: { width: "100%", marginBottom: 16 },
  title: { color: T.text, fontWeight: "900", fontSize: 28 },
  subtitle: { color: T.textDim, marginTop: 6 },

  card: {
    width: "100%",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: T.stroke,
    backgroundColor: T.cardBg,
  },

  tabsTrack: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.stroke,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 6,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#fff",
  },
  tabText: { fontSize: 15, fontWeight: "800", color: T.text },
  tabTextActive: { color: T.darkText },

  form: { marginTop: 4 },
  label: { fontSize: 14, fontWeight: "800", color: T.text, marginBottom: 6 },

  inputWrap: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.stroke,
    backgroundColor: T.inputBg,
  },
  input: {
    height: 52,
    paddingHorizontal: 12,
    color: T.text,
    fontSize: 16,
  },

  primaryBtn: { marginTop: 18, borderRadius: 12, overflow: "hidden" },
  primaryBtnBg: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: T.darkText, fontWeight: "900", fontSize: 16 },

  secondaryBtn: {
    marginTop: 10,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.stroke,
    backgroundColor: T.cardBg,
  },
  secondaryBtnText: { color: T.text, fontWeight: "800" },

  disclaimer: { color: T.textDim, fontSize: 12, marginTop: 16, textAlign: "center" },
});
