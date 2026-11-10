'use client';

import { BusinessProvider } from '@/context/BusinessContext.jsx';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { WishlistProvider } from '@/context/WishlistContext.jsx';
import { CartProvider } from '@/context/CartContext.jsx';
import { ToastProvider } from '@/context/ToastContext.jsx';
import { QuickViewProvider } from '@/context/QuickViewContext.jsx';
import { CompareProvider } from '@/context/CompareContext.jsx';
import { ChatProvider } from '@/context/ChatContext.jsx';
import Layout from '@/components/layout/Layout.jsx';

/** Every browser-side store, around the header/footer shell. `initial` is the server's business read. */
export default function Providers({ initial, children }) {
  return (
    <BusinessProvider initial={initial}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ToastProvider>
              <QuickViewProvider>
                <CompareProvider>
                  <ChatProvider>
                    <Layout>{children}</Layout>
                  </ChatProvider>
                </CompareProvider>
              </QuickViewProvider>
            </ToastProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BusinessProvider>
  );
}
