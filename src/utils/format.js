/** `symbol` should come from the business's real currency_symbol (useBusiness().info)
    wherever that's available - '৳' is only a safety-net default. */
export function money(amount, symbol = '৳') {
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}

/** Maps a Sale status (Pending/Processing/Confirmed/Delivery/Cancelled) to a .dash-badge tone class. */
export function statusTone(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'cancelled') return 'is-danger';
  if (s === 'delivery') return 'is-done';
  if (s === 'confirmed') return 'is-active';
  return 'is-pending';
}

export function dateShort(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
