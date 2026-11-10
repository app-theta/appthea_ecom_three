'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from '@/lib/router';
import { useAsync } from '../hooks/useAsync';
import { paginated } from '../utils/product';
import { reelsApi, useReelsEnv } from '../components/reels/reelsKit';
import ReelIcon from '../components/reels/ReelIcon';
import '../components/reels/reels.css';

/**
 * /reels - every product video as a grid, 4 to a row. Hover a card for a silent preview,
 * Like and View details; click one for the full-screen viewer, where scrolling (swipe,
 * mouse wheel, arrow keys) moves to the next reel like Facebook. The open reel is in the
 * address bar (/reels/<slug>), so a shared link opens it directly and Back closes it.
 *
 * The same file in every storefront template - the template's own API, login, prices and
 * labels come from components/reels/reelsKit.js.
 */
const BATCH = 12;
const GUEST_LIKES_KEY = 'reels.liked';

const videoOf = (reel) => reel?.reel_video_url || reel?.video_url || reel?.video || null;
const isEmbed = (url) => /youtube\.com|youtu\.be|player\.vimeo\.com/i.test(url || '');
const withAutoplay = (url, muted) => `${url}${url.includes('?') ? '&' : '?'}autoplay=1&playsinline=1&mute=${muted ? 1 : 0}`;
const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

export default function Reels({ initial = null }) {
  const env = useReelsEnv();
  const { pathname } = useLocation();
  const { data, loading, error, reload } = useAsync(() => reelsApi.list(), [], { skip: !env.enabled, initial });
  const reels = useMemo(() => paginated(data).rows.filter((r) => videoOf(r) || r.thumbnail), [data]);
  const likes = useReelLikes(reels, env.isAuthed);
  const [shown, setShown] = useState(BATCH);
  const sentinel = useRef(null);
  // true while the open reel was pushed onto history by a click here, so closing can go Back
  const pushed = useRef(false);

  const openSlug = pathname.startsWith('/reels/') ? decodeURIComponent(pathname.slice('/reels/'.length)) : null;
  const openIndex = openSlug ? reels.findIndex((r) => r.slug === openSlug) : -1;

  // more cards as the visitor nears the end of the grid
  useEffect(() => {
    const el = sentinel.current;
    if (!el || shown >= reels.length) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShown((n) => Math.min(n + BATCH, reels.length));
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, reels.length]);

  const open = useCallback((reel) => {
    pushed.current = true;
    window.history.pushState(null, '', `/reels/${reel.slug}`);
  }, []);

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, '', '/reels');
    }
  }, []);

  if (!env.enabled) return <Navigate to="/" replace />;

  return (
    <section className="rl-page">
      <div className="rl-wrap">
        <header className="rl-head">
          <h1>{env.text.title}</h1>
          {reels.length > 0 && <p>{env.text.count(reels.length)}</p>}
        </header>

        {loading && !reels.length ? (
          <div className="rl-grid" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => <div className="rl-card rl-card--skeleton" key={i} />)}
          </div>
        ) : error && !reels.length ? (
          <div className="rl-empty">
            <p>{error.message}</p>
            <button type="button" className="rl-btn" onClick={reload}>{env.text.retry}</button>
          </div>
        ) : !reels.length ? (
          <div className="rl-empty"><ReelIcon name="play" size={34} /><p>{env.text.empty}</p></div>
        ) : (
          <div className="rl-grid">
            {reels.slice(0, shown).map((reel) => (
              <ReelCard key={reel.id} reel={reel} env={env} like={likes.get(reel)} onLike={() => likes.toggle(reel)} onOpen={open} />
            ))}
          </div>
        )}
        <div ref={sentinel} aria-hidden="true" />
      </div>

      {openIndex >= 0 && (
        <ReelViewer reels={reels} startIndex={openIndex} env={env} likes={likes} onClose={close} />
      )}
    </section>
  );
}

/* ── grid card ──────────────────────────────────────────────────────────── */

