import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onTagPress?: (tag: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onTagPress }) => {
  const { isFavorite, toggleFavorite } = useUser();
  const { colors } = useTheme();
  const favorite = isFavorite(product);
  const s = makeStyles(colors);

  const cardStyle = ({ pressed }: { pressed: boolean }) =>
    [s.card, pressed ? { opacity: 0.7 } : null];

  return (
    <Pressable
      style={cardStyle}
      onPress={() => onPress(product)}
    >
      <View style={s.imageContainer}>
        <Image
          source={{ uri: product.item_image_link }}
          style={s.image}
          contentFit="cover"
        />
        <Pressable
          style={s.favoriteButton}
          onPress={() => toggleFavorite(product)}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={favorite ? colors.error : colors.inverseText}
          />
        </Pressable>
      </View>
      <View style={s.info}>
        <Text style={s.storeName} numberOfLines={1}>
          {product.store}
        </Text>
        <Text style={s.itemName} numberOfLines={2}>
          {product.item_name}
        </Text>
        <Text style={s.price}>{product.price}</Text>
        <View style={s.tagsContainer}>
          {product.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={s.tag}>
              <Text
                style={s.tagText}
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

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      backgroundColor: colors.surfaceRaised,
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
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
      lineHeight: 18,
    },
    price: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.tabActive,
      marginBottom: 8,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    tag: {
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderCurve: 'continuous',
      maxWidth: CARD_WIDTH - 24,
    },
    tagText: {
      fontSize: 10,
      color: colors.textSecondary,
    },
  });

export default ProductCard;
