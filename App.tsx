// App.tsx
import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Suppress Legacy Architecture deprecation warning until we can use New Arch
// (react-native-screens has native build issues with New Arch on Android with RN 0.81).
LogBox.ignoreLogs([
  'The app is running using the Legacy Architecture',
]);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}