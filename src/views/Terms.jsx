'use client';

import LegalLayout from '../components/legal/LegalLayout.jsx';
import PolicyContent from '../components/legal/PolicyContent.jsx';

export default function Terms() {
  return (
    <LegalLayout title="Terms & Conditions">
      <PolicyContent field="terms_condition" />
    </LegalLayout>
  );
}
