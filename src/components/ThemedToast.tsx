import React, { useMemo } from 'react';
import Toast, { BaseToast, type ToastConfig } from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';

export function ThemedToast() {
  const { colors } = useTheme();

  const toastConfig = useMemo<ToastConfig>(
    () => ({
      error: ({ text1, text2, onPress, text1Style, text2Style }) => (
        <BaseToast
          text1={text1}
          text2={text2}
          onPress={onPress}
          style={{
            borderLeftColor: colors.error,
            backgroundColor: colors.surfaceRaised,
            height: undefined,
            minHeight: 60,
          }}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          text1Style={[{ fontSize: 15, fontWeight: '600', color: colors.text }, text1Style]}
          text2Style={[{ fontSize: 13, color: colors.textSecondary }, text2Style]}
          text2NumberOfLines={6}
        />
      ),
    }),
    [colors],
  );

  return <Toast config={toastConfig} />;
}
