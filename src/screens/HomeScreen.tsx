// src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../components/ProductGrid';
import FilterModal from '../components/FilterModal';
import SubscriptionsModal from '../components/SubscriptionsModal';
import { useProducts } from '../hooks/useProducts';
import { useUser } from '../context/UserContext';
import { RootStackParamList, Product } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { subscribedStores } = useUser();
  const { getProductsByStore, searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  const getDisplayProducts = () => {
    // Get products from subscribed stores
    let products = getProductsByStore(subscribedStores);

    // Apply store filter if specific stores are selected
    if (selectedStores.length > 0) {
      products = products.filter(p => selectedStores.includes(p.store));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searched = searchProducts(searchQuery);
      products = products.filter(p =>
        searched.some(sp => sp.item_link === p.item_link)
      );
    }

    return products;
  };

  const displayProducts = getDisplayProducts();

  const handleTagPress = useCallback((tag: string) => {
    setSearchQuery(tag);
    setShowSearch(true);
  }, []);

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { product });
    },
    [navigation]
  );

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch && searchQuery) {
      setSearchQuery('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.iconButton}
            onPress={() => setShowSubscriptions(true)}
          >
            <Ionicons name="settings-outline" size={24} color="#000" />
          </Pressable>
          <Pressable
            style={[styles.iconButton, selectedStores.length > 0 && styles.iconButtonActive]}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons name="filter" size={24} color="#000" />
            {selectedStores.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedStores.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={[styles.iconButton, showSearch && styles.iconButtonActive]}
            onPress={toggleSearch}
          >
            <Ionicons
              name={showSearch ? "close" : "search"}
              size={24}
              color="#000"
            />
          </Pressable>
        </View>
      </View>

      {showSearch ? (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your feed..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <ProductGrid
        products={displayProducts}
        onProductPress={handleProductPress}
        onTagPress={handleTagPress}
      />

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        selectedStores={selectedStores}
        onStoresChange={setSelectedStores}
        showSubscribedOnly={true}
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
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 18,
    height: 18,
    borderRadius: 9,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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

export default HomeScreen;