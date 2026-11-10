import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import MyWallet from '@/views/user/MyWallet.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('My Wallet');

export default function Page() {
  return <ProtectedRoute><MyWallet /></ProtectedRoute>;
}
