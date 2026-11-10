import Script from 'next/script';
import Providers from './providers.jsx';
import { getBundle } from '@/lib/api-server.js';
import { SITE_URL, siteInfo } from '@/lib/seo.jsx';
import { themeCss } from '@/theme/websiteTheme.js';

export async function generateMetadata() {
  const { name, seo, business, image } = await siteInfo();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s | ${name}` },
    description: seo.home_description || undefined,
    applicationName: name,
    icons: business?.favicon ? { icon: business.favicon, apple: business.favicon } : undefined,
    openGraph: { type: 'website', siteName: name, locale: 'en_US', images: image ? [image] : [] },
  };
}

export default async function RootLayout({ children }) {
  const initial = await getBundle();
  // the business's own colours, in the HTML so the first paint already has them
  const css = themeCss(initial.bundle?.business?.theme);

  return (
    <html lang="en">
      <head>
        {/* the template's own vendor copies, loaded as-is (public/assets) */}
        <link href="/assets/css/vendor/bootstrap.min.css" rel="stylesheet" />
        <link href="/assets/css/vendor/bootstrap-icons.css" rel="stylesheet" />
        <link href="/assets/css/vendor/swiper-bundle.min.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans+Bengali:wght@100..900&family=Kaushan+Script&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/style.css" />
        {css ? <style id="website-theme" dangerouslySetInnerHTML={{ __html: css }} /> : null}
      </head>
      <body>
        <Providers initial={initial}>{children}</Providers>
        {/* window.bootstrap (Modal / Offcanvas / Toast) and window.Swiper, ready before the page code runs */}
        <Script src="/assets/js/vendor/bootstrap.bundle.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/vendor/swiper-bundle.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
