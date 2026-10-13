// ---------------------------------------------------------------------------
// HotelFlow currency formatter — Bangladeshi Taka (BDT) only.
// Lakh-style grouping (e.g. 125000 -> "৳1,25,000") via the "en-IN" locale,
// whose digit grouping matches the Bangladesh convention. ("en-BD" ICU data
// is not guaranteed on every Node/browser, so en-IN is the safe choice.)
// ---------------------------------------------------------------------------

export const BDT_SYMBOL = "৳";
export const BDT_VAT_RATE = 0.15; // Bangladesh VAT: 15%

// 4500 -> "৳4,500" · 125000 -> "৳1,25,000"
export function formatBDT(amount) {
  const n = Number(amount) || 0;
  const opts = Number.isInteger(n)
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${BDT_SYMBOL}${n.toLocaleString("en-IN", opts)}`;
}

// 15% VAT portion of a price, formatted (e.g. 10000 -> "৳1,500").
export function formatVAT(amount) {
  return formatBDT((Number(amount) || 0) * BDT_VAT_RATE);
}

// "15 Dec 2026" style dates used across the Bangladesh site.
export function formatDateBD(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Alias used by the admin panel (same en-GB style).
export function formatDate(date) {
  return formatDateBD(date);
}

// Plain grouped number: 125000 -> "1,25,000".
export function formatNumber(n) {
  return (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// Relative time: "just now", "5m ago", "3h ago", "2d ago", "3w ago",
// "4mo ago", "1y ago". Pair with title={exact date} for exactness on hover.
export function formatTimeAgo(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  const w = Math.floor(days / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}
