import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import ManageProfile from '@/views/user/ManageProfile.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Manage Profile');

export default function Page() {
  return <ProtectedRoute><ManageProfile /></ProtectedRoute>;
}
