import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LocationPermissionScreen from "./src/screens/Permissions/LocationPermissionScreen";
import HealthPermissionScreen from "./src/screens/Permissions/HealthPermissionScreen";
import CalendarPermissionScreen from "./src/screens/Permissions/CalendarPermissionScreen";
<<<<<<< Updated upstream
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
=======
import BottomTabNavigator from "./src/navigation/BottomTabNavigator"; // already exists
>>>>>>> Stashed changes

const Stack = createNativeStackNavigator();

import React from "react";
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

export const LOCATION_TASK = 'background-location-task';

// Define the background location task
TaskManager.defineTask(LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Error in background location task:', error);
    return;
  }
  const { locations } = data;
  console.log('Got location in BG:', locations);
  // TODO: Send locations to a server or persist locally
});

// Ensure the app starts the background task if not already running
(async () => {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // 10 seconds
      distanceInterval: 50, // 50 meters
      showsBackgroundLocationIndicator: true,
    });
  }
})();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LocationPermission" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
        <Stack.Screen name="HealthPermission" component={HealthPermissionScreen} />
        <Stack.Screen name="CalendarPermission" component={CalendarPermissionScreen} />
        <Stack.Screen name="Dashboard" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}




