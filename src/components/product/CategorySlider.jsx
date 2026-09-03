import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { imageUrl } from '../../utils/product.js';

export default function CategorySlider() {
  const { categories } = useBusiness();
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const refresh = () => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth - 2;
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(track.scrollLeft >= max);
  };

  useEffect(() => {
    refresh();
    window.addEventListener('resize', refresh);
    return () => window.removeEventListener('resize', refresh);
  }, []);

  const step = () => {
    const track = trackRef.current;
    if (!track) return track?.clientWidth ?? 0;
    const card = track.querySelector('.cat-card');
    if (!card) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || 0) || 0;
    const per = Math.max(1, Math.round(track.clientWidth / (card.offsetWidth + gap)));
    return (card.offsetWidth + gap) * per;
  };

  const scrollBy = (dir) => {
    trackRef.current?.scrollBy({ left: dir * step(), behavior: 'smooth' });
  };

  // drag to scroll (desktop mouse)
  const dragState = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const onMouseDown = (e) => {
    const d = dragState.current;
    d.down = true;
    d.moved = false;
    d.startX = e.pageX;
    d.startScroll = trackRef.current.scrollLeft;
    trackRef.current.style.scrollBehavior = 'auto';
    trackRef.current.style.cursor = 'grabbing';
  };
  useEffect(() => {
    const onMouseMove = (e) => {
      const d = dragState.current;
      if (!d.down) return;
      const walk = e.pageX - d.startX;
      if (Math.abs(walk) > 4) d.moved = true;
      trackRef.current.scrollLeft = d.startScroll - walk;
    };
    const onMouseUp = () => {
      const d = dragState.current;
      if (!d.down) return;
      d.down = false;
      if (trackRef.current) {
        trackRef.current.style.scrollBehavior = '';
        trackRef.current.style.cursor = '';
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const onTrackClick = (e) => {
    if (dragState.current.moved) {
      e.preventDefault();
      dragState.current.moved = false;
    }
  };

  return (
    <div className="slider js-slider">
      <button
        type="button"
        className="slider-nav prev js-slider-prev"
        aria-label="Previous categories"
        disabled={atStart}
        onClick={() => scrollBy(-1)}
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      <div
        className="slider-track js-slider-track"
        ref={trackRef}
        onScroll={refresh}
        onMouseDown={onMouseDown}
        onClick={onTrackClick}
      >
        {categories.filter((c) => (c.products_count ?? 1) > 0).map((c) => (
          <Link to={`/shop?category=${c.slug}`} className="cat-card" key={c.id}>
            <span className="cat-img">
              {imageUrl(c.image) ? (
                <img src={imageUrl(c.image)} alt={c.name} loading="lazy" />
              ) : (
                <span style={{ display: 'block', width: '100%', height: '100%', background: 'var(--cat-bg)' }} />
              )}
            </span>
            <span className="cat-name">
              {c.name}{c.products_count != null && <small> ({c.products_count})</small>}
            </span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="slider-nav next js-slider-next"
        aria-label="Next categories"
        disabled={atEnd}
        onClick={() => scrollBy(1)}
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
}
