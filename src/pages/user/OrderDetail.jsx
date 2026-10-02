import { Link, useParams } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { account } from '../../api/endpoints.js';
import { money, statusTone, dateShort } from '../../utils/format.js';
import { num } from '../../utils/product.js';
import { parseApiError } from '../../api/errors.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import OrderReturns from '../../components/user/OrderReturns.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const { currencySymbol } = useBusiness();
  const toast = useToast();
  const chat = useChat();
  const { data, loading, error, reload } = useAsync((signal) => account.orderDetails(id, { signal }), [id]);
  const order = data?.order;

  const cancel = async () => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    try {
      await account.cancelOrder(order.id);
      toast.success('Your order was cancelled');
      reload();
    } catch (e) { toast.error(parseApiError(e).message); }
  };

  return (
    <DashLayout title={order?.invoice_no || order?.unique_code || 'Order'}>
      <div className="mb-3 d-flex align-items-center justify-content-between gap-2 flex-wrap">
        <Link to="/user/purchase-history" className="link-accent">
          <i className="bi bi-arrow-left"></i> Back to orders
        </Link>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {order && chat.enabled && (
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => chat.openChat({ order: { id: order.id, invoice_no: order.invoice_no || order.unique_code } })}>
              <i className="bi bi-chat-dots"></i> Help with this order
            </button>
          )}
          {order?.can_cancel && (
            <button type="button" className="btn btn-outline-dark btn-sm text-danger" onClick={cancel}>Cancel order</button>
          )}
        </div>
      </div>

      {loading && !data ? (
        <p>Loading…</p>
      ) : error || !order ? (
        <p>{error?.message || 'Order not found.'}</p>
      ) : (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="panel">
              <div className="dash-block-head">
                <h5>Items</h5>
                <span className={`dash-badge ${statusTone(order.sale_status)}`}>{order.sale_status}</span>
              </div>
              <ul className="checkout-mini-cart mb-0">
                {(order.products || []).map((item) => (
                  <li key={item.id}>
                    <div className="cart-thumb cart-thumb-sm">
                      <img src={item.product?.thumbnail} alt="" loading="lazy" />
                      <span className="mini-cart-qty">{item.quantity}</span>
                    </div>
                    <span className="mini-cart-name">
                      {item.product?.name}
                      <small className="d-block text-muted">
                        {item.barcode?.combination ? `${item.barcode.combination} · ` : ''}{money(num(item.selling_price), currencySymbol)} × {num(item.quantity)}
                      </small>
                    </span>
                    <span className="mini-cart-price">{money(num(item.subtotal_price), currencySymbol)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {Array.isArray(order.status_activities) && order.status_activities.length > 0 && (
              <div className="panel mt-4">
                <h5 className="mb-3">Order Timeline</h5>
                <ol className="track-timeline">
                  {order.status_activities.map((a, i) => (
                    <li className="is-done" key={i}>
                      <span className="track-icon"><i className="bi bi-check-lg"></i></span>
                      <div className="track-info">
                        <strong>{a.status}</strong>
                        <span>{dateShort(a.date_time)}</span>
                        {a.note && <p>{a.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="col-lg-5">
            <div className="panel mb-4">
              <h5 className="mb-3">Summary</h5>
              <div className="order-summary-row">
                <span>Subtotal</span>
                <strong>{money(num(order.sub_total), currencySymbol)}</strong>
              </div>
              <div className="order-summary-row">
                <span>Shipping</span>
                <strong>{money(num(order.shipping_charge), currencySymbol)}</strong>
              </div>
              {num(order.discount_amount) > 0 && (
                <div className="order-summary-row">
                  <span>Discount</span>
                  <strong className="text-accent">&minus; {money(num(order.discount_amount), currencySymbol)}</strong>
                </div>
              )}
              {num(order.discount_coupon_amount) > 0 && (
                <div className="order-summary-row">
                  <span>Coupon</span>
                  <strong className="text-accent">&minus; {money(num(order.discount_coupon_amount), currencySymbol)}</strong>
                </div>
              )}
              <div className="order-summary-total">
                <span>Total</span>
                <strong>{money(num(order.total_amount), currencySymbol)}</strong>
              </div>
              {num(order.returned_amount) > 0 && (
                <div className="order-summary-row">
                  <span>Returned</span>
                  <strong>&minus; {money(num(order.returned_amount), currencySymbol)}</strong>
                </div>
              )}
              <div className="order-summary-row">
                <span>Paid <span className={`dash-badge ms-1 ${order.sale_paid_status === 'Paid' ? 'is-done' : 'is-pending'}`}>{order.sale_paid_status}</span></span>
                <strong>{money(num(order.paid_amount), currencySymbol)}</strong>
              </div>
              {num(order.due_amount) > 0 && (
                <div className="order-summary-row">
                  <span>Due</span>
                  <strong className="text-danger">{money(num(order.due_amount), currencySymbol)}</strong>
                </div>
              )}
            </div>

            <div className="panel">
              <h5 className="mb-3">Delivery</h5>
              <p className="oc-address mb-2">
                {order.shipping_address?.name}
                <br />
                {order.shipping_address?.phone}
                <br />
                {[order.shipping_address?.address, order.shipping_address?.city, order.shipping_address?.zip_code].filter(Boolean).join(', ')}
              </p>
              {order.payment_type && (
                <p className="text-muted mb-0"><i className="bi bi-credit-card me-1"></i>{order.payment_type}</p>
              )}
            </div>
          </div>
          {(order.can_request_return || num(order.returned_amount) > 0) && (
            <div className="col-12">
              <OrderReturns orderId={order.id} onChanged={reload} />
            </div>
          )}
        </div>
      )}
    </DashLayout>
  );
}
