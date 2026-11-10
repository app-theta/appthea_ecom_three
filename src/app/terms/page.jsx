import Terms from '@/views/Terms.jsx';
import { excerpt, pageMetadata, siteInfo } from '@/lib/seo.jsx';

export const revalidate = 300;

export async function generateMetadata() {
  const { seo, business } = await siteInfo();
  return pageMetadata({
    title: 'Terms & Conditions',
    description: seo.terms_description || excerpt(business?.terms_condition) || undefined,
    keywords: seo.terms_keywords,
    path: '/terms',
  });
}

export default function TermsConditionsPage() {
  return <Terms />;
}
