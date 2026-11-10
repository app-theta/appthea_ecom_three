import { Suspense } from 'react';
import OrderPaymentResult from '@/views/OrderPaymentResult.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Payment');

export default function Page() {
  return <Suspense><OrderPaymentResult /></Suspense>;
}
