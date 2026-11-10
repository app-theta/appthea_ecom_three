import ReturnPolicy from '@/views/ReturnPolicy.jsx';
import { excerpt, pageMetadata, siteInfo } from '@/lib/seo.jsx';

export const revalidate = 300;

export async function generateMetadata() {
  const { seo, business } = await siteInfo();
  return pageMetadata({
    title: 'Return Policy',
    description: excerpt(business?.return_policy) || undefined,
    path: '/return-policy',
  });
}

export default function ReturnPolicyPage() {
  return <ReturnPolicy />;
}
