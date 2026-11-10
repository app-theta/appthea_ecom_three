import { revalidateTag } from 'next/cache';
import { STORE_TAG } from '@/lib/api-server.js';

/**
 * POST /api/revalidate with header `x-revalidate-secret: <REVALIDATE_SECRET>` -
 * the backend calls it after a product / price / setting changes, so the next
 * visit gets fresh pages instead of waiting out the cache.
 */
export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(STORE_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
