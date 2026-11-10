import { notFound } from 'next/navigation';
import ProductDetails from '@/views/ProductDetails.jsx';
import { api, getBundle, getProduct } from '@/lib/api-server.js';
import { JsonLd, breadcrumbLd, excerpt, pageMetadata, productLd } from '@/lib/seo.jsx';
import { headlinePrice, productImages, productInStock } from '@/utils/product.js';

// built on the first visit, then served from cache and refreshed every 5 minutes
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

const imagesOf = (p) => [...new Set(productImages(p))];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product: p } = await getProduct(slug);
  if (!p) return { title: 'Product not found', robots: { index: false } };
  return pageMetadata({
    title: p.name,
    description: excerpt(p.short_description || p.long_description) || undefined,
    path: `/product/${p.slug}`,
    images: imagesOf(p).slice(0, 4),
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { product: p, missing } = await getProduct(slug);
  if (missing) notFound();

  const [{ bundle }, related] = await Promise.all([
    getBundle(),
    p?.category?.id ? api.products({ category_id: p.category.id, per_page: 4 }) : null,
  ]);

  const crumbs = p && [
    ['Home', '/'],
    ...(p.category?.slug ? [[p.category.name, `/shop?category=${p.category.slug}`]] : []),
    [p.name, `/product/${p.slug}`],
  ];

  return (
    <>
      {p && (
        <>
          <JsonLd
            data={productLd(p, {
              currency: bundle?.business?.site_currency || 'BDT',
              price: headlinePrice(p).now,
              inStock: productInStock(p),
              images: imagesOf(p),
            })}
          />
          <JsonLd data={breadcrumbLd(crumbs)} />
        </>
      )}
      <ProductDetails initial={p} initialRelated={related} />
    </>
  );
}
