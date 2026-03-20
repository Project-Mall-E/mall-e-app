import { Product } from '../types';

/** Max items per discovery horizontal row (performance + layout). */
export const DISCOVERY_ROW_LIMIT = 28;

/** When `tags` is empty, returns `products` unchanged. Otherwise keeps products that have at least one matching tag (case-insensitive). */
export function applyTagFilter(products: Product[], tags: string[]): Product[] {
  if (!tags.length) return products;
  const lower = tags.map(t => t.toLowerCase());
  return products.filter(p => p.tags.some(tag => lower.includes(tag.toLowerCase())));
}

/** Fisher–Yates shuffle then take up to `count` items. */
export function shufflePick<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
