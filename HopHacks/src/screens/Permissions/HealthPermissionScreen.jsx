import React from "react";
import { SafeAreaView, View, Text, Pressable, Image, StyleSheet } from "react-native";

export default function HealthPermissionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1554284126-aa88f22d8b74" }}
          style={styles.image}
        />
        <Text style={styles.title}>Connect to Health Data</Text>
        <Text style={styles.subtitle}>
          Sync with Apple Health or Google Fit to track your activity, heart rate, and more.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("CalendarPermission")}
        >
          <Text style={styles.buttonText}>Allow Health Access</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const BG_BEIGE = "#E8DED3";
const CARD_WHITE = "#FFFFFF";
const BTN_DARK = "#1976F3";
const TEXT_PRIMARY = "#111";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_BEIGE },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: CARD_WHITE, borderRadius: 24, shadowColor: BG_BEIGE, shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  image: { width: 280, height: 180, borderRadius: 12, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 10, color: TEXT_PRIMARY },
  subtitle: { fontSize: 15, color: TEXT_PRIMARY, textAlign: "center", marginBottom: 40 },
  button: { backgroundColor: BTN_DARK, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10 },
  buttonText: { color: CARD_WHITE, fontSize: 16, fontWeight: "700" },
});
