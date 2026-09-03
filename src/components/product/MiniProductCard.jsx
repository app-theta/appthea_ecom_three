import { Link } from 'react-router-dom';

export default function MiniProductCard({ name, image, priceNow, slug }) {
  const href = slug ? `/product/${slug}` : '/shop';
  return (
    <article className="product-card">
      <div className="product-media">
        <Link to={href}>
          <img className="product-thumb" src={image} alt={name} loading="lazy" />
        </Link>
      </div>
      <div className="product-body">
        <h3 className="product-name">
          <Link to={href}>{name}</Link>
        </h3>
        <div className="product-price">
          <span className="price-now">{priceNow}</span>
        </div>
      </div>
    </article>
  );
}