function ReelCard({ reel, env, like, onLike, onOpen }) {
  const videoRef = useRef(null);
  const [previewing, setPreviewing] = useState(false);
  const video = videoOf(reel);
  const views = Number(reel.reel_views_count ?? reel.total_views ?? 0);

  // a silent preview while the mouse is over the card (never on touch screens)
  const startPreview = () => {
    const v = videoRef.current;
    if (!v || !window.matchMedia('(hover: hover)').matches) return;
    if (!v.src) v.src = video;
    v.play().then(() => setPreviewing(true)).catch(() => {});
  };
  const stopPreview = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setPreviewing(false);
  };

  return (
    <article className={`rl-card${previewing ? ' is-previewing' : ''}`} onMouseEnter={startPreview} onMouseLeave={stopPreview}>
      <Link
        to={`/reels/${reel.slug}`}
        className="rl-card__link"
        aria-label={reel.name}
        onClick={(e) => { e.preventDefault(); onOpen(reel); }}
      >
        {reel.thumbnail && <img className="rl-card__poster" src={reel.thumbnail} alt="" loading="lazy" />}
        {video && !isEmbed(video) && <video ref={videoRef} className="rl-card__video" muted loop playsInline preload="none" />}
        <span className="rl-card__shade" />
        <span className="rl-card__play"><ReelIcon name="play" size={22} /></span>
        <span className="rl-card__views"><ReelIcon name="eye" size={14} /> {compact(views)}</span>
        <span className="rl-card__info">
          <span className="rl-card__name">{reel.name}</span>
          <span className="rl-card__price">{env.price(reel)}</span>
        </span>
      </Link>

      <div className="rl-card__actions">
        <button
          type="button"
          className={`rl-chip rl-chip--like${like.liked ? ' is-on' : ''}`}
          onClick={onLike}
          aria-pressed={like.liked}
          aria-label={env.text.like}
        >
          <ReelIcon name="heart" filled={like.liked} size={16} /> {compact(like.count)}
        </button>
        <Link to={`/product/${reel.slug}`} className="rl-chip rl-chip--details">
          {env.text.details}
        </Link>
      </div>
    </article>
  );
}

/* ── full-screen viewer ─────────────────────────────────────────────────── */

function ReelViewer({ reels, startIndex, env, likes, onClose }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(startIndex);
  const [muted, setMuted] = useState(false);
  const viewed = useRef(new Set());

  // open on the reel that was clicked, without animating through the ones before it
  useLayoutEffect(() => {
    trackRef.current?.children[startIndex]?.scrollIntoView({ block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the page behind stays put (and its hover previews stop) while the viewer is open
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.querySelectorAll('.rl-card__video').forEach((v) => v.pause());
    return () => { document.body.style.overflow = overflow; };
  }, []);

  // whichever slide fills most of the screen is the active one
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
      });
    }, { root: track, threshold: 0.6 });
    Array.from(track.children).forEach((slide) => io.observe(slide));
    return () => io.disconnect();
  }, [reels.length]);

  // the address bar follows the open reel; each reel counts one view per visit
  useEffect(() => {
    const reel = reels[active];
    if (!reel) return;
    window.history.replaceState(window.history.state, '', `/reels/${reel.slug}`);
    if (!viewed.current.has(reel.id)) {
      viewed.current.add(reel.id);
      reelsApi.view(reel.id).catch(() => {});
    }
  }, [active, reels]);

  const go = useCallback((index) => {
    const slide = trackRef.current?.children[index];
    if (slide) slide.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(Math.min(active + 1, reels.length - 1)); }
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(Math.max(active - 1, 0)); }
      else if (e.key === 'm' || e.key === 'M') setMuted((m) => !m);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, reels.length, go, onClose]);

  return (
    <div className="rl-viewer" role="dialog" aria-modal="true" aria-label={env.text.title}>
      <button type="button" className="rl-round rl-viewer__close" onClick={onClose} aria-label={env.text.close}>
        <ReelIcon name="close" size={22} />
      </button>
      <span className="rl-viewer__count">{active + 1} / {reels.length}</span>
      <div className="rl-viewer__nav">
        <button type="button" className="rl-round" onClick={() => go(active - 1)} disabled={active === 0} aria-label={env.text.prev}>
          <ReelIcon name="up" size={22} />
        </button>
        <button type="button" className="rl-round" onClick={() => go(active + 1)} disabled={active === reels.length - 1} aria-label={env.text.next}>
          <ReelIcon name="down" size={22} />
        </button>
      </div>

      <div className="rl-viewer__track" ref={trackRef}>
        {reels.map((reel, i) => (
          <ReelSlide
            key={reel.id}
            reel={reel}
            index={i}
            isActive={i === active}
            // only the reels around the open one hold a video element
            near={Math.abs(i - active) <= 1}
            muted={muted}
            setMuted={setMuted}
            env={env}
            like={likes.get(reel)}
            onLike={() => likes.toggle(reel)}
          />
        ))}
      </div>
    </div>
  );
}

