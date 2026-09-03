import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader.jsx';
import Footer from './Footer.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import CartDrawer from './CartDrawer.jsx';
import QuickViewDrawer from './QuickViewDrawer.jsx';

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
      <Outlet />
      <Footer />
      <MobileBottomNav />
    </>
  );
}
