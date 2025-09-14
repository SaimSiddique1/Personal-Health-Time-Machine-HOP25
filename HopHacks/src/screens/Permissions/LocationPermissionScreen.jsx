// src/screens/Permissions/LocationPermissionScreen.jsx
import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const T = {
  bg: "#0f1117",
  text: "#EAF2FF",
  textDim: "#AAB6D3",
  stroke: "rgba(255,255,255,0.14)",
  cardBg: "rgba(255,255,255,0.06)", // solid “glass”
  grad: ["#34FFD1", "#5B8EFF", "#BC6FFF", "#FF7AC3"],
  darkText: "#0b0c10",
};

export default function LocationPermissionScreen({ navigation }) {
  // subtle float + tilt animation for the image
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, [t]);

  const rotateY = t.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "4deg"] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] });
  const shadow = t.interpolate({ inputRange: [0, 1], outputRange: [8, 14] });

  return (
    <SafeAreaView style={styles.safe}>
      {/* hero glow */}
      <LinearGradient colors={T.grad} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.hero} />

      <View style={styles.container}>
        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Share Your Location</Text>
          <Text style={styles.subtitle}>
            We use your location for weather, activity insights, and personalized recommendations.
          </Text>

          {/* 3D image block */}
          <Animated.View
            style={[
              styles.imageWrap,
              {
                transform: [{ perspective: 800 }, { rotateY }, { translateY }],
                shadowRadius: shadow,
              },
            ]}
          >
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1502920514313-52581002a659" }}
              style={styles.image}
            />
            {/* soft gloss highlight */}
            <LinearGradient
              colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.00)"]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.gloss}
            />
            {/* subtle border to crisp edges */}
            <View style={styles.edge} />
          </Animated.View>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("HealthPermission")}
          >
            <LinearGradient
              colors={T.grad}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.primaryBtnBg}
            >
              <Text style={styles.primaryBtnText}>Allow Location Access</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.note}>You can change this later in Settings.</Text>
        </View>
      </View>
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
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.stroke,
    backgroundColor: T.cardBg,
    padding: 18,
    alignItems: "center",
  },

  title: { fontSize: 22, fontWeight: "900", color: T.text, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, color: T.textDim, textAlign: "center", marginBottom: 16 },

  imageWrap: {
    width: 300,
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#0b0c10",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    marginBottom: 18,
  },
  image: { width: "100%", height: "100%" },
  gloss: { ...StyleSheet.absoluteFillObject },
  edge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  primaryBtn: { width: "100%", borderRadius: 12, overflow: "hidden", marginTop: 6 },
  primaryBtnBg: { height: 52, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: T.darkText, fontWeight: "900", fontSize: 16 },

  note: { color: T.textDim, fontSize: 12, marginTop: 10, textAlign: "center" },
});
