import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { catalog } from '../../api/endpoints.js';
import { categoryColumns } from '../../utils/categoryTree.js';
import { money } from '../../utils/format.js';
import { headlinePrice, productImages, paginated, imageUrl } from '../../utils/product.js';

const isDesktop = () => window.innerWidth >= 992;

const langOptions = ['English (USD)', 'বাংলা (BDT)', 'العربية (AED)', 'Français (EUR)'];

const offerLinks = ['Flash Sale', 'Buy 1 Get 1', 'Clearance', 'Coupon Zone'];

export default function SiteHeader() {
  const { count: cartCount } = useCart();
  const { info, categories, currencySymbol } = useBusiness();
  const { isAuthed, customer } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const [openDropdown, setOpenDropdown] = useState(null); // 'lang' | 'offer' | 'account' | null
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langCurrent, setLangCurrent] = useState(langOptions[0]);
  const [isStuck, setIsStuck] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchToggleRef = useRef(null);
  const searchPanelRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileNavRef = useRef(null);

  const megaColumns = useMemo(() => categoryColumns(categories, 4), [categories]);

  const closeAll = () => {
    setOpenDropdown(null);
    setMegaOpen(false);
  };

  useEffect(() => {
    function onDocClick(e) {
      closeAll();
      if (
        searchPanelRef.current &&
        searchToggleRef.current &&
        !searchPanelRef.current.contains(e.target) &&
        !searchToggleRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        closeAll();
        setSearchOpen(false);
      }
    }
    function onScroll() {
      setIsStuck(window.scrollY > 10);
    }
    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(closeAll, 150);
    }

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    onScroll();

    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setHits([]); setSearching(false); return undefined; }
    setSearching(true);
    const controller = new AbortController();
    const t = setTimeout(() => {
      catalog.products({ keyword: q, per_page: 6 }, { signal: controller.signal })
        .then((data) => setHits(paginated(data).rows))
        .catch((e) => { if (e?.code !== 'ERR_CANCELED') setHits([]); })
        .finally(() => setSearching(false));
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [query]);

  const toggleDropdown = (id) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMegaOpen(false);
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const hoverOpenDropdown = (id) => () => {
    if (!isDesktop()) return;
    setMegaOpen(false);
    setOpenDropdown(id);
  };
  const hoverCloseDropdown = () => {
    if (!isDesktop()) return;
    setOpenDropdown(null);
  };

  const toggleMega = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdown(null);
    setMegaOpen((prev) => !prev);
  };
  const hoverOpenMega = () => {
    if (!isDesktop()) return;
    setOpenDropdown(null);
    setMegaOpen(true);
  };
  const hoverCloseMega = () => {
    if (!isDesktop()) return;
    setMegaOpen(false);
  };

  const toggleSearch = (e) => {
    e.stopPropagation();
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
      return next;
    });
  };

  const goSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    navigate(`/shop?keyword=${encodeURIComponent(query.trim())}`);
  };

  const closeMobileNav = () => {
    if (!mobileNavRef.current || !window.bootstrap) return;
    window.bootstrap.Offcanvas.getOrCreateInstance(mobileNavRef.current).hide();
  };

  return (
    <>
      {/* ============================= TOP BAR ============================= */}
      <div className="topbar">
        <div className="container">
          <div className="topbar-inner">
            <ul className="topbar-social">
              <li>
                <a href={info?.facebook_link || '#'} aria-label="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
              </li>
              <li>
                <a href={info?.instagram_link || '#'} aria-label="Instagram">
                  <i className="bi bi-instagram"></i>
                </a>
              </li>
              <li>
                <a href="#" aria-label="LinkedIn">
                  <i className="bi bi-linkedin"></i>
                </a>
              </li>
            </ul>

            {isHome && (
              <div className="topbar-ticker" aria-label="Store announcements">
                <div className="topbar-ticker-track">
                  <span>30% discount on every product</span>
                  <span>Return and refund policy available</span>
                  <span>Free shipping on selected orders</span>
                  <span>New arrivals are live now</span>
                </div>
              </div>
            )}

            <ul className="topbar-meta">
              <li>
                <a href={info?.phone ? `tel:${info.phone}` : undefined}>
                  <i className="bi bi-telephone"></i>
                  <span>{info?.phone || '—'}</span>
                </a>
              </li>
              <li className="d-none d-sm-block">
                <Link to="track-order">
                  <i className="bi bi-truck"></i>
                  <span>Track Order</span>
                </Link>
              </li>
              <li
                className={`lang-switch js-dropdown${openDropdown === 'lang' ? ' open' : ''}`}
                onMouseEnter={hoverOpenDropdown('lang')}
                onMouseLeave={hoverCloseDropdown}
              >
                <button
                  type="button"
                  className="lang-toggle js-dropdown-toggle"
                  aria-expanded={openDropdown === 'lang'}
                  onClick={toggleDropdown('lang')}
                >
                  <i className="bi bi-globe2"></i>
                  <span className="lang-current">{langCurrent}</span>
                  <i className="bi bi-chevron-down caret"></i>
                </button>
                <ul className="lang-menu js-dropdown-menu">
                  {langOptions.map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        className={`lang-option${langCurrent === opt ? ' is-active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLangCurrent(opt);
                          closeAll();
                        }}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ============================= MAIN HEADER ============================= */}
      <header className={`main-header${isStuck ? ' is-stuck' : ''}`} id="mainHeader">
        <div className="container">
          <div className="header-inner">
            <button
              className="icon-btn d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileNav"
              aria-label="Open menu"
            >
              <i className="bi bi-list"></i>
            </button>

            {/* LEFT : main menu */}
            <nav className="header-nav d-none d-lg-block">
              <ul className="nav-list">
                <li>
                  <NavLink to="" end className="nav-link">
                    Home
                  </NavLink>
                </li>

                <li
                  className={`has-mega js-mega${megaOpen ? ' open' : ''}`}
                  onMouseEnter={hoverOpenMega}
                  onMouseLeave={hoverCloseMega}
                >
                  <a href="#" className="nav-link js-mega-toggle" onClick={toggleMega}>
                    Categories
                    <i className="bi bi-chevron-down caret"></i>
                  </a>
                  <div className="mega-menu js-mega-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="container">
                      <div className="row g-4">
                        {megaColumns.map((col, i) => (
                          <div className="col-lg-3 col-md-6" key={i}>
                            {col.map((cat) => (
                              <div key={cat.id} className="mb-3">
                                <h6>
                                  <Link className="mega-title" to={`/shop?category=${cat.slug}`}>{cat.label}</Link>
                                </h6>
                                {cat.children.length > 0 && (
                                  <ul className="mega-list">
                                    {cat.children.map((child) => (
                                      <li key={child.slug}>
                                        <Link to={`/shop?category=${child.slug}`}>{child.name}</Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                <li>
                  <NavLink to="shop" className="nav-link">
                    Shop
                  </NavLink>
                </li>

                <li
                  className={`js-dropdown${openDropdown === 'offer' ? ' open' : ''}`}
                  onMouseEnter={hoverOpenDropdown('offer')}
                  onMouseLeave={hoverCloseDropdown}
                >
                  <a
                    href="#"
                    className="nav-link js-dropdown-toggle"
                    aria-expanded={openDropdown === 'offer'}
                    onClick={toggleDropdown('offer')}
                  >
                    Offer <i className="bi bi-chevron-down caret"></i>
                  </a>
                  <ul className="drop-menu js-dropdown-menu">
                    {offerLinks.map((item) => (
                      <li key={item}>
                        <a href="#">{item}</a>
                      </li>
                    ))}
                  </ul>
                </li>

                <li>
                  <NavLink to="contact" className="nav-link">
                    Contact Us
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* CENTER : logo */}
            <Link to="" className="brand">
              {info?.name || 'AppTheta Ecom'}<span>.</span>
            </Link>

            {/* RIGHT : action icons */}
            <div className="header-actions">
              <button
                ref={searchToggleRef}
                className="icon-btn js-search-toggle"
                type="button"
                aria-label="Search"
                aria-expanded={searchOpen}
                onClick={toggleSearch}
              >
                <i className="bi bi-search"></i>
              </button>

              <Link
                to="user/wishlist"
                className="icon-btn d-none d-sm-inline-flex"
                aria-label="Wishlist"
              >
                <i className="bi bi-heart"></i>
                <span className="badge-count">{wishlistCount}</span>
              </Link>

              <button
                className="icon-btn"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#cartDrawer"
                aria-label="Cart"
              >
                <i className="bi bi-bag"></i>
                <span className="badge-count">{cartCount}</span>
              </button>

              <div
                className={`js-dropdown user-box${openDropdown === 'account' ? ' open' : ''}`}
                onMouseEnter={hoverOpenDropdown('account')}
                onMouseLeave={hoverCloseDropdown}
              >
                <button
                  className="icon-btn js-dropdown-toggle"
                  type="button"
                  aria-label="Account"
                  aria-expanded={openDropdown === 'account'}
                  onClick={toggleDropdown('account')}
                >
                  <i className="bi bi-person"></i>
                </button>
                <ul className="drop-menu drop-end js-dropdown-menu">
                  {isAuthed ? (
                    <>
                      <li>
                        <span className="dropdown-item-text text-truncate d-block">
                          {[customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || customer?.username}
                        </span>
                      </li>
                      <li><hr className="drop-divider" /></li>
                      <li>
                        <Link to="user/dashboard">
                          <i className="bi bi-speedometer2"></i> My Account
                        </Link>
                      </li>
                      <li>
                        <Link to="user/purchase-history">
                          <i className="bi bi-bag-check"></i> My Orders
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to="login">
                          <i className="bi bi-box-arrow-in-right"></i> Login
                        </Link>
                      </li>
                      <li>
                        <Link to="register">
                          <i className="bi bi-person-plus"></i> Register
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH DROPDOWN */}
        <div className="search-drop-wrap">
          <div className="container">
            <div
              ref={searchPanelRef}
              className={`search-drop js-search-panel${searchOpen ? ' open' : ''}`}
            >
              <button
                type="button"
                className="search-close js-search-close"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
              <form className="search-form" role="search" onSubmit={goSearch}>
                <input
                  ref={searchInputRef}
                  type="search"
                  className="search-input js-search-input"
                  placeholder="Search for products…"
                  aria-label="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="btn-search">
                  Search
                </button>
              </form>
              {query.trim() !== '' && (
                <div className="search-live-results">
                  {searching ? (
                    <p className="p-3 mb-0">Searching…</p>
                  ) : hits.length === 0 ? (
                    <p className="p-3 mb-0">No products found for &ldquo;{query}&rdquo;</p>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {hits.map((p) => {
                        const price = headlinePrice(p);
                        return (
                          <li key={p.id}>
                            <Link
                              to={`/product/${p.slug}`}
                              className="d-flex align-items-center gap-3 p-2 text-decoration-none"
                              onClick={() => setSearchOpen(false)}
                            >
                              <img src={imageUrl(productImages(p)[0])} alt="" width="40" height="50" style={{ objectFit: 'cover', borderRadius: 4 }} />
                              <span className="flex-grow-1">{p.name}</span>
                              <span>{money(price.now, currencySymbol)}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================= MOBILE NAV ============================= */}
      <div
        ref={mobileNavRef}
        className="offcanvas offcanvas-start mobile-nav"
        tabIndex="-1"
        id="mobileNav"
        aria-labelledby="mobileNavLabel"
      >
        <div className="offcanvas-header">
          <span className="brand brand-sm" id="mobileNavLabel">
            {info?.name || 'AppTheta Ecom'}<span>.</span>
          </span>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="m-nav">
            <li>
              <Link to="" onClick={closeMobileNav}>Home</Link>
            </li>
            <li>
              <a
                className="m-toggle collapsed"
                data-bs-toggle="collapse"
                href="#mCategories"
                role="button"
                aria-expanded="false"
              >
                Categories <i className="bi bi-chevron-down"></i>
              </a>
              <div className="collapse" id="mCategories">
                <div className="m-sub">
                  <ul>
                    {megaColumns.flat().map((cat) => (
                      <li key={cat.id}>
                        <Link to={`/shop?category=${cat.slug}`} onClick={closeMobileNav}>{cat.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
            <li>
              <Link to="shop" onClick={closeMobileNav}>Shop</Link>
            </li>
            <li>
              <a
                className="m-toggle collapsed"
                data-bs-toggle="collapse"
                href="#mOffer"
                role="button"
                aria-expanded="false"
              >
                Offer <i className="bi bi-chevron-down"></i>
              </a>
              <div className="collapse" id="mOffer">
                <div className="m-sub">
                  <ul>
                    {offerLinks.map((item) => (
                      <li key={item}>
                        <a href="#">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
            <li>
              <Link to="blog" onClick={closeMobileNav}>
                Blog
              </Link>
            </li>
            <li>
              <Link to="contact" onClick={closeMobileNav}>
                Contact Us
              </Link>
            </li>
          </ul>

          <div className="m-extra">
            <Link to="user/wishlist" className="m-extra-link" onClick={closeMobileNav}>
              <i className="bi bi-heart"></i>
              Wishlist{' '}
              <span className="badge-count static">{wishlistCount}</span>
            </Link>
            {isAuthed ? (
              <Link to="user/dashboard" className="m-extra-link" onClick={closeMobileNav}>
                <i className="bi bi-person"></i>
                My Account
              </Link>
            ) : (
              <Link to="login" className="m-extra-link" onClick={closeMobileNav}>
                <i className="bi bi-person"></i>
                Login / Register
              </Link>
            )}
            <Link to="track-order" className="m-extra-link" onClick={closeMobileNav}>
              <i className="bi bi-truck"></i>
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
