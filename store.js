// 내 기록은 전부 localStorage. 내장 멘트(data/phrases.json)는 읽기 전용.
const PREFIX = 'hanmadi.';

function read(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v == null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}

function write(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* 저장 불가 환경 */ }
}

export const store = {
  favorites: () => read('favorites', []),
  isFavorite: id => read('favorites', []).includes(id),
  toggleFavorite(id) {
    const favs = read('favorites', []);
    const next = favs.includes(id) ? favs.filter(f => f !== id) : [id, ...favs];
    write('favorites', next);
    return next.includes(id);
  },
  settings: () => ({ animations: true, ...read('settings', {}) }),
  saveSettings: s => write('settings', s),
  // 2단계: usage, collected, people
  read, write,
};
