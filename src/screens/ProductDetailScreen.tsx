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
import { RootStackParamList } from '../types';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;
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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(imageUrl, index) => `${imageUrl}-${index}`}
            onMomentumScrollEnd={handleImageScroll}
            renderItem={({ item: imageUrl }) => (
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
              />
            )}
          />
          {images.length > 1 ? (
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={`image-dot-${index}`}
                  style={[styles.dot, index === activeImageIndex ? styles.dotActive : null]}
                />
              ))}
            </View>
          ) : null}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.storeContainer}>
              <Text style={styles.storeName}>{product.store}</Text>
              <Pressable
                style={[
                  styles.subscribeButton,
                  isSubscribed && styles.subscribedButton,
                ]}
                onPress={() => toggleStoreSubscription(product.store)}
              >
                <Ionicons
                  name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'}
                  size={16}
                  color={isSubscribed ? '#FFF' : '#007AFF'}
                />
              </Pressable>
            </View>
            <Text style={styles.itemName}>{product.item_name}</Text>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          <View style={styles.tagsSection}>
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionsSection}>
            <Pressable
              style={styles.actionButton}
              onPress={() => toggleFavorite(product)}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={favorite ? '#FF3B30' : '#000'}
              />
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => setShowListModal(true)}
            >
              <Ionicons name="list-outline" size={24} color="#000" />
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={handleOpenLink}
            >
              <Ionicons name="open-outline" size={24} color="#000" />
            </Pressable>
          </View>

          <Pressable
            style={styles.shopButton}
            onPress={handleOpenLink}
          >
            <Text style={styles.shopButtonText}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showListModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to List</Text>
              <Pressable onPress={() => setShowListModal(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </Pressable>
            </View>

            <ScrollView style={styles.listsList}>
              {lists.map(list => (
                <Pressable
                  key={list.id}
                  style={styles.listItem}
                  onPress={() => handleAddToList(list.id)}
                >
                  <View style={styles.listItemContent}>
                    <Ionicons name="list" size={24} color="#007AFF" />
                    <Text style={styles.listItemName}>{list.name}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
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
  dotActive: { backgroundColor: '#FFF' },
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
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subscribeButton: {
    padding: 8,
    borderRadius: 20,
    borderCurve: 'continuous',
  },
  subscribedButton: {
    backgroundColor: '#007AFF',
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 32,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
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
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderCurve: 'continuous',
  },
  tagText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  shopButton: {
    backgroundColor: '#007AFF',
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
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
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
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
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
    borderBottomColor: '#F0F0F0',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default ProductDetailScreen;