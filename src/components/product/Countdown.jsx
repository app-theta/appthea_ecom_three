import { useEffect, useRef, useState } from 'react';

/** Time left until `endsAt` (ISO), ticking every second; `done` once it has passed. */
export function useCountdown(endsAt) {
  const end = endsAt ? new Date(endsAt).getTime() : NaN;
  const valid = Number.isFinite(end);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!valid) return undefined;
    setNow(Date.now());
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= end) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [end, valid]);

  const left = valid ? Math.max(0, Math.floor((end - now) / 1000)) : 0;
  return {
    valid,
    done: valid && left === 0,
    days: Math.floor(left / 86400),
    hours: Math.floor((left % 86400) / 3600),
    minutes: Math.floor((left % 3600) / 60),
    seconds: left % 60,
  };
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Countdown to a deal / campaign end. `boxes` for section heads, `inline` ("2d 04:12:09") for
 * strips. `onEnd` fires once when it reaches zero - callers reload so the old price disappears.
 */
export default function Countdown({ endsAt, variant = 'boxes', onEnd, className = '' }) {
  const left = useCountdown(endsAt);
  // already at zero when it mounts (the device clock runs ahead of the server's) counts as fired,
  // so a reload that still gets the deal back can not reload again and again
  const fired = useRef(null);

  useEffect(() => {
    if (fired.current === null) {
      fired.current = left.done;
      return;
    }
    if (left.done && !fired.current) {
      fired.current = true;
      onEnd?.();
    }
  }, [left.done, onEnd]);

  if (!left.valid) return null;

  if (variant === 'inline') {
    return (
      <span className={`countdown-inline ${className}`.trim()} role="timer">
        {left.days > 0 && `${left.days}d `}
        {pad(left.hours)}:{pad(left.minutes)}:{pad(left.seconds)}
      </span>
    );
  }

  const parts = [[left.days, 'Days'], [left.hours, 'Hours'], [left.minutes, 'Mins'], [left.seconds, 'Secs']];

  return (
    <div className={`countdown ${className}`.trim()} role="timer" aria-label="Ends in">
      {parts.map(([value, label]) => (
        <span className="countdown-unit" key={label}>
          <span className="countdown-value">{pad(value)}</span>
          <span className="countdown-label">{label}</span>
        </span>
      ))}
    </div>
  );
}
