import LegalLayout from '../components/legal/LegalLayout.jsx';
import PolicyContent from '../components/legal/PolicyContent.jsx';
import { useSeoMeta } from '../hooks/useSeoMeta.js';

export default function Terms() {
  useSeoMeta('terms');
  return (
    <LegalLayout title="Terms & Conditions">
      <PolicyContent field="terms_condition" />
    </LegalLayout>
  );
}
