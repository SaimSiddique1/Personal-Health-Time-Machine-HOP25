import React from "react";
import { SafeAreaView, View, Text, Pressable, Image, StyleSheet } from "react-native";

export default function CalendarPermissionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1519681393784-d120267933ba" }}
          style={styles.image}
        />
        <Text style={styles.title}>Sync Your Calendar</Text>
        <Text style={styles.subtitle}>
          Connect Google Calendar so we can integrate your schedule and help plan your wellness.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.buttonText}>Allow Calendar Access</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  image: { width: 280, height: 180, borderRadius: 12, marginBottom: 30 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#444", textAlign: "center", marginBottom: 40 },
  button: { backgroundColor: "#fbbc05", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