function ReelSlide({ reel, index, isActive, near, muted, setMuted, env, like, onLike }) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const video = videoOf(reel);
  const embed = isEmbed(video);
  const views = Number(reel.reel_views_count ?? reel.total_views ?? 0);

  // the active reel plays from the start; the rest stop
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!isActive) { v.pause(); return; }
    v.currentTime = 0;
    v.muted = muted;
    // a browser may refuse sound before the visitor has touched the page - play silently then
    v.play().then(() => setPaused(false)).catch(() => {
      setMuted(true);
      v.muted = true;
      v.play().then(() => setPaused(false)).catch(() => setPaused(true));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, near]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPaused(false); } else { v.pause(); setPaused(true); }
  };

  return (
    <section className="rl-slide" data-index={index}>
      <div className="rl-stage">
        {near && video && embed ? (
          isActive ? (
            <iframe src={withAutoplay(video, muted)} title={reel.name} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            reel.thumbnail && <img src={reel.thumbnail} alt="" />
          )
        ) : near && video ? (
          <video
            ref={videoRef}
            src={video}
            poster={reel.thumbnail || undefined}
            loop
            playsInline
            preload="metadata"
            onClick={togglePlay}
            onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
          />
        ) : (
          reel.thumbnail && <img src={reel.thumbnail} alt="" loading="lazy" />
        )}

        {paused && !embed && (
          <button type="button" className="rl-stage__resume" onClick={togglePlay} aria-label="Play">
            <ReelIcon name="play" size={34} />
          </button>
        )}

        <div className="rl-stage__info">
          <h2>{reel.name}</h2>
          <p className="rl-stage__price">{env.price(reel)}</p>
          {reel.short_description && <p className="rl-stage__desc">{reel.short_description}</p>}
          <Link to={`/product/${reel.slug}`} className="rl-btn rl-btn--light">
            <ReelIcon name="bag" size={18} /> {env.text.details}
          </Link>
        </div>
        {!embed && <span className="rl-stage__progress" style={{ transform: `scaleX(${progress})` }} />}
      </div>

      <div className="rl-rail">
        <button type="button" className={`rl-rail__btn${like.liked ? ' is-on' : ''}`} onClick={onLike} aria-pressed={like.liked} aria-label={env.text.like}>
          <span className="rl-round"><ReelIcon name="heart" filled={like.liked} size={24} /></span>
          <small>{compact(like.count)}</small>
        </button>
        <span className="rl-rail__btn" title={`${views} ${env.text.views}`}>
          <span className="rl-round"><ReelIcon name="eye" size={24} /></span>
          <small>{compact(views)}</small>
        </span>
        {!embed && (
          <button type="button" className="rl-rail__btn" onClick={() => setMuted(!muted)} aria-label={muted ? env.text.unmute : env.text.mute}>
            <span className="rl-round"><ReelIcon name={muted ? 'muted' : 'sound'} size={24} /></span>
          </button>
        )}
        <Link to={`/product/${reel.slug}`} className="rl-rail__btn" aria-label={env.text.details}>
          <span className="rl-round"><ReelIcon name="bag" size={24} /></span>
        </Link>
      </div>
    </section>
  );
}

/* ── likes ──────────────────────────────────────────────────────────────── */

/**
 * Like state per reel. A logged-in customer's likes come from the API and toggle there.
 * A guest's are remembered in this browser only: the API knows a guest by a cookie on its
 * own domain, which never reaches it from the shop's domain, so a second tap would count
 * as a new like rather than an unlike - a guest can like a reel once.
 */
function useReelLikes(reels, isAuthed) {
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [counts, setCounts] = useState({});

  useEffect(() => {
    if (!isAuthed) {
      try { setLikedIds(new Set(JSON.parse(localStorage.getItem(GUEST_LIKES_KEY) || '[]'))); } catch { /* none kept */ }
      return undefined;
    }
    if (!reels.length) return undefined;
    let alive = true;
    // the reel detail call is the one that says which reels this customer liked
    reelsApi.detail(reels[0].slug)
      .then((data) => { if (alive && Array.isArray(data?.likedReelIds)) setLikedIds(new Set(data.likedReelIds.map(Number))); })
      .catch(() => {});
    return () => { alive = false; };
  }, [isAuthed, reels]);

  const get = (reel) => ({
    liked: likedIds.has(Number(reel.id)),
    count: counts[reel.id] ?? Number(reel.reel_likes_count ?? 0),
  });

  const toggle = async (reel) => {
    const id = Number(reel.id);
    const was = likedIds.has(id);
    if (!isAuthed && was) return;
    const before = get(reel).count;
    const apply = (liked, count) => {
      setLikedIds((set) => {
        const next = new Set(set);
        liked ? next.add(id) : next.delete(id);
        if (!isAuthed) {
          try { localStorage.setItem(GUEST_LIKES_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
        }
        return next;
      });
      setCounts((c) => ({ ...c, [id]: count }));
    };
    apply(!was, Math.max(0, before + (was ? -1 : 1)));
    try {
      const res = await reelsApi.like(id);
      if (typeof res?.liked === 'boolean') apply(res.liked, Number(res.likes ?? before));
    } catch {
      apply(was, before);
    }
  };

  return { get, toggle };
}
