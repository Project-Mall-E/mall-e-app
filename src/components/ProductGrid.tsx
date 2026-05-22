// src/components/ProductGrid.tsx
import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  Text,
} from 'react-native';

import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { Product } from '../types';
import { useTheme } from '../context/ThemeContext';
import { GRID_CONTENT_TOP_GAP } from './productCardLayout';

const AnimatedProductFlatList = Animated.createAnimatedComponent(FlatList<Product>);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<number>);

const SKELETON_PLACEHOLDERS = [0, 1, 2, 3, 4, 5] as const;

const gridCellStyle = StyleSheet.create({
  cardCell: {
    flex: 1,
    minWidth: 0,
  },
});

type GridProductCellProps = {
  product: Product;
  onProductPress: (product: Product) => void;
  onTagPress?: (tag: string) => void;
  numColumns: 2 | 3;
  cardVariant: 'default' | 'imageOnly';
  favoriteRemoveEditMode: boolean;
  onFavoriteRemoveEditModeChange?: (editing: boolean) => void;
};

const GridProductCell = memo(function GridProductCell({
  product,
  onProductPress,
  onTagPress,
  numColumns,
  cardVariant,
  favoriteRemoveEditMode,
  onFavoriteRemoveEditModeChange,
}: GridProductCellProps) {
  return (
    <View style={gridCellStyle.cardCell}>
      <ProductCard
        product={product}
        onPress={onProductPress}
        onTagPress={onTagPress}
        numColumns={numColumns}
        variant={cardVariant}
        favoriteRemoveEditMode={favoriteRemoveEditMode}
        onFavoriteRemoveEditModeChange={onFavoriteRemoveEditModeChange}
      />
    </View>
  );
});

const GridSkeletonCell = memo(function GridSkeletonCell() {
  return (
    <View style={gridCellStyle.cardCell}>
      <ProductCardSkeleton />
    </View>
  );
});

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
  numColumns?: 2 | 3;
  cardVariant?: 'default' | 'imageOnly';
  /** With `imageOnly`, long-press toggles edit mode; when true, every tile shows the remove control. */
  favoriteRemoveEditMode?: boolean;
  onFavoriteRemoveEditModeChange?: (editing: boolean) => void;
  /** Extra bottom padding for scroll content (e.g. floating UI above list). */
  contentPaddingBottom?: number;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
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
  numColumns = 2,
  cardVariant = 'default',
  favoriteRemoveEditMode = false,
  onFavoriteRemoveEditModeChange,
  contentPaddingBottom,
  onScroll,
  scrollEventThrottle = 1,
}) => {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const rowWrapStyle = numColumns === 2 ? s.rowTwoCol : s.rowThreeCol;

  const listHeaderWithGap = useMemo(
    () =>
      listHeaderComponent != null ? (
        <>
          {listHeaderComponent}
          <View style={s.gridTopGap} />
        </>
      ) : undefined,
    [listHeaderComponent, s.gridTopGap],
  );

  const skeletonContentStyle = useMemo(
    () => [s.container, listHeaderComponent == null ? s.containerTopPad : null],
    [s.container, s.containerTopPad, listHeaderComponent],
  );

  const productsContentStyle = useMemo(
    () => [
      s.container,
      listHeaderComponent == null ? s.containerTopPad : null,
      products.length === 0 ? s.containerGrow : null,
      contentPaddingBottom != null && contentPaddingBottom > 0
        ? { paddingBottom: 16 + contentPaddingBottom }
        : null,
    ],
    [
      s.container,
      s.containerTopPad,
      s.containerGrow,
      listHeaderComponent,
      products.length,
      contentPaddingBottom,
    ],
  );

  const emptyComp =
    products.length === 0 && !loading ? (
      <View style={s.emptyWrap}>
        <Text style={s.emptyText}>{emptyMessage}</Text>
      </View>
    ) : null;

  const scrollProps = onScroll != null ? { onScroll, scrollEventThrottle } : {};

  const renderSkeletonItem = useCallback(
    () => <GridSkeletonCell />,
    [],
  );

  const renderProductItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <GridProductCell
        product={item}
        onProductPress={onProductPress}
        onTagPress={onTagPress}
        numColumns={numColumns}
        cardVariant={cardVariant}
        favoriteRemoveEditMode={favoriteRemoveEditMode}
        onFavoriteRemoveEditModeChange={onFavoriteRemoveEditModeChange}
      />
    ),
    [
      onProductPress,
      onTagPress,
      numColumns,
      cardVariant,
      favoriteRemoveEditMode,
      onFavoriteRemoveEditModeChange,
    ],
  );

  const keyExtractor = useCallback(
    (item: Product, index: number) => `${item.item_link}-${index}`,
    [],
  );

  const skeletonKeyExtractor = useCallback(
    (item: number) => `skeleton-${item}`,
    [],
  );

  if (loading) {
    return (
      <AnimatedFlatList
        style={s.list}
        data={SKELETON_PLACEHOLDERS}
        renderItem={renderSkeletonItem}
        keyExtractor={skeletonKeyExtractor}
        numColumns={numColumns}
        columnWrapperStyle={rowWrapStyle}
        contentContainerStyle={skeletonContentStyle}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={listHeaderWithGap}
        ListFooterComponent={listFooterComponent ?? undefined}
        {...scrollProps}
      />
    );
  }

  return (
    <AnimatedProductFlatList
      style={s.list}
      data={products}
      renderItem={renderProductItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      columnWrapperStyle={rowWrapStyle}
      contentContainerStyle={productsContentStyle}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={listHeaderWithGap}
      ListFooterComponent={listFooterComponent ?? undefined}
      ListEmptyComponent={emptyComp}
      {...scrollProps}
    />
  );
};

const makeStyles = (colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    list: { flex: 1 },
    container: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    containerTopPad: {
      paddingTop: 16,
    },
    gridTopGap: {
      height: GRID_CONTENT_TOP_GAP,
    },
    containerGrow: {
      flexGrow: 1,
    },
    rowTwoCol: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 16,
    },
    rowThreeCol: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 8,
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
