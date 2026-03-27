// src/components/ProfileSavedSection.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductGrid from './ProductGrid';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Product } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type ProfileSavedContentTab = 'favorites' | 'lists';

type Props = {
  contentTab: ProfileSavedContentTab;
};

/** Space so last grid rows stay above the floating Done pill. */
const FAVORITES_DONE_SCROLL_INSET = 88;

export default function ProfileSavedSection({ contentTab }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { favorites, lists, createList, deleteList } = useUser();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(colors);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [favoriteRemoveEditMode, setFavoriteRemoveEditMode] = useState(false);

  useEffect(() => {
    setSelectedList(null);
    setFavoriteRemoveEditMode(false);
  }, [contentTab]);

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { product });
    },
    [navigation],
  );

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
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteList(listId);
          if (selectedList === listId) setSelectedList(null);
        },
      },
    ]);
  };

  if (contentTab === 'favorites') {
    const fabBottom = Math.max(insets.bottom, 12) + 8;

    return (
      <View style={s.favoritesScreen}>
        <ProductGrid
          products={favorites}
          onProductPress={handleProductPress}
          numColumns={3}
          cardVariant="imageOnly"
          favoriteRemoveEditMode={favoriteRemoveEditMode}
          onFavoriteRemoveEditModeChange={setFavoriteRemoveEditMode}
          contentPaddingBottom={
            favoriteRemoveEditMode && favorites.length > 0 ? FAVORITES_DONE_SCROLL_INSET : undefined
          }
          emptyMessage="No favorites yet. Tap the heart icon on products to add them here."
        />
        {favoriteRemoveEditMode ? (
          <View
            pointerEvents="box-none"
            style={[s.favoritesDoneFabWrap, { bottom: fabBottom }]}
          >
            <Pressable
              onPress={() => setFavoriteRemoveEditMode(false)}
              style={({ pressed }) => [
                s.favoritesDoneFab,
                {
                  backgroundColor: colors.tabActive,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
              accessibilityLabel="Done editing favorites"
            >
              <Text style={[s.favoritesDoneFabLabel, { color: colors.inverseText }]}>Done</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  if (selectedList) {
    const list = lists.find(l => l.id === selectedList);
    if (!list) return null;
    return (
      <View style={s.listView}>
        <View style={s.listHeader}>
          <Pressable onPress={() => setSelectedList(null)} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.tabActive} />
          </Pressable>
          <View style={s.listHeaderText}>
            <Text style={[s.listTitle, { color: colors.text }]}>{list.name}</Text>
            <Text style={[s.listCount, { color: colors.textSecondary }]}>
              {list.products.length} item{list.products.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Pressable onPress={() => handleDeleteList(list.id, list.name)} style={s.deleteButton}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </Pressable>
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
    <>
      <ScrollView style={s.listsContainer} contentInsetAdjustmentBehavior="automatic">
        <Pressable
          style={[s.createListButton, { borderColor: colors.tabActive }]}
          onPress={() => setShowNewListModal(true)}
        >
          <Ionicons name="add-circle-outline" size={32} color={colors.tabActive} />
          <Text style={s.createListText}>Create New List</Text>
        </Pressable>

        {lists.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="list-outline" size={64} color={colors.textTertiary} />
            <Text style={[s.emptyTitle, { color: colors.text }]}>No lists yet</Text>
            <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>
              Create lists to organize your favorite products
            </Text>
          </View>
        ) : (
          <View style={s.listsGrid}>
            {lists.map(list => (
              <Pressable
                key={list.id}
                style={[s.listCard, { backgroundColor: colors.surfaceRaised }]}
                onPress={() => setSelectedList(list.id)}
              >
                <View style={s.listCardHeader}>
                  <Ionicons name="list" size={24} color={colors.tabActive} />
                  <Text style={[s.listCardCount, { color: colors.text }]}>{list.products.length}</Text>
                </View>
                <Text style={[s.listCardName, { color: colors.text }]} numberOfLines={2}>
                  {list.name}
                </Text>
                <Text style={[s.listCardDate, { color: colors.textSecondary }]}>
                  {new Date(list.createdAt).toLocaleDateString()}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showNewListModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewListModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.surfaceRaised }]}>
            <Text style={[s.modalTitle, { color: colors.text }]}>Create New List</Text>
            <TextInput
              style={[
                s.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.inputText,
                  borderColor: colors.border,
                },
              ]}
              placeholder="List name"
              placeholderTextColor={colors.textTertiary}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={s.modalButtons}>
              <Pressable
                style={[s.modalButton, { backgroundColor: colors.surface }]}
                onPress={() => {
                  setShowNewListModal(false);
                  setNewListName('');
                }}
              >
                <Text style={[s.modalButtonTextCancel, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[s.modalButton, s.modalButtonCreate]} onPress={handleCreateList}>
                <Text style={s.modalButtonTextCreate}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    favoritesScreen: { flex: 1 },
    favoritesDoneFabWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      pointerEvents: 'box-none',
    },
    favoritesDoneFab: {
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 24,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 120,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 6,
    },
    favoritesDoneFabLabel: { fontSize: 17, fontWeight: '600' },
    listView: { flex: 1 },
    listHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
    backButton: { padding: 4, marginRight: 12 },
    listHeaderText: { flex: 1 },
    listTitle: { fontSize: 20, fontWeight: '700' },
    listCount: { fontSize: 14, marginTop: 2 },
    deleteButton: { padding: 4 },
    listsContainer: { flex: 1, paddingHorizontal: 16 },
    createListButton: {
      padding: 20,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    createListText: { fontSize: 16, fontWeight: '600', color: colors.tabActive, marginLeft: 12 },
    listsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    listCard: {
      width: '47%',
      padding: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    listCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    listCardCount: { fontSize: 18, fontWeight: '700' },
    listCardName: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    listCardDate: { fontSize: 12 },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      marginTop: 48,
    },
    emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center' },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: { borderRadius: 16, padding: 24, width: '80%', maxWidth: 400 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    modalInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalButtonCreate: { backgroundColor: colors.tabActive },
    modalButtonTextCancel: { fontSize: 16, fontWeight: '600' },
    modalButtonTextCreate: { fontSize: 16, fontWeight: '600', color: colors.inverseText },
  });
