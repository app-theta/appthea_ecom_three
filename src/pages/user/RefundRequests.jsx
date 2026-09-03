import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const initialRefunds = [
  { order: '#APT-09954', product: 'Everyday Denim Jacket', reason: 'Wrong size', date: 'Jun 24, 2026', status: 'Approved', badge: 'is-done' },
  { order: '#APT-10098', product: 'Silk Printed Neckties', reason: 'Changed my mind', date: 'Jul 11, 2026', status: 'Pending', badge: 'is-pending' },
];

export default function RefundRequests() {
  const [refunds, setRefunds] = useState(initialRefunds);
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
    setRefunds((prev) => [
      { order: form.rfOrder.value, product: 'Order item', reason: form.rfReason.value, date: 'Today', status: 'Pending', badge: 'is-pending' },
      ...prev,
    ]);
    toast.success('Your refund request has been submitted');
    if (window.bootstrap) {
      const modalEl = document.getElementById('newRefundModal');
      window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    }
    form.reset();
    setValidated(false);
  };

  return (
    <DashLayout title="Refund Requests">
      <div className="panel dash-table-panel">
        <div className="dash-block-head">
          <h5>Your Refund Requests</h5>
          <button type="button" className="btn btn-accent btn-sm" data-bs-toggle="modal" data-bs-target="#newRefundModal">
            <i className="bi bi-plus-lg"></i> New Refund Request
          </button>
        </div>
        <div className="table-responsive">
          <table className="table dash-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Product</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => (
                <tr key={r.order + r.product}>
                  <td data-label="Order">
                    <Link to="/track-order" className="link-accent">
                      {r.order}
                    </Link>
                  </td>
                  <td data-label="Product">{r.product}</td>
                  <td data-label="Reason">{r.reason}</td>
                  <td data-label="Date">{r.date}</td>
                  <td data-label="Status">
                    <span className={`dash-badge ${r.badge}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="modal fade" id="newRefundModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content review-modal-content">
            <div className="modal-header">
              <h5 className="modal-title">New Refund Request</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form className={`row g-3 needs-validation${validated ? ' was-validated' : ''}`} noValidate onSubmit={onSubmit}>
                <div className="col-12">
                  <label className="form-label" htmlFor="rfOrder">
                    Order number
                  </label>
                  <input type="text" name="rfOrder" className="form-control" id="rfOrder" placeholder="e.g. APT-10482" required />
                  <div className="invalid-feedback">Enter your order number.</div>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="rfReason">
                    Reason
                  </label>
                  <select className="form-select" name="rfReason" id="rfReason" defaultValue="" required>
                    <option value="" disabled>
                      Choose a reason
                    </option>
                    <option>Wrong size</option>
                    <option>Item damaged</option>
                    <option>Not as described</option>
                    <option>Changed my mind</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="rfNote">
                    Additional details
                  </label>
                  <textarea className="form-control" id="rfNote" rows="3" placeholder="Tell us more (optional)"></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-accent w-100">
                    Submit Request
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
