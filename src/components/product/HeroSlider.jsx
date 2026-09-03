import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { imageUrl } from '../../utils/product.js';

export default function HeroSlider() {
  const { sliders } = useBusiness();
  const rootRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current || typeof window.Swiper === 'undefined' || sliders.length === 0) return;
    swiperRef.current?.destroy(true, true);
    swiperRef.current = new window.Swiper(rootRef.current, {
      loop: sliders.length > 1,
      speed: 550,
      autoplay: sliders.length > 1 ? {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      } : false,
      grabCursor: true,
      keyboard: { enabled: true },
      pagination: {
        el: rootRef.current.querySelector('.swiper-pagination'),
        clickable: true,
      },
      navigation: {
        nextEl: rootRef.current.querySelector('.swiper-button-next'),
        prevEl: rootRef.current.querySelector('.swiper-button-prev'),
      },
    });
    return () => swiperRef.current?.destroy(true, true);
  }, [sliders.length]);

  if (sliders.length === 0) return null;

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-slider">
          <div className="swiper heroSwiper" ref={rootRef}>
            <div className="swiper-wrapper">
              {sliders.map((s) => (
                <div className="swiper-slide hero-slide" style={{ background: 'var(--cat-bg)' }} key={s.id}>
                  <div className="hero-slide-inner">
                    <div className="hero-content">
                      <h2 className="hero-title">{s.title}</h2>
                      <Link to={s.url || '/shop'} className="hero-btn">
                        Shop Now
                        <span className="hero-btn-icon">
                          <i className="bi bi-arrow-up-right"></i>
                        </span>
                      </Link>
                    </div>
                    <div className="hero-media">
                      <img src={imageUrl(s.image)} alt={s.title || ''} loading="lazy" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="hero-nav prev swiper-button-prev" aria-label="Previous slide">
              <i className="bi bi-chevron-left"></i>
            </button>
            <button type="button" className="hero-nav next swiper-button-next" aria-label="Next slide">
              <i className="bi bi-chevron-right"></i>
            </button>

            <div className="hero-pagination swiper-pagination"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
