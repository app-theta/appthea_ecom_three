import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Blog from './pages/Blog.jsx';
import Contact from './pages/Contact.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import ShippingPolicy from './pages/ShippingPolicy.jsx';
import RefundPolicy from './pages/RefundPolicy.jsx';
import ReturnPolicy from './pages/ReturnPolicy.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import OrderComplete from './pages/OrderComplete.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import PurchaseHistory from './pages/user/PurchaseHistory.jsx';
import OrderDetail from './pages/user/OrderDetail.jsx';
import RefundRequests from './pages/user/RefundRequests.jsx';
import Wishlist from './pages/user/Wishlist.jsx';
import Compare from './pages/user/Compare.jsx';
import MyWallet from './pages/user/MyWallet.jsx';
import EarningPoints from './pages/user/EarningPoints.jsx';
import SupportTicket from './pages/user/SupportTicket.jsx';
import ManageProfile from './pages/user/ManageProfile.jsx';
import DeleteAccount from './pages/user/DeleteAccount.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/order-complete" element={<OrderComplete />} />
        <Route path="/user/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/user/purchase-history" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
        <Route path="/user/purchase-history/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/user/refund-requests" element={<ProtectedRoute><RefundRequests /></ProtectedRoute>} />
        <Route path="/user/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/user/compare" element={<Compare />} />
        <Route path="/user/my-wallet" element={<ProtectedRoute><MyWallet /></ProtectedRoute>} />
        <Route path="/user/earning-points" element={<ProtectedRoute><EarningPoints /></ProtectedRoute>} />
        <Route path="/user/support-ticket" element={<ProtectedRoute><SupportTicket /></ProtectedRoute>} />
        <Route path="/user/manage-profile" element={<ProtectedRoute><ManageProfile /></ProtectedRoute>} />
        <Route path="/user/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
