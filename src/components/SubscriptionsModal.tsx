// src/components/SubscriptionsModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../context/ThemeContext';

interface SubscriptionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const { subscribedStores, toggleStoreSubscription } = useUser();
  const { getAllStores } = useProducts();
  const allStores = getAllStores();

  const subscribedList = allStores.filter(store => subscribedStores.includes(store));
  const availableList = allStores.filter(store => !subscribedStores.includes(store));

  const handleToggle = (store: string) => {
    toggleStoreSubscription(store);
  };

  const handleSubscribeAll = () => {
    Alert.alert(
      'Subscribe to All',
      `Subscribe to all ${availableList.length} stores?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            availableList.forEach(store => {
              if (!subscribedStores.includes(store)) {
                toggleStoreSubscription(store);
              }
            });
          },
        },
      ]
    );
  };

  const handleUnsubscribeAll = () => {
    Alert.alert(
      'Unsubscribe from All',
      'Remove all store subscriptions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe',
          style: 'destructive',
          onPress: () => {
            subscribedList.forEach(store => {
              toggleStoreSubscription(store);
            });
          },
        },
      ]
    );
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
            <Text style={s.title}>Subscriptions</Text>
            <Pressable onPress={onClose} style={s.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
          </View>

          <View style={s.stats}>
            <View style={s.statItem}>
              <Text style={s.statNumber}>{subscribedStores.length}</Text>
              <Text style={s.statLabel}>Subscribed</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statNumber}>{allStores.length}</Text>
              <Text style={s.statLabel}>Total Stores</Text>
            </View>
          </View>

          <ScrollView style={s.content}>
            {subscribedList.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>
                    Subscribed ({subscribedList.length})
                  </Text>
                  {subscribedList.length > 1 && (
                    <Pressable onPress={handleUnsubscribeAll}>
                      <Text style={s.sectionAction}>Remove All</Text>
                    </Pressable>
                  )}
                </View>
                {subscribedList.map(store => (
                  <View key={store} style={s.storeItem}>
                    <View style={s.storeInfo}>
                      <Ionicons name="storefront" size={24} color={colors.tabActive} />
                      <Text style={s.storeName}>{store}</Text>
                    </View>
                    <Pressable style={s.actionButton} onPress={() => handleToggle(store)}>
                      <Ionicons name="checkmark-circle" size={28} color={colors.tabActive} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {availableList.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>
                    Available ({availableList.length})
                  </Text>
                  {availableList.length > 1 && (
                    <Pressable onPress={handleSubscribeAll}>
                      <Text style={[s.sectionAction, s.addAction]}>Add All</Text>
                    </Pressable>
                  )}
                </View>
                {availableList.map(store => (
                  <View key={store} style={s.storeItem}>
                    <View style={s.storeInfo}>
                      <Ionicons name="storefront-outline" size={24} color={colors.textTertiary} />
                      <Text style={[s.storeName, s.storeNameInactive]}>{store}</Text>
                    </View>
                    <Pressable style={s.actionButton} onPress={() => handleToggle(store)}>
                      <Ionicons name="add-circle-outline" size={28} color={colors.tabActive} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
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
      maxHeight: '85%',
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
    stats: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.surface,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.tabActive,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    content: {
      flex: 1,
    },
    section: {
      paddingVertical: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    sectionAction: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.error,
    },
    addAction: {
      color: colors.tabActive,
    },
    storeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    storeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    storeName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    storeNameInactive: {
      color: colors.textSecondary,
    },
    actionButton: {
      padding: 4,
    },
  });

export default SubscriptionsModal;
