import LegalLayout from '../components/legal/LegalLayout.jsx';
import PolicyContent from '../components/legal/PolicyContent.jsx';
import { useSeoMeta } from '../hooks/useSeoMeta.js';

export default function Privacy() {
  useSeoMeta('privacy');
  return (
    <LegalLayout title="Privacy Policy">
      <PolicyContent field="privacy_policy" />
    </LegalLayout>
  );
}
