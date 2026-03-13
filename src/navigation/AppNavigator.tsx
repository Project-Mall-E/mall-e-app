// src/navigation/AppNavigator.tsx
import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import type { AppleIcon } from 'react-native-bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { RootStackParamList, BottomTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createNativeBottomTabNavigator<BottomTabParamList>();

// Placeholder 1x1 transparent PNG for Android tab icons (SF Symbols are iOS-only).
// Replace with require('./assets/icons/...') for proper Android icons.
const ANDROID_TAB_ICON_PLACEHOLDER = {
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
};

function getTabBarIcon(
  routeName: string,
  focused: boolean
): AppleIcon | { uri: string } {
  if (Platform.OS === 'ios') {
    const sfSymbol =
      routeName === 'Home'
        ? focused
          ? 'house.fill'
          : 'house'
        : routeName === 'Explore'
          ? focused
            ? 'compass.fill'
            : 'compass'
          : routeName === 'Favorites'
            ? focused
              ? 'heart.fill'
              : 'heart'
            : 'questionmark.circle';
    return { sfSymbol: sfSymbol as AppleIcon['sfSymbol'] };
  }
  return ANDROID_TAB_ICON_PLACEHOLDER;
}

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => getTabBarIcon(route.name, focused),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentRoute = state.routes[state.index];

            if (currentRoute.name === 'Explore') {
              e.preventDefault();
              navigation.navigate('Explore', { refresh: Date.now() });
            }
          },
        })}
      />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: 'Product Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
