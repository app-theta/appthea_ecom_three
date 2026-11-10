import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import PurchaseHistory from '@/views/user/PurchaseHistory.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Purchase History');

export default function Page() {
  return <ProtectedRoute><PurchaseHistory /></ProtectedRoute>;
}
