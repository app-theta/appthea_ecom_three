import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import EarningPoints from '@/views/user/EarningPoints.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Earning Points');

export default function Page() {
  return <ProtectedRoute><EarningPoints /></ProtectedRoute>;
}
