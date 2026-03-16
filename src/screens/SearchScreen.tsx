// src/screens/SearchScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { RootStackParamList, Product, Profile } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'all' | 'stores' | 'products' | 'users';

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { subscribedStores, toggleStoreSubscription, followUser, unfollowUser, isFollowing, currentUserId } = useUser();
  const { getAllStores, searchProducts } = useProducts();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const allStores = getAllStores();

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) { console.error('Error fetching profiles:', error); }
  };

  const getFilteredStores = () => !searchQuery.trim() ? [] : allStores.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
  const getSearchedProducts = () => !searchQuery.trim() ? [] : searchProducts(searchQuery);
  const getFilteredUsers = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return profiles.filter(p =>
      (p.username?.toLowerCase() || '').includes(q) ||
      (p.first_name?.toLowerCase() || '').includes(q) ||
      (p.last_name?.toLowerCase() || '').includes(q)
    );
  };

  const filteredStores = getFilteredStores();
  const searchedProducts = getSearchedProducts();
  const filteredUsers = getFilteredUsers();

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const handleUserPress = useCallback((userId: string) => {
    console.log('Navigate to user:', userId);
  }, []);

  const showStores = activeFilter === 'all' || activeFilter === 'stores';
  const showProducts = activeFilter === 'all' || activeFilter === 'products';
  const showUsers = activeFilter === 'all' || activeFilter === 'users';
  const hasResults =
    (showStores && filteredStores.length > 0) ||
    (showProducts && searchedProducts.length > 0) ||
    (showUsers && filteredUsers.length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Search</Text>
      </View>

      <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search stores, products, or users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {(['all', 'stores', 'products', 'users'] as FilterType[]).map(f => (
            <Pressable
              key={f}
              style={[styles.filterPill, { backgroundColor: colors.surface }, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              {f !== 'all' && (
                <Ionicons
                  name={f === 'stores' ? 'storefront' : f === 'products' ? 'grid' : 'people'}
                  size={16}
                  color={activeFilter === f ? '#FFF' : colors.textTertiary}
                  style={styles.filterPillIcon}
                />
              )}
              <Text style={[styles.filterPillText, { color: colors.textTertiary }, activeFilter === f && styles.filterPillTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery.trim() === '' ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="search" size={48} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Search Everything</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Find stores, products, and users all in one place</Text>
          </View>
        ) : !hasResults ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="sad-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Try a different search term</Text>
          </View>
        ) : (
          <>
            {showStores && filteredStores.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Stores ({filteredStores.length})</Text>
                <View style={[styles.storesList, { backgroundColor: colors.surfaceRaised }]}>
                  {filteredStores.map((store, index) => {
                    const isSubscribed = subscribedStores.includes(store);
                    return (
                      <View key={store} style={[styles.storeItem, { borderBottomColor: colors.surface }, index === filteredStores.length - 1 && styles.storeItemLast]}>
                        <View style={styles.storeInfo}>
                          <View style={[styles.storeIconContainer, { backgroundColor: colors.surface }, isSubscribed && styles.storeIconActive]}>
                            <Ionicons name={isSubscribed ? 'storefront' : 'storefront-outline'} size={20} color={isSubscribed ? '#007AFF' : colors.textTertiary} />
                          </View>
                          <Text style={[styles.storeName, { color: colors.text }]}>{store}</Text>
                        </View>
                        <Pressable style={styles.subscribeButton} onPress={() => toggleStoreSubscription(store)} hitSlop={8}>
                          <Ionicons name={isSubscribed ? 'checkmark-circle' : 'add-circle-outline'} size={26} color="#007AFF" />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {showProducts && searchedProducts.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Products ({searchedProducts.length})</Text>
                <View style={styles.productsGrid}>
                  {searchedProducts.slice(0, 20).map((product, index) => (
                    <Pressable
                      key={`${product.store}-${product.item_name}-${index}`}
                      style={[styles.productCard, { backgroundColor: colors.surfaceRaised }]}
                      onPress={() => handleProductPress(product)}
                    >
                      <Image source={{ uri: product.item_image_link }} style={styles.productImage} resizeMode="cover" />
                      <View style={styles.productInfo}>
                        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.item_name}</Text>
                        <Text style={styles.productPrice}>{product.price}</Text>
                        <Text style={[styles.productStore, { color: colors.textTertiary }]}>{product.store}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {showUsers && filteredUsers.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Users ({filteredUsers.length})</Text>
                <View style={[styles.usersList, { backgroundColor: colors.surfaceRaised }]}>
                  {filteredUsers.map((profile, index) => {
                    const isCurrentUser = profile.id === currentUserId;
                    const following = isFollowing(profile.id);
                    return (
                      <View key={profile.id} style={[styles.userItem, { borderBottomColor: colors.surface }, index === filteredUsers.length - 1 && styles.userItemLast]}>
                        <Pressable style={styles.userPressable} onPress={() => handleUserPress(profile.id)}>
                          <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>
                                {(profile.username?.[0] || profile.first_name?.[0] || 'U').toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: colors.text }]}>
                              {profile.username || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous'}
                            </Text>
                            {profile.username && (profile.first_name || profile.last_name) && (
                              <Text style={[styles.userSubtext, { color: colors.textSecondary }]}>
                                {`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                              </Text>
                            )}
                          </View>
                        </Pressable>
                        {!isCurrentUser && (
                          <Pressable
                            style={[styles.followButton, following && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                            onPress={() => following ? unfollowUser(profile.id) : followUser(profile.id)}
                            hitSlop={8}
                          >
                            <Text style={[styles.followButtonText, following && { color: colors.text }]}>
                              {following ? 'Following' : 'Follow'}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: 0.4 },
  searchWrapper: { paddingHorizontal: 16, paddingBottom: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 17 },
  clearButton: { padding: 4 },
  filterContainer: { paddingBottom: 12, borderBottomWidth: 1 },
  filterScrollContent: { paddingHorizontal: 16, gap: 8 },
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterPillActive: { backgroundColor: '#007AFF' },
  filterPillIcon: { marginRight: 4 },
  filterPillText: { fontSize: 15, fontWeight: '600' },
  filterPillTextActive: { color: '#FFF' },
  content: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100, paddingHorizontal: 40 },
  emptyIconContainer: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 20 },
  section: { marginTop: 24, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 },
  storesList: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  storeItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  storeItemLast: { borderBottomWidth: 0 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  storeIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  storeIconActive: { backgroundColor: '#E3F2FD' },
  storeName: { fontSize: 17, fontWeight: '600' },
  subscribeButton: { padding: 4 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  productCard: { width: '48%', marginHorizontal: '1%', marginBottom: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productImage: { width: '100%', aspectRatio: 1 },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 4, lineHeight: 18 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#007AFF', marginBottom: 4 },
  productStore: { fontSize: 12 },
  usersList: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  userItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  userItemLast: { borderBottomWidth: 0 },
  userPressable: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  userSubtext: { fontSize: 14 },
  followButton: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: '#007AFF', marginLeft: 12 },
  followButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});

export default SearchScreen;