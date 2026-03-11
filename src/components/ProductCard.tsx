import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useUser } from '../context/UserContext';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { isFavorite, toggleFavorite } = useUser();
  const favorite = isFavorite(product);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.item_image_link }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(product)}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={favorite ? '#FF3B30' : '#FFF'}
          />
        </TouchableOpacity>
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
              <Text style={styles.tagText} numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    maxWidth: CARD_WIDTH - 24,
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
});

export default ProductCard;