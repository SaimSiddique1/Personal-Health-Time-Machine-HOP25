// src/navigation/BottomTabNavigator.jsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import DashboardScreen from "../screens/DashboardScreen";
import TimeMachineScreen from "../screens/TimeMachineScreen";

const Tab = createBottomTabNavigator();

const T = {
  barBg: "rgba(255,255,255,0.06)",   // solid translucent “glass”
  stroke: "rgba(255,255,255,0.14)",
  text: "#EAF2FF",
  activeText: "#0b0c10",
};

function IconWithBounce({ name, focused, color, size }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  }, [focused]);

  return (
    <View style={{ alignItems: "center" }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.activeText,
        tabBarInactiveTintColor: T.text,
        tabBarLabelStyle: styles.labelText, // moved up
        tabBarStyle: {
          backgroundColor: T.barBg,
          borderTopColor: T.stroke,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          position: "absolute",
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <IconWithBounce
              name={focused ? "speedometer" : "speedometer-outline"}
              focused={focused}
              color={focused ? T.activeText : T.text}
              size={22}
            />
          ),
          tabBarLabel: "Dashboard",
        }}
      />
      <Tab.Screen
        name="Time Machine"
        component={TimeMachineScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <IconWithBounce
              name={focused ? "time" : "time-outline"}
              focused={focused}
              color={focused ? T.activeText : T.text}
              size={22}
            />
          ),
          tabBarLabel: "Time Machine",
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 12,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#fff",
    opacity: 0.9,
    marginTop: 5,
  },
  // Move label closer to the icon (upwards)
  labelText: {
    fontWeight: "800",
    fontSize: 11,
    marginTop: -2,     // <- nudges text up
  },
});
