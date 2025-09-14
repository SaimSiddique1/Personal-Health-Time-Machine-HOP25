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

export default function LoginScreen() {
  const nav = useNavigation();
  const [mode, setMode] = useState("signIn"); // "signIn" | "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onPrimary = () => {
    // TODO: wire to real auth
    console.log(mode === "signIn" ? "Sign In" : "Sign Up", { email, password });
    // Navigate to LocationPermission after "auth"
    if (mode === "signUp") {
      nav.replace("LocationPermission");
    } else {
      nav.replace("Survey");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabsTrack}>
              <Pressable
                onPress={() => setMode("signIn")}
                style={[styles.tab, styles.tabLeft, mode === "signIn" ? styles.tabActive : styles.tabInactive]}
              >
                <Text style={[styles.tabText, mode === "signIn" ? styles.tabTextActive : styles.tabTextInactive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode("signUp")}
                style={[styles.tab, styles.tabRight, mode === "signUp" ? styles.tabActive : styles.tabInactive]}
              >
                <Text style={[styles.tabText, mode === "signUp" ? styles.tabTextActive : styles.tabTextInactive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#b4b4b4"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#b4b4b4"
                secureTextEntry
                style={styles.input}
              />

              <Pressable onPress={onPrimary} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>{mode === "signIn" ? "Sign In" : "Create Account"}</Text>
              </Pressable>
            </View>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BG_BEIGE = "#E4D8CC";
const CARD_WHITE = "#FFFFFF";
const TRACK_GRAY = "#E6E6E6";
const TAB_ACTIVE = "#F3F3F3";
const INPUT_DARK = "#2D2E30";
const BTN_DARK = "#2E2E2E";
const BTN_BLACK = "#0F0F0F";
const TEXT_PRIMARY = "#0B0B0B";
const TEXT_MUTED = "#777777";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_BEIGE },
  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 48, paddingBottom: 32, alignItems: "center" },
  card: {
    width: "100%",
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 16,
    paddingTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  tabsTrack: {
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: TRACK_GRAY,
    borderRadius: 16,
    padding: 6,
    marginBottom: 18,
    width: "85%",
  },
  tab: { flex: 1, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  tabLeft: { marginRight: 6 },
  tabRight: { marginLeft: 6 },
  tabActive: { backgroundColor: TAB_ACTIVE },
  tabInactive: { backgroundColor: "transparent" },
  tabText: { fontSize: 16, fontWeight: "600" },
  tabTextActive: { color: TEXT_PRIMARY },
  tabTextInactive: { color: TEXT_PRIMARY },

  form: { marginTop: 4 },
  label: { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 6 },
  input: { backgroundColor: INPUT_DARK, color: "#fff", borderRadius: 6, height: 54, paddingHorizontal: 12 },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: "#1a73e8",
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  orText: { textAlign: "center", color: TEXT_MUTED, marginVertical: 18, fontSize: 16 },
  providerBtn: { height: 56, borderRadius: 6, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  appleBtn: { backgroundColor: BTN_DARK },
  googleBtn: { backgroundColor: BTN_BLACK },
  providerText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
