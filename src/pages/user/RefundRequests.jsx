import { Link } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { account, returns as returnsApi } from '../../api/endpoints.js';
import { money, dateShort, returnTone } from '../../utils/format.js';
import { paginated } from '../../utils/product.js';

/**
 * Returns & refunds: the delivered orders the customer can still ask a return for (the request is
 * made on the order's page, item by item), and every request made so far.
 */
export default function RefundRequests() {
  const { currencySymbol } = useBusiness();
  const mine = useAsync((signal) => returnsApi.mine({ per_page: 50 }, { signal }), []);
  const delivered = useAsync((signal) => account.orders({ status: 'Delivery', per_page: 20 }, { signal }), []);
  const requests = paginated(mine.data).rows;
  const orders = paginated(delivered.data).rows;
  // an order with a request still open can't take another one yet
  const inProgress = new Set(requests.filter((r) => ['Requested', 'Approved'].includes(r.status)).map((r) => r.order?.id));

  return (
    <DashLayout title="Refund Requests">
      <div className="panel mb-4">
        <div className="dash-block-head">
          <h5>Ask for a return</h5>
          <span className="text-muted">Delivered orders</span>
        </div>
        {delivered.loading ? (
          <p className="mb-0">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-muted mb-0">Only delivered orders can be returned. You have none yet.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="d-flex align-items-center justify-content-between gap-3 py-2 border-bottom">
              <span><strong>{o.invoice_no}</strong> <small className="text-muted">· delivered order from {dateShort(o.date)}</small></span>
              {inProgress.has(o.id)
                ? <span className="dash-badge is-pending">Return in progress</span>
                : <Link className="btn btn-outline-dark btn-sm" to={`/user/purchase-history/${o.id}#returns`}>Return items</Link>}
            </div>
          ))
        )}
      </div>

      <div className="panel dash-table-panel">
        <div className="dash-block-head">
          <h5>Your Refund Requests</h5>
          <span className="text-muted">{requests.length} requests</span>
        </div>
        <div className="table-responsive">
          {mine.loading ? (
            <p className="p-4 mb-0">Loading…</p>
          ) : mine.error ? (
            <p className="p-4 mb-0 text-danger">{mine.error.message}</p>
          ) : requests.length === 0 ? (
            <p className="p-4 mb-0">You have not asked for a return yet.</p>
          ) : (
            <table className="table dash-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Order</th>
                  <th>Items</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Request">{r.return_no}</td>
                    <td data-label="Order">
                      <Link to={`/user/purchase-history/${r.order?.id}`} className="link-accent">{r.order?.invoice_no}</Link>
                    </td>
                    <td data-label="Items">{r.items.map((line) => `${line.product} × ${line.quantity}`).join(', ')}</td>
                    <td data-label="Reason">{r.reason}</td>
                    <td data-label="Date">{dateShort(r.requested_at)}</td>
                    <td data-label="Value">
                      {money(r.total_amount, currencySymbol)}
                      {r.refunded_amount > 0 && <small className="d-block text-muted">refunded {money(r.refunded_amount, currencySymbol)}</small>}
                    </td>
                    <td data-label="Status"><span className={`dash-badge ${returnTone(r.status)}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashLayout>
  );
}
