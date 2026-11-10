import Login from '@/views/Login.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Login');

export default function Page() {
  return <Login />;
}
