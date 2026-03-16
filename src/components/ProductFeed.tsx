// src/components/ProductFeed.tsx - TikTok-style snap scrolling
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProductFeedProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  onTagPress: (tag: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const ProductCard: React.FC<{
  item: Product;
  bottomOffset: number;
  onProductPress: (product: Product) => void;
  onTagPress: (tag: string) => void;
}> = ({ item, bottomOffset, onProductPress, onTagPress }) => {
  return (
    <View style={[styles.slide, { height: SCREEN_HEIGHT }]}>
      <Pressable
        style={styles.imageContainer}
        onPress={() => onProductPress(item)}
        activeOpacity={0.95}
      >
        <Image
          source={{ uri: item.item_image_link }}
          style={styles.productImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.88)']}
          style={styles.gradient}
        />
        <View style={[styles.productInfo, { paddingBottom: bottomOffset }]}>
          <Text style={styles.storeName}>{item.store}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.item_name}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <Pressable key={idx} style={styles.tag} onPress={() => onTagPress(tag)}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
};

const ProductFeed: React.FC<ProductFeedProps> = ({
  products,
  onProductPress,
  onTagPress,
}) => {
  const tabBarHeight = useBottomTabBarHeight();
  const bottomOffset = tabBarHeight + 24;
  const flatListRef = useRef<FlatList>(null);
  // prefixed with _ to satisfy no-unused-vars rule
  const [_currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index || 0);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            bottomOffset={bottomOffset}
            onProductPress={onProductPress}
            onTagPress={onTagPress}
          />
        )}
        keyExtractor={(item, index) => `${item.store}-${item.item_name}-${index}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  slide: { width: SCREEN_WIDTH },
  imageContainer: { flex: 1, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
  productInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20 },
  storeName: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 6, lineHeight: 26 },
  productPrice: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
});

export default ProductFeed;