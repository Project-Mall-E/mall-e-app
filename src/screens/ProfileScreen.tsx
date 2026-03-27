// src/screens/ProfileScreen.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import ProfileSavedSection, { ProfileSavedContentTab } from '../components/ProfileSavedSection';

const MAX_USERNAME_LENGTH = 50;
const MAX_NAME_LENGTH = 100;

const PLACEHOLDER_AVATAR = require('../../assets/profile-placeholder.png');

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const [measuredPagerWidth, setMeasuredPagerWidth] = useState<number | null>(null);
  const pagerWidth = measuredPagerWidth ?? windowWidth;

  const [savedTab, setSavedTab] = useState<ProfileSavedContentTab>('favorites');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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

  const displayName = useMemo(
    () =>
      [firstName, lastName].filter(Boolean).join(' ') ||
      username ||
      (user?.email ? user.email.split('@')[0] : '—'),
    [firstName, lastName, username, user?.email],
  );

  const usernameLine = useMemo(() => {
    const u = username.trim();
    if (u.length > 0) return `@${u}`;
    return profile?.username?.trim() ? `@${profile.username.trim()}` : '@username';
  }, [username, profile?.username]);

  const avatarSource = useMemo(() => {
    const url = profile?.avatar_url?.trim();
    if (url) return { uri: url };
    return PLACEHOLDER_AVATAR;
  }, [profile?.avatar_url]);

  // Re-align page only when width changes (e.g. rotation). Tab changes use goToTab / swipe end.
  useEffect(() => {
    if (pagerWidth <= 0) return;
    pagerRef.current?.scrollTo({
      x: savedTab === 'favorites' ? 0 : pagerWidth,
      animated: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- savedTab omitted: taps/swipes should not re-trigger this snap
  }, [pagerWidth]);

  const goToTab = useCallback(
    (tab: ProfileSavedContentTab) => {
      setSavedTab(tab);
      if (pagerWidth > 0) {
        pagerRef.current?.scrollTo({
          x: tab === 'favorites' ? 0 : pagerWidth,
          animated: true,
        });
      }
    },
    [pagerWidth],
  );

  const onPagerScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pagerWidth <= 0) return;
      const x = e.nativeEvent.contentOffset.x;
      const page = Math.round(x / pagerWidth);
      setSavedTab(page <= 0 ? 'favorites' : 'lists');
    },
    [pagerWidth],
  );

  const openEditFromMenu = () => {
    setMenuOpen(false);
    setEditOpen(true);
    setError(null);
  };

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
    if (err) {
      const dup =
        err.code === '23505' ||
        err.message?.toLowerCase().includes('duplicate') ||
        err.message?.includes('profiles_username_unique');
      if (dup) {
        setError('That username is already taken. Try another.');
      } else {
        setError(err.message);
      }
      return;
    }
    await refreshProfile();
    setEditOpen(false);
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          setMenuOpen(false);
          signOut();
        },
      },
    ]);
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.topBar}>
        <View style={s.topBarSpacer} />
        <Pressable
          onPress={() => setMenuOpen(true)}
          style={s.iconButton}
          accessibilityLabel="Open profile menu"
        >
          <Ionicons name="menu" size={26} color={colors.text} />
        </Pressable>
      </View>

      <View style={s.identityBlock}>
        <Image
          source={avatarSource}
          style={s.avatar}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <Text style={s.displayName}>{displayName}</Text>
        <Text style={s.username}>{usernameLine}</Text>
      </View>

      <View style={s.subTabRow}>
        <Pressable
          onPress={() => goToTab('favorites')}
          style={[s.subTab, savedTab === 'favorites' && s.subTabActive]}
          accessibilityLabel="Favorites"
        >
          <Ionicons
            name={savedTab === 'favorites' ? 'heart' : 'heart-outline'}
            size={26}
            color={savedTab === 'favorites' ? colors.text : colors.textSecondary}
          />
        </Pressable>
        <Pressable
          onPress={() => goToTab('lists')}
          style={[s.subTab, savedTab === 'lists' && s.subTabActive]}
          accessibilityLabel="Lists"
        >
          <Ionicons
            name={savedTab === 'lists' ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color={savedTab === 'lists' ? colors.text : colors.textSecondary}
          />
        </Pressable>
      </View>

      <View
        style={s.contentArea}
        onLayout={e => setMeasuredPagerWidth(e.nativeEvent.layout.width)}
      >
        {pagerWidth > 0 ? (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            keyboardDismissMode="on-drag"
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            onMomentumScrollEnd={onPagerScrollEnd}
            style={s.pagerScroll}
          >
            <View style={{ width: pagerWidth, flex: 1 }}>
              <ProfileSavedSection contentTab="favorites" />
            </View>
            <View style={{ width: pagerWidth, flex: 1 }}>
              <ProfileSavedSection contentTab="lists" />
            </View>
          </ScrollView>
        ) : null}
      </View>

      <Modal
        visible={menuOpen}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setMenuOpen(false)}
      >
        <SafeAreaView style={[s.sheet, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: colors.text }]}>Account</Text>
            <Pressable onPress={() => setMenuOpen(false)} style={s.iconButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView contentInsetAdjustmentBehavior="automatic" style={s.sheetBody}>
            <Text style={[s.sheetLabel, { color: colors.textTertiary }]}>Email</Text>
            <Text style={[s.sheetValue, { color: colors.text }]}>{user?.email ?? '—'}</Text>
            <Pressable style={s.sheetAction} onPress={openEditFromMenu}>
              <Ionicons name="create-outline" size={22} color={colors.tabActive} />
              <Text style={[s.sheetActionText, { color: colors.tabActive }]}>Edit profile</Text>
            </Pressable>
            <Pressable style={s.sheetAction} onPress={confirmSignOut}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[s.sheetActionText, { color: colors.error }]}>Sign out</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={editOpen}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => !saving && setEditOpen(false)}
      >
        <SafeAreaView style={[s.sheet, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: colors.text }]}>Edit profile</Text>
            <Pressable onPress={() => !saving && setEditOpen(false)} style={s.iconButton} disabled={saving}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={s.editScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}
            <TextInput
              style={[s.input, { backgroundColor: colors.inputBg, color: colors.inputText }]}
              placeholder="Username"
              placeholderTextColor={colors.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!saving}
            />
            <TextInput
              style={[s.input, { backgroundColor: colors.inputBg, color: colors.inputText }]}
              placeholder="First name"
              placeholderTextColor={colors.textTertiary}
              value={firstName}
              onChangeText={setFirstName}
              editable={!saving}
            />
            <TextInput
              style={[s.input, { backgroundColor: colors.inputBg, color: colors.inputText }]}
              placeholder="Last name"
              placeholderTextColor={colors.textTertiary}
              value={lastName}
              onChangeText={setLastName}
              editable={!saving}
            />
            <Pressable
              style={[s.saveButton, saving && s.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.inverseText} />
              ) : (
                <Text style={s.saveButtonText}>Save</Text>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    topBarSpacer: { flex: 1 },
    iconButton: { padding: 8 },
    identityBlock: {
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 20,
      paddingHorizontal: 24,
      gap: 8,
    },
    avatar: {
      width: 112,
      height: 112,
      borderRadius: 56,
      borderCurve: 'continuous',
      backgroundColor: colors.surfaceRaised,
    },
    displayName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    username: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    subTabRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 48,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    subTab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
      marginBottom: -12,
    },
    subTabActive: {
      borderBottomColor: colors.text,
    },
    contentArea: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    pagerScroll: {
      flex: 1,
    },
    sheet: {
      flex: 1,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    sheetTitle: { fontSize: 20, fontWeight: '700' },
    sheetBody: { flex: 1, padding: 24 },
    sheetLabel: { fontSize: 13, marginBottom: 4 },
    sheetValue: { fontSize: 16, marginBottom: 24 },
    sheetAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 16,
    },
    sheetActionText: { fontSize: 17, fontWeight: '600' },
    editScrollContent: { padding: 24, gap: 16 },
    errorBox: {
      backgroundColor: colors.errorBg,
      padding: 12,
      borderRadius: 12,
    },
    errorText: { color: colors.error, fontSize: 14 },
    input: {
      padding: 16,
      borderRadius: 12,
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: colors.tabActive,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    saveButtonText: { color: colors.inverseText, fontSize: 17, fontWeight: '600' },
    buttonDisabled: { opacity: 0.6 },
  });
