import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, List, UserData } from '../types';

interface UserContextType {
  subscribedStores: string[];
  favorites: Product[];
  lists: List[];
  toggleStoreSubscription: (storeName: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (product: Product) => boolean;
  createList: (name: string) => void;
  deleteList: (listId: string) => void;
  addToList: (listId: string, product: Product) => void;
  removeFromList: (listId: string, product: Product) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = '@mall_e_user_data';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [subscribedStores, setSubscribedStores] = useState<string[]>(['AmericanEagle']);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const userData: UserData = JSON.parse(data);
        setSubscribedStores(userData.subscribedStores || ['AmericanEagle']);
        setFavorites(userData.favorites || []);
        setLists(userData.lists || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = useCallback(async () => {
    try {
      const userData: UserData = { subscribedStores, favorites, lists };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }, [subscribedStores, favorites, lists]);

  useEffect(() => {
    saveUserData();
  }, [saveUserData]);

  const toggleStoreSubscription = (storeName: string) => {
    setSubscribedStores(prev =>
      prev.includes(storeName)
        ? prev.filter(s => s !== storeName)
        : [...prev, storeName]
    );
  };

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const exists = prev.some(p => p.item_link === product.item_link);
      if (exists) {
        return prev.filter(p => p.item_link !== product.item_link);
      }
      return [...prev, product];
    });
  };

  const isFavorite = (product: Product) => {
    return favorites.some(p => p.item_link === product.item_link);
  };

  const createList = (name: string) => {
    const newList: List = {
      id: Date.now().toString(),
      name,
      products: [],
      createdAt: new Date().toISOString(),
    };
    setLists(prev => [...prev, newList]);
  };

  const deleteList = (listId: string) => {
    setLists(prev => prev.filter(list => list.id !== listId));
  };

  const addToList = (listId: string, product: Product) => {
    setLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          const exists = list.products.some(p => p.item_link === product.item_link);
          if (!exists) {
            return { ...list, products: [...list.products, product] };
          }
        }
        return list;
      })
    );
  };

  const removeFromList = (listId: string, product: Product) => {
    setLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            products: list.products.filter(p => p.item_link !== product.item_link),
          };
        }
        return list;
      })
    );
  };

  return (
    <UserContext.Provider
      value={{
        subscribedStores,
        favorites,
        lists,
        toggleStoreSubscription,
        toggleFavorite,
        isFavorite,
        createList,
        deleteList,
        addToList,
        removeFromList,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};