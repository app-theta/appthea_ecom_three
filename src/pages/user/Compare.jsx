import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { money } from '../../utils/format.js';

const initialProducts = [
  { id: 1, image: '/assets/img/products/pro-1.jpg', name: 'Flowy Boho Maxi Dress', price: 33.99, rating: '★★★★½ (189)', category: 'Women’s Fashion', availability: 'In Stock', badge: 'is-done' },
  { id: 2, image: '/assets/img/products/pro-2.jpg', name: 'Classic Leather Strap Watch', price: 55.25, rating: '★★★★½ (142)', category: 'Jewelry & Watches', availability: 'In Stock', badge: 'is-done' },
  { id: 3, image: '/assets/img/products/pro-13.jpg', name: 'Round Tinted Sunglasses', price: 24.99, rating: '★★★★½ (112)', category: 'Accessories', availability: 'Low Stock', badge: 'is-pending' },
];

export default function Compare() {
  const { currencySymbol } = useBusiness();
  const [products, setProducts] = useState(initialProducts);
  const remove = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  return (
    <DashLayout title="Compare">
      <div className="panel dash-table-panel">
        <div className="table-responsive dash-compare-scroll">
          <table className="table dash-compare-table">
            <tbody>
              <tr className="dash-compare-imgs">
                <td>Product</td>
                {products.map((p) => (
                  <td key={p.id}>
                    <img src={p.image} alt={p.name} loading="lazy" />
                    <button type="button" className="dash-wish-remove" aria-label="Remove" onClick={() => remove(p.id)}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Name</td>
                {products.map((p) => (
                  <td key={p.id}>
                    <Link to="/product-details" className="link-accent">
                      {p.name}
                    </Link>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Price</td>
                {products.map((p) => (
                  <td key={p.id}>{money(p.price, currencySymbol)}</td>
                ))}
              </tr>
              <tr>
                <td>Rating</td>
                {products.map((p) => (
                  <td key={p.id}>{p.rating}</td>
                ))}
              </tr>
              <tr>
                <td>Category</td>
                {products.map((p) => (
                  <td key={p.id}>{p.category}</td>
                ))}
              </tr>
              <tr>
                <td>Availability</td>
                {products.map((p) => (
                  <td key={p.id}>
                    <span className={`dash-badge ${p.badge}`}>{p.availability}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td></td>
                {products.map((p) => (
                  <td key={p.id}>
                    <button type="button" className="btn btn-accent btn-sm w-100">
                      <i className="bi bi-cart3"></i> Add to Cart
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashLayout>
  );
}
