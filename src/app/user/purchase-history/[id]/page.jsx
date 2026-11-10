import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import OrderDetail from '@/views/user/OrderDetail.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Order Details');

export default function Page() {
  return <ProtectedRoute><OrderDetail /></ProtectedRoute>;
}
