import React, { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  PRODUCT_CARD_IMAGE,
  PRODUCT_CARD_TEXT,
} from './productCardLayout';

const titleBlockHeight =
  PRODUCT_CARD_TEXT.titleLineHeight * PRODUCT_CARD_TEXT.titleMaxLines;

export const ProductCardSkeleton = memo(function ProductCardSkeleton() {
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
    <View style={styles.card}>
      <Animated.View style={{ opacity }}>
        <View style={[styles.imagePlaceholder, { backgroundColor: blockBg }]} />
        <View style={styles.info}>
          <View style={[styles.storeLine, { backgroundColor: blockBg }]} />
          <View style={[styles.titleBlock, { backgroundColor: blockBg }]} />
          <View style={[styles.priceLine, { backgroundColor: blockBg }]} />
          <View style={styles.tagsRow}>
            <View style={[styles.tagPill, { backgroundColor: blockBg }]} />
            <View style={[styles.tagPill, { backgroundColor: blockBg }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: PRODUCT_CARD_TEXT.cardMarginBottom,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 5 / 6,
    borderRadius: PRODUCT_CARD_IMAGE.borderRadius,
    borderCurve: 'continuous',
  },
  info: {
    paddingTop: PRODUCT_CARD_TEXT.infoPaddingTop,
  },
  storeLine: {
    height: PRODUCT_CARD_TEXT.storeLineHeight,
    width: '45%',
    borderRadius: 4,
    borderCurve: 'continuous',
    marginBottom: PRODUCT_CARD_TEXT.storeMarginBottom,
  },
  titleBlock: {
    height: titleBlockHeight,
    width: '100%',
    borderRadius: 4,
    borderCurve: 'continuous',
    marginBottom: PRODUCT_CARD_TEXT.titleMarginBottom,
  },
  priceLine: {
    height: PRODUCT_CARD_TEXT.priceLineHeight,
    width: '35%',
    borderRadius: 4,
    borderCurve: 'continuous',
    marginBottom: PRODUCT_CARD_TEXT.priceMarginBottom,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    height: PRODUCT_CARD_TEXT.tagsRowHeight,
    alignItems: 'center',
  },
  tagPill: {
    height: 24,
    width: 64,
    borderRadius: 999,
    borderCurve: 'continuous',
  },
});

export default ProductCardSkeleton;
