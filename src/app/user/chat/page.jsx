import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import Chat from '@/views/user/Chat.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Chat');

export default function Page() {
  return <ProtectedRoute><Chat /></ProtectedRoute>;
}
