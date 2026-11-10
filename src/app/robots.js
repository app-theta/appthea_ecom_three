import { SITE_URL, absolute } from '@/lib/seo.jsx';

export default function robots() {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/user/','/cart','/checkout','/order/','/order-complete','/login','/register','/forgot-password','/reset-password','/track-order','/api/'],
    }],
    sitemap: absolute('/sitemap.xml'),
    host: SITE_URL,
  };
}
