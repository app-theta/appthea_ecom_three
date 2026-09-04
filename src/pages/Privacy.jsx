import LegalLayout from '../components/legal/LegalLayout.jsx';
import PolicyContent from '../components/legal/PolicyContent.jsx';

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <PolicyContent field="privacy_policy" />
    </LegalLayout>
  );
}
