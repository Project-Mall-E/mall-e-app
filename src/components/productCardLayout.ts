import { Dimensions } from 'react-native';

/** Matches ProductGrid: 16px side padding ×2 + 16px column gap (2-column). */
export const GRID_HORIZONTAL_INSET = 48;

/** Space between list header (e.g. search) and the first product row. */
export const GRID_CONTENT_TOP_GAP = 12;

/** Fixed vertical slots so every card in a row is the same height. */
export const PRODUCT_CARD_TEXT = {
  infoPaddingTop: 10,
  storeLineHeight: 18,
  storeMarginBottom: 4,
  titleLineHeight: 20,
  titleMaxLines: 2,
  titleMarginBottom: 4,
  priceLineHeight: 20,
  priceMarginBottom: 8,
  tagsRowHeight: 28,
  cardMarginBottom: 16,
} as const;

export const PRODUCT_CARD_IMAGE = {
  borderRadius: 14,
} as const;

export function getProductCardWidth(
  numColumns: 2 | 3 = 2,
  screenWidth = Dimensions.get('window').width,
): number {
  return (screenWidth - GRID_HORIZONTAL_INSET) / numColumns;
}
