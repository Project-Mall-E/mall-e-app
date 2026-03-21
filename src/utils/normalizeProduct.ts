import { Product } from '../types';

export type ProductTagRow = { id: number; name: string };

export type ProductRow = {
  store: string | null;
  item_name: string | null;
  item_image_link: string | null;
  item_image_links: string[] | null;
  item_link: string | null;
  price_text: string | null;
  price: number | string | null;
  item_descriptions?: string[] | null;
  tags?: ProductTagRow[] | null | unknown;
};

const FALLBACK_IMAGE = 'https://via.placeholder.com/800x800?text=No+Image';

function parseTags(raw: ProductRow['tags']): ProductTagRow[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const out: ProductTagRow[] = [];
  for (const el of raw) {
    if (el && typeof el === 'object' && 'name' in el) {
      const name = String((el as { name?: unknown }).name ?? '').trim();
      if (name) {
        const id = Number((el as { id?: unknown }).id);
        out.push({ id: Number.isFinite(id) ? id : 0, name });
      }
    }
  }
  return out;
}

export function normalizeProduct(row: ProductRow): Product | null {
  const itemLink = row.item_link?.trim() ?? '';
  if (!itemLink) return null;

  const imageLinks = (row.item_image_links ?? [])
    .map(link => link?.trim())
    .filter((link): link is string => Boolean(link));
  const primaryImage = row.item_image_link?.trim() || imageLinks[0] || FALLBACK_IMAGE;
  const allImages = imageLinks.length > 0 ? imageLinks : [primaryImage];

  const tagRows = parseTags(row.tags);
  const tags = tagRows.map(t => t.name.trim()).filter(Boolean);

  const descriptions = (row.item_descriptions ?? [])
    .map(d => d?.trim())
    .filter((d): d is string => Boolean(d));

  return {
    store: row.store?.trim() ?? '',
    item_name: row.item_name?.trim() ?? '',
    item_image_link: primaryImage,
    item_image_links: allImages,
    item_link: itemLink,
    price: row.price_text?.trim() || (row.price != null ? `$${row.price}` : ''),
    tags,
    ...(descriptions.length > 0 ? { item_descriptions: descriptions } : {}),
  };
}
