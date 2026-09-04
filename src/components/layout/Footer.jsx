import { Link } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { categoryNavTree } from '../../utils/categoryTree.js';

export default function Footer() {
  const { info, categories } = useBusiness();

  const name = info?.name || 'AppTheta Ecom';
  const shopLinks = categoryNavTree(categories).slice(0, 4);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="brand brand-footer">
              {name}
              <span>.</span>
            </Link>
            <p className="footer-text">
              Everyday wear made to last &mdash; dresses, accessories and winter staples, shipped
              worldwide.
            </p>
            <ul className="footer-social">
              {info?.facebook_link && (
                <li>
                  <a href={info?.facebook_link || '#'} aria-label="Facebook" target='__blank'>
                    <i className="bi bi-facebook"></i>
                  </a>
                </li>
              )}
              {info?.instagram_link && (
                <li>
                  <a href={info?.instagram_link || '#'} aria-label="Instagram" target='__blank'>
                    <i className="bi bi-instagram"></i>
                  </a>
                </li>
              )}
              {info?.linkedin_link && (
                <li>
                  <a href={info?.linkedin_link || '#'} aria-label="LinkedIn" target='__blank'>
                    <i className="bi bi-linkedin"></i>
                  </a>
                </li>
              )}
              {info?.x_link && (
                <li>
                  <a href={info?.x_link || '#'} aria-label="X" target='__blank'>
                    <i className="bi bi-twitter"></i>
                  </a>
                </li>
              )}
              {info?.youtube_link && (
                <li>
                  <a href={info?.youtube_link || '#'} aria-label="YouTube" target='__blank'>
                    <i className="bi bi-youtube"></i>
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="footer-title">
              Shop
            </h6>
            <ul className="footer-links">
              {shopLinks.length === 0 ? (
                <li>
                  <Link to="/shop">
                    <i className="bi bi-chevron-double-right"></i>
                    All Products
                  </Link>
                </li>
              ) : shopLinks.map((c) => (
                <li key={c.id}>
                  <Link to={`/shop?category=${c.slug}`}>
                    <i className="bi bi-chevron-double-right"></i>
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/blog">
                  <i className="bi bi-chevron-double-right"></i>
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="footer-title">Company</h6>
            <ul className="footer-links">
              <li>
                <Link to="/contact">
                  <i className="bi bi-chevron-double-right"></i>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms">
                  <i className="bi bi-chevron-double-right"></i>
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy">
                  <i className="bi bi-chevron-double-right"></i>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy">
                  <i className="bi bi-chevron-double-right"></i>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy">
                  <i className="bi bi-chevron-double-right"></i>
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy">
                  <i className="bi bi-chevron-double-right"></i>
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-12">
            <h6 className="footer-title">Contact Us</h6>
            <ul className="footer-contact">
              <li>
                <i className="bi bi-geo-alt"></i>
                <span>{info?.address || '—'}</span>
              </li>
              <li>
                <i className="bi bi-envelope"></i>
                <a href={info?.email ? `mailto:${info.email}` : undefined}>{info?.email || '—'}</a>
              </li>
              <li>
                <i className="bi bi-telephone"></i>
                <a href={info?.phone ? `tel:${info.phone}` : undefined}>{info?.phone || '—'}</a>
              </li>
            </ul>
            {info?.features?.is_subscribe_newsletter && (
              <>
                <form className="footer-form input-group" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email address"
                    aria-label="Email address"
                  />
                  <button className="btn btn-accent" type="submit">
                    Join
                  </button>
                </form>
                <p className="footer-note">
                  Get 10% off your first order. Unsubscribe any time.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
          <ul>
            <li>
              <Link to="/terms">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/privacy">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/contact">
                Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
