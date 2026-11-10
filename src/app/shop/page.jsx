import { Suspense } from 'react';
import Shop from '@/views/Shop.jsx';
import { api, getBundle } from '@/lib/api-server.js';
import { JsonLd, breadcrumbLd, pageMetadata, siteInfo } from '@/lib/seo.jsx';
import { shopQuery } from '@/utils/shopQuery.js';

/** The URL's filters, resolved against the business's categories / brands like the view does. */
async function read(searchParams) {
  const sp = await searchParams;
  const get = (key) => (typeof sp?.[key] === 'string' ? sp[key] : null);
  const { bundle } = await getBundle();
  const list = (v) => (Array.isArray(v) ? v : v?.data || []);
  const resolved = shopQuery(get, {
    categories: list(bundle?.categoryLists),
    brands: list(bundle?.brandLists),
    features: bundle?.business?.features || {},
  });
  // only the plain shop and a plain category listing are worth indexing; filtered,
  // sorted and searched variants are near-duplicates of them
  const filtered = ['keyword', 'brand', 'price', 'sort', 'is_featured'].some((k) => get(k));
  return { ...resolved, get, filtered };
}

export async function generateMetadata({ searchParams }) {
  const { activeCategory, get, filtered } = await read(searchParams);
  const { name } = await siteInfo();
  const keyword = get('keyword');
  return pageMetadata({
    title: keyword ? `Search: ${keyword}` : activeCategory ? activeCategory.name : 'Shop',
    description: activeCategory
      ? `${activeCategory.name} - shop ${activeCategory.products_count ? `${activeCategory.products_count} ` : ''}products online at ${name}.`
      : `Browse all products at ${name} - order online with delivery across Bangladesh.`,
    path: activeCategory ? `/shop?category=${activeCategory.slug}` : '/shop',
    images: activeCategory ? [activeCategory.banner_image || activeCategory.image] : undefined,
    noindex: filtered,
  });
}

export default async function ShopPage({ searchParams }) {
  const { query, activeCategory } = await read(searchParams);
  // the same first query the view starts with, so it shows this without asking again
  const initial = await api.products(query);
  return (
    <>
      {activeCategory && (
        <JsonLd data={breadcrumbLd([['Home', '/'], ['Shop', '/shop'], [activeCategory.name, `/shop?category=${activeCategory.slug}`]])} />
      )}
      <Suspense>
        <Shop initial={initial} />
      </Suspense>
    </>
  );
}
