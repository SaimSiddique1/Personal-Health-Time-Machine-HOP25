import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LocationPermissionScreen from "./src/screens/Permissions/LocationPermissionScreen";
import HealthPermissionScreen from "./src/screens/Permissions/HealthPermissionScreen";
import CalendarPermissionScreen from "./src/screens/Permissions/CalendarPermissionScreen";
import DashboardScreen from "./src/screens/DashboardScreen"; // already exists

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LocationPermission" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
        <Stack.Screen name="HealthPermission" component={HealthPermissionScreen} />
        <Stack.Screen name="CalendarPermission" component={CalendarPermissionScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
