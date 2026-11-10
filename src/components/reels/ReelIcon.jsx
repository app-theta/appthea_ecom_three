/* The reels page's own icons, so it looks the same whichever icon font a template loads. */
const PATHS = {
  heart: 'M12 20.5s-7.6-4.5-9.4-9.3C1.2 7.6 3.4 4 7 4c2.1 0 3.7 1.1 5 2.8C13.3 5.1 14.9 4 17 4c3.6 0 5.8 3.6 4.4 7.2-1.8 4.8-9.4 9.3-9.4 9.3z',
  eye: 'M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  close: 'M6 6l12 12M18 6L6 18',
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  sound: 'M4 9.5h3.5L12 6v12l-4.5-3.5H4zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11',
  muted: 'M4 9.5h3.5L12 6v12l-4.5-3.5H4zM16 9.5l5 5M21 9.5l-5 5',
  bag: 'M5.5 8h13l-1 12h-11zM9 8V7a3 3 0 016 0v1',
};

const FILLED = new Set(['play', 'pause']);

export default function ReelIcon({ name, filled = false, size = 20 }) {
  const solid = filled || FILLED.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? 'currentColor' : 'none'}
      stroke={solid ? 'none' : 'currentColor'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
