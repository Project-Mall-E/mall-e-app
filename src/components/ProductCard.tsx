import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import {
  getProductCardWidth,
  PRODUCT_CARD_IMAGE,
  PRODUCT_CARD_TEXT,
} from './productCardLayout';

/** Platform-typical long-press delay (matches RN `Pressable` default; ~400–500ms is common on iOS/Android). */
const LONG_PRESS_REMOVE_MS = 500;

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onTagPress?: (tag: string) => void;
  /** Grid column count; width is `(screenWidth - 48) / numColumns` to match ProductGrid padding and gaps. */
  numColumns?: 2 | 3;
  /** Image-only tile: no heart, store line, title, price, or tags (e.g. profile favorites grid). */
  variant?: 'default' | 'imageOnly';
  /** With `imageOnly` + `onFavoriteRemoveEditModeChange`, long-press enters edit mode (all tiles show remove). */
  favoriteRemoveEditMode?: boolean;
  onFavoriteRemoveEditModeChange?: (editing: boolean) => void;
}

const brandFontFamily = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

const titleBlockHeight =
  PRODUCT_CARD_TEXT.titleLineHeight * PRODUCT_CARD_TEXT.titleMaxLines;

const PRESSED_CARD_STYLE = { opacity: 0.7 } as const;

const ProductCard = memo(function ProductCard({
  product,
  onPress,
  onTagPress,
  numColumns = 2,
  variant = 'default',
  favoriteRemoveEditMode = false,
  onFavoriteRemoveEditModeChange,
}: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useUser();
  const { colors, dark } = useTheme();
  const favorite = isFavorite(product);
  const cardWidth = getProductCardWidth(numColumns);
  const s = makeStyles(colors, dark, cardWidth, variant);

  const cardStyle = useCallback(
    ({ pressed }: { pressed: boolean }) =>
      [s.card, pressed ? PRESSED_CARD_STYLE : null],
    [s.card],
  );

  const handleCardPress = useCallback(() => {
    onPress(product);
  }, [onPress, product]);

  const handleFavoritePress = useCallback(() => {
    toggleFavorite(product);
  }, [toggleFavorite, product]);

  const handleImageOnlyPress = useCallback(() => {
    if (!favoriteRemoveEditMode) {
      onPress(product);
    }
  }, [favoriteRemoveEditMode, onPress, product]);

  const handleImageOnlyLongPress = useCallback(() => {
    onFavoriteRemoveEditModeChange?.(true);
  }, [onFavoriteRemoveEditModeChange]);

  if (variant === 'imageOnly') {
    const longPressEntersEdit = Boolean(onFavoriteRemoveEditModeChange);
    const showRemoveChrome = favoriteRemoveEditMode;

    return (
      <Pressable
        style={cardStyle}
        delayLongPress={LONG_PRESS_REMOVE_MS}
        onLongPress={
          longPressEntersEdit && !favoriteRemoveEditMode
            ? handleImageOnlyLongPress
            : undefined
        }
        onPress={handleImageOnlyPress}
      >
        <Image
          source={{ uri: product.item_image_link }}
          style={s.imageOnlyImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        {showRemoveChrome ? (
          <Pressable
            accessibilityLabel="Remove from favorites"
            style={s.removeFavoriteButton}
            onPress={() => toggleFavorite(product)}
          >
            <Ionicons name="remove-circle-outline" size={26} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={cardStyle}
      onPress={handleCardPress}
    >
      <View style={s.imageContainer}>
        <Image
          source={{ uri: product.item_image_link }}
          style={s.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <Pressable
          style={s.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={favorite ? colors.error : colors.inverseText}
          />
        </Pressable>
      </View>
      <View style={s.info}>
        <Text style={s.storeName} numberOfLines={1}>
          {product.store}
        </Text>
        <Text style={s.itemName} numberOfLines={2}>
          {product.item_name}
        </Text>
        <Text style={s.price}>{product.price}</Text>
        <View style={s.tagsContainer}>
          {product.tags.slice(0, 2).map(tag => (
            <Pressable
              key={tag}
              style={s.tag}
              onPress={() => onTagPress?.(tag)}
            >
              <Text style={s.tagText} numberOfLines={1}>
                {tag}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Pressable>
  );
});

const makeStyles = (
  colors: ReturnType<typeof useTheme>['colors'],
  dark: boolean,
  cardWidth: number,
  variant: 'default' | 'imageOnly',
) =>
  StyleSheet.create({
    card: {
      width: variant === 'imageOnly' ? cardWidth : '100%',
      backgroundColor: variant === 'imageOnly' ? colors.surfaceRaised : 'transparent',
      borderRadius: variant === 'imageOnly' ? 8 : 0,
      borderCurve: 'continuous',
      marginBottom:
        variant === 'imageOnly' ? 8 : PRODUCT_CARD_TEXT.cardMarginBottom,
      overflow: variant === 'imageOnly' ? 'hidden' : 'visible',
      boxShadow: variant === 'imageOnly' ? '0 1px 2px rgba(0, 0, 0, 0.06)' : undefined,
    },
    imageOnlyImage: {
      width: '100%',
      aspectRatio: 1,
    },
    removeFavoriteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 36,
      height: 36,
      borderRadius: 18,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      aspectRatio: 5 / 6,
      borderRadius: PRODUCT_CARD_IMAGE.borderRadius,
      borderCurve: 'continuous',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    favoriteButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(80, 80, 80, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    info: {
      paddingTop: PRODUCT_CARD_TEXT.infoPaddingTop,
    },
    storeName: {
      fontFamily: brandFontFamily,
      fontSize: 12,
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      lineHeight: PRODUCT_CARD_TEXT.storeLineHeight,
      height: PRODUCT_CARD_TEXT.storeLineHeight,
      marginBottom: PRODUCT_CARD_TEXT.storeMarginBottom,
      includeFontPadding: false,
    },
    itemName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: PRODUCT_CARD_TEXT.titleMarginBottom,
      lineHeight: PRODUCT_CARD_TEXT.titleLineHeight,
      height: titleBlockHeight,
      includeFontPadding: false,
    },
    price: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      lineHeight: PRODUCT_CARD_TEXT.priceLineHeight,
      height: PRODUCT_CARD_TEXT.priceLineHeight,
      marginBottom: PRODUCT_CARD_TEXT.priceMarginBottom,
      includeFontPadding: false,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
      gap: 6,
      height: PRODUCT_CARD_TEXT.tagsRowHeight,
      overflow: 'hidden',
    },
    tag: {
      backgroundColor: dark ? '#2A2A2A' : colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderCurve: 'continuous',
      flexShrink: 1,
      maxWidth: (cardWidth - 6) / 2,
    },
    tagText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.text,
    },
  });

export default ProductCard;
