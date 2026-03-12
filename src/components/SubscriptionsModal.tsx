// src/components/SubscriptionsModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useProducts } from '../hooks/useProducts';

interface SubscriptionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({
  visible,
  onClose,
}) => {
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
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Subscriptions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{subscribedStores.length}</Text>
              <Text style={styles.statLabel}>Subscribed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{allStores.length}</Text>
              <Text style={styles.statLabel}>Total Stores</Text>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {subscribedList.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Subscribed ({subscribedList.length})
                  </Text>
                  {subscribedList.length > 1 && (
                    <TouchableOpacity onPress={handleUnsubscribeAll}>
                      <Text style={styles.sectionAction}>Remove All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {subscribedList.map(store => (
                  <View key={store} style={styles.storeItem}>
                    <View style={styles.storeInfo}>
                      <Ionicons name="storefront" size={24} color="#007AFF" />
                      <Text style={styles.storeName}>{store}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleToggle(store)}
                    >
                      <Ionicons name="checkmark-circle" size={28} color="#007AFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {availableList.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Available ({availableList.length})
                  </Text>
                  {availableList.length > 1 && (
                    <TouchableOpacity onPress={handleSubscribeAll}>
                      <Text style={[styles.sectionAction, styles.addAction]}>
                        Add All
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {availableList.map(store => (
                  <View key={store} style={styles.storeItem}>
                    <View style={styles.storeInfo}>
                      <Ionicons name="storefront-outline" size={24} color="#999" />
                      <Text style={[styles.storeName, styles.storeNameInactive]}>
                        {store}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleToggle(store)}
                    >
                      <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
                    </TouchableOpacity>
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
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
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
    color: '#000',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  addAction: {
    color: '#007AFF',
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
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
    color: '#000',
  },
  storeNameInactive: {
    color: '#666',
  },
  actionButton: {
    padding: 4,
  },
});

export default SubscriptionsModal;