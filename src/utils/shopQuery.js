/**
 * The products query the shop page sends for its URL (?category, ?brand, ?keyword, ?price,
 * ?sort, ?page, ?is_featured). Shared by the page itself and the server, which reads the
 * same first page ahead so it is in the HTML.
 */
export const PRICE_RANGES = {
  under25: { max_price: 25 },
  '25-75': { min_price: 25, max_price: 75 },
  '75-200': { min_price: 75, max_price: 200 },
  above200: { min_price: 200 },
};

/** `get(name)` reads one URL parameter (URLSearchParams.get, or a plain-object lookup on the server). */
export function shopQuery(get, { categories = [], brands = [], features = {} }) {
  // the home page's "Featured Products - View all" (only while featured products are switched on)
  const featuredOnly = Boolean(features.enable_featured_product) && get('is_featured') === 'Yes';
  const activeCategory = categories.find((c) => c.slug === (get('category') || ''));
  const activeBrand = brands.find((b) => b.slug === get('brand'));
  const price = get('price') || '';
  return {
    featuredOnly,
    activeCategory,
    activeBrand,
    query: {
      keyword: get('keyword') || undefined,
      category_id: activeCategory?.id,
      brand_id: activeBrand?.id,
      is_featured: featuredOnly ? 'Yes' : undefined,
      sort: get('sort') || 'latest',
      per_page: 12,
      page: Number(get('page') || 1),
      ...(PRICE_RANGES[price] || {}),
    },
  };
}
