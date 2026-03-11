import { useState, useEffect } from 'react';
import { Product } from '../types';
import mockData from '../data/mock-data.json';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(mockData as Product[]);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
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
    getProductsByStore,
    getProductsNotInStores,
    getAllStores,
    searchProducts,
  };
};