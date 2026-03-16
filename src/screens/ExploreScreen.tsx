// src/screens/ExploreScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductFeed from '../components/ProductFeed';
import FilterModal from '../components/FilterModal';
import { useProducts } from '../hooks/useProducts';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Product, PublicList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExploreMode = 'selector' | 'stores' | 'lists';

const ExploreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { products } = useProducts();
  const { followUser, unfollowUser, isFollowing, currentUserId } = useUser();
  const { colors, dark } = useTheme();
  const isFocused = useIsFocused();
  const prevFocused = useRef(false);

  const [mode, setMode] = useState<ExploreMode>('selector');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [publicLists, setPublicLists] = useState<PublicList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Reset to selector when user re-taps the Explore tab
  useEffect(() => {
    if (isFocused && prevFocused.current && mode !== 'selector') {
      setMode('selector');
      setSelectedStores([]);
    }
    prevFocused.current = isFocused;
  }, [isFocused, mode]);

  const shuffleArray = (array: Product[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => { setShuffledProducts(shuffleArray(products)); }, [products]);

  const loadPublicLists = useCallback(async () => {
    setLoadingLists(true);
    try {
      const mockLists: PublicList[] = [
        { id: '1', name: 'Summer Essentials 🌞', description: 'My go-to items for summer', products: shuffledProducts.slice(0, 6), createdAt: new Date().toISOString(), user_id: 'user1', is_public: true, profile: { id: 'user1', username: 'fashionista', first_name: 'Sarah', last_name: 'Chen', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } },
        { id: '2', name: 'Cozy Fall Vibes 🍂', description: 'Perfect for autumn weather', products: shuffledProducts.slice(6, 12), createdAt: new Date().toISOString(), user_id: 'user2', is_public: true, profile: { id: 'user2', username: 'styleseeker', first_name: 'Alex', last_name: 'Rivera', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } },
      ];
      setPublicLists(mockLists);
    } catch (error) { console.error('Error loading public lists:', error); }
    finally { setLoadingLists(false); }
  }, [shuffledProducts]);

  useEffect(() => {
    if (mode === 'lists') loadPublicLists();
  }, [mode, loadPublicLists]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (mode === 'stores') { setShuffledProducts(shuffleArray(products)); setSelectedStores([]); }
    else if (mode === 'lists') loadPublicLists();
    setTimeout(() => setRefreshing(false), 500);
  }, [products, mode, loadPublicLists]);

  const handleTagPress = useCallback((_tag: string) => {
    navigation.navigate('MainTabs', { screen: 'Search' });
  }, [navigation]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const handleListPress = useCallback((list: PublicList) => {
    console.log('View list:', list.name);
  }, []);

  const handleUserPress = useCallback((userId: string) => {
    console.log('View user profile:', userId);
  }, []);

  const handleBackToSelector = () => { setMode('selector'); setSelectedStores([]); };

  const getDisplayProducts = () => {
    let filtered = shuffledProducts;
    if (selectedStores.length > 0) filtered = filtered.filter(p => selectedStores.includes(p.store));
    return filtered;
  };

  // ── Selector ──────────────────────────────────────────────────────────────
  if (mode === 'selector') {
    return (
      <View style={[styles.selectorBg, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.selectorSafe} edges={['top', 'bottom']}>
          <View style={styles.selectorContent}>
            <Text style={[styles.selectorTitle, { color: colors.text }]}>Explore</Text>
            <Text style={[styles.selectorSubtitle, { color: colors.textTertiary }]}>What would you like to discover?</Text>
            <View style={styles.cardsRow}>
              <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setMode('stores')}>
                <View style={[styles.cardIconWrap, { backgroundColor: dark ? '#0A84FF22' : '#E8F2FF' }]}>
                  <Ionicons name="storefront-outline" size={32} color="#0A84FF" />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Stores</Text>
                <Text style={[styles.cardSub, { color: colors.textTertiary }]}>Browse products from your favorite stores</Text>
                <View style={[styles.cardArrow, { backgroundColor: '#0A84FF' }]}>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </View>
              </Pressable>
              <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setMode('lists')}>
                <View style={[styles.cardIconWrap, { backgroundColor: dark ? '#FF375F22' : '#FFE8EC' }]}>
                  <Ionicons name="bookmark-outline" size={32} color="#FF375F" />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Lists</Text>
                <Text style={[styles.cardSub, { color: colors.textTertiary }]}>Curated collections made by other users</Text>
                <View style={[styles.cardArrow, { backgroundColor: '#FF375F' }]}>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </View>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Stores / Lists ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[
        styles.header,
        mode === 'stores' && styles.headerTransparent,
        mode !== 'stores' && { backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}>
        <Pressable style={styles.backButton} onPress={handleBackToSelector} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={28} color={mode === 'stores' ? '#FFF' : colors.text} />
          <Text style={[styles.backLabel, { color: mode === 'stores' ? '#FFF' : colors.text }]}>Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: mode === 'stores' ? '#FFF' : colors.text }]}>
          {mode === 'stores' ? 'Stores' : 'Lists'}
        </Text>
        <View style={styles.headerRight}>
          {mode === 'stores' && (
            <Pressable
              style={[styles.filterButton, selectedStores.length > 0 && styles.filterButtonActive]}
              onPress={() => setShowFilter(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="options-outline" size={24} color="#FFF" />
              {selectedStores.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{selectedStores.length}</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>

      {mode === 'stores' ? (
        <View style={styles.feedContainer}>
          <ProductFeed products={getDisplayProducts()} onProductPress={handleProductPress} onTagPress={handleTagPress} onRefresh={handleRefresh} refreshing={refreshing} />
        </View>
      ) : (
        <ScrollView style={[styles.listsContainer, { backgroundColor: colors.surface }]} contentContainerStyle={styles.listsContent} showsVerticalScrollIndicator={false}>
          {loadingLists ? (
            <View style={styles.emptyState}><Text style={[styles.emptyText, { color: colors.textTertiary }]}>Loading lists...</Text></View>
          ) : publicLists.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="list-outline" size={48} color={colors.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Public Lists Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Create and share your own curated lists</Text>
            </View>
          ) : (
            publicLists.map(list => (
              <View key={list.id} style={[styles.listCard, { backgroundColor: colors.surfaceRaised }]}>
                <View style={styles.listHeader}>
                  <Pressable style={styles.listUserInfo} onPress={() => list.user_id && handleUserPress(list.user_id)}>
                    <View style={styles.listAvatar}>
                      <Text style={styles.listAvatarText}>
                        {(list.profile?.username?.[0] || list.profile?.first_name?.[0] || 'U').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.listUserText}>
                      <Text style={[styles.listUsername, { color: colors.text }]}>{list.profile?.username || list.profile?.first_name || 'User'}</Text>
                      <Text style={[styles.listTimestamp, { color: colors.textTertiary }]}>{new Date(list.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </Pressable>
                  {list.user_id && list.user_id !== currentUserId ? <Pressable
                      style={[styles.followButtonSmall, isFollowing(list.user_id) ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border } : undefined]}
                      onPress={() => { isFollowing(list.user_id!) ? unfollowUser(list.user_id!) : followUser(list.user_id!); }}
                    >
                      <Ionicons name={isFollowing(list.user_id) ? 'checkmark' : 'add'} size={16} color={isFollowing(list.user_id) ? colors.textSecondary : '#FFF'} />
                    </Pressable> : null}
                </View>
                <Pressable onPress={() => handleListPress(list)}>
                  <Text style={[styles.listTitle, { color: colors.text }]}>{list.name}</Text>
                  {list.description ? <Text style={[styles.listDescription, { color: colors.textSecondary }]}>{list.description}</Text> : null}
                  <View style={styles.listProductGrid}>
                    {list.products.slice(0, 4).map((product, index) => (
                      <View key={index} style={[styles.listProductItem, { backgroundColor: colors.surface }]}>
                        <Image source={{ uri: product.item_image_link }} style={styles.listProductImage} resizeMode="cover" />
                      </View>
                    ))}
                    {list.products.length > 4 && (
                      <View style={[styles.listProductItem, styles.listProductMore, { backgroundColor: colors.border }]}>
                        <Text style={[styles.listProductMoreText, { color: colors.textSecondary }]}>+{list.products.length - 4}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.listFooter, { borderTopColor: colors.surface }]}>
                    <View style={styles.listStats}>
                      <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.listStatsText, { color: colors.textSecondary }]}>{Math.floor(Math.random() * 100) + 10} likes</Text>
                    </View>
                    <Text style={[styles.listItemCount, { color: colors.textTertiary }]}>{list.products.length} {list.products.length === 1 ? 'item' : 'items'}</Text>
                  </View>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <FilterModal visible={showFilter} onClose={() => setShowFilter(false)} selectedStores={selectedStores} onStoresChange={setSelectedStores} showSubscribedOnly={false} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  selectorBg: { flex: 1 },
  selectorSafe: { flex: 1 },
  selectorContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  selectorTitle: { fontSize: 40, fontWeight: '700', marginBottom: 8, letterSpacing: -1 },
  selectorSubtitle: { fontSize: 16, marginBottom: 40 },
  cardsRow: { gap: 16 },
  card: { borderRadius: 20, padding: 24, borderWidth: 1 },
  cardIconWrap: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  cardSub: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  cardArrow: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  headerTransparent: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'transparent', borderBottomWidth: 0, zIndex: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingRight: 16, minWidth: 80 },
  backLabel: { fontSize: 17, fontWeight: '500', marginLeft: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerRight: { minWidth: 80, alignItems: 'flex-end' },
  feedContainer: { flex: 1, backgroundColor: '#000' },
  filterButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  filterButtonActive: { backgroundColor: '#007AFF' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  listsContainer: { flex: 1 },
  listsContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  emptyIconContainer: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 15 },
  emptyText: { fontSize: 16 },
  listCard: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  listUserInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  listAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  listAvatarText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  listUserText: { flex: 1 },
  listUsername: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  listTimestamp: { fontSize: 12 },
  followButtonSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  listTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  listDescription: { fontSize: 15, marginBottom: 12, lineHeight: 20 },
  listProductGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  listProductItem: { flex: 1, aspectRatio: 1, borderRadius: 8, overflow: 'hidden' },
  listProductImage: { width: '100%', height: '100%' },
  listProductMore: { justifyContent: 'center', alignItems: 'center' },
  listProductMoreText: { fontSize: 16, fontWeight: '700' },
  listFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  listStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listStatsText: { fontSize: 14, fontWeight: '500' },
  listItemCount: { fontSize: 14, fontWeight: '500' },
});

export default ExploreScreen;