/**
 * The business's own website colours (admin: Website Manage > Website Theme), laid over this
 * template's design. business/info sends only the colours the business picked, by meaning -
 * { primary, text, text_muted, border, background, topbar_bg, topbar_text, footer_bg, footer_text } -
 * and each one lands on this template's :root variables (public/assets/css/style.css) below, with
 * the shades it needs (hover, tints, gradients, button text) worked out from it. A colour not picked
 * is left alone, so a business that picked nothing looks exactly like the template.
 *
 * The last theme is kept in the browser, so the next visit paints the business's colours before
 * the API answers instead of flashing the template's.
 */
const STORE_KEY = `website-theme:${import.meta.env.VITE_APPTHETA_PUBLIC_KEY || ''}`;

const MAP = {
  primary: (c) => ({
    '--accent': c,
    '--accent-dark': mix(c, '#000000', 0.12),
    '--accent-darker': mix(c, '#000000', 0.22),
    '--accent-soft': mix(c, '#ffffff', 0.9),
    '--accent-soft-2': mix(c, '#ffffff', 0.84),
    '--accent-light': mix(c, '#ffffff', 0.55),
    '--accent-mid': mix(c, '#000000', 0.4),
    '--accent-deep': mix(c, '#000000', 0.55),
    '--accent-night': mix(c, '#000000', 0.82),
    '--accent-rgb': toRgb(c).join(', '),
    '--accent-contrast': contrastText(c),
  }),
  text: (c) => ({ '--ink': c }),
  text_muted: (c) => ({ '--ink-soft': c, '--muted': mix(c, '#ffffff', 0.3) }),
  border: (c) => ({ '--line': c }),
  // the page itself, and the soft boxes on it a shade deeper
  background: (c) => ({ '--body-bg': c, '--surface-2': mix(c, '#000000', 0.025) }),
  topbar_bg: (c) => ({ '--topbar-bg': c }),
  topbar_text: (c) => ({ '--topbar-text': c }),
  footer_bg: (c) => ({ '--footer-bg': c }),
  footer_text: (c) => ({
    '--footer-text': c,
    '--footer-muted': alpha(c, 0.68),
    '--footer-line': alpha(c, 0.14),
    '--footer-field': alpha(c, 0.06),
    '--footer-field-focus': alpha(c, 0.08),
  }),
};

// the variables painted last time, so a new theme (or none) starts from the design's own
let painted = [];

/** Paints the business's colours; an empty / missing theme puts the template's own back. */
export function applyWebsiteTheme(theme) {
  const root = document.documentElement.style;
  painted.forEach((name) => root.removeProperty(name));
  painted = [];
  Object.entries(MAP).forEach(([key, toVars]) => {
    if (!isHex(theme?.[key])) return;
    Object.entries(toVars(theme[key].toLowerCase())).forEach(([name, value]) => {
      root.setProperty(name, value);
      painted.push(name);
    });
  });
}

export function rememberWebsiteTheme(theme) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(theme && typeof theme === 'object' ? theme : {}));
  } catch {
    // private window / storage blocked: the colours just arrive with the API
  }
}

/** The last visit's colours, before the first paint. */
export function restoreWebsiteTheme() {
  try {
    const theme = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (theme) applyWebsiteTheme(theme);
  } catch {
    // nothing kept, or unreadable: the template's colours until the API answers
  }
}

function isHex(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function toRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `weight` of the way from `a` to `b` (0 = a, 1 = b). */
function mix(a, b, weight) {
  const x = toRgb(a);
  const y = toRgb(b);
  return '#' + x.map((c, i) => Math.round(c + (y[i] - c) * weight).toString(16).padStart(2, '0')).join('');
}

function alpha(hex, a) {
  return `rgba(${toRgb(hex).join(', ')}, ${a})`;
}

/** Dark text on a light colour, white on the rest - the same rule as the admin preview. */
function contrastText(hex) {
  const [r, g, b] = toRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 160 ? '#111111' : '#ffffff';
}
