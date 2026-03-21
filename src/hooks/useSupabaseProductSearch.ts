import { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { normalizeProduct, ProductRow } from '../utils/normalizeProduct';

const DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 80;

export function useSupabaseProductSearch(searchQuery: string) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const trimmed = searchQuery.trim();

  useEffect(() => {
    if (!trimmed) {
      requestIdRef.current += 1;
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const handle = setTimeout(() => {
      const myId = ++requestIdRef.current;

      void (async () => {
        try {
          const { data: rows, error: rpcError } = await supabase.rpc('search_products', {
            q: trimmed,
            result_limit: DEFAULT_LIMIT,
          });

          if (myId !== requestIdRef.current) return;

          if (rpcError) throw rpcError;

          const list = (rows as ProductRow[] | null) ?? [];
          const products = list
            .map(normalizeProduct)
            .filter((p): p is Product => p !== null);

          if (myId !== requestIdRef.current) return;

          setData(products);
        } catch (e) {
          if (myId !== requestIdRef.current) return;
          setData([]);
          setError(e instanceof Error ? e : new Error(String(e)));
          console.error('search_products RPC failed:', e);
        } finally {
          if (myId === requestIdRef.current) {
            setLoading(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [trimmed]);

  return { data, loading, error };
}
