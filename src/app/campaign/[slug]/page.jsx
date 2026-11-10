import Campaign from '@/views/Campaign.jsx';
import { getCampaign } from '@/lib/api-server.js';
import { excerpt, pageMetadata } from '@/lib/seo.jsx';

export const revalidate = 120;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data, ended } = await getCampaign(slug);
  const campaign = data?.campaign;
  if (!campaign) return { title: 'Campaign', robots: ended ? { index: false } : undefined };
  return pageMetadata({
    title: campaign.title,
    description: excerpt(campaign.description) || undefined,
    path: `/campaign/${slug}`,
    images: [campaign.banner],
  });
}

export default async function CampaignPage({ params }) {
  const { slug } = await params;
  const { data } = await getCampaign(slug);
  // an ended campaign has no data: the view asks once more and shows its 'ended' note
  return <Campaign initial={data} />;
}
