/** True unless the API told us this category has zero (Active) products.
    Missing/unknown products_count fails open (shown) rather than silently
    hiding a category over a data hiccup. */
const hasProducts = (c) => (c.products_count ?? 1) > 0;

/**
 * Builds the nav structure from the flat category list the API returns.
 * Categories with no parent become top-level links; any category whose
 * parent_id points at one of those becomes a child under it. When a business
 * has no sub-categories set up (the common case), every category is just a
 * flat top-level entry with no children. Empty categories (no Active
 * products) are dropped - a link that leads to an empty shop page is a dead
 * end, not a feature.
 */
export function categoryNavTree(categories) {
  const list = Array.isArray(categories) ? categories : [];
  const top = list.filter((c) => !c.parent_id && hasProducts(c));
  return top.map((c) => ({
    id: c.id,
    label: c.name,
    slug: c.slug,
    children: list
      .filter((x) => x.parent_id === c.id && hasProducts(x))
      .map((x) => ({ slug: x.slug, name: x.name })),
  }));
}

/**
 * Distributes the nav tree round-robin across `columnCount` columns, for a
 * mega-menu layout that expects N fixed columns. This business's categories
 * have no natural "Dresses / Accessories / Winter / Footwear"-style grouping
 * (they're flat), so round-robin is the only grouping that doesn't invent a
 * taxonomy the data doesn't have. Columns that end up empty are dropped.
 */
export function categoryColumns(categories, columnCount = 4) {
  const tree = categoryNavTree(categories);
  const columns = Array.from({ length: columnCount }, () => []);
  tree.forEach((cat, i) => columns[i % columnCount].push(cat));
  return columns.filter((col) => col.length > 0);
}
