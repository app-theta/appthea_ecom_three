import { Link } from 'react-router-dom';
import LegalLayout from '../components/legal/LegalLayout.jsx';

const toc = [
  { id: 't1', label: 'Using this site' },
  { id: 't2', label: 'Accounts' },
  { id: 't3', label: 'Orders and pricing' },
  { id: 't4', label: 'Shipping' },
  { id: 't5', label: 'Returns and refunds' },
  { id: 't6', label: 'Intellectual property' },
  { id: 't7', label: 'Liability' },
  { id: 't8', label: 'Changes to these terms' },
];

export default function Terms() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      intro="These terms explain what you can expect from AppTheta Ecom and what we expect from you when you shop with us."
      toc={toc}
      lastUpdated="12 March 2026"
      cta={
        <>
          Questions about this page? <Link to="/contact">Contact the team</Link> and we will explain anything that
          is unclear.
        </>
      }
    >
      <div className="legal-block" id="t1">
        <h2>Using this site</h2>
        <p>
          By browsing or ordering from AppTheta Ecom you accept the rules on this page. If you do not accept them,
          please do not use the site. You must be at least 18, or shopping with the consent of a parent or
          guardian.
        </p>
      </div>
      <div className="legal-block" id="t2">
        <h2>Accounts</h2>
        <p>You are responsible for keeping your password private and for everything that happens under your account.</p>
        <ul>
          <li>Give accurate details when you register.</li>
          <li>Tell us straight away if you think someone else has access.</li>
          <li>We may suspend an account used for fraud or abuse.</li>
        </ul>
      </div>
      <div className="legal-block" id="t3">
        <h2>Orders and pricing</h2>
        <p>
          An order is an offer to buy. It becomes a contract once we send the confirmation email. Prices include
          applicable VAT unless stated otherwise. If an item is listed at an obviously wrong price we will cancel
          the order and refund you in full.
        </p>
      </div>
      <div className="legal-block" id="t4">
        <h2>Shipping</h2>
        <p>
          Delivery windows are estimates, not guarantees. Risk passes to you on delivery. Import duty on
          international orders is paid by the customer.
        </p>
      </div>
      <div className="legal-block" id="t5">
        <h2>Returns and refunds</h2>
        <p>
          Unworn items with the tags attached can be returned within 14 days of delivery. Refunds go back to the
          original payment method within 7 working days of the return arriving. Underwear, swimwear and pierced
          jewellery cannot be returned for hygiene reasons.
        </p>
      </div>
      <div className="legal-block" id="t6">
        <h2>Intellectual property</h2>
        <p>
          Photography, copy, logos and page design belong to AppTheta Ecom. You may not copy or republish them
          commercially without written permission.
        </p>
      </div>
      <div className="legal-block" id="t7">
        <h2>Liability</h2>
        <p>
          We are responsible for foreseeable loss caused by us breaking this agreement. We are not liable for
          indirect loss, and nothing here limits liability for death, personal injury or fraud.
        </p>
      </div>
      <div className="legal-block" id="t8">
        <h2>Changes to these terms</h2>
        <p>
          We may update this page as the business changes. The version shown here is the one that applies to your
          order, so check the date before buying.
        </p>
      </div>
    </LegalLayout>
  );
}
