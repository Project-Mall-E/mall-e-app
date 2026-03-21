// src/components/ProductGrid.tsx
import React, { ReactElement } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { Product } from '../types';
import { useTheme } from '../context/ThemeContext';

const SKELETON_PLACEHOLDERS = [0, 1, 2, 3, 4, 5] as const;

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onTagPress?: (tag: string) => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyMessage?: string;
  /** Shown above grid / skeleton / empty (single scroll, avoids nested ScrollViews). */
  listHeaderComponent?: ReactElement | null;
  listFooterComponent?: ReactElement | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductPress,
  onTagPress,
  loading = false,
  refreshing = false,
  onRefresh,
  emptyMessage = 'No products found',
  listHeaderComponent = null,
  listFooterComponent = null,
}) => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const emptyComp =
    products.length === 0 && !loading ? (
      <View style={s.emptyWrap}>
        <Text style={s.emptyText}>{emptyMessage}</Text>
      </View>
    ) : null;

  if (loading) {
    return (
      <FlatList
        data={SKELETON_PLACEHOLDERS}
        renderItem={() => <ProductCardSkeleton />}
        keyExtractor={item => `skeleton-${item}`}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={listHeaderComponent ?? undefined}
        ListFooterComponent={listFooterComponent ?? undefined}
      />
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={onProductPress} onTagPress={onTagPress} />
      )}
      keyExtractor={(item, index) => `${item.item_link}-${index}`}
      numColumns={2}
      columnWrapperStyle={s.row}
      contentContainerStyle={[s.container, products.length === 0 ? s.containerGrow : null]}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={listHeaderComponent ?? undefined}
      ListFooterComponent={listFooterComponent ?? undefined}
      ListEmptyComponent={emptyComp}
    />
  );
};

const makeStyles = (colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      padding: 16,
    },
    containerGrow: {
      flexGrow: 1,
    },
    row: {
      justifyContent: 'space-between',
    },
    emptyWrap: {
      paddingVertical: 48,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

export default ProductGrid;
