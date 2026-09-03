import { Link, useParams } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { account } from '../../api/endpoints.js';
import { money, statusTone, dateShort } from '../../utils/format.js';
import { num } from '../../utils/product.js';

export default function OrderDetail() {
  const { id } = useParams();
  const { currencySymbol } = useBusiness();
  const { data, loading, error } = useAsync((signal) => account.orderDetails(id, { signal }), [id]);
  const order = data?.order;

  return (
    <DashLayout title={order?.invoice_no || order?.unique_code || 'Order'}>
      <div className="mb-3">
        <Link to="/user/purchase-history" className="link-accent">
          <i className="bi bi-arrow-left"></i> Back to orders
        </Link>
      </div>

      {loading ? (
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
                    <span className="mini-cart-name">{item.product?.name}</span>
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
              <div className="order-summary-total">
                <span>Total</span>
                <strong>{money(num(order.total_amount), currencySymbol)}</strong>
              </div>
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
        </div>
      )}
    </DashLayout>
  );
}
