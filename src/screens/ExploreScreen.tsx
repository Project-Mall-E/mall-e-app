// src/screens/ExploreScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, styles.headerTransparent]}>
        <View style={styles.headerLeft} />
        <Text style={[styles.headerTitle, { color: '#FFF' }]}>Explore</Text>
        <View style={styles.headerRight}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  headerTransparent: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'transparent', borderBottomWidth: 0, zIndex: 10 },
  headerLeft: { minWidth: 80 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerRight: { minWidth: 80, alignItems: 'flex-end' },
  feedContainer: { flex: 1, backgroundColor: '#000' },
  filterButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  filterButtonActive: { backgroundColor: '#007AFF' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF3B30', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});

export default ExploreScreen;
