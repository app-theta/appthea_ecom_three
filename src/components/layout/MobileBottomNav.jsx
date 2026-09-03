import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

export default function MobileBottomNav() {
  const { count } = useCart();

  return (
    <nav className="mobile-tabbar d-lg-none">
      <button
        type="button"
        className="mobile-tabbar-link"
        data-bs-toggle="offcanvas"
        data-bs-target="#mobileNav"
      >
        <i className="bi bi-grid-3x3-gap"></i>
        <span>Category</span>
      </button>
      <NavLink to="/user/wishlist" className="mobile-tabbar-link">
        <i className="bi bi-heart"></i>
        <span>Wishlist</span>
      </NavLink>
      <NavLink to="/" end className="mobile-tabbar-home" aria-label="Home">
        <i className="bi bi-house-door-fill"></i>
      </NavLink>
      <button
        type="button"
        className="mobile-tabbar-link"
        data-bs-toggle="offcanvas"
        data-bs-target="#cartDrawer"
      >
        <span className="mobile-tabbar-cart-icon">
          <i className="bi bi-bag"></i>
          <span className="mobile-tabbar-badge js-tabbar-cart-badge" style={{ display: count ? 'flex' : 'none' }}>
            {count}
          </span>
        </span>
        <span>Cart</span>
      </button>
      <NavLink to="/user/dashboard" className="mobile-tabbar-link">
        <i className="bi bi-person"></i>
        <span>Account</span>
      </NavLink>
    </nav>
  );
}
