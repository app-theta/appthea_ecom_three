import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { checkout as checkoutApi } from '../api/endpoints';
import { barcodePrice, productImages, barcodesOf, variantLabel as variantLabelOf } from '../utils/product';

const CartContext = createContext(null);
const KEY = 'AppTheta_ecom_cart';

/**
 * Every cart item carries `total_price` (the authoritative line total, exactly
 * what the API is sent) plus `price` (a derived per-unit figure, kept only for
 * display). `type` is one of:
 *
 *  simple        { type, id, product_id, barcode_id, qty, price, total_price }
 *  combo_product { type, id, product_id, barcode_id, qty, total_price, free_selections[] }
 *  bundle        { type, id, bundle_id, qty, total_price, selections[] }
 *
 * combo_product/bundle lines are never merged and never quantity-edited after
 * being added — the quantity/free-picks/selections were fixed by whichever
 * combo tier or bundle the customer chose on the product page, and arbitrarily
 * bumping that number in the cart has no well-defined meaning (it wouldn't
 * necessarily match any real tier any more). They can only be removed and
 * re-added with a fresh choice. Simple lines merge and re-quantity freely.
 */
let uidSeq = 0;
const uid = () => `${Date.now()}-${(uidSeq += 1)}`;

/** Backfills `type`/`total_price` on carts saved by an older build of this
    context, so a stale localStorage cart never produces a NaN total_price. */
const read = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(raw)) return [];
    return raw.map((i) => ({
      ...i,
      type: i.type || 'simple',
      total_price: i.total_price != null ? i.total_price : round2(Number(i.price || 0) * Number(i.qty || 1)),
    }));
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);
  const [pricing, setPricing] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* quota */ }
  }, [items]);

  /**
   * `barcode` is the selected variant object (from a product's `barcodes[]`),
   * not a plain size/variant string - the backend prices/checks-out by
   * barcode_id. `variant` display text is only set when the product actually
   * has more than one variant.
   */
  const addItem = useCallback((product, barcode, qty = 1) => {
    const hasVariants = barcodesOf(product).length > 1;
    const price = barcodePrice(barcode);
    const id = 'simple-' + product.id + '|' + (barcode?.id ?? 'default');
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) {
        const nextQty = found.qty + qty;
        return prev.map((i) => (i.id === id
          ? { ...i, qty: nextQty, total_price: round2(i.price * nextQty) }
          : i));
      }
      return [
        ...prev,
        {
          type: 'simple',
          id,
          product_id: product.id,
          barcode_id: barcode?.id ?? null,
          slug: product.slug,
          name: product.name,
          variant: hasVariants ? variantLabelOf(barcode) : null,
          qty,
          price: price.now,
          oldPrice: price.was,
          image: productImages(product)[0],
          total_price: round2(price.now * qty),
        },
      ];
    });
  }, []);

  /** entry: { product_id, barcode_id, qty, total_price, name, image, slug,
      variant, free_items[], free_selections[] } - built by the product-details
      page from the chosen combo tier. Always a new, standalone line. */
  const addComboItem = useCallback((entry) => {
    const id = 'combo-' + uid();
    setItems((prev) => [...prev, {
      type: 'combo_product',
      id,
      product_id: entry.product_id,
      barcode_id: entry.barcode_id,
      slug: entry.slug,
      name: entry.name,
      image: entry.image,
      variant: entry.variant || null,
      freeItems: entry.free_items || [],
      free_selections: entry.free_selections || [],
      qty: entry.qty,
      price: entry.qty > 0 ? round2(entry.total_price / entry.qty) : entry.total_price,
      oldPrice: 0,
      total_price: round2(entry.total_price),
    }]);
  }, []);

  /** entry: { bundle_id, qty, total_price, name, image, items[] (display
      labels), selections[] } - built by the product-details page from the
      chosen bundle. Always a new, standalone line. */
  const addBundleItem = useCallback((entry) => {
    const id = 'bundle-' + uid();
    setItems((prev) => [...prev, {
      type: 'bundle',
      id,
      bundle_id: entry.bundle_id,
      slug: entry.slug,
      name: entry.name,
      image: entry.image,
      bundleItems: entry.items || [],
      selections: entry.selections || [],
      qty: entry.qty,
      price: entry.qty > 0 ? round2(entry.total_price / entry.qty) : entry.total_price,
      oldPrice: 0,
      total_price: round2(entry.total_price),
    }]);
  }, []);

  /** Only simple lines are re-quantified in place - combo/bundle lines ignore
      this (they're remove-and-re-add only, see file header). */
  const updateQty = (id, delta) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id || item.type !== 'simple') return item;
      const nextQty = Math.max(1, item.qty + delta);
      return { ...item, qty: nextQty, total_price: round2(item.price * nextQty) };
    }));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const apiCart = useCallback(() => items.map((i) => {
    if (i.type === 'bundle') {
      return {
        type: 'bundle',
        bundle_id: i.bundle_id,
        bundle_quantity: i.qty,
        selections: i.selections || [],
        total_price: round2(i.total_price),
      };
    }
    if (i.type === 'combo_product') {
      return {
        type: 'combo_product',
        product_id: i.product_id,
        barcode_id: i.barcode_id,
        quantity: i.qty,
        free_selections: i.free_selections || [],
        total_price: round2(i.total_price),
      };
    }
    return {
      type: 'simple',
      product_id: i.product_id,
      barcode_id: i.barcode_id,
      quantity: i.qty,
      total_price: round2(i.total_price),
    };
  }), [items]);

  /** POST cart/price - refreshes each line's total from the backend right
      before checkout, since the backend re-prices every line and rejects
      checkout on any mismatch. Returns whether anything actually changed. */
  const syncPrices = useCallback(async () => {
    if (!items.length) return { changed: false, data: null };
    setPricing(true);
    try {
      const data = await checkoutApi.price(apiCart());
      const lines = Array.isArray(data?.cart) ? data.cart : Array.isArray(data?.items) ? data.items : null;
      if (!lines) return { changed: false, data };

      const next = items.map((line, idx) => {
        const server = lines[idx];
        const fresh = Number(server?.total_price ?? line.total_price);
        if (!(Math.abs(fresh - Number(line.total_price)) > 0.009)) return line;
        return { ...line, total_price: fresh, price: line.qty > 0 ? round2(fresh / line.qty) : fresh };
      });
      const changed = next.some((line, i) => line !== items[i]);
      if (changed) setItems(next);
      return { changed, data };
    } finally {
      setPricing(false);
    }
  }, [items, apiCart]);

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    return {
      items,
      count: items.length,
      subtotal,
      pricing,
      addItem,
      addComboItem,
      addBundleItem,
      updateQty,
      removeItem,
      clearCart,
      apiCart,
      syncPrices,
    };
  }, [items, pricing, addItem, addComboItem, addBundleItem, apiCart, syncPrices]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const round2 = (n) => Math.round(Number(n) * 100) / 100;

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
