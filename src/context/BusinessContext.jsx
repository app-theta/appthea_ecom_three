'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { basic } from '../api/endpoints';
import { applyWebsiteTheme } from '../theme/websiteTheme';

const BusinessContext = createContext(null);

/** Feature flags default to false so the UI never shows something the tenant disabled. */
const EMPTY_FEATURES = {
  is_coupon: false,
  // home page sections - shown only while the store has them switched on
  enable_campaign: false,
  enable_hotdeal_product: false,
  enable_featured_product: false,
  enable_customer_point_commission: false,
  email_verification: false,
  phone_verification: false,
  newsletter_popup: false,
  is_subscribe_newsletter: false,
  open_cart: false,
  product_reels: false,
  draft_orders: false,
  show_breedcrumb: false,
  user_wishlist: false,
  facebook_status: false,
  google_status: false,
  live_notification: false,
  enable_meta_seo: false,
  facebook_pixel_status: false,
  customer_live_chat: false,
};

/**
 * `initial` is what the server already read ({ bundle, closed }) - the page renders with it
 * straight away. Only when the server got nothing does the browser ask the API itself.
 */
export function BusinessProvider({ initial = null, children }) {
  const seeded = Boolean(initial?.bundle || initial?.closed);
  const [{ info, categories, brands, colours, sliders, seoMeta }, setData] = useState(() => readBundle(initial?.bundle));
  const [loading, setLoading] = useState(!seeded);
  const [error, setError] = useState(null);
  // the API answered 423: the shop is closed (stopped, or its subscription ended)
  const [closed, setClosed] = useState(initial?.closed ?? null);

  useEffect(() => {
    const onClosed = (e) => setClosed(e.detail || 'closed');
    window.addEventListener('store:closed', onClosed);
    return () => window.removeEventListener('store:closed', onClosed);
  }, []);

  useEffect(() => {
    if (seeded) return undefined;
    let alive = true;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const bundle = await basic.all(undefined, { signal: controller.signal });
        if (!alive) return;
        const data = readBundle(bundle);
        setData(data);
        setError(data.info ? null : 'business/info unavailable');
      } catch {
        if (alive) setError('business/info unavailable');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; controller.abort(); };
  }, [seeded]);

  // the server already wrote these colours into the page; this covers a browser-side load
  useEffect(() => {
    if (!seeded && info) applyWebsiteTheme(info.theme);
  }, [seeded, info]);

  const value = useMemo(() => {
    const features = { ...EMPTY_FEATURES, ...(info?.features || {}) };
    const shipping = info?.shipping || {};
    const paymentMethods = info?.payment_methods || {};
    return {
      info,
      currencySymbol: info?.currency_symbol || '৳',
      features,
      shipping: {
        inside: Number(shipping.inside_city_charge_amount ?? 0),
        outside: Number(shipping.outside_city_charge_amount ?? 0),
        freeAbove: Number(shipping.max_shipping_charge_free_amount ?? 0),
      },
      paymentMethods,
      enabledPayments: Object.entries(PAYMENT_MAP)
        .filter(([flag]) => truthy(paymentMethods[flag]))
        .map(([, type]) => type),
      categories,
      brands,
      colours,
      sliders,
      seoMeta,
      loading,
      error,
      closed,
    };
  }, [info, categories, brands, colours, sliders, seoMeta, loading, error, closed]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

/** business/info flag → the `payment_type` string the checkout endpoint expects. */
export const PAYMENT_MAP = {
  cash_on_delivery: 'Cash On Delivery',
  bkash_status: 'Bkash',
  nagad_status: 'Nagad',
  sslcommerz_status: 'SSL',
  aamarpay_status: 'AamarPay',
  stripe_status: 'Stripe',
  paypal_status: 'Paypal',
};

function truthy(v) {
  return v === true || v === 1 || v === '1' || v === 'Yes' || v === 'active';
}

// a failed sub-call degrades to [] server-side (still truthy) - only a
// real business record has an id, so that's what 'success' means here
function readBundle(bundle) {
  return {
    info: bundle?.business?.id ? bundle.business : null,
    categories: asList(bundle?.categoryLists),
    brands: asList(bundle?.brandLists),
    colours: asList(bundle?.colourLists),
    sliders: asList(bundle?.sliderLists),
    seoMeta: bundle?.seoMetaInfos || null,
  };
}

function asList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used inside BusinessProvider');
  return ctx;
}
