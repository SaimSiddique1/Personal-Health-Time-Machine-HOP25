// src/screens/IntroScreen.jsx
import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

const T = {
  bg: "#0f1117",
  text: "#EAF2FF",
  textDim: "#AAB6D3",
  cardBg: "rgba(255,255,255,0.06)",
  cardStroke: "rgba(255,255,255,0.14)",
  chipBg: "rgba(255,255,255,0.08)",
  chipStroke: "rgba(255,255,255,0.16)",
  grad: ["#34FFD1", "#5B8EFF", "#BC6FFF", "#FF7AC3"],
};

function GradientButton({ title, onPress, style, icon }) {
  return (
    <Pressable onPress={onPress} style={[{ borderRadius: 16, overflow: "hidden" }, style]}>
      <LinearGradient
        colors={T.grad}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ paddingVertical: 14, paddingHorizontal: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
      >
        {icon ? <Ionicons name={icon} size={18} color="#0b0c10" /> : null}
        <Text style={{ color: "#0b0c10", fontWeight: "900", fontSize: 16 }}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function GhostButton({ title, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.ghostBtn, style]}>
      <Text style={{ color: T.text, fontWeight: "800" }}>{title}</Text>
    </Pressable>
  );
}

export default function IntroScreen({ navigation }) {
  // subtle float animation for the logo mark
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -6, duration: 1500, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [y]);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Hero gradient */}
      <LinearGradient colors={T.grad} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.hero} />

      <View style={styles.wrap}>
        {/* Logo / Mark */}
        <Animated.View style={[styles.markWrap, { transform: [{ translateY: y }] }]}>
          <View style={styles.orbit} />
          <View style={styles.markCard}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: T.cardBg, borderRadius: 28 }]} />
            <Ionicons name="heart-circle" size={64} color="#EAF2FF" />
          </View>
        </Animated.View>

        {/* Title + Tagline */}
        <View style={styles.titleBlock}>
          <Text style={styles.appName}>Personal Health{"\n"}Time-Machine</Text>
          <Text style={styles.tagline}>
            Turn your digital exhaust into insights you can scrub through time.
          </Text>
        </View>

        {/* Feature chips */}
        <View style={styles.chipsRow}>
          {[
            { icon: "flash-outline", text: "Actionable insights" },
            { icon: "shield-checkmark-outline", text: "Privacy-first" },
            { icon: "watch-outline", text: "Wearables-ready" },
          ].map((c) => (
            <View key={c.text} style={styles.chip}>
              <Ionicons name={c.icon} size={14} color={T.text} />
              <Text style={styles.chipText}>{c.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={{ gap: 10, marginTop: 14 }}>
          <GradientButton
            title="Get Started"
            icon="arrow-forward"
            onPress={() => navigation?.replace?.("Login") || navigation?.navigate?.("Login")}
          />
          <GhostButton title="Continue as Guest" onPress={() => navigation?.replace?.("Dashboard")} />
        </View>

        {/* Mini disclaimer */}
        <Text style={styles.disclaimer}>Not medical advice. For informational purposes only.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: "absolute",
    top: -140,
    left: -80,
    right: -80,
    height: 320,
    transform: [{ rotate: "-6deg" }],
    opacity: 0.20,
  },
  wrap: { flex: 1, padding: 20, paddingTop: 80, alignItems: "center" },

  markWrap: { marginBottom: 18, alignItems: "center", justifyContent: "center" },
  orbit: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(91,142,255,0.10)",
  },
  markCard: {
    width: 120,
    height: 120,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: T.cardStroke,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  titleBlock: { alignItems: "center", marginBottom: 8 },
  appName: { color: T.text, fontWeight: "900", fontSize: 28, textAlign: "center", lineHeight: 32 },
  tagline: { color: T.textDim, marginTop: 8, textAlign: "center" },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14, justifyContent: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.chipStroke,
    backgroundColor: T.chipBg,
  },
  chipText: { color: T.text, fontSize: 13, fontWeight: "700" },

  ghostBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.cardStroke,
    backgroundColor: T.cardBg,
  },

  disclaimer: { color: T.textDim, fontSize: 12, marginTop: 14, textAlign: "center" },
});
