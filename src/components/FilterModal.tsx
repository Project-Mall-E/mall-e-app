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
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();
  const s = makeStyles(colors);
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
      const newSelection = selectedStores.filter(sel => sel !== store);
      onStoresChange(newSelection);
    } else {
      onStoresChange([...selectedStores, store]);
    }
  };

  const handleSelectAll = () => {
    onStoresChange([]);
  };

  const handleClearAll = () => {
    onStoresChange([...displayStores]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.container}>
          <View style={s.header}>
            <Text style={s.title}>Filter Stores</Text>
            <Pressable onPress={onClose} style={s.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
          </View>

          {!showSubscribedOnly && (
            <View style={s.filterSection}>
              <View style={s.filterRow}>
                <Text style={s.filterLabel}>Subscribed stores only</Text>
                <Switch
                  value={filterSubscribedOnly}
                  onValueChange={setFilterSubscribedOnly}
                  trackColor={{ false: colors.border, true: colors.tabActive }}
                  thumbColor={colors.inverseText}
                />
              </View>
            </View>
          )}

          <View style={s.actionsRow}>
            <Pressable style={s.actionButton} onPress={handleSelectAll}>
              <Text style={s.actionButtonText}>Show All</Text>
            </Pressable>
            <Pressable style={s.actionButton} onPress={handleClearAll}>
              <Text style={s.actionButtonText}>Clear Filters</Text>
            </Pressable>
          </View>

          <ScrollView style={s.storesList}>
            {displayStores.map(store => {
              const isSelected = isStoreSelected(store);
              const isSubscribed = subscribedStores.includes(store);

              return (
                <Pressable
                  key={store}
                  style={s.storeItem}
                  onPress={() => handleStoreToggle(store)}
                >
                  <View style={s.storeInfo}>
                    <View style={s.storeNameRow}>
                      <Text style={s.storeName}>{store}</Text>
                      {isSubscribed ? (
                        <View style={s.subscribedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color={colors.tabActive} />
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={18} color={colors.inverseText} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={s.applyButton} onPress={onClose}>
            <Text style={s.applyButtonText}>
              Apply {selectedStores.length > 0 ? `(${selectedStores.length})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.surfaceRaised,
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
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    filterSection: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    actionsRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionButton: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderCurve: 'continuous',
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.tabActive,
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
      borderBottomColor: colors.border,
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
      color: colors.text,
    },
    subscribedBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderCurve: 'continuous',
      backgroundColor: colors.accentMuted,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderCurve: 'continuous',
      borderWidth: 2,
      borderColor: colors.textTertiary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.tabActive,
      borderColor: colors.tabActive,
    },
    applyButton: {
      backgroundColor: colors.tabActive,
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
      color: colors.inverseText,
    },
  });

export default FilterModal;
