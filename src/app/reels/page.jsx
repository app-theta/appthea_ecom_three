import Reels from '@/views/Reels.jsx';
import { api } from '@/lib/api-server.js';
import { pageMetadata, siteInfo } from '@/lib/seo.jsx';

export const revalidate = 300;

export async function generateMetadata() {
  const { name } = await siteInfo();
  return pageMetadata({ title: 'Reels', description: `Short product videos from ${name}.`, path: '/reels' });
}

export default async function ReelsPage() {
  return <Reels initial={await api.reels()} />;
}
