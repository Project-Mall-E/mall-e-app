// src/components/FilterModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useProducts } from '../hooks/useProducts';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedStores: string[];
  onStoresChange: (stores: string[]) => void;
  showSubscribedOnly?: boolean;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  selectedStores,
  onStoresChange,
  showSubscribedOnly = false,
}) => {
  const { subscribedStores } = useUser();
  const { getAllStores } = useProducts();
  const allStores = getAllStores();

  const [filterSubscribedOnly, setFilterSubscribedOnly] = useState(showSubscribedOnly);

  const displayStores = filterSubscribedOnly
    ? allStores.filter(store => subscribedStores.includes(store))
    : allStores;

  const isStoreSelected = (store: string) => {
    return selectedStores.length === 0 || selectedStores.includes(store);
  };

  const handleStoreToggle = (store: string) => {
    if (selectedStores.includes(store)) {
      // Remove store from selection
      const newSelection = selectedStores.filter(s => s !== store);
      onStoresChange(newSelection);
    } else {
      // Add store to selection
      onStoresChange([...selectedStores, store]);
    }
  };

  const handleSelectAll = () => {
    // Clear all filters (show all stores)
    onStoresChange([]);
  };

  const handleClearAll = () => {
    // Select all displayed stores (effectively filtering to show only these)
    onStoresChange([...displayStores]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Stores</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#000" />
            </Pressable>
          </View>

          {!showSubscribedOnly && (
            <View style={styles.filterSection}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Subscribed stores only</Text>
                <Switch
                  value={filterSubscribedOnly}
                  onValueChange={setFilterSubscribedOnly}
                  trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          )}

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.actionButton}
              onPress={handleSelectAll}
            >
              <Text style={styles.actionButtonText}>
                Show All
              </Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={handleClearAll}
            >
              <Text style={styles.actionButtonText}>
                Clear Filters
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.storesList}>
            {displayStores.map(store => {
              const isSelected = isStoreSelected(store);
              const isSubscribed = subscribedStores.includes(store);

              return (
                <Pressable
                  key={store}
                  style={styles.storeItem}
                  onPress={() => handleStoreToggle(store)}
                >
                  <View style={styles.storeInfo}>
                    <View style={styles.storeNameRow}>
                      <Text style={styles.storeName}>{store}</Text>
                      {isSubscribed ? (
                        <View style={styles.subscribedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#007AFF" />
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected
                  ]}>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={styles.applyButton}
            onPress={onClose}
          >
            <Text style={styles.applyButtonText}>
              Apply {selectedStores.length > 0 ? `(${selectedStores.length})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderCurve: 'continuous',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  storesList: {
    maxHeight: 400,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  storeInfo: {
    flex: 1,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  subscribedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderCurve: 'continuous',
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default FilterModal;