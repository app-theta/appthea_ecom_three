import { useState } from 'react';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { money } from '../../utils/format.js';

const initialTransactions = [
  { date: 'Jun 24, 2026', desc: 'Refund — order #APT-09954', type: 'Credit', badge: 'is-done', amount: 32.5, balance: 32.5 },
  { date: 'Jun 25, 2026', desc: 'Used at checkout — order #APT-10098', type: 'Debit', badge: 'is-danger', amount: -32.5, balance: 0 },
];

export default function MyWallet() {
  const { currencySymbol } = useBusiness();
  const [balance, setBalance] = useState(0);
  const [lastRecharge, setLastRecharge] = useState(null);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [validated, setValidated] = useState(false);
  const toast = useToast();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    const form = e.currentTarget;
    const amount = Number(form.wAmount.value) || 0;
    const nextBalance = balance + amount;
    setBalance(nextBalance);
    setLastRecharge('Today');
    setTransactions((prev) => [
      { date: 'Today', desc: 'Wallet recharge', type: 'Credit', badge: 'is-done', amount, balance: nextBalance },
      ...prev,
    ]);
    toast.success('Wallet recharged successfully');
    if (window.bootstrap) {
      const modalEl = document.getElementById('rechargeModal');
      window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    }
    form.reset();
    setValidated(false);
  };

  return (
    <DashLayout title="My Wallet">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="wallet-card">
            <div className="wallet-card-main">
              <span className="wallet-card-label">Wallet Balance</span>
              <span className="wallet-card-amount">{money(balance, currencySymbol)}</span>
              <span className="wallet-card-sub">Last recharge: {lastRecharge || '—'}</span>
              <button type="button" className="btn btn-accent wallet-recharge-btn" data-bs-toggle="modal" data-bs-target="#rechargeModal">
                <i className="bi bi-plus-lg"></i> Recharge Wallet
              </button>
            </div>
            <i className="bi bi-wallet2 wallet-card-icon"></i>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="panel h-100">
            <h6 className="footer-title mb-3">How wallet credit works</h6>
            <ul className="dash-feature-list">
              <li>
                <i className="bi bi-check2"></i> Use balance instantly at checkout
              </li>
              <li>
                <i className="bi bi-check2"></i> Refunds are credited here first
              </li>
              <li>
                <i className="bi bi-check2"></i> Never expires
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="panel dash-table-panel mt-4">
        <div className="dash-block-head">
          <h5>Transaction History</h5>
        </div>
        <div className="table-responsive">
          <table className="table dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.date + t.type}>
                  <td>{t.date}</td>
                  <td>{t.desc}</td>
                  <td>
                    <span className={`dash-badge ${t.badge}`}>{t.type}</span>
                  </td>
                  <td>{t.amount < 0 ? '−' : '+'}{money(Math.abs(t.amount), currencySymbol)}</td>
                  <td>{money(t.balance, currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="modal fade" id="rechargeModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content review-modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Recharge Wallet</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form className={`row g-3 needs-validation${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
                <div className="col-12">
                  <label className="form-label" htmlFor="wAmount">
                    Amount ({currencySymbol})
                  </label>
                  <input type="number" name="wAmount" min="5" className="form-control" id="wAmount" placeholder="50" required />
                  <div className="invalid-feedback">Enter an amount of at least {currencySymbol}5.</div>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-accent w-100">
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashLayout>
  );
}
