import Register from '@/views/Register.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Register');

export default function Page() {
  return <Register />;
}
