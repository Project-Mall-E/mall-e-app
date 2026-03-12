import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';
import { useUser } from '../context/UserContext';
import { RootStackParamList, Product } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { subscribedStores, toggleStoreSubscription } = useUser();
  const { products, getAllStores, loading, searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const allStores = getAllStores();

  const getDisplayProducts = () => {
    let filtered = products;

    if (selectedStore) {
      filtered = filtered.filter(p => p.store === selectedStore);
    }

    if (searchQuery) {
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

  const handleStorePress = (storeName: string) => {
    setSelectedStore(selectedStore === storeName ? null : storeName);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover from all stores</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search all products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storesScroll}
        contentContainerStyle={styles.storesContainer}
      >
        {allStores.map(store => {
          const isSubscribed = subscribedStores.includes(store);
          const isSelected = selectedStore === store;
          return (
            <TouchableOpacity
              key={store}
              style={[
                styles.storeChip,
                isSelected && styles.storeChipSelected,
              ]}
              onPress={() => handleStorePress(store)}
            >
              <Text
                style={[
                  styles.storeChipText,
                  isSelected && styles.storeChipTextSelected,
                ]}
              >
                {store}
              </Text>
              {isSubscribed && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={isSelected ? '#FFF' : '#007AFF'}
                  style={styles.checkmark}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ProductGrid
        products={displayProducts}
        onProductPress={handleProductPress}
        loading={loading}
        emptyMessage="No products found"
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  storesScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 10,
  },
  storesContainer: {
    paddingHorizontal: 16,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  storeChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  storeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  storeChipTextSelected: {
    color: '#FFF',
  },
  checkmark: {
    marginLeft: 6,
  },
});

export default ExploreScreen;