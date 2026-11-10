import { Suspense } from 'react';
import ForgotPassword from '@/views/ForgotPassword.jsx';
import { privateMetadata } from '@/lib/seo.jsx';

export const metadata = privateMetadata('Reset Password');

export default function Page() {
  return <Suspense><ForgotPassword /></Suspense>;
}
