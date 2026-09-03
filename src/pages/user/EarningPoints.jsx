import DashLayout from '../../components/user/DashLayout.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';

const history = [
  { date: 'Aug 12, 2026', activity: 'Purchase — order #APT-10482', points: '+146 pts', badge: 'is-done' },
  { date: 'Aug 01, 2026', activity: 'Product review — Flowy Boho Maxi Dress', points: '+20 pts', badge: 'is-done' },
  { date: 'Jul 28, 2026', activity: 'Purchase — order #APT-10311', points: '+55 pts', badge: 'is-done' },
  { date: 'Jul 15, 2026', activity: 'Redeemed for wallet credit', points: '-100 pts', badge: 'is-danger' },
];

export default function EarningPoints() {
  const { currencySymbol } = useBusiness();
  return (
    <DashLayout title="Earning Points">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="wallet-card is-points">
            <div className="wallet-card-main">
              <span className="wallet-card-label">Club Points Balance</span>
              <span className="wallet-card-amount">
                240 <small>pts</small>
              </span>
              <span className="wallet-card-sub">&#8776; {currencySymbol}2.40 wallet credit</span>
              <button type="button" className="btn btn-accent wallet-recharge-btn">
                <i className="bi bi-arrow-repeat"></i> Convert to Wallet Credit
              </button>
            </div>
            <i className="bi bi-award wallet-card-icon"></i>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="panel h-100">
            <h6 className="footer-title mb-3">How to earn points</h6>
            <ul className="dash-feature-list">
              <li>
                <i className="bi bi-check2"></i> 1 point per {currencySymbol}1 spent
              </li>
              <li>
                <i className="bi bi-check2"></i> 20 points for a product review
              </li>
              <li>
                <i className="bi bi-check2"></i> 50 points on your birthday
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="panel dash-table-panel mt-4">
        <div className="dash-block-head">
          <h5>Points History</h5>
        </div>
        <div className="table-responsive">
          <table className="table dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.date + h.activity}>
                  <td>{h.date}</td>
                  <td>{h.activity}</td>
                  <td>
                    <span className={`dash-badge ${h.badge}`}>{h.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashLayout>
  );
}
