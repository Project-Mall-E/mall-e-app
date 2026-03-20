// src/screens/ExploreScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductFeed from '../components/ProductFeed';
import FilterModal from '../components/FilterModal';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Product } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { products } = useProducts();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [showFilter, setShowFilter] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const shuffleArray = (array: Product[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => { setShuffledProducts(shuffleArray(products)); }, [products]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setShuffledProducts(shuffleArray(products));
    setSelectedStores([]);
    setTimeout(() => setRefreshing(false), 500);
  }, [products]);

  const handleTagPress = useCallback((_tag: string) => {
    navigation.navigate('MainTabs', { screen: 'Search' });
  }, [navigation]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const getDisplayProducts = () => {
    let filtered = shuffledProducts;
    if (selectedStores.length > 0) filtered = filtered.filter(p => selectedStores.includes(p.store));
    return filtered;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.filterWrap, { top: insets.top + 8 }]} pointerEvents="box-none">
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
      </View>

      <View style={styles.feedContainer}>
        <ProductFeed
          products={getDisplayProducts()}
          onProductPress={handleProductPress}
          onTagPress={handleTagPress}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      </View>

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        selectedStores={selectedStores}
        onStoresChange={setSelectedStores}
        showSubscribedOnly={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterWrap: { position: 'absolute', right: 12, zIndex: 10 },
  feedContainer: { flex: 1, backgroundColor: '#000' },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: '#007AFF', borderColor: 'rgba(255,255,255,0.25)' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});

export default ExploreScreen;
