/* Reading the product payload defensively: the Frontend resources are the source
   of truth for field names, and list vs detail resources differ slightly. */

export function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export const isCombo = (p) => String(p?.is_combo ?? 'No') === 'Yes';
export const comboKind = (p) => (isCombo(p) ? String(p?.combo_type || 'Same') : null);
export const isSameCombo = (p) => comboKind(p) === 'Same';
export const isBundle = (p) => comboKind(p) === 'Different';
export const comboTiers = (p) => (Array.isArray(p?.combo_tiers) ? p.combo_tiers : []);
export const bundlesOf = (p) => (Array.isArray(p?.bundles) ? p.bundles : []);

export function barcodesOf(p) {
  const list = p?.barcodes || (p?.barcode ? [p.barcode] : []);
  return Array.isArray(list) ? list : [];
}

/** The barcode that drives the headline price - first in-stock one, else the first. */
export function primaryBarcode(p) {
  if (p?.barcode && typeof p.barcode === 'object') return p.barcode;
  const list = barcodesOf(p);
  return list.find((b) => inStock(b)) || list[0] || null;
}

export function headlinePrice(p) {
  const b = primaryBarcode(p);
  const now = num(b?.discount_selling_amount ?? b?.selling_amount ?? p?.discount_selling_amount ?? p?.selling_amount);
  const was = num(b?.selling_amount ?? p?.selling_amount);
  return { now, was: was > now ? was : 0 };
}

export function barcodePrice(b) {
  const now = num(b?.discount_selling_amount ?? b?.selling_amount);
  const was = num(b?.selling_amount);
  return { now, was: was > now ? was : 0 };
}

export function stockOf(b) {
  return num(b?.stock_qty ?? b?.stock ?? b?.available_stock ?? b?.quantity ?? 0);
}
export function inStock(b) {
  return stockOf(b) > 0 || String(b?.stock_status || '').toLowerCase() === 'in stock';
}
export function productInStock(p) {
  if (p?.total_stock_qty !== undefined && p?.total_stock_qty !== null) {
    return num(p.total_stock_qty) > 0;
  }
  const list = barcodesOf(p);
  if (!list.length) return num(p?.stock ?? 1) > 0;
  return list.some(inStock);
}

/** Human label for a barcode's variant: "Black · M" from whichever attribute fields exist. */
export function variantLabel(b) {
  const bits = [
    b?.combination?.colour?.name || b?.combination?.color?.name,
    b?.combination?.size?.name,
  ].filter((x) => typeof x === 'string' && x.trim());
  if (bits.length) return bits.join(' · ');
  return b?.barcode || `#${b?.id ?? ''}`;
}

/** Like variantLabel, but returns null instead of falling back to a raw
    barcode/id when there's no real colour/size attribute data - for spots
    where "no variant to show" reads better than an internal SKU (e.g. a
    combo/bundle member that only has one, unvaried barcode). */
export function meaningfulVariantLabel(b) {
  const bits = [
    b?.combination?.colour?.name || b?.combination?.color?.name,
    b?.combination?.size?.name,
  ].filter((x) => typeof x === 'string' && x.trim());
  return bits.length ? bits.join(' · ') : null;
}

export function swatchColour(b) {
  return b?.combination?.colour?.code || b?.combination?.colour?.hex || b?.combination?.color?.code || null;
}
export function sizeLabel(b) {
  return b?.combination?.size?.name || null;
}

/** Every distinct colour among a product's barcodes, each mapped back to one representative barcode. */
export function coloursOf(barcodes) {
  const seen = new Map();
  for (const b of barcodes) {
    const code = swatchColour(b);
    const name = b?.combination?.colour?.name || b?.combination?.color?.name;
    if (!code || seen.has(code)) continue;
    seen.set(code, { code, name, barcode: b });
  }
  return [...seen.values()];
}

/** Every distinct size among a product's barcodes, each mapped back to one representative barcode. */
export function sizesOf(barcodes) {
  const seen = new Map();
  for (const b of barcodes) {
    const label = sizeLabel(b);
    if (!label || seen.has(label)) continue;
    seen.set(label, { label, barcode: b });
  }
  return [...seen.values()];
}

/** First usable image URL out of the many shapes the API may return. */
export function imageUrl(source) {
  if (!source) return null;
  if (typeof source === 'string') return source;
  if (Array.isArray(source)) return imageUrl(source[0]);
  return source.image || source.url || source.path || source.thumbnail || source.full_url || null;
}

/** Card/gallery images for a product - falls back to repeating the thumbnail
    when no gallery was loaded (true for every list/card view). */
export function productImages(p) {
  const many = p?.images || p?.gallery || p?.product_images;
  const list = (Array.isArray(many) ? many : []).map(imageUrl).filter(Boolean);
  const first = imageUrl(p?.thumbnail || p?.image || p?.primary_image);
  const all = [first, ...list].filter(Boolean);
  const unique = [...new Set(all)];
  if (unique.length === 0) return [];
  if (unique.length === 1) return [unique[0], unique[0]];
  return unique;
}

export function thumbOf(p) {
  return productImages(p)[0] || null;
}

export function ratingOf(p) {
  return {
    value: num(p?.average_rating ?? p?.rating ?? p?.reviews_avg_rating ?? 0),
    count: num(p?.total_reviews ?? p?.reviews_count ?? 0),
  };
}

/** Strips HTML from a description for a plain-text blurb. */
export function plain(html) {
  return String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** paginated list responses arrive either bare or wrapped. */
export function paginated(payload) {
  if (!payload) return { rows: [], page: 1, lastPage: 1, total: 0 };
  const rows = Array.isArray(payload) ? payload : payload.data ?? payload.products ?? [];
  const meta = payload.meta ?? payload;
  return {
    rows: Array.isArray(rows) ? rows : [],
    page: num(meta.current_page ?? 1) || 1,
    lastPage: num(meta.last_page ?? 1) || 1,
    total: num(meta.total ?? (Array.isArray(rows) ? rows.length : 0)),
  };
}
