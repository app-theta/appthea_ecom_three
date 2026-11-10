import { Suspense } from 'react';
import TrackOrder from '@/views/TrackOrder.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Track Order');

export default function Page() {
  return <Suspense><TrackOrder /></Suspense>;
}
