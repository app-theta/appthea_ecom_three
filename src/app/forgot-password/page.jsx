import { Suspense } from 'react';
import ForgotPassword from '@/views/ForgotPassword.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Forgot Password');

export default function Page() {
  return <Suspense><ForgotPassword /></Suspense>;
}
