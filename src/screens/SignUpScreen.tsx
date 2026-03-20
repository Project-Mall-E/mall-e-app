import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
const MAX_USERNAME_LENGTH = 50;
const MAX_NAME_LENGTH = 100;

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (username.length > MAX_USERNAME_LENGTH) {
      setError(`Username must be ${MAX_USERNAME_LENGTH} characters or less.`);
      return;
    }
    if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
      setError('First and last name must be 100 characters or less.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp({
      email: trimmedEmail,
      password,
      username: username.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? 'Sign up failed.');
      return;
    }
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.content}>
          <Text style={s.title}>Check your email</Text>
          <Text style={s.subtitle}>
            We sent a confirmation link to {email.trim()}. Open the link to activate your account, then return here to sign in.
          </Text>
          <Pressable style={s.button} onPress={() => navigation.navigate('SignIn')}>
            <Text style={s.buttonText}>Back to Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.keyboardView}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Sign up with email and a few details</Text>

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
            placeholder="Password (min 6 characters)"
            placeholderTextColor={colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          <TextInput
            style={s.input}
            placeholder="Username"
            placeholderTextColor={colors.textTertiary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            style={s.input}
            placeholder="First name"
            placeholderTextColor={colors.textTertiary}
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
          />
          <TextInput
            style={s.input}
            placeholder="Last name"
            placeholderTextColor={colors.textTertiary}
            value={lastName}
            onChangeText={setLastName}
            editable={!loading}
          />

          <Pressable
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.inverseText} />
            ) : (
              <Text style={s.buttonText}>Sign up</Text>
            )}
          </Pressable>

          <Pressable
            style={s.linkButton}
            onPress={() => navigation.navigate('SignIn')}
            disabled={loading}
          >
            <Text style={s.linkText}>
              Already have an account? <Text style={s.linkTextBold}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
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
    scrollContent: {
      padding: 24,
      gap: 16,
      paddingBottom: 48,
    },
    content: {
      padding: 24,
      gap: 16,
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
