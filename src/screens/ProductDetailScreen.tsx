// src/screens/ProductDetailScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Linking,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const {
    isFavorite,
    toggleFavorite,
    subscribedStores,
    toggleStoreSubscription,
    lists,
    addToList,
  } = useUser();
  const [showListModal, setShowListModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const productImages = (product.item_image_links?.filter(Boolean)?.length
    ? product.item_image_links.filter(Boolean)
    : [product.item_image_link]).filter(Boolean);
  const images = productImages.length > 0
    ? productImages
    : ['https://via.placeholder.com/800x800?text=No+Image'];

  const handleImageScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const width = event.nativeEvent.layoutMeasurement.width;
    const maxIndex = Math.max(images.length - 1, 0);
    const nextIndex = Math.max(0, Math.min(Math.round(event.nativeEvent.contentOffset.x / width), maxIndex));
    setActiveImageIndex(prev => (prev === nextIndex ? prev : nextIndex));
  }, [images.length]);

  const favorite = isFavorite(product);
  const isSubscribed = subscribedStores.includes(product.store);

  const handleOpenLink = async () => {
    try {
      const canOpen = await Linking.canOpenURL(product.item_link);
      if (canOpen) {
        await Linking.openURL(product.item_link);
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleAddToList = (listId: string) => {
    addToList(listId, product);
    setShowListModal(false);
  };

  return (
    <View style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={s.imageContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(imageUrl, index) => `${imageUrl}-${index}`}
            onMomentumScrollEnd={handleImageScroll}
            renderItem={({ item: imageUrl }) => (
              <View style={s.imageSlide}>
                <View style={s.imageBackdropWrap} pointerEvents="none">
                  <Image
                    source={{ uri: imageUrl }}
                    style={s.imageBackdrop}
                    contentFit="cover"
                    blurRadius={56}
                  />
                </View>
                <Image
                  source={{ uri: imageUrl }}
                  style={s.image}
                  contentFit="contain"
                />
              </View>
            )}
          />
          {images.length > 1 ? (
            <View style={s.pagination}>
              {images.map((_, index) => (
                <View
                  key={`image-dot-${index}`}
                  style={[s.dot, index === activeImageIndex ? s.dotActive : null]}
                />
              ))}
            </View>
          ) : null}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={s.gradient}
          />
        </View>

        <View style={s.content}>
          <View style={s.headerSection}>
            <View style={s.storeContainer}>
              <Text style={s.storeName}>{product.store}</Text>
              <Pressable
                style={[s.subscribeButton, isSubscribed && s.subscribedButton]}
                onPress={() => toggleStoreSubscription(product.store)}
              >
                <Ionicons
                  name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'}
                  size={16}
                  color={isSubscribed ? colors.inverseText : colors.tabActive}
                />
              </Pressable>
            </View>
            <Text style={s.itemName}>{product.item_name}</Text>
            <Text style={s.price}>{product.price}</Text>
          </View>

          <View style={s.tagsSection}>
            <View style={s.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View key={index} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.actionsSection}>
            <Pressable
              style={s.actionButton}
              onPress={() => toggleFavorite(product)}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={favorite ? colors.error : colors.text}
              />
            </Pressable>

            <Pressable
              style={s.actionButton}
              onPress={() => setShowListModal(true)}
            >
              <Ionicons name="list-outline" size={24} color={colors.text} />
            </Pressable>

            <Pressable
              style={s.actionButton}
              onPress={handleOpenLink}
            >
              <Ionicons name="open-outline" size={24} color={colors.text} />
            </Pressable>
          </View>

          <Pressable
            style={s.shopButton}
            onPress={handleOpenLink}
          >
            <Text style={s.shopButtonText}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.inverseText} />
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showListModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowListModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add to List</Text>
              <Pressable onPress={() => setShowListModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={s.listsList}>
              {lists.map(list => (
                <Pressable
                  key={list.id}
                  style={s.listItem}
                  onPress={() => handleAddToList(list.id)}
                >
                  <View style={s.listItemContent}>
                    <Ionicons name="list" size={24} color={colors.tabActive} />
                    <Text style={s.listItemName}>{list.name}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color={colors.tabActive} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    imageContainer: {
      width: '100%',
      height: 400,
      position: 'relative',
      backgroundColor: colors.surface,
    },
    imageSlide: {
      width: SCREEN_WIDTH,
      height: '100%',
      overflow: 'hidden',
    },
    imageBackdropWrap: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden',
    },
    imageBackdrop: {
      width: '100%',
      height: '100%',
      transform: [{ scale: 1.18 }],
    },
    image: {
      width: '100%',
      height: '100%',
    },
    pagination: {
      position: 'absolute',
      bottom: 16,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(0,0,0,0.3)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderCurve: 'continuous',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.45)',
    },
    dotActive: { backgroundColor: colors.inverseText },
    gradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
    },
    content: {
      padding: 20,
    },
    headerSection: {
      marginBottom: 24,
    },
    storeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    storeName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    subscribeButton: {
      padding: 8,
      borderRadius: 20,
      borderCurve: 'continuous',
    },
    subscribedButton: {
      backgroundColor: colors.tabActive,
    },
    itemName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      lineHeight: 32,
    },
    price: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.tabActive,
    },
    tagsSection: {
      marginBottom: 24,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
      borderCurve: 'continuous',
    },
    tagText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    actionsSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 24,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    actionButton: {
      alignItems: 'center',
      padding: 8,
    },
    shopButton: {
      backgroundColor: colors.tabActive,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
      borderRadius: 12,
      borderCurve: 'continuous',
      gap: 8,
    },
    shopButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.inverseText,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surfaceRaised,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderCurve: 'continuous',
      paddingTop: 20,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    listsList: {
      padding: 20,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    listItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });

export default ProductDetailScreen;
