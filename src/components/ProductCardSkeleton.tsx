import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1.2;

export const ProductCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const blockBg = colors.border;

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceRaised }]}>
      <Animated.View style={{ opacity }}>
        <View style={[styles.imagePlaceholder, { backgroundColor: blockBg }]} />
        <View style={styles.info}>
          <View style={[styles.lineShort, { backgroundColor: blockBg }]} />
          <View style={[styles.lineLong, { backgroundColor: blockBg }]} />
          <View style={[styles.lineLong, { backgroundColor: blockBg }]} />
          <View style={[styles.priceLine, { backgroundColor: blockBg }]} />
          <View style={styles.tagsRow}>
            <View style={[styles.tagPill, { backgroundColor: blockBg }]} />
            <View style={[styles.tagPill, { backgroundColor: blockBg }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderCurve: 'continuous',
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
  },
  imagePlaceholder: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderCurve: 'continuous',
  },
  info: {
    padding: 12,
    gap: 8,
  },
  lineShort: {
    height: 10,
    width: '40%',
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  lineLong: {
    height: 12,
    width: '100%',
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  priceLine: {
    height: 16,
    width: '35%',
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tagPill: {
    height: 22,
    width: 56,
    borderRadius: 6,
    borderCurve: 'continuous',
  },
});

export default ProductCardSkeleton;
