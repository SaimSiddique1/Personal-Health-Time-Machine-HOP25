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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  image: { width: 280, height: 180, borderRadius: 12, marginBottom: 30 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#444", textAlign: "center", marginBottom: 40 },
  button: { backgroundColor: "#34a853", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
