import Contact from '@/views/Contact.jsx';
import { pageMetadata, siteInfo } from '@/lib/seo.jsx';

export async function generateMetadata() {
  const { seo, name } = await siteInfo();
  return pageMetadata({
    title: 'Contact Us',
    description: seo.contact_description || `Get in touch with ${name} - phone, email and address.`,
    keywords: seo.contact_keywords,
    path: '/contact',
  });
}

export default function ContactPage() {
  return <Contact />;
}
