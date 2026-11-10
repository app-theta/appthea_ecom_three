import { notFound } from 'next/navigation';
import BlogPost from '@/views/BlogPost.jsx';
import { getBlog } from '@/lib/api-server.js';
import { JsonLd, absolute, breadcrumbLd, excerpt, pageMetadata, siteInfo } from '@/lib/seo.jsx';

export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { post } = await getBlog(slug);
  if (!post) return { title: 'Post not found', robots: { index: false } };
  return pageMetadata({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || excerpt(post.description) || undefined,
    path: `/blog/${post.slug || slug}`,
    images: [post.thumbnail],
    type: 'article',
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const { post, missing } = await getBlog(slug);
  if (missing) notFound();
  const { name } = await siteInfo();

  return (
    <>
      {post && (
        <>
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              image: post.thumbnail ? [post.thumbnail] : undefined,
              datePublished: post.published_at || undefined,
              dateModified: post.updated_at || post.published_at || undefined,
              author: { '@type': 'Organization', name },
              publisher: { '@type': 'Organization', name },
              mainEntityOfPage: absolute(`/blog/${post.slug || slug}`),
            }}
          />
          <JsonLd data={breadcrumbLd([['Home', '/'], ['Blog', '/blog'], [post.title, `/blog/${post.slug || slug}`]])} />
        </>
      )}
      <BlogPost initial={post} />
    </>
  );
}
