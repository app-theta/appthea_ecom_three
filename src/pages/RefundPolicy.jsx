import LegalLayout from '../components/legal/LegalLayout.jsx';
import PolicyContent from '../components/legal/PolicyContent.jsx';

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy">
      <PolicyContent field="refund_policy" />
    </LegalLayout>
  );
}
