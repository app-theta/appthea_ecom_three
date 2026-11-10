import Privacy from '@/views/Privacy.jsx';
import { excerpt, pageMetadata, siteInfo } from '@/lib/seo.jsx';

export const revalidate = 300;

export async function generateMetadata() {
  const { seo, business } = await siteInfo();
  return pageMetadata({
    title: 'Privacy Policy',
    description: seo.privacy_description || excerpt(business?.privacy_policy) || undefined,
    keywords: seo.privacy_keywords,
    path: '/privacy',
  });
}

export default function PrivacyPolicyPage() {
  return <Privacy />;
}
