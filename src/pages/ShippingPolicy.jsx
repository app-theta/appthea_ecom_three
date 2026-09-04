import LegalLayout from '../components/legal/LegalLayout.jsx';
import PolicyContent from '../components/legal/PolicyContent.jsx';

export default function ShippingPolicy() {
  return (
    <LegalLayout title="Shipping Policy">
      <PolicyContent field="shipping_policy" />
    </LegalLayout>
  );
}
