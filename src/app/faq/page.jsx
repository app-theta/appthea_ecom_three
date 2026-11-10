import Faq from '@/views/Faq.jsx';
import { api } from '@/lib/api-server.js';
import { JsonLd, pageMetadata, siteInfo } from '@/lib/seo.jsx';

export const revalidate = 300;

export async function generateMetadata() {
  const { name } = await siteInfo();
  return pageMetadata({ title: 'FAQ', description: `Answers to common questions about ordering, delivery and returns at ${name}.`, path: '/faq' });
}

export default async function FaqPage() {
  const faqs = await api.faqs();
  const list = Array.isArray(faqs) ? faqs : [];
  return (
    <>
      {list.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: list.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }}
        />
      )}
      <Faq initial={faqs} />
    </>
  );
}
