'use client';

/* This template's own pieces that the shared reels page (views/Reels.jsx) plugs into -
   the reels page itself is the same file in every storefront template. */
import { reels as reelsApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { headlinePrice } from '../../utils/product.js';
import { money } from '../../utils/format.js';

export { reelsApi };

const TEXT = {
  title: 'Reels',
  count: (n) => `${n} videos`,
  like: 'Like',
  details: 'View details',
  views: 'views',
  close: 'Close',
  mute: 'Mute',
  unmute: 'Unmute',
  prev: 'Previous reel',
  next: 'Next reel',
  empty: 'No reels yet.',
  retry: 'Try again',
};

export function useReelsEnv() {
  const { isAuthed } = useAuth();
  const { features, currencySymbol } = useBusiness();
  return {
    isAuthed,
    enabled: Boolean(features.product_reels),
    text: TEXT,
    price: (product) => money(headlinePrice(product).now, currencySymbol),
  };
}
