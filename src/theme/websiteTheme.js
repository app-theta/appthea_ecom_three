/**
 * The business's own website colours (admin: Website Manage > Website Theme), laid over this
 * template's design. business/info sends only the colours the business picked, by meaning -
 * { primary, text, text_muted, border, background, topbar_bg, topbar_text, footer_bg, footer_text } -
 * and each one lands on this template's :root variables (public/assets/css/style.css) below, with
 * the shades it needs (hover, tints, gradients, button text) worked out from it. A colour not picked
 * is left alone, so a business that picked nothing looks exactly like the template.
 *
 * The server writes them into the page as CSS (themeCss), so the first paint already has them.
 */

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

/** [name, value] pairs for every colour the business picked. */
export function themeVars(theme) {
  const vars = [];
  Object.entries(MAP).forEach(([key, toVars]) => {
    if (!isHex(theme?.[key])) return;
    vars.push(...Object.entries(toVars(theme[key].toLowerCase())));
  });
  return vars;
}

/** The same colours as a stylesheet rule - doubled :root so it wins over the stylesheet wherever it lands. */
export function themeCss(theme) {
  const vars = themeVars(theme);
  return vars.length ? `:root:root{${vars.map(([name, value]) => `${name}:${value}`).join(';')}}` : '';
}

// the variables painted last time, so a new theme (or none) starts from the design's own
let painted = [];

/** Paints the business's colours in the browser; an empty / missing theme puts the template's own back. */
export function applyWebsiteTheme(theme) {
  const root = document.documentElement.style;
  painted.forEach((name) => root.removeProperty(name));
  painted = [];
  themeVars(theme).forEach(([name, value]) => {
    root.setProperty(name, value);
    painted.push(name);
  });
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
