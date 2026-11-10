# AppTheta Ecom (Bootstrap template) — Next.js version

Storefront for the AppTheta POS API (Laravel), on Next.js 16 (App Router).
Design same as before: `public/assets/css/style.css` plus the vendor Bootstrap / Swiper
copies in `public/assets` (loaded in `src/app/layout.jsx`; their JS as `window.bootstrap` / `window.Swiper`).

Public pages (home, shop, category, product, campaign, blog, FAQ, policies) are
rendered on the server, so Google and Facebook/WhatsApp previews get the real
content, title, description, canonical URL and product schema (JSON-LD).
Cart, checkout and account stay in the browser and are `noindex`.

## Run

```bash
cp .env.example .env   # API URL, public key, site URL
npm install
npm run dev            # http://localhost:3000
npm run build          # production build -> .next/
npm start
```

## Environment

| variable | what |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Laravel app URL, no `/api` (old name `VITE_API_BASE_URL` still works) |
| `NEXT_PUBLIC_APPTHETA_PUBLIC_KEY` | business public key (old name `VITE_APPTHETA_PUBLIC_KEY` still works) |
| `NEXT_PUBLIC_SITE_URL` | this store's domain, e.g. `https://shop.example.com` — canonical, sitemap, share links. On Vercel it falls back to the production domain |
| `REVALIDATE_SECRET` | optional — lets the backend refresh cached pages at once (below) |

## Caching

Pages are cached and rebuilt in the background (ISR): home every 2 min, product /
blog / policy pages every 5 min, the business info every 5 min. A product page is
built on its first visit, then served from cache.

For instant updates after an admin edit, the backend can call:

```
POST https://<store-domain>/api/revalidate
x-revalidate-secret: <REVALIDATE_SECRET>
```

## Structure

```
src/app/                 Next.js routes (page.jsx per URL), layout, sitemap.js, robots.js, not-found.jsx
src/app/providers.jsx    client contexts + header/footer shell
src/views/               page components (former src/pages - renamed, Next reserves "pages")
src/components/          layout/ (header, footer, drawers), product/, legal/, user/
src/routes/ProtectedRoute.jsx  login gate for /user/* pages
src/utils/shopQuery.js   the shop URL -> products query, shared by the page and the server
src/context/             business, auth, cart, wishlist, compare, quick view, toast, chat
src/lib/api-server.js    server-side API reads (cached, tagged "store")
src/lib/seo.jsx          metadata, canonical, JSON-LD helpers
src/lib/router.jsx       react-router-style Link / useNavigate / useParams on top of Next navigation
src/api/                 browser-side axios client + endpoints
```

## Deploy (Vercel)

`vercel.json` sets the framework to Next.js, so an existing Vite project switches
over on the next deploy. Set `NEXT_PUBLIC_SITE_URL` to the real domain.
