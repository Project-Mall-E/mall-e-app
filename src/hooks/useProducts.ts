import { useState, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

type ProductTagRow = { id: number; name: string };

type ProductRow = {
  store: string | null;
  item_name: string | null;
  item_image_link: string | null;
  item_image_links: string[] | null;
  item_link: string | null;
  price_text: string | null;
  price: number | string | null;
  tags: ProductTagRow[] | null;
};

const FALLBACK_IMAGE = 'https://via.placeholder.com/800x800?text=No+Image';

/** Fisher–Yates shuffle — mixes store order instead of DB insertion/created order */
function shuffleProducts<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const normalizeProduct = (row: ProductRow): Product | null => {
  const itemLink = row.item_link?.trim() ?? '';
  if (!itemLink) return null;

  const imageLinks = (row.item_image_links ?? [])
    .map(link => link?.trim())
    .filter((link): link is string => Boolean(link));
  const primaryImage = row.item_image_link?.trim() || imageLinks[0] || FALLBACK_IMAGE;
  const allImages = imageLinks.length > 0
    ? imageLinks
    : [primaryImage];

  const tags = (row.tags ?? [])
    .map(tag => tag?.name?.trim())
    .filter((tag): tag is string => Boolean(tag));

  return {
    store: row.store?.trim() ?? '',
    item_name: row.item_name?.trim() ?? '',
    item_image_link: primaryImage,
    item_image_links: allImages,
    item_link: itemLink,
    price: row.price_text?.trim() || (row.price != null ? `$${row.price}` : ''),
    tags,
  };
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('products_with_tags')
        .select('store,item_name,item_image_link,item_image_links,item_link,price_text,price,tags')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalizedProducts = (data as ProductRow[] | null)
        ?.map(normalizeProduct)
        .filter((product): product is Product => product !== null) ?? [];

      setProducts(shuffleProducts(normalizedProducts));
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const refreshProducts = async () => {
    await loadProducts(true);
  };

  const getProductsByStore = (storeNames: string[]) => {
    return products.filter(p => storeNames.includes(p.store));
  };

  const getProductsNotInStores = (storeNames: string[]) => {
    return products.filter(p => !storeNames.includes(p.store));
  };

  const getAllStores = () => {
    return Array.from(new Set(products.map(p => p.store)));
  };

  const searchProducts = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(
      p =>
        p.item_name.toLowerCase().includes(lowerQuery) ||
        p.store.toLowerCase().includes(lowerQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  return {
    products,
    loading,
    refreshing,
    refreshProducts,
    getProductsByStore,
    getProductsNotInStores,
    getAllStores,
    searchProducts,
  };
};