import Cart from '@/views/Cart.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Cart');

export default function Page() {
  return <Cart />;
}
