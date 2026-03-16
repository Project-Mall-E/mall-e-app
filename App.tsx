// App.tsx
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import RootNavigator from './src/navigation/RootNavigator';
import { setSessionFromUrl } from './src/lib/authRedirect';
import { ThemeProvider } from './src/context/ThemeContext';

const AUTH_SCHEME = 'com.celestialdragonfly.malle';

function useAuthDeepLink() {
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      if (event.url.startsWith(`${AUTH_SCHEME}:`)) {
        setSessionFromUrl(event.url);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(url => {
      if (url?.startsWith(`${AUTH_SCHEME}:`)) {
        setSessionFromUrl(url);
      }
    });
    return () => subscription.remove();
  }, []);
}

export default function App() {
  useAuthDeepLink();

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}