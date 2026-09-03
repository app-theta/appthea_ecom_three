import { Link } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { account } from '../../api/endpoints.js';
import { money, statusTone, dateShort } from '../../utils/format.js';
import { paginated, num } from '../../utils/product.js';

export default function PurchaseHistory() {
  const { currencySymbol } = useBusiness();
  const toast = useToast();
  const { data, loading, reload } = useAsync((signal) => account.orders({ per_page: 20 }, { signal }), []);
  const { rows, total } = paginated(data);

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await account.deleteOrder(id);
      toast.success('Order cancelled');
      reload();
    } catch { toast.error('Could not cancel this order'); }
  };

  const downloadInvoice = async (id) => {
    try {
      const res = await account.orderDownload(id);
      if (res?.download_url) window.open(res.download_url, '_blank');
    } catch { toast.error('Could not download invoice'); }
  };

  return (
    <DashLayout title="Purchase History">
      <div className="panel dash-table-panel">
        <div className="dash-block-head">
          <h5>Your Orders</h5>
          <span className="text-muted">{total} orders</span>
        </div>
        <div className="table-responsive">
          {loading ? (
            <p className="p-4 mb-0">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-4 mb-0">You haven&rsquo;t placed any orders yet.</p>
          ) : (
            <table className="table dash-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Order">
                      <Link to={`/user/purchase-history/${o.id}`} className="link-accent">
                        {o.invoice_no || o.unique_code}
                      </Link>
                    </td>
                    <td data-label="Date">{dateShort(o.date)}</td>
                    <td data-label="Total">{money(num(o.total_amount), currencySymbol)}</td>
                    <td data-label="Status">
                      <span className={`dash-badge ${statusTone(o.sale_status)}`}>{o.sale_status}</span>
                    </td>
                    <td className="dash-table-action">
                      <Link to={`/user/purchase-history/${o.id}`} className="btn btn-outline-dark btn-sm">
                        View
                      </Link>
                      <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => downloadInvoice(o.id)}>
                        Invoice
                      </button>
                      {['Pending', 'Processing'].includes(o.sale_status) && (
                        <button type="button" className="btn btn-outline-dark btn-sm text-danger" onClick={() => cancelOrder(o.id)}>
                          Cancel
                        </button>
                      )}
                    </td>
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
