// src/types/index.ts
export interface Product {
  store: string;
  item_name: string;
  item_image_link: string;
  item_image_links?: string[];
  item_link: string;
  price: string;
  tags: string[];
  /** Optional: from Supabase `item_descriptions` */
  item_descriptions?: string[];
}

export interface List {
  id: string;
  name: string;
  description?: string;
  products: Product[];
  createdAt: string;
  user_id?: string;
  is_public?: boolean;
}

export interface PublicList extends List {
  user_id: string;
  profile?: Profile;
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
  MainTabs: { screen?: keyof BottomTabParamList } | undefined;
  ProductDetail: { product: Product };
  UserProfile: { userId: string };
  ListDetail: { list: PublicList };
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Explore: { refresh?: number } | undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};