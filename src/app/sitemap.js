import { apiTry, getBundle } from '@/lib/api-server.js';
import { absolute } from '@/lib/seo.jsx';

export const revalidate = 3600;

const F = "/ecom-frontend";
const MAX_PAGES = 50; // 5,000 rows per list is plenty for one store

/** Every row of a paginated list, 100 at a time. */
async function all(path, params = {}) {
  const rows = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const data = await apiTry(`${F}${path}`, { ...params, page, per_page: 100 }, { revalidate: 3600 });
    const list = Array.isArray(data) ? data : data?.data || [];
    rows.push(...list);
    const last = Number(data?.meta?.last_page ?? data?.last_page ?? 1);
    if (!list.length || page >= last) break;
  }
  return rows;
}

export default async function sitemap() {
  const { bundle } = await getBundle();
  const features = bundle?.business?.features || {};
  const categories = Array.isArray(bundle?.categoryLists) ? bundle.categoryLists : bundle?.categoryLists?.data || [];
  const [products, blogs, campaigns] = await Promise.all([
    all('/products'),
    all('/blogs'),
    features.enable_campaign ? apiTry(`${F}/basic/campaigns`, undefined, { revalidate: 3600 }) : null,
  ]);

  const entry = (path, priority, changeFrequency = "weekly", lastModified) => ({
    url: absolute(path),
    priority,
    changeFrequency,
    ...(lastModified ? { lastModified: new Date(String(lastModified).replace(' ', 'T')) } : {}),
  });

  return [
    entry('/', 1, 'daily'),
    entry('/shop', 0.9, 'daily'),
    ...categories.map((c) => entry(`/shop?category=${c.slug}`, 0.8, 'daily')),
    ...products.filter((p) => p.slug).map((p) => entry(`/product/${p.slug}`, 0.8, 'weekly', p.updated_at)),
    ...(campaigns?.campaigns || []).filter((c) => c.slug).map((c) => entry(`/campaign/${c.slug}`, 0.7, 'daily')),
    entry('/blog', 0.5),
    ...blogs.filter((b) => b.slug).map((b) => entry(`/blog/${b.slug}`, 0.5, 'monthly', b.updated_at || b.published_at)),
    entry('/faq', 0.3, 'monthly'),
    entry('/contact', 0.3, 'monthly'),
    entry('/privacy', 0.2, 'yearly'),
    entry('/terms', 0.2, 'yearly'),
    entry('/shipping-policy', 0.2, 'yearly'),
    entry('/refund-policy', 0.2, 'yearly'),
    entry('/return-policy', 0.2, 'yearly'),
  ];
}
