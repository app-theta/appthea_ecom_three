import { getBundle } from './api-server.js';
import { plain } from '../utils/product.js';

/** This store's public address - canonical URLs, sitemap and share previews hang off it. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  || 'http://localhost:3000'
).replace(/\/$/, '');

export const absolute = (path = "/") => (/^https?:\/\//.test(path) ? path : SITE_URL + path);

/** Plain text cut at a word boundary, for meta descriptions. */
export function excerpt(html, max = 160) {
  const text = plain(html);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length) + '…';
}

/** The business name and site-wide SEO texts (admin: SEO settings). */
export async function siteInfo() {
  const { bundle } = await getBundle();
  const business = bundle?.business || null;
  const seo = bundle?.seoMetaInfos && typeof bundle.seoMetaInfos === "object" ? bundle.seoMetaInfos : {};
  const name = seo.og_site_name || business?.name || 'Online Shop';
  const image = seo.og_image || business?.logo || null;
  return { business, seo, name, image };
}

/**
 * One page's metadata. Next.js replaces (does not merge) a parent's openGraph,
 * so every page builds the whole block here.
 */
export async function pageMetadata({ title, description, path, images, type = "website", noindex = false, keywords, absoluteTitle = false }) {
  const { name, image, seo } = await siteInfo();
  const pics = (images || []).filter(Boolean);
  const ogImages = pics.length ? pics : image ? [image] : [];
  const desc = description || seo.home_description || undefined;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    keywords: keywords || undefined,
    alternates: path ? { canonical: path } : undefined,
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      siteName: name,
      locale: 'en_US',
      title: title || name,
      description: desc,
      url: path,
      images: ogImages,
    },
    twitter: {
      card: ogImages.length ? 'summary_large_image' : 'summary',
      title: title || name,
      description: desc,
      images: ogImages,
    },
  };
}

/** Private pages (cart, checkout, account...) stay out of search results. */
export function privateMetadata(title) {
  return { title, robots: { index: false, follow: false } };
}

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // '<' escaped so a product text can never close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/** The shop itself - name, logo, contact and social profiles, for the home page. */
export function organizationLd(business, name) {
  const sameAs = ['facebook_link', 'instagram_link', 'youtube_link', 'linkedin_link', 'x_link']
    .map((k) => business?.[k])
    .filter((v) => typeof v === "string" && /^https?:\/\//.test(v));
  const address = [business?.address, business?.area, business?.city].filter(Boolean).join(', ');
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name,
    url: absolute('/'),
    logo: business?.logo || undefined,
    email: business?.email || undefined,
    telephone: business?.phone || undefined,
    address: address ? { '@type': 'PostalAddress', streetAddress: address, addressCountry: business?.country || 'BD' } : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

/** Price, stock, images and rating for Google's product results. */
export function productLd(p, { currency = "BDT", price, inStock, images }) {
  const rating = Number(p.average_rating || 0);
  const reviews = Number(p.total_reviews || 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: images,
    description: excerpt(p.long_description || p.short_description, 5000) || undefined,
    sku: p.sku || undefined,
    brand: p.brand?.name ? { '@type': 'Brand', name: p.brand.name } : undefined,
    category: p.category?.name || undefined,
    offers: {
      '@type': 'Offer',
      url: absolute(`/product/${p.slug}`),
      priceCurrency: currency,
      price: Number(price || 0).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: reviews > 0 && rating > 0
      ? { '@type': 'AggregateRating', ratingValue: rating.toFixed(1), reviewCount: reviews }
      : undefined,
  };
}

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absolute(path),
    })),
  };
}
