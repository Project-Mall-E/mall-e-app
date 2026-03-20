// src/screens/HomeScreen.tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { subscribedStores } = useUser();
  const { getProductsByStore, loading, refreshing, refreshProducts } = useProducts();
  const { colors } = useTheme();
  const [showFilter, setShowFilter] = React.useState(false);
  const [selectedStores, setSelectedStores] = React.useState<string[]>([]);

  const getDisplayProducts = () => {
    let products = getProductsByStore(subscribedStores);
    if (selectedStores.length > 0) {
      products = products.filter(p => selectedStores.includes(p.store));
    }
    return products;
  };

  const handleTagPress = useCallback((_tag: string) => {
    navigation.navigate('MainTabs', { screen: 'Search' });
  }, [navigation]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Home</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface },
              selectedStores.length > 0 && { backgroundColor: colors.tabActive },
            ]}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons
              name="filter"
              size={24}
              color={selectedStores.length > 0 ? colors.inverseText : colors.text}
            />
            {selectedStores.length > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.error, borderColor: colors.background }]}>
                <Text style={[styles.filterBadgeText, { color: colors.inverseText }]}>
                  {selectedStores.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ProductGrid
        loading={loading}
        refreshing={refreshing}
        onRefresh={refreshProducts}
        products={getDisplayProducts()}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '700' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
});

export default HomeScreen;