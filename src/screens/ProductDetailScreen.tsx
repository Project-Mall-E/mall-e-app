import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../types';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
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

  const favorite = isFavorite(product);
  const isSubscribed = subscribedStores.includes(product.store);

  const handleOpenLink = async () => {
    try {
      const canOpen = await Linking.canOpenURL(product.item_link);
      if (canOpen) {
        await Linking.openURL(product.item_link);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleAddToList = (listId: string) => {
    addToList(listId, product);
    setShowListModal(false);
    Alert.alert('Success', 'Added to list!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.item_image_link }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.storeContainer}>
              <Text style={styles.storeName}>{product.store}</Text>
              <TouchableOpacity
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
                <Text
                  style={[
                    styles.subscribeText,
                    isSubscribed && styles.subscribedText,
                  ]}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.itemName}>{product.item_name}</Text>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleFavorite(product)}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={favorite ? '#FF3B30' : '#000'}
              />
              <Text style={styles.actionText}>
                {favorite ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowListModal(true)}
            >
              <Ionicons name="list-outline" size={24} color="#000" />
              <Text style={styles.actionText}>Add to List</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOpenLink}
            >
              <Ionicons name="open-outline" size={24} color="#000" />
              <Text style={styles.actionText}>Open Link</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shopButton}
            onPress={handleOpenLink}
          >
            <Text style={styles.shopButtonText}>View on {product.store}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add to List Modal */}
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
              <TouchableOpacity onPress={() => setShowListModal(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {lists.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>
                  No lists yet. Create one in the Favorites tab.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.listsList}>
                {lists.map(list => (
                  <TouchableOpacity
                    key={list.id}
                    style={styles.listItem}
                    onPress={() => handleAddToList(list.id)}
                  >
                    <View style={styles.listItemContent}>
                      <Ionicons name="list" size={24} color="#007AFF" />
                      <View style={styles.listItemText}>
                        <Text style={styles.listItemName}>{list.name}</Text>
                        <Text style={styles.listItemCount}>
                          {list.products.length} items
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    width: '100%',
    height: '100%',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 4,
  },
  subscribedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  subscribeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  subscribedText: {
    color: '#FFF',
  },
  itemName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 36,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  tagsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
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
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  shopButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
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
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  listItemText: {
    gap: 4,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  listItemCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProductDetailScreen;