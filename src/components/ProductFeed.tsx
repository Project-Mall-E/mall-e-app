// src/components/ProductFeed.tsx - TikTok-style snap scrolling
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewToken,
  useWindowDimensions,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../types';
import { useTheme } from '../context/ThemeContext';

const SLIDE_DOT_MAX = 6;

const getProductImages = (item: Product) => {
  const links = item.item_image_links?.filter(Boolean) ?? [];
  if (links.length > 0) return links;
  if (item.item_image_link) return [item.item_image_link];
  return ['https://via.placeholder.com/800x800?text=No+Image'];
};

interface ProductFeedProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onTagPress: (tag: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const ProductTagPill = memo(function ProductTagPill({
  tag,
  onTagPress,
}: {
  tag: string;
  onTagPress: (tag: string) => void;
}) {
  const handlePress = useCallback(() => {
    onTagPress(tag);
  }, [tag, onTagPress]);

  return (
    <Pressable style={styles.tag} onPress={handlePress}>
      <Text style={styles.tagText}>#{tag}</Text>
    </Pressable>
  );
});

const ProductCard: React.FC<{
  item: Product;
  slideWidth: number;
  slideHeight: number;
  bottomInset: number;
  onProductPress: (product: Product) => void;
  onTagPress: (tag: string) => void;
}> = ({ item, slideWidth, slideHeight, bottomInset, onProductPress, onTagPress }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = getProductImages(item);

  const handleImageScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const maxIndex = Math.max(images.length - 1, 0);
    const nextIndex = Math.max(0, Math.min(Math.round(offsetX / slideWidth), maxIndex));
    setActiveImageIndex(prev => (prev === nextIndex ? prev : nextIndex));
  }, [images.length, slideWidth]);

  const pageStyle = useMemo(
    () => ({ width: slideWidth, height: slideHeight }),
    [slideWidth, slideHeight],
  );

  const slideDimsStyle = useMemo(
    () => ({ width: slideWidth, height: slideHeight }),
    [slideWidth, slideHeight],
  );

  const productInfoStyle = useMemo(
    () => [styles.productInfo, { paddingBottom: bottomInset }],
    [bottomInset],
  );

  const onImagePress = useCallback(() => {
    onProductPress(item);
  }, [item, onProductPress]);

  const renderImagePage = useCallback(
    ({ item: imageUrl }: ListRenderItemInfo<string>) => (
      <Pressable style={pageStyle} onPress={onImagePress}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          contentFit="cover"
        />
      </Pressable>
    ),
    [pageStyle, onImagePress],
  );

  return (
    <View style={[styles.slide, slideDimsStyle]}>
      <View style={styles.imageContainer}>
        <FlatList
          data={images}
          horizontal
          nestedScrollEnabled
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(imageUrl, index) => `${imageUrl}-${index}`}
          onMomentumScrollEnd={handleImageScroll}
          getItemLayout={(_, index) => ({
            length: slideWidth,
            offset: slideWidth * index,
            index,
          })}
          renderItem={renderImagePage}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.88)']}
          style={styles.gradient}
        />
        <Pressable style={productInfoStyle} onPress={onImagePress}>
          <Text style={styles.storeName}>{item.store}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.item_name}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
          {item.tags && item.tags.length > 0 ? (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <ProductTagPill
                  key={`${item.item_link}-tag-${idx}`}
                  tag={tag}
                  onTagPress={onTagPress}
                />
              ))}
            </View>
          ) : null}
          {images.length > 1 ? (
            <View style={styles.pagination}>
              {images.slice(0, SLIDE_DOT_MAX).map((_, index) => (
                <View
                  key={`${item.item_link}-dot-${index}`}
                  style={[
                    styles.dot,
                    index === activeImageIndex ? styles.dotActive : null,
                  ]}
                />
              ))}
              {images.length > SLIDE_DOT_MAX ? (
                <Text style={styles.paginationText}>
                  {activeImageIndex + 1}/{images.length}
                </Text>
              ) : null}
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
};

const ProductFeed: React.FC<ProductFeedProps> = ({
  products,
  onProductPress,
  onTagPress,
  onRefresh,
  refreshing,
}) => {
  const { dark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  const slideW = viewport?.width ?? winW;
  const slideH = viewport?.height ?? winH;
  /** Keep tags above home indicator / gesture area without a layout-level safe-area strip (avoids black gap above tab bar). */
  const bottomInset = 20 + insets.bottom;

  const flatListRef = useRef<FlatList>(null);
  const [_currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index || 0);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const onLayoutContainer = useCallback((e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setViewport(prev => (prev?.width === width && prev?.height === height ? prev : { width, height }));
    }
  }, []);

  const renderProduct = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <ProductCard
        item={item}
        slideWidth={slideW}
        slideHeight={slideH}
        bottomInset={bottomInset}
        onProductPress={onProductPress}
        onTagPress={onTagPress}
      />
    ),
    [slideW, slideH, bottomInset, onProductPress, onTagPress],
  );

  const keyExtractor = useCallback((item: Product) => item.item_link, []);

  const refreshTint = dark ? colors.inverseText : colors.text;
  const refreshControl = useMemo(() => {
    if (!onRefresh || refreshing === undefined) return undefined;
    return (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={refreshTint} />
    );
  }, [onRefresh, refreshing, refreshTint]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} onLayout={onLayoutContainer}>
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={slideH}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: slideH,
          offset: slideH * index,
          index,
        })}
        refreshControl={refreshControl}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { position: 'relative' },
  imageContainer: { flex: 1, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: { backgroundColor: '#FFF' },
  paginationText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  productInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20 },
  storeName: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 6, lineHeight: 26 },
  productPrice: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
});

export default ProductFeed;
