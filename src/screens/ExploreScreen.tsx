// src/screens/ExploreScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductFeed from '../components/ProductFeed';
import FilterModal from '../components/FilterModal';
import SubscriptionsModal from '../components/SubscriptionsModal';
import { useProducts } from '../hooks/useProducts';
import { useUser } from '../context/UserContext';
import { RootStackParamList, BottomTabParamList, Product } from '../types';

type ExploreRouteProp = RouteProp<BottomTabParamList, 'Explore'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExploreRouteProp>();
  const { subscribedStores: _subscribedStores } = useUser();
  const { products, searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Shuffle products function
  const shuffleArray = (array: Product[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initial shuffle
  useEffect(() => {
    setShuffledProducts(shuffleArray(products));
  }, [products]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    // Shuffle products
    setShuffledProducts(shuffleArray(products));

    // Reset filters and search
    setSearchQuery('');
    setSelectedStores([]);
    setShowSearch(false);

    // Simulate a brief refresh animation
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [products]);

  // Listen for refresh parameter
  useEffect(() => {
    if (route.params?.refresh) {
      handleRefresh();
    }
  }, [route.params?.refresh, handleRefresh]);

  const handleTagPress = (tag: string) => {
    setSearchQuery(tag);
    setShowSearch(true);
  };

  const getDisplayProducts = () => {
    // Show ALL products for doomscrolling exploration
    let filtered = shuffledProducts;

    // Apply store filter if specific stores are selected
    if (selectedStores.length > 0) {
      filtered = filtered.filter(p => selectedStores.includes(p.store));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searched = searchProducts(searchQuery);
      filtered = filtered.filter(p =>
        searched.some(sp => sp.item_link === p.item_link)
      );
    }

    return filtered;
  };

  const displayProducts = getDisplayProducts();

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch && searchQuery) {
      setSearchQuery('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowSubscriptions(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, selectedStores.length > 0 && styles.iconButtonActive]}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="filter" size={24} color="#000" />
          {selectedStores.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedStores.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, showSearch && styles.iconButtonActive]}
          onPress={toggleSearch}
        >
          <Ionicons name={showSearch ? "close" : "search"} size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search everything..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ProductFeed
        products={displayProducts}
        onProductPress={handleProductPress}
        onTagPress={handleTagPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        selectedStores={selectedStores}
        onStoresChange={setSelectedStores}
        showSubscribedOnly={false}
      />

      <SubscriptionsModal
        visible={showSubscriptions}
        onClose={() => setShowSubscriptions(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  iconButtonActive: {
    backgroundColor: '#FF3B30',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 160,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});

export default ExploreScreen;