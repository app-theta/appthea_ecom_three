import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { BusinessProvider } from './context/BusinessContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { QuickViewProvider } from './context/QuickViewContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BusinessProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ToastProvider>
                <QuickViewProvider>
                  <CompareProvider>
                    <ChatProvider>
                      <App />
                    </ChatProvider>
                  </CompareProvider>
                </QuickViewProvider>
              </ToastProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </BusinessProvider>
    </BrowserRouter>
  </StrictMode>
);
