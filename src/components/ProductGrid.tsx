// src/components/ProductGrid.tsx
import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Product } from '../types';

const SKELETON_PLACEHOLDERS = [0, 1, 2, 3, 4, 5] as const;

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onTagPress?: (tag: string) => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyMessage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductPress,
  onTagPress,
  loading = false,
  refreshing = false,
  onRefresh,
  emptyMessage = 'No products found',
}) => {
  if (loading) {
    return (
      <FlatList
        data={[...SKELETON_PLACEHOLDERS]}
        renderItem={() => <ProductCardSkeleton />}
        keyExtractor={item => `skeleton-${item}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard 
          product={item} 
          onPress={onProductPress}
          onTagPress={onTagPress}
        />
      )}
      keyExtractor={(item, index) => `${item.item_link}-${index}`}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProductGrid;