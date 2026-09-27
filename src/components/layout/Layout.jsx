import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader.jsx';
import Footer from './Footer.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import CartDrawer from './CartDrawer.jsx';
import QuickViewDrawer from './QuickViewDrawer.jsx';
import NewsletterPopup from './NewsletterPopup.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const { closed } = useBusiness();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // the API answered 423 - the shop is switched off or its subscription ended
  if (closed) {
    return (
      <section className="section">
        <div className="container text-center py-5">
          <i className="bi bi-shop" style={{ fontSize: 48, color: 'var(--accent)' }}></i>
          <h1 className="mt-3">We are closed right now</h1>
          <p className="text-muted mb-0">The shop is not taking orders at the moment. Please check back later.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <SiteHeader />
      <CartDrawer />
      <QuickViewDrawer />
      <NewsletterPopup />
      <Outlet />
      <Footer />
      <MobileBottomNav />
    </>
  );
}
