// src/components/ProductFeedCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '../types';
import { useUser } from '../context/UserContext';

interface ProductFeedCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onTagPress?: (tag: string) => void;
  variant?: 'default' | 'featured' | 'compact' | 'wide';
  bottomOffset?: number; // passed from parent that has tab bar height
}

const { width, height } = Dimensions.get('window');

const ProductFeedCard: React.FC<ProductFeedCardProps> = ({
  product,
  onPress,
  onTagPress,
  variant = 'default',
  bottomOffset = 100, // fallback — callers should pass real value
}) => {
  const { isFavorite, toggleFavorite, subscribedStores, toggleStoreSubscription } = useUser();
  const favorite = isFavorite(product);
  const isSubscribed = subscribedStores.includes(product.store);

  const handleSubscribeToggle = (e: any) => {
    e.stopPropagation();
    toggleStoreSubscription(product.store);
  };

  const handleFavoriteToggle = (e: any) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  const handleTagPress = (tag: string, e: any) => {
    e.stopPropagation();
    if (onTagPress) onTagPress(tag);
  };

  if (variant === 'default') {
    const CARD_HEIGHT = height * 0.75;
    return (
      <Pressable style={[styles.card, { height: CARD_HEIGHT }]} onPress={() => onPress(product)}>
        <Image source={{ uri: product.item_image_link }} style={styles.image} contentFit="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']} style={styles.gradient} />
        <View style={styles.topActions}>
          <Pressable style={[styles.storeTag, isSubscribed && styles.storeTagSubscribed]} onPress={handleSubscribeToggle}>
            <Text style={styles.storeText}>{product.store}</Text>
            <Ionicons name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'} size={14} color="#FFF" />
          </Pressable>
        </View>
        {/* Use bottomOffset so tags are never hidden by tab bar */}
        <View style={[styles.bottomInfo, { paddingBottom: bottomOffset }]}>
          <View style={styles.productInfo}>
            <Text style={styles.price}>{product.price}</Text>
            <Text style={styles.itemName} numberOfLines={2}>{product.item_name}</Text>
            <View style={styles.tags}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <Pressable key={index} style={styles.tag} onPress={(e) => handleTagPress(tag, e)}>
                  <Text style={styles.tagText}>{tag}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={handleFavoriteToggle}>
              <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={32} color={favorite ? '#FF3B30' : '#FFF'} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === 'featured') {
    const CARD_HEIGHT = height * 0.85;
    return (
      <Pressable style={[styles.card, { height: CARD_HEIGHT }]} onPress={() => onPress(product)}>
        <Image source={{ uri: product.item_image_link }} style={styles.image} contentFit="cover" />
        <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.9)']} style={styles.gradient} />
        <View style={styles.topActions}>
          <Pressable style={[styles.storeTag, styles.featuredTag, isSubscribed && styles.storeTagSubscribed]} onPress={handleSubscribeToggle}>
            <Ionicons name="flame" size={14} color={isSubscribed ? '#FFF' : '#FF3B30'} />
            <Text style={styles.storeText}>{product.store}</Text>
            <Ionicons name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'} size={16} color="#FFF" />
          </Pressable>
        </View>
        <View style={[styles.bottomInfo, styles.featuredInfo, { paddingBottom: bottomOffset }]}>
          <View style={styles.productInfo}>
            <Text style={[styles.price, styles.featuredPrice]}>{product.price}</Text>
            <Text style={[styles.itemName, styles.featuredName]} numberOfLines={3}>{product.item_name}</Text>
            <View style={styles.tags}>
              {product.tags.slice(0, 4).map((tag, index) => (
                <Pressable key={index} style={[styles.tag, styles.featuredTagItem]} onPress={(e) => handleTagPress(tag, e)}>
                  <Text style={styles.tagText}>{tag}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable style={[styles.actionButton, styles.featuredButton]} onPress={handleFavoriteToggle}>
              <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={36} color={favorite ? '#FF3B30' : '#FFF'} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === 'compact') {
    const CARD_HEIGHT = height * 0.55;
    return (
      <Pressable style={[styles.card, { height: CARD_HEIGHT }]} onPress={() => onPress(product)}>
        <Image source={{ uri: product.item_image_link }} style={styles.image} contentFit="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.gradient} />
        <View style={styles.compactContent}>
          <View style={styles.compactTop}>
            <Pressable style={[styles.storeTag, styles.compactTag, isSubscribed && styles.storeTagSubscribed]} onPress={handleSubscribeToggle}>
              <Text style={[styles.storeText, styles.compactStoreText]}>{product.store}</Text>
              <Ionicons name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'} size={12} color="#FFF" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.compactAction]} onPress={handleFavoriteToggle}>
              <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={24} color={favorite ? '#FF3B30' : '#FFF'} />
            </Pressable>
          </View>
          <View style={styles.compactBottom}>
            <Text style={[styles.price, styles.compactPrice]}>{product.price}</Text>
            <Text style={[styles.itemName, styles.compactName]} numberOfLines={2}>{product.item_name}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === 'wide') {
    const CARD_HEIGHT = height * 0.65;
    return (
      <Pressable style={[styles.card, { height: CARD_HEIGHT }]} onPress={() => onPress(product)}>
        <View style={styles.wideLayout}>
          <View style={styles.wideImageContainer}>
            <Image source={{ uri: product.item_image_link }} style={styles.wideImage} contentFit="cover" />
          </View>
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']} style={styles.wideGradient} />
          <View style={styles.wideContent}>
            <View style={styles.wideTop}>
              <Pressable style={[styles.storeTag, isSubscribed && styles.storeTagSubscribed]} onPress={handleSubscribeToggle}>
                <Text style={styles.storeText}>{product.store}</Text>
                <Ionicons name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'} size={14} color="#FFF" />
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleFavoriteToggle}>
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={28} color={favorite ? '#FF3B30' : '#FFF'} />
              </Pressable>
            </View>
            <View style={styles.wideInfo}>
              <Text style={[styles.price, styles.widePrice]}>{product.price}</Text>
              <Text style={[styles.itemName, styles.wideName]} numberOfLines={3}>{product.item_name}</Text>
              <View style={styles.tags}>
                {product.tags.slice(0, 3).map((tag, index) => (
                  <Pressable key={index} style={styles.tag} onPress={(e) => handleTagPress(tag, e)}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  card: { width, marginBottom: 16, position: 'relative' },
  image: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  topActions: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeTag: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  storeTagSubscribed: { backgroundColor: 'rgba(0,122,255,0.8)' },
  featuredTag: { backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 14, paddingVertical: 8 },
  storeText: { color: '#FFF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  bottomInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20 },
  featuredInfo: { paddingHorizontal: 24, paddingTop: 24 },
  productInfo: { flex: 1, marginRight: 16 },
  price: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  featuredPrice: { fontSize: 36, marginBottom: 12 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 12, lineHeight: 22 },
  featuredName: { fontSize: 20, lineHeight: 28, marginBottom: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  featuredTagItem: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  actions: { justifyContent: 'flex-end', alignItems: 'center', gap: 20 },
  actionButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  featuredButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,0,0,0.6)' },
  compactContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 16, justifyContent: 'space-between' },
  compactTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compactTag: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5 },
  compactStoreText: { fontSize: 10 },
  compactAction: { width: 44, height: 44, borderRadius: 22 },
  compactBottom: { gap: 4 },
  compactPrice: { fontSize: 24, marginBottom: 4 },
  compactName: { fontSize: 14, marginBottom: 0 },
  wideLayout: { flex: 1, position: 'relative' },
  wideImageContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  wideImage: { width: '100%', height: '100%' },
  wideGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  wideContent: { flex: 1, padding: 20, justifyContent: 'space-between' },
  wideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wideInfo: { gap: 8 },
  widePrice: { fontSize: 32 },
  wideName: { fontSize: 18, lineHeight: 24 },
});

export default ProductFeedCard;