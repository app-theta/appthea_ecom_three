import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import Wishlist from '@/views/user/Wishlist.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Wishlist');

export default function Page() {
  return <ProtectedRoute><Wishlist /></ProtectedRoute>;
}
