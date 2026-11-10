import Checkout from '@/views/Checkout.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Checkout');

export default function Page() {
  return <Checkout />;
}
