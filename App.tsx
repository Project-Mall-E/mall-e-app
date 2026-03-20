// App.tsx
import { useEffect, useMemo } from 'react';
import { Linking } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import RootNavigator from './src/navigation/RootNavigator';
import { setSessionFromUrl } from './src/lib/authRedirect';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

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

function ThemedNavigation() {
  const { dark, colors } = useTheme();
  const navigationTheme = useMemo((): NavigationTheme => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.tabActive,
        background: colors.background,
        card: colors.surfaceRaised,
        text: colors.text,
        border: colors.border,
        notification: colors.tabActive,
      },
    };
  }, [dark, colors]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  useAuthDeepLink();

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <ThemedNavigation />
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
