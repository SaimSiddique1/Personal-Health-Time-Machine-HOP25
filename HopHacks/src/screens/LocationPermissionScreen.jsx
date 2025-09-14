import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

const LocationPermissionScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        console.log('Foreground permission status:', foregroundStatus);
        if (foregroundStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to use this app.');
          return;
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        console.log('Background permission status:', backgroundStatus);
        if (backgroundStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Background location permission is required for tracking.');
          return;
        }

        setHasPermission(true);
        console.log('Permissions granted, starting background location task...');
        startBackgroundLocationTask();
      } catch (error) {
        console.error('Error requesting location permissions:', error);
        Alert.alert('Error', 'An error occurred while requesting location permissions.');
      }
    };

    requestPermissions();
  }, []);

  const startBackgroundLocationTask = async () => {
    try {
      const isTaskDefined = await Location.hasStartedLocationUpdatesAsync('background-location-task');
      console.log('Is background location task defined:', isTaskDefined);
      if (!isTaskDefined) {
        await Location.startLocationUpdatesAsync('background-location-task', {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 50, // 50 meters
          showsBackgroundLocationIndicator: true,
        });
        console.log('Background location task started successfully.');
      }
    } catch (error) {
      console.error('Error starting background location task:', error);
      Alert.alert('Error', 'An error occurred while starting background location tracking.');
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      if (!hasPermission) return;

      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Error fetching location');
      }
    };

    getLocation();
  }, [hasPermission]);

  const handleContinue = () => {
    if (hasPermission) {
      navigation.navigate('Dashboard'); // Navigate to the main dashboard or next screen
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {errorMsg ? errorMsg : location ? JSON.stringify(location) : 'Requesting Location Permissions...'}
      </Text>
      {hasPermission && <Button title="Continue" onPress={handleContinue} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default LocationPermissionScreen;