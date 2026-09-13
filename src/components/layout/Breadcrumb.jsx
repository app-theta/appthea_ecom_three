import { Link } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext.jsx';

/** items: [{ label, to? }] - the last item is rendered as the current page
    (no link) regardless of whether it carries a `to`. Renders nothing when
    the tenant has `show_breedcrumb` turned off. */
export default function Breadcrumb({ items }) {
  const { features } = useBusiness();
  if (!features.show_breedcrumb || !items?.length) return null;

  return (
    <div className="pd-crumb-bar">
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="crumb crumb-left">
            {items.map((item, i) => (
              i === items.length - 1 ? (
                <li key={i} aria-current="page">{item.label}</li>
              ) : (
                <li key={i}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              )
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
