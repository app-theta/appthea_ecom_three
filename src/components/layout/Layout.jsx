import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader.jsx';
import Footer from './Footer.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import CartDrawer from './CartDrawer.jsx';
import QuickViewDrawer from './QuickViewDrawer.jsx';
import NewsletterPopup from './NewsletterPopup.jsx';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
