// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

const MAX_USERNAME_LENGTH = 50;
const MAX_NAME_LENGTH = 100;

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { colors } = useTheme();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsername(profile?.username ?? '');
    setFirstName(profile?.first_name ?? '');
    setLastName(profile?.last_name ?? '');
  }, [profile?.username, profile?.first_name, profile?.last_name]);

  const displayName =
    [firstName, lastName].filter(Boolean).join(' ') || username || (user?.email ?? '—');

  const handleSave = async () => {
    if (!user?.id) return;
    setError(null);
    if (username.length > MAX_USERNAME_LENGTH) {
      setError(`Username must be ${MAX_USERNAME_LENGTH} characters or less.`);
      return;
    }
    if (firstName.length > MAX_NAME_LENGTH || lastName.length > MAX_NAME_LENGTH) {
      setError('Names must be 100 characters or less.');
      return;
    }
    setSaving(true);
    const { error: err } = await supabase
      .from('profiles')
      .update({
        username: username.trim() || null,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    await refreshProfile();
    setEditing(false);
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.content}>
        <Text style={s.title}>Profile</Text>
        <Text style={s.email}>{user?.email ?? '—'}</Text>
        <Text style={s.displayLabel}>Display name</Text>
        <Text style={s.displayName}>{displayName}</Text>

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {editing ? (
          <>
            <TextInput
              style={s.input}
              placeholder="Username"
              placeholderTextColor={colors.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!saving}
            />
            <TextInput
              style={s.input}
              placeholder="First name"
              placeholderTextColor={colors.textTertiary}
              value={firstName}
              onChangeText={setFirstName}
              editable={!saving}
            />
            <TextInput
              style={s.input}
              placeholder="Last name"
              placeholderTextColor={colors.textTertiary}
              value={lastName}
              onChangeText={setLastName}
              editable={!saving}
            />
            <Pressable
              style={[s.button, saving && s.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color={colors.inverseText} /> : <Text style={s.buttonText}>Save</Text>}
            </Pressable>
            <Pressable style={s.secondaryButton} onPress={() => setEditing(false)} disabled={saving}>
              <Text style={s.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={s.button} onPress={() => setEditing(true)}>
            <Text style={s.buttonText}>Edit profile</Text>
          </Pressable>
        )}

        <Pressable style={s.signOutButton} onPress={() => signOut()}>
          <Text style={s.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 24,
      gap: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    email: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    displayLabel: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 8,
    },
    displayName: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '500',
    },
    errorBox: {
      backgroundColor: colors.errorBg,
      padding: 12,
      borderRadius: 12,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
    },
    input: {
      backgroundColor: colors.inputBg,
      padding: 16,
      borderRadius: 12,
      fontSize: 16,
      color: colors.inputText,
    },
    button: {
      backgroundColor: colors.tabActive,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: colors.inverseText, fontSize: 17, fontWeight: '600' },
    secondaryButton: { padding: 16, alignItems: 'center' },
    secondaryButtonText: { color: colors.tabActive, fontSize: 17 },
    signOutButton: {
      marginTop: 'auto',
      padding: 16,
      alignItems: 'center',
    },
    signOutText: {
      color: colors.error,
      fontSize: 17,
      fontWeight: '600',
    },
  });