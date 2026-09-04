import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/user/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  { to: '/user/purchase-history', icon: 'bi-receipt', label: 'Purchase History' },
  { to: '/user/refund-requests', icon: 'bi-arrow-counterclockwise', label: 'Refund Requests' },
  { to: '/user/wishlist', icon: 'bi-heart', label: 'Wishlist' },
  { to: '/user/compare', icon: 'bi-arrow-left-right', label: 'Compare' },
  { to: '/user/my-wallet', icon: 'bi-wallet2', label: 'My Wallet' },
  { to: '/user/earning-points', icon: 'bi-award', label: 'Earning Points' },
  { to: '/user/support-ticket', icon: 'bi-life-preserver', label: 'Support Ticket' },
  { to: '/user/manage-profile', icon: 'bi-person-gear', label: 'Manage Profile' },
];

export default function DashSidebar() {
  const navigate = useNavigate();
  const { customer, logout } = useAuth();
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || customer?.username || 'Account';

  const onSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-user-card">
        <span className="dash-avatar">
          {customer?.avatar ? (
            <img src={customer.avatar} alt="" loading="lazy" />
          ) : (
            <span className="dash-avatar-fallback">{name.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <h6 className="dash-user-name">{name}</h6>
        <p className="dash-user-email">{customer?.email || customer?.phone}</p>
      </div>
      <nav className="dash-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/user/dashboard'}
                className={({ isActive }) => `dash-nav-link${isActive ? ' is-active' : ''}`}
              >
                <i className={`bi ${item.icon}`}></i> {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/user/delete-account"
              className={({ isActive }) => `dash-nav-link is-danger${isActive ? ' is-active' : ''}`}
            >
              <i className="bi bi-x-circle"></i> Delete My Account
            </NavLink>
          </li>
        </ul>
      </nav>
      <button type="button" className="btn dash-signout" onClick={onSignOut}>
        <i className="bi bi-box-arrow-right"></i> Sign Out
      </button>
    </aside>
  );
}
