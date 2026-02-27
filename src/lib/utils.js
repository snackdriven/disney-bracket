export const loadLS = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

export const saveLS = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
};

export const serMatch = (ms) => ms.map(m => ({ p: [m[0], m[1]], w: m.winner || null }));

export const desMatch = (ms) => ms.map(({ p, w }) => {
  const m = [p[0], p[1]];
  if (w) m.winner = w;
  return m;
});

export const extractImdbId = url => url?.match(/tt\d+/)?.[0] ?? null;
