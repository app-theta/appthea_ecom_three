import LegalLayout from '../components/legal/LegalLayout.jsx';
import PolicyContent from '../components/legal/PolicyContent.jsx';

export default function ReturnPolicy() {
  return (
    <LegalLayout title="Return Policy">
      <PolicyContent field="return_policy" />
    </LegalLayout>
  );
}
