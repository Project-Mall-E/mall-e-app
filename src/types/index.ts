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

export type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { product: Product };
};

export type BottomTabParamList = {
  Home: undefined;
  Explore: undefined;
  Favorites: undefined;
};