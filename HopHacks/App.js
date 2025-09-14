// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

import LocationPermissionScreen from "./src/screens/Permissions/LocationPermissionScreen";
import HealthPermissionScreen from "./src/screens/Permissions/HealthPermissionScreen";
import CalendarPermissionScreen from "./src/screens/Permissions/CalendarPermissionScreen";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import IntroScreen from "./src/screens/IntroScreen"; // ✅ only once

export const LOCATION_TASK = "background-location-task";

// Define BG task once at module scope
TaskManager.defineTask(LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error("Error in background location task:", error);
    return;
  }
  const { locations } = data || {};
  if (locations) {
    console.log("Got location in BG:", locations);
  }
});

// Start updates if not already running
(async () => {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 50,
        showsBackgroundLocationIndicator: true,
        // foregroundService is recommended on Android:
        foregroundService: {
          notificationTitle: "Location tracking",
          notificationBody: "Tracking your location in the background.",
        },
      });
    }
  } catch (e) {
    console.warn("Failed to start background location:", e?.message || e);
  }
})();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IntroScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="IntroScreen" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
        <Stack.Screen name="HealthPermission" component={HealthPermissionScreen} />
        <Stack.Screen name="CalendarPermission" component={CalendarPermissionScreen} />
        <Stack.Screen name="Dashboard" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
