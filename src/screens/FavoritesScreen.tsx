// src/screens/FavoritesScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../components/ProductGrid';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Product } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  // addToList intentionally omitted — not used in this screen yet
  const { favorites, lists, createList, deleteList } = useUser();
  const { colors } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'favorites' | 'lists'>('favorites');
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim());
      setNewListName('');
      setShowNewListModal(false);
    }
  };

  const handleDeleteList = (listId: string, listName: string) => {
    Alert.alert('Delete List', `Are you sure you want to delete "${listName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteList(listId);
        if (selectedList === listId) setSelectedList(null);
      }},
    ]);
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
            <Pressable onPress={() => setSelectedList(null)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </Pressable>
            <View style={styles.listHeaderText}>
              <Text style={[styles.listTitle, { color: colors.text }]}>{list.name}</Text>
              <Text style={[styles.listCount, { color: colors.textSecondary }]}>
                {list.products.length} item{list.products.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Pressable onPress={() => handleDeleteList(list.id, list.name)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
            </Pressable>
          </View>
          <ProductGrid products={list.products} onProductPress={handleProductPress} emptyMessage="No products in this list yet." />
        </View>
      );
    }

    return (
      <ScrollView style={styles.listsContainer} contentInsetAdjustmentBehavior="automatic">
        <Pressable style={[styles.createListButton, { borderColor: '#007AFF' }]} onPress={() => setShowNewListModal(true)}>
          <Ionicons name="add-circle-outline" size={32} color="#007AFF" />
          <Text style={styles.createListText}>Create New List</Text>
        </Pressable>

        {lists.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No lists yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create lists to organize your favorite products
            </Text>
          </View>
        ) : (
          <View style={styles.listsGrid}>
            {lists.map(list => (
              <Pressable
                key={list.id}
                style={[styles.listCard, { backgroundColor: colors.surfaceRaised }]}
                onPress={() => setSelectedList(list.id)}
              >
                <View style={styles.listCardHeader}>
                  <Ionicons name="list" size={24} color="#007AFF" />
                  <Text style={[styles.listCardCount, { color: colors.text }]}>{list.products.length}</Text>
                </View>
                <Text style={[styles.listCardName, { color: colors.text }]} numberOfLines={2}>{list.name}</Text>
                <Text style={[styles.listCardDate, { color: colors.textSecondary }]}>
                  {new Date(list.createdAt).toLocaleDateString()}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Saved</Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <Pressable
          style={[styles.tab, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }, selectedTab === 'favorites' && styles.tabActive]}
          onPress={() => setSelectedTab('favorites')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, selectedTab === 'favorites' && styles.tabTextActive]}>
            Favorites ({favorites.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }, selectedTab === 'lists' && styles.tabActive]}
          onPress={() => setSelectedTab('lists')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, selectedTab === 'lists' && styles.tabTextActive]}>
            Lists ({lists.length})
          </Text>
        </Pressable>
      </View>

      {selectedTab === 'favorites' ? renderFavorites() : renderLists()}

      <Modal visible={showNewListModal} transparent animationType="fade" onRequestClose={() => setShowNewListModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceRaised }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create New List</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.border }]}
              placeholder="List name"
              placeholderTextColor={colors.textTertiary}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, { backgroundColor: colors.surface }]} onPress={() => { setShowNewListModal(false); setNewListName(''); }}>
                <Text style={[styles.modalButtonTextCancel, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonCreate]} onPress={handleCreateList}>
                <Text style={styles.modalButtonTextCreate}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 32, fontWeight: '700' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8, paddingTop: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  tabActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  listsContainer: { flex: 1, paddingHorizontal: 16 },
  createListButton: { padding: 24, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderStyle: 'dashed' },
  createListText: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginLeft: 12 },
  listsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  listCard: { width: '47%', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listCardCount: { fontSize: 18, fontWeight: '700' },
  listCardName: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  listCardDate: { fontSize: 12 },
  listView: { flex: 1 },
  listHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  backButton: { padding: 4, marginRight: 12 },
  listHeaderText: { flex: 1 },
  listTitle: { fontSize: 24, fontWeight: '700' },
  listCount: { fontSize: 14, marginTop: 2 },
  deleteButton: { padding: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 16, padding: 24, width: '80%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalButtonCreate: { backgroundColor: '#007AFF' },
  modalButtonTextCancel: { fontSize: 16, fontWeight: '600' },
  modalButtonTextCreate: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});

export default FavoritesScreen;