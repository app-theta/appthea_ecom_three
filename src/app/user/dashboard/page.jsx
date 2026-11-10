import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import Dashboard from '@/views/user/Dashboard.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Dashboard');

export default function Page() {
  return <ProtectedRoute><Dashboard /></ProtectedRoute>;
}
