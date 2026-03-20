import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { AuthStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const MIN_PASSWORD_LENGTH = 6;

export default function SignInScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setLoading(true);
    const { error: err } = await signIn(trimmedEmail, password);
    setLoading(false);
    if (err) {
      setError(err.message ?? 'Sign in failed.');
      return;
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.keyboardView}
      >
        <View style={s.content}>
          <Text style={s.title}>Sign in</Text>
          <Text style={s.subtitle}>Welcome back to Mall-E</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <Pressable
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.inverseText} />
            ) : (
              <Text style={s.buttonText}>Sign in</Text>
            )}
          </Pressable>

          <Pressable
            style={s.linkButton}
            onPress={() => navigation.navigate('SignUp')}
            disabled={loading}
          >
            <Text style={s.linkText}>
              Don&apos;t have an account? <Text style={s.linkTextBold}>Sign up</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 24,
      gap: 16,
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    errorBox: {
      backgroundColor: colors.errorBg,
      padding: 12,
      borderRadius: 12,
      borderCurve: 'continuous',
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
    },
    input: {
      backgroundColor: colors.inputBg,
      padding: 16,
      borderRadius: 12,
      borderCurve: 'continuous',
      fontSize: 16,
      color: colors.inputText,
    },
    button: {
      backgroundColor: colors.tabActive,
      padding: 16,
      borderRadius: 12,
      borderCurve: 'continuous',
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.inverseText,
      fontSize: 17,
      fontWeight: '600',
    },
    linkButton: {
      alignItems: 'center',
      padding: 12,
    },
    linkText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
    linkTextBold: {
      color: colors.tabActive,
      fontWeight: '600',
    },
  });
