import { Link } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import MiniProductCard from '../../components/product/MiniProductCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { account } from '../../api/endpoints.js';
import { money } from '../../utils/format.js';
import { headlinePrice, num } from '../../utils/product.js';

export default function Dashboard() {
  const { customer } = useAuth();
  const { count: cartCount } = useCart();
  const { currencySymbol } = useBusiness();
  const wishlist = useWishlist();
  const { data } = useAsync((signal) => account.dashboard({ signal }), []);

  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || customer?.username || 'there';

  return (
    <DashLayout title="My Account">
      <div className="dash-welcome">
        <h4>
          Welcome back, {name} <span>&#128075;</span>
        </h4>
        <p>Here&rsquo;s a quick look at your account activity.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="wallet-card">
            <div className="wallet-card-main">
              <span className="wallet-card-label">Wallet Balance</span>
              <span className="wallet-card-amount">Coming soon</span>
              <span className="wallet-card-sub">Wallet features are being finalised</span>
            </div>
            <i className="bi bi-wallet2 wallet-card-icon"></i>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="row g-4 h-100">
            <div className="col-12">
              <div className="dash-stat-card is-amber">
                <span className="dash-stat-icon">
                  <i className="bi bi-currency-dollar"></i>
                </span>
                <div>
                  <span className="dash-stat-label">Total Spent</span>
                  <strong className="dash-stat-value">{money(num(data?.total_spent), currencySymbol)}</strong>
                </div>
                <Link to="/user/purchase-history" className="dash-stat-link">
                  View Order History <i className="bi bi-chevron-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-12">
              <div className="dash-stat-card is-green">
                <span className="dash-stat-icon">
                  <i className="bi bi-star"></i>
                </span>
                <div>
                  <span className="dash-stat-label">Reviews Written</span>
                  <strong className="dash-stat-value">{data?.total_reviews ?? '—'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <div className="panel dash-mini-stats">
            <div className="dash-mini-stat">
              <span className="dash-mini-icon is-red">
                <i className="bi bi-cart3"></i>
              </span>
              <div>
                <strong>{cartCount}</strong>
                <span>Products in Cart</span>
              </div>
            </div>
            <div className="dash-mini-stat">
              <span className="dash-mini-icon is-blue">
                <i className="bi bi-heart"></i>
              </span>
              <div>
                <strong>{data?.total_wishlist ?? wishlist.count}</strong>
                <span>Products in Wishlist</span>
              </div>
            </div>
            <div className="dash-mini-stat">
              <span className="dash-mini-icon is-green">
                <i className="bi bi-box-seam"></i>
              </span>
              <div>
                <strong>{data?.total_orders ?? '—'}</strong>
                <span>Total Orders</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="panel h-100">
            <h6 className="footer-title mb-3">Default Shipping Address</h6>
            <p className="oc-address">
              {name}
              <br />
              {customer?.address || 'No address on file yet.'}
              {customer?.city && <><br />{customer.city}</>}
              <br />
              {customer?.phone}
            </p>
            <Link to="/user/manage-profile" className="link-accent">
              Edit address
            </Link>
          </div>
        </div>
      </div>

      <div className="dash-block-head mt-2">
        <h5>My Wishlist</h5>
        <Link to="/user/wishlist" className="link-accent">
          View All
        </Link>
      </div>
      <div className="row g-4">
        {wishlist.rows.length === 0 ? (
          <div className="col-12">
            <p className="text-muted">No wishlist items yet.</p>
          </div>
        ) : wishlist.rows.slice(0, 4).map((r) => {
          const p = r.product;
          if (!p) return null;
          const price = headlinePrice(p);
          return (
            <div className="col-6 col-md-3" key={r.id}>
              <MiniProductCard name={p.name} image={p.thumbnail} priceNow={money(price.now, currencySymbol)} slug={p.slug} />
            </div>
          );
        })}
      </div>
    </DashLayout>
  );
}
