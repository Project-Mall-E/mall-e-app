import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../components/ProductGrid';
import { useUser } from '../context/UserContext';
import { RootStackParamList, Product, List } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    favorites,
    lists,
    createList,
    deleteList,
    addToList,
    removeFromList,
  } = useUser();
  const [selectedTab, setSelectedTab] = useState<'favorites' | 'lists'>('favorites');
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [productToAdd, setProductToAdd] = useState<Product | null>(null);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim());
      setNewListName('');
      setShowNewListModal(false);
    }
  };

  const handleDeleteList = (listId: string, listName: string) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${listName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteList(listId);
            if (selectedList === listId) {
              setSelectedList(null);
            }
          },
        },
      ]
    );
  };

  const handleAddToList = (listId: string) => {
    if (productToAdd) {
      addToList(listId, productToAdd);
      setShowAddToListModal(false);
      setProductToAdd(null);
    }
  };

  const renderFavorites = () => (
    <ProductGrid
      products={favorites}
      onProductPress={handleProductPress}
      emptyMessage="No favorites yet. Tap the heart icon on products to add them here."
    />
  );

  const renderLists = () => {
    if (selectedList) {
      const list = lists.find(l => l.id === selectedList);
      if (!list) return null;

      return (
        <View style={styles.listView}>
          <View style={styles.listHeader}>
            <TouchableOpacity
              onPress={() => setSelectedList(null)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.listHeaderText}>
              <Text style={styles.listTitle}>{list.name}</Text>
              <Text style={styles.listCount}>
                {list.products.length} item{list.products.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteList(list.id, list.name)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          <ProductGrid
            products={list.products}
            onProductPress={handleProductPress}
            emptyMessage="No products in this list yet."
          />
        </View>
      );
    }

    return (
      <ScrollView style={styles.listsContainer}>
        <TouchableOpacity
          style={styles.createListButton}
          onPress={() => setShowNewListModal(true)}
        >
          <Ionicons name="add-circle-outline" size={32} color="#007AFF" />
          <Text style={styles.createListText}>Create New List</Text>
        </TouchableOpacity>

        {lists.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No lists yet</Text>
            <Text style={styles.emptySubtitle}>
              Create lists to organize your favorite products
            </Text>
          </View>
        ) : (
          <View style={styles.listsGrid}>
            {lists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={styles.listCard}
                onPress={() => setSelectedList(list.id)}
              >
                <View style={styles.listCardHeader}>
                  <Ionicons name="list" size={24} color="#007AFF" />
                  <Text style={styles.listCardCount}>
                    {list.products.length}
                  </Text>
                </View>
                <Text style={styles.listCardName} numberOfLines={2}>
                  {list.name}
                </Text>
                <Text style={styles.listCardDate}>
                  {new Date(list.createdAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'favorites' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('favorites')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'favorites' && styles.tabTextActive,
            ]}
          >
            Favorites ({favorites.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'lists' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('lists')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'lists' && styles.tabTextActive,
            ]}
          >
            Lists ({lists.length})
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'favorites' ? renderFavorites() : renderLists()}

      {/* New List Modal */}
      <Modal
        visible={showNewListModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="List name"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowNewListModal(false);
                  setNewListName('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreateList}
              >
                <Text style={styles.modalButtonTextCreate}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tabActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFF',
  },
  listsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  createListButton: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  createListText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 12,
  },
  listsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  listCard: {
    width: '47%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listCardCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  listCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  listCardDate: {
    fontSize: 12,
    color: '#666',
  },
  listView: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  listHeaderText: {
    flex: 1,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  listCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalButtonCreate: {
    backgroundColor: '#007AFF',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalButtonTextCreate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default FavoritesScreen;