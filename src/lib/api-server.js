import 'server-only';
import { cache } from 'react';

/* Server-side reads of the storefront API, for pages Google and link previews see.
   Every response is cached (ISR) and tagged 'store', so POST /api/revalidate can
   refresh all of it at once after an edit in the admin. */

const API_BASE = `${(process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')}/api`;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_APPTHETA_PUBLIC_KEY || '';
const F = "/ecom-frontend";

export const STORE_TAG = "store";

export class ApiError extends Error {
  constructor(status, message) {
    super(message || `API ${status}`);
    this.status = status;
  }
}

export async function apiGet(path, params, { revalidate = 300 } = {}) {
  const url = new URL(API_BASE + path);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'apptheta_public-key': PUBLIC_KEY },
    next: { revalidate, tags: [STORE_TAG] },
  });
  let body = null;
  try { body = await res.json(); } catch { /* not JSON */ }
  if (!res.ok) throw new ApiError(res.status, body?.message);
  if (body && typeof body === "object" && 'status' in body) {
    if (body.status === false) throw new ApiError(body.code || 400, body.message);
    return body.data;
  }
  return body;
}

/** null on any failure - the page still renders and the browser fetches the data itself. */
export async function apiTry(path, params, options) {
  try { return await apiGet(path, params, options); } catch { return null; }
}

/** business + categories + sliders + SEO texts; `closed` when the API answered 423. */
export const getBundle = cache(async () => {
  try {
    const bundle = await apiGet(`${F}/basic/all/list`);
    return { bundle: bundle?.business?.id ? bundle : null, closed: null };
  } catch (e) {
    return { bundle: null, closed: e?.status === 423 ? (e.message || 'closed') : null };
  }
});

export const getProduct = cache(async (slug) => {
  try {
    return { product: await apiGet(`${F}/products/${encodeURIComponent(slug)}`), missing: false };
  } catch (e) {
    return { product: null, missing: e?.status === 404 };
  }
});

export const getCampaign = cache(async (slug) => {
  try {
    return { data: await apiGet(`${F}/campaigns/${encodeURIComponent(slug)}`, { page: 1, per_page: 24 }), ended: false };
  } catch (e) {
    return { data: null, ended: e?.status === 404 };
  }
});

export const getBlog = cache(async (slug) => {
  try {
    return { post: await apiGet(`${F}/blogs/${encodeURIComponent(slug)}`), missing: false };
  } catch (e) {
    return { post: null, missing: e?.status === 404 };
  }
});

export const api = {
  homeSummary: () => apiTry(`${F}/home/summary`, { per_page: 8 }, { revalidate: 120 }),
  campaigns: () => apiTry(`${F}/basic/campaigns`, { products: 8 }, { revalidate: 120 }),
  hotDeals: () => apiTry(`${F}/basic/hot-deals`, undefined, { revalidate: 120 }),
  products: (params) => apiTry(`${F}/products`, params),
  blogs: (params) => apiTry(`${F}/blogs`, params),
  faqs: () => apiTry(`${F}/faqs`),
  reels: () => apiTry(`${F}/reels`),
};
