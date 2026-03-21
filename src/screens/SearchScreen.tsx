// src/screens/SearchScreen.tsx
import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { useSupabaseProductSearch } from '../hooks/useSupabaseProductSearch';
import { useUser } from '../context/UserContext';
import { useTheme, lightColors } from '../context/ThemeContext';
import DiscoverySection from '../components/DiscoverySection';
import ProductGrid from '../components/ProductGrid';
import {
  applyTagFilter,
  shufflePick,
  DISCOVERY_ROW_LIMIT,
} from '../utils/discoveryFeed';
import { RootStackParamList, Product } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'all' | 'stores' | 'products';

/** Future: load from UserContext / profile when default tags are supported. */
const DISCOVERY_DEFAULT_TAGS: string[] = [];

type SearchStoresHeaderProps = {
  colors: typeof lightColors;
  filteredStores: string[];
  subscribedStores: string[];
  toggleStoreSubscription: (s: string) => void;
};

const SearchStoresHeader = memo(function SearchStoresHeader({
  colors,
  filteredStores,
  subscribedStores,
  toggleStoreSubscription,
}: SearchStoresHeaderProps) {
  return (
    <View style={headerStyles.headerRoot}>
      {filteredStores.length > 0 ? (
        <View style={headerStyles.block}>
          <Text style={[headerStyles.sectionTitle, { color: colors.text }]}>
            Stores ({filteredStores.length})
          </Text>
          <View style={[headerStyles.storesList, { backgroundColor: colors.surfaceRaised }]}>
            {filteredStores.map((store, index) => {
              const isSubscribed = subscribedStores.includes(store);
              return (
                <View
                  key={store}
                  style={[
                    headerStyles.storeItem,
                    { borderBottomColor: colors.surface },
                    index === filteredStores.length - 1 && headerStyles.storeItemLast,
                  ]}
                >
                  <View style={headerStyles.storeInfo}>
                    <View
                      style={[
                        headerStyles.storeIconContainer,
                        { backgroundColor: colors.surface },
                        isSubscribed && { backgroundColor: colors.accentMuted },
                      ]}
                    >
                      <Ionicons
                        name={isSubscribed ? 'storefront' : 'storefront-outline'}
                        size={20}
                        color={isSubscribed ? colors.tabActive : colors.textTertiary}
                      />
                    </View>
                    <Text style={[headerStyles.storeName, { color: colors.text }]}>{store}</Text>
                  </View>
                  <Pressable
                    style={headerStyles.subscribeButton}
                    onPress={() => toggleStoreSubscription(store)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'}
                      size={26}
                      color={colors.tabActive}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {filteredStores.length > 0 ? (
        <Text style={[headerStyles.productsHeading, { color: colors.text }]}>Products</Text>
      ) : null}
    </View>
  );
});

const headerStyles = StyleSheet.create({
  headerRoot: { paddingBottom: 8 },
  block: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', paddingHorizontal: 4, marginBottom: 12 },
  productsHeading: { fontSize: 20, fontWeight: '700', paddingHorizontal: 4, marginBottom: 4, marginTop: 8 },
  storesList: { borderRadius: 12, overflow: 'hidden' },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  storeItemLast: { borderBottomWidth: 0 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  storeIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  storeName: { fontSize: 17, fontWeight: '600' },
  subscribeButton: { padding: 4 },
});

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { subscribedStores, toggleStoreSubscription } = useUser();
  const { products, getAllStores, loading, refreshProducts } = useProducts();
  const { colors, dark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveryShuffleKey, setDiscoveryShuffleKey] = useState(0);
  const [discoveryRefreshing, setDiscoveryRefreshing] = useState(false);

  const { data: rpcProducts, loading: searchLoading, error: searchError } = useSupabaseProductSearch(searchQuery);

  const allStores = getAllStores();

  const filteredForTags = useMemo(
    () => applyTagFilter(products, DISCOVERY_DEFAULT_TAGS),
    [products]
  );

  const newItemsRow = useMemo(() => {
    return shufflePick(filteredForTags, DISCOVERY_ROW_LIMIT);
  }, [filteredForTags, discoveryShuffleKey]);

  const discoverShopsRow = useMemo(() => {
    const pool = products.filter(p => !subscribedStores.includes(p.store));
    const tagged = applyTagFilter(pool, DISCOVERY_DEFAULT_TAGS);
    return shufflePick(tagged, DISCOVERY_ROW_LIMIT);
  }, [products, subscribedStores, discoveryShuffleKey]);

  const getFilteredStores = () =>
    !searchQuery.trim() ? [] : allStores.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredStores = getFilteredStores();

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { product });
    },
    [navigation]
  );

  const handleTagPress = useCallback(
    (tag: string) => {
      setSearchQuery(tag);
      setActiveFilter('products');
    },
    []
  );

  const handleDiscoveryRefresh = useCallback(async () => {
    setDiscoveryRefreshing(true);
    try {
      setDiscoveryShuffleKey(k => k + 1);
      await refreshProducts();
    } finally {
      setDiscoveryRefreshing(false);
    }
  }, [refreshProducts]);

  const showStores = activeFilter === 'all' || activeFilter === 'stores';
  const showProducts = activeFilter === 'all' || activeFilter === 'products';

  const productsHitOrLoading = searchLoading || rpcProducts.length > 0;
  const productSearchFailed = searchError != null;

  const hasResults = useMemo(() => {
    if (!searchQuery.trim()) return false;
    if (activeFilter === 'stores') return filteredStores.length > 0;
    if (activeFilter === 'products') return productsHitOrLoading || productSearchFailed;
    return (showStores && filteredStores.length > 0) || productsHitOrLoading || productSearchFailed;
  }, [
    searchQuery,
    activeFilter,
    filteredStores.length,
    productsHitOrLoading,
    productSearchFailed,
    showStores,
  ]);

  const queryActive = searchQuery.trim() !== '';
  const searchPillBg = dark ? colors.surfaceRaised : colors.inputBg;

  const listHeader = useMemo(() => {
    if (activeFilter !== 'all') return null;
    if (filteredStores.length === 0) return null;
    return (
      <SearchStoresHeader
        colors={colors}
        filteredStores={filteredStores}
        subscribedStores={subscribedStores}
        toggleStoreSubscription={toggleStoreSubscription}
      />
    );
  }, [activeFilter, filteredStores, colors, subscribedStores, toggleStoreSubscription]);

  const productEmptyMessage = searchError
    ? 'Search could not load results. Check your connection and try again.'
    : 'No products found';

  const renderSearchResults = () => {
    if (!hasResults) {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceRaised }]}>
            <Ionicons name="sad-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {searchError ? productEmptyMessage : 'Try a different search term'}
          </Text>
        </View>
      );
    }

    if (activeFilter === 'stores') {
      return (
        <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Stores ({filteredStores.length})</Text>
            <View style={[styles.storesList, { backgroundColor: colors.surfaceRaised }]}>
              {filteredStores.map((store, index) => {
                const isSubscribed = subscribedStores.includes(store);
                return (
                  <View
                    key={store}
                    style={[
                      styles.storeItem,
                      { borderBottomColor: colors.surface },
                      index === filteredStores.length - 1 && styles.storeItemLast,
                    ]}
                  >
                    <View style={styles.storeInfo}>
                      <View
                        style={[
                          styles.storeIconContainer,
                          { backgroundColor: colors.surface },
                          isSubscribed && { backgroundColor: colors.accentMuted },
                        ]}
                      >
                        <Ionicons
                          name={isSubscribed ? 'storefront' : 'storefront-outline'}
                          size={20}
                          color={isSubscribed ? colors.tabActive : colors.textTertiary}
                        />
                      </View>
                      <Text style={[styles.storeName, { color: colors.text }]}>{store}</Text>
                    </View>
                    <Pressable
                      style={styles.subscribeButton}
                      onPress={() => toggleStoreSubscription(store)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'}
                        size={26}
                        color={colors.tabActive}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      );
    }

    if (showProducts) {
      return (
        <View style={styles.flex}>
          <ProductGrid
            products={rpcProducts}
            onProductPress={handleProductPress}
            onTagPress={handleTagPress}
            loading={searchLoading}
            listHeaderComponent={listHeader}
            emptyMessage={productEmptyMessage}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {queryActive ? (
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Search</Text>
        </View>
      ) : null}

      <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
        <View style={[styles.searchContainer, { backgroundColor: searchPillBg }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for products across all stores..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {queryActive ? (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {queryActive ? (
        <View style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {(['all', 'stores', 'products'] as FilterType[]).map(f => (
              <Pressable
                key={f}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.surfaceRaised },
                  activeFilter === f && { backgroundColor: colors.tabActive },
                ]}
                onPress={() => setActiveFilter(f)}
              >
                {f !== 'all' && (
                  <Ionicons
                    name={f === 'stores' ? 'storefront' : 'grid'}
                    size={16}
                    color={activeFilter === f ? colors.inverseText : colors.textTertiary}
                    style={styles.filterPillIcon}
                  />
                )}
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === f ? { color: colors.inverseText } : { color: colors.textTertiary },
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {!queryActive ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.discoveryScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={discoveryRefreshing}
              onRefresh={handleDiscoveryRefresh}
              tintColor={colors.tabActive}
            />
          }
        >
          {loading && products.length === 0 ? (
            <View style={styles.discoveryLoading}>
              <ActivityIndicator size="large" color={colors.tabActive} />
              <Text style={[styles.discoveryLoadingText, { color: colors.textSecondary }]}>Loading picks…</Text>
            </View>
          ) : (
            <View style={styles.discoverySections}>
              <DiscoverySection
                eyebrow="For you"
                title="New Items"
                products={newItemsRow}
                onProductPress={handleProductPress}
                emptyMessage={products.length === 0 ? 'No products yet. Pull to refresh.' : undefined}
              />
              {products.length > 0 ? (
                <DiscoverySection
                  eyebrow="For you"
                  title="Discover New Shops"
                  products={discoverShopsRow}
                  onProductPress={handleProductPress}
                  emptyMessage="You're following every shop we have — nice! We are constantly adding new stores and products, so check back soon."
                />
              ) : null}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.content}>{renderSearchResults()}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: 0.3 },
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 26,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 13, minHeight: 24 },
  clearButton: { padding: 4 },
  filterContainer: { paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  filterScrollContent: { paddingHorizontal: 16, gap: 8 },
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterPillIcon: { marginRight: 4 },
  filterPillText: { fontSize: 15, fontWeight: '600' },
  content: { flex: 1 },
  discoveryScrollContent: { paddingTop: 8, paddingBottom: 32 },
  discoverySections: { paddingHorizontal: 16 },
  discoveryLoading: {
    paddingTop: 80,
    paddingBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  discoveryLoadingText: { fontSize: 15 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 20 },
  section: { marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 },
  storesList: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  storeItemLast: { borderBottomWidth: 0 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  storeIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  storeName: { fontSize: 17, fontWeight: '600' },
  subscribeButton: { padding: 4 },
});

export default SearchScreen;
