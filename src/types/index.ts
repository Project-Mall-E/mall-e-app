// src/types/index.ts
export interface Product {
  store: string;
  item_name: string;
  item_image_link: string;
  item_link: string;
  price: string;
  tags: string[];
}

export interface List {
  id: string;
  name: string;
  products: Product[];
  createdAt: string;
}

export interface UserData {
  subscribedStores: string[];
  favorites: Product[];
  lists: List[];
}

export interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { product: Product };
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Explore: { refresh?: number } | undefined;
  Favorites: undefined;
  Profile: undefined;
};