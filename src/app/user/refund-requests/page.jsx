import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import RefundRequests from '@/views/user/RefundRequests.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Refund Requests');

export default function Page() {
  return <ProtectedRoute><RefundRequests /></ProtectedRoute>;
}
