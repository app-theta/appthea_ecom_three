import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import DeleteAccount from '@/views/user/DeleteAccount.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Delete Account');

export default function Page() {
  return <ProtectedRoute><DeleteAccount /></ProtectedRoute>;
}
