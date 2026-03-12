// src/components/ProductFeed.tsx
import React from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import ProductFeedCard from './ProductFeedCard';
import { Product } from '../types';

interface ProductFeedProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onTagPress?: (tag: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const getCardVariant = (index: number): 'default' | 'featured' | 'compact' | 'wide' => {
  // Create a more obvious pattern for visual variety
  const mod = index % 7;

  if (mod === 0) return 'featured';   // Every 7th item is FEATURED (tall + bold)
  if (mod === 2) return 'compact';    // Every 3rd is COMPACT (short)
  if (mod === 4) return 'wide';       // Every 5th is WIDE (split layout)

  return 'default';  // Rest are default
};

const ProductFeed: React.FC<ProductFeedProps> = ({
  products,
  onProductPress,
  onTagPress,
  onRefresh,
  refreshing = false,
}) => {
  return (
    <FlatList
      data={products}
      renderItem={({ item, index }) => {
        const variant = getCardVariant(index);
        return (
          <ProductFeedCard
            product={item}
            onPress={onProductPress}
            onTagPress={onTagPress}
            variant={variant}
          />
        );
      }}
      keyExtractor={(item, index) => `${item.item_link}-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={5}
      initialNumToRender={2}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFF"
            colors={['#007AFF']}
            progressBackgroundColor="#000"
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
});

export default ProductFeed;