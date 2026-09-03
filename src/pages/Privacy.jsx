import { Link } from 'react-router-dom';
import LegalLayout from '../components/legal/LegalLayout.jsx';

const toc = [
  { id: 'p1', label: 'What we collect' },
  { id: 'p2', label: 'Why we use it' },
  { id: 'p3', label: 'Cookies' },
  { id: 'p4', label: 'Sharing with others' },
  { id: 'p5', label: 'How long we keep data' },
  { id: 'p6', label: 'Your rights' },
  { id: 'p7', label: 'Security' },
  { id: 'p8', label: 'Contact us' },
];

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="This policy sets out what data AppTheta Ecom collects, why we need it, and the control you have over it."
      toc={toc}
      lastUpdated="12 March 2026"
      cta={
        <>
          Questions about this page? <Link to="/contact">Contact the team</Link> and we will explain anything that
          is unclear.
        </>
      }
    >
      <div className="legal-block" id="p1">
        <h2>What we collect</h2>
        <p>We only ask for what an order needs.</p>
        <ul>
          <li>
            <strong>Account details</strong> &mdash; name, email, phone, password.
          </li>
          <li>
            <strong>Order details</strong> &mdash; delivery address, items, order history.
          </li>
          <li>
            <strong>Payment details</strong> &mdash; handled by our payment provider; card numbers never reach our
            servers.
          </li>
          <li>
            <strong>Usage data</strong> &mdash; pages visited, device and browser type.
          </li>
        </ul>
      </div>
      <div className="legal-block" id="p2">
        <h2>Why we use it</h2>
        <p>
          To process orders, run deliveries and returns, answer support messages, prevent fraud, and &mdash; only if
          you opt in &mdash; send marketing email. You can unsubscribe from any email in one click.
        </p>
      </div>
      <div className="legal-block" id="p3">
        <h2>Cookies</h2>
        <p>
          Essential cookies keep you logged in and hold your bag. Analytics cookies show us which pages work. You
          can refuse non-essential cookies in the banner or clear them in your browser at any time.
        </p>
      </div>
      <div className="legal-block" id="p4">
        <h2>Sharing with others</h2>
        <p>
          We share data with couriers, payment processors and email tools purely so they can do their job. We do
          not sell personal data. We may disclose information if the law requires it.
        </p>
      </div>
      <div className="legal-block" id="p5">
        <h2>How long we keep data</h2>
        <p>
          Order records are kept for seven years to satisfy tax rules. Marketing preferences are kept until you
          withdraw them. Closed accounts are deleted after two years of inactivity.
        </p>
      </div>
      <div className="legal-block" id="p6">
        <h2>Your rights</h2>
        <p>
          You can ask for a copy of your data, correct it, delete it, or object to marketing. Email us and we will
          respond within 30 days.
        </p>
      </div>
      <div className="legal-block" id="p7">
        <h2>Security</h2>
        <p>
          The site runs over HTTPS, passwords are hashed, and access to customer records is limited to staff who
          need it. No system is perfect, so please use a unique password.
        </p>
      </div>
      <div className="legal-block" id="p8">
        <h2>Contact us</h2>
        <p>
          Write to <a href="mailto:privacy@apptheta.com">privacy@apptheta.com</a> or use the{' '}
          <Link to="/contact">contact form</Link> for anything on this page.
        </p>
      </div>
    </LegalLayout>
  );
}
