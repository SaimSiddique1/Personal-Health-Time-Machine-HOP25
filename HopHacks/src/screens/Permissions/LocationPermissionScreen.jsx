import React from "react";
import { SafeAreaView, View, Text, Pressable, Image, StyleSheet } from "react-native";

export default function LocationPermissionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1502920514313-52581002a659" }}
          style={styles.image}
        />
        <Text style={styles.title}>Share Your Location</Text>
        <Text style={styles.subtitle}>
          We use your location for weather, activity insights, and personalized recommendations.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("HealthPermission")}
        >
          <Text style={styles.buttonText}>Allow Location Access</Text>
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
  button: { backgroundColor: "#1a73e8", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
