import { Product } from '../types';

/** Max items per discovery horizontal row (performance + layout). */
export const DISCOVERY_ROW_LIMIT = 28;

/** When `tags` is empty, returns `products` unchanged. Otherwise keeps products that have at least one matching tag (case-insensitive). */
export function applyTagFilter(products: Product[], tags: string[]): Product[] {
  if (!tags.length) return products;
  const lower = tags.map(t => t.toLowerCase());
  return products.filter(p => p.tags.some(tag => lower.includes(tag.toLowerCase())));
}

/** Fisher–Yates shuffle then take up to `count` items. Pass `shuffleNonce > 0` to vary order when inputs are unchanged (e.g. pull-to-refresh); `0` uses `Math.random()` like a plain shuffle. */
export function shufflePick<T>(items: T[], count: number, shuffleNonce = 0): T[] {
  const shuffled = [...items];
  let seed = shuffleNonce >>> 0;
  const rand =
    shuffleNonce === 0
      ? () => Math.random()
      : () => {
          seed = (1664525 * seed + 1013904223) >>> 0;
          return seed / 0x100000000;
        };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
