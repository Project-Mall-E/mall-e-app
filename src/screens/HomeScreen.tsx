// src/screens/HomeScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../components/ProductGrid';
import FilterModal from '../components/FilterModal';
import { useProducts } from '../hooks/useProducts';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Product } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** Fixed collapse region (title row + search) for scroll-hide. */
const HEADER_TOP_PAD = 8;
const TITLE_ROW_HEIGHT = 40;
const SEARCH_GAP = 12;
const SEARCH_FILTER_GAP = 8;
const SEARCH_BAR_HEIGHT = 48;
const FILTER_BUTTON_SIZE = 48;
const HEADER_BOTTOM_PAD = 12;
const COLLAPSE_HEIGHT =
  HEADER_TOP_PAD + TITLE_ROW_HEIGHT + SEARCH_GAP + SEARCH_BAR_HEIGHT + HEADER_BOTTOM_PAD;
const COLLAPSE_HIDE_RANGE = COLLAPSE_HEIGHT + 24;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { subscribedStores } = useUser();
  const { searchProducts, loading, refreshing, refreshProducts, products } = useProducts();
  const { colors, dark } = useTheme();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  const queryActive = searchQuery.trim() !== '';
  const searchPillBg = dark ? colors.surfaceRaised : colors.inputBg;

  const headerFadeStyle = useMemo(
    () => ({
      opacity: scrollY.interpolate({
        inputRange: [0, COLLAPSE_HIDE_RANGE],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      }),
    }),
    [scrollY]
  );

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      }),
    [scrollY]
  );

  const displayProducts = useMemo(() => {
    let list = products.filter(p => subscribedStores.includes(p.store));
    if (selectedStores.length > 0) {
      list = list.filter(p => selectedStores.includes(p.store));
    }
    if (queryActive) {
      const allowed = new Set(list);
      list = searchProducts(searchQuery.trim()).filter(p => allowed.has(p));
    }
    return list;
  }, [products, subscribedStores, selectedStores, searchQuery, queryActive, searchProducts]);

  const emptyMessage = queryActive ? 'No products match your search' : undefined;

  const handleTagPress = useCallback((_tag: string) => {
    navigation.navigate('MainTabs', { screen: 'Search' });
  }, [navigation]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const listHeaderComponent = (
    <Animated.View
      style={[
        styles.listHeader,
        { backgroundColor: colors.background, borderBottomColor: colors.border },
        headerFadeStyle,
      ]}
    >
      <View style={styles.collapseContent}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Home</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: searchPillBg }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.inputText }]}
              placeholder="Search products in your stores..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {queryActive ? (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton} hitSlop={8}>
                <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            style={[
              styles.filterButton,
              { backgroundColor: colors.surface },
              selectedStores.length > 0 && { backgroundColor: colors.tabActive },
            ]}
            onPress={() => setShowFilter(true)}
            hitSlop={8}
          >
            <Ionicons
              name="filter"
              size={24}
              color={selectedStores.length > 0 ? colors.inverseText : colors.text}
            />
            {selectedStores.length > 0 ? (
              <View style={[styles.filterBadge, { backgroundColor: colors.error, borderColor: colors.background }]}>
                <Text style={[styles.filterBadgeText, { color: colors.inverseText }]}>
                  {selectedStores.length}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <ProductGrid
        loading={loading}
        refreshing={refreshing}
        onRefresh={refreshProducts}
        products={displayProducts}
        onProductPress={handleProductPress}
        onTagPress={handleTagPress}
        emptyMessage={emptyMessage}
        listHeaderComponent={listHeaderComponent}
        onScroll={onScroll}
      />

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        selectedStores={selectedStores}
        onStoresChange={setSelectedStores}
        showSubscribedOnly={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  collapseContent: {
    height: COLLAPSE_HEIGHT,
    paddingTop: HEADER_TOP_PAD,
    paddingBottom: HEADER_BOTTOM_PAD,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: TITLE_ROW_HEIGHT,
  },
  title: { fontSize: 28, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SEARCH_GAP,
    height: SEARCH_BAR_HEIGHT,
    gap: SEARCH_FILTER_GAP,
  },
  filterButton: {
    width: FILTER_BUTTON_SIZE,
    height: FILTER_BUTTON_SIZE,
    borderRadius: FILTER_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '700' },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: SEARCH_BAR_HEIGHT,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
    margin: 0,
  },
  clearButton: { padding: 4 },
});

export default HomeScreen;