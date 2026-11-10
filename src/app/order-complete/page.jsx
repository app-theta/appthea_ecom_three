import OrderComplete from '@/views/OrderComplete.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Order Placed');

export default function Page() {
  return <OrderComplete />;
}
