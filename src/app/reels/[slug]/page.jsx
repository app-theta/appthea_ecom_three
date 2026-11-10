import { notFound } from 'next/navigation';
import Reels from '@/views/Reels.jsx';
import { api } from '@/lib/api-server.js';
import { excerpt, pageMetadata } from '@/lib/seo.jsx';

// one reel open in the viewer, over the reels grid
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

async function read(params) {
  const { slug } = await params;
  const list = await api.reels();
  const rows = Array.isArray(list) ? list : list?.data || [];
  return { slug, list, reel: rows.find((r) => r.slug === slug) || null, loaded: list != null };
}

export async function generateMetadata({ params }) {
  const { slug, reel } = await read(params);
  if (!reel) return { title: 'Reels', robots: { index: false } };
  return pageMetadata({
    title: reel.name,
    description: excerpt(reel.short_description || reel.long_description) || undefined,
    path: `/reels/${slug}`,
    images: [reel.thumbnail],
  });
}

export default async function ReelPage({ params }) {
  const { list, reel, loaded } = await read(params);
  // an unknown reel is a 404 - unless the list itself failed to load
  if (!reel && loaded) notFound();
  return <Reels initial={list} />;
}
