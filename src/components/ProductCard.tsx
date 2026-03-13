import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useUser } from '../context/UserContext';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onTagPress?: (tag: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onTagPress }) => {
  const { isFavorite, toggleFavorite } = useUser();
  const favorite = isFavorite(product);

  const cardStyle = ({ pressed }: { pressed: boolean }) =>
    [styles.card, pressed ? { opacity: 0.7 } : null];

  return (
    <Pressable
      style={cardStyle}
      onPress={() => onPress(product)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.item_image_link }}
          style={styles.image}
          contentFit="cover"
        />
        <Pressable
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(product)}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={favorite ? '#FF3B30' : '#FFF'}
          />
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.storeName} numberOfLines={1}>
          {product.store}
        </Text>
        <Text style={styles.itemName} numberOfLines={2}>
          {product.item_name}
        </Text>
        <Text style={styles.price}>{product.price}</Text>
        <View style={styles.tagsContainer}>
          {product.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text
                style={styles.tagText}
                numberOfLines={1}
                onPress={() => onTagPress?.(tag)}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderCurve: 'continuous',
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 1.2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderCurve: 'continuous',
  },
  favoriteButton: {
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
  info: {
    padding: 12,
  },
  storeName: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderCurve: 'continuous',
    maxWidth: CARD_WIDTH - 24,
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
});

export default ProductCard;