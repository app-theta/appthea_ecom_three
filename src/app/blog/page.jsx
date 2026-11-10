import Blog from '@/views/Blog.jsx';
import { api } from '@/lib/api-server.js';
import { pageMetadata, siteInfo } from '@/lib/seo.jsx';

export const revalidate = 300;

export async function generateMetadata() {
  const { name } = await siteInfo();
  return pageMetadata({ title: 'Blog', description: `News, guides and stories from ${name}.`, path: '/blog' });
}

export default async function BlogPage() {
  const [list, recent] = await Promise.all([api.blogs({ page: 1, per_page: 6 }), api.blogs({ per_page: 3 })]);
  return <Blog initial={{ list, recent }} />;
}
