import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { Image } from 'expo-image';
import { Product } from '../types';
import { useTheme } from '../context/ThemeContext';

const THUMB_HEIGHT = 200;
const THUMB_WIDTH = Math.round(THUMB_HEIGHT * 0.65);

type DiscoverySectionProps = {
  title: string;
  eyebrow?: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  emptyMessage?: string;
};

const ThumbItem = memo(function ThumbItem({
  product,
  onPress,
}: {
  product: Product;
  onPress: (p: Product) => void;
}) {
  const { colors } = useTheme();
  const handlePress = useCallback(() => {
    onPress(product);
  }, [onPress, product]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.thumbWrap, { backgroundColor: colors.surfaceRaised }]}
      accessibilityRole="button"
      accessibilityLabel={product.item_name}
    >
      <Image
        source={{ uri: product.item_image_link }}
        style={styles.thumbImage}
        contentFit="cover"
        transition={120}
      />
    </Pressable>
  );
});

const DiscoverySection = memo(function DiscoverySection({
  title,
  eyebrow,
  products,
  onProductPress,
  emptyMessage,
}: DiscoverySectionProps) {
  const { colors } = useTheme();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <ThumbItem product={item} onPress={onProductPress} />
    ),
    [onProductPress]
  );

  const keyExtractor = useCallback(
    (item: Product, index: number) => `${item.item_link}-${index}`,
    []
  );

  return (
    <View style={styles.section}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { color: colors.textTertiary }]}>{eyebrow}</Text>
      ) : null}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {products.length === 0 ? (
        emptyMessage ? (
          <Text style={[styles.emptyMessage, { color: colors.textTertiary }]}>{emptyMessage}</Text>
        ) : null
      ) : (
        <FlatList
          horizontal
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  headerRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  rowContent: {
    paddingVertical: 2,
  },
  thumbWrap: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  emptyMessage: {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 4,
  },
});

export default DiscoverySection;
