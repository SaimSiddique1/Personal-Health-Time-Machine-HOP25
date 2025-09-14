import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const BG_BEIGE = "#E8DED3"; // soft beige background
const CARD_WHITE = "#FFFFFF"; // pure white card
const TRACK_GRAY = "#EAEAEA"; // light gray tabs
const TAB_ACTIVE = "#F5F5F5"; // slightly darker tab
const INPUT_DARK = "#333333"; // dark gray input
const BTN_DARK = "#1976F3"; // blue primary button
const BTN_BLACK = "#222"; // black for Google
const TEXT_PRIMARY = "#111"; // black text
const TEXT_MUTED = "#888"; // muted gray text

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_BEIGE },
  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 48, paddingBottom: 32, alignItems: "center" },
  card: {
    width: "100%",
    backgroundColor: CARD_WHITE,
    borderRadius: 24,
    padding: 24,
    paddingTop: 22,
    shadowColor: BG_BEIGE,
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 0,
  },
  tabsTrack: {
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: TRACK_GRAY,
    borderRadius: 18,
    padding: 8,
    marginBottom: 22,
    width: "90%",
  },
  tab: { flex: 1, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  tabLeft: { marginRight: 8 },
  tabRight: { marginLeft: 8 },
  tabActive: { backgroundColor: TAB_ACTIVE },
  tabInactive: { backgroundColor: TRACK_GRAY },
  tabText: { fontSize: 18, fontWeight: "700" },
  tabTextActive: { color: TEXT_PRIMARY },
  tabTextInactive: { color: TEXT_MUTED },
  form: { marginTop: 8 },
  label: { fontSize: 17, fontWeight: "700", color: TEXT_PRIMARY, marginBottom: 8 },
  input: { backgroundColor: INPUT_DARK, color: TEXT_MUTED, borderRadius: 8, height: 56, paddingHorizontal: 16, fontSize: 16, borderWidth: 0 },
  primaryBtn: {
    marginTop: 22,
    backgroundColor: BTN_DARK,
    borderRadius: 10,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BTN_DARK,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 18 },
  orText: { textAlign: "center", color: TEXT_MUTED, marginVertical: 22, fontSize: 17 },
  providerBtn: { height: 56, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 18, backgroundColor: INPUT_DARK },
  appleBtn: { backgroundColor: INPUT_DARK },
  googleBtn: { backgroundColor: BTN_BLACK },
  providerText: { color: "#FFF", fontSize: 19, fontWeight: "700" },
});

export default function LoginScreen() {
  const nav = useNavigation();
  const [mode, setMode] = useState("signIn"); // "signIn" | "signUp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const CRED_KEY = 'user_credentials';


  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Email and password required.");
      return;
    }
    try {
      // Save credentials as JSON
      await AsyncStorage.setItem(CRED_KEY, JSON.stringify({ email, password }));
      const saved = await AsyncStorage.getItem(CRED_KEY);
      console.log('Saved credentials:', saved);
      setError("Account created! Please sign in with your new credentials.");
      setMode("signIn");
      setEmail("");
      setPassword("");
    } catch (e) {
      setError("Failed to save credentials.");
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Email and password required.");
      return;
    }
    try {
      const credStr = await AsyncStorage.getItem(CRED_KEY);
      console.log('Loaded credentials:', credStr);
      console.log('Entered credentials:', { email, password });
      if (!credStr) {
        setError("No account found. Please sign up first.");
        return;
      }
      const creds = JSON.parse(credStr);
      if (creds.email === email && creds.password === password) {
        setError("");
  nav.replace("LocationPermission");
      } else {
        setError("Incorrect email or password. Please sign up first or check your credentials.");
      }
    } catch (e) {
      setError("Failed to sign in.");
    }
  };

  const onPrimary = () => {
<<<<<<< Updated upstream
    // TODO: wire to real auth
    console.log(mode === "signIn" ? "Sign In" : "Sign Up", { email, password });
    // Navigate to LocationPermission after "auth"
    if (mode === "signUp") {
      nav.replace("LocationPermission");
    } else {
      nav.replace("Survey");
=======
    if (mode === "signIn") {
      handleSignIn();
    } else {
      handleSignUp();
>>>>>>> Stashed changes
    }
  };

  const onApple = () => console.log("Continue with Apple");
  const onGoogle = () => console.log("Continue with Google");

  // Helper to switch modes and clear fields
  const switchMode = (newMode) => {
    setMode(newMode);
    setEmail("");
    setPassword("");
    setError("");
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
                onPress={() => switchMode("signIn")}
                style={[styles.tab, styles.tabLeft, mode === "signIn" ? styles.tabActive : styles.tabInactive]}
              >
                <Text style={[styles.tabText, mode === "signIn" ? styles.tabTextActive : styles.tabTextInactive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => switchMode("signUp")}
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

              {error ? (
                <Text style={{ color: 'red', marginTop: 8, marginBottom: 4 }}>{error}</Text>
              ) : null}

              <Pressable onPress={onPrimary} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>{mode === "signIn" ? "Sign In" : "Create Account"}</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <Text style={styles.orText}>Or Continue With</Text>

            {/* Providers */}
            <Pressable onPress={onApple} style={[styles.providerBtn, styles.appleBtn]}>
              <Text style={styles.providerText}>Apple</Text>
            </Pressable>
            <Pressable onPress={onGoogle} style={[styles.providerBtn, styles.googleBtn]}>
              <Text style={styles.providerText}>Google</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Remove any duplicate imports or code below this line