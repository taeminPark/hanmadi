// 조건(category, situation, target, moment …)이 모두 맞는 멘트 중 고른 톤을 우선, 방금 본 멘트는 뒤로.
// 2단계에서 반응(🔥/🥶) 가중치를 여기에 더한다.
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function recommend(phrases, { tone, ...match }, recent = [], count = 3) {
  const pool = phrases.filter(p => Object.entries(match).every(([k, v]) => p[k] === v));
  const fresh = pool.filter(p => !recent.includes(p.id));
  const seen = pool.filter(p => recent.includes(p.id));
  const byTone = list => tone
    ? [...shuffle(list.filter(p => p.tone === tone)), ...shuffle(list.filter(p => p.tone !== tone))]
    : shuffle(list);
  return [...byTone(fresh), ...byTone(seen)].slice(0, count);
}
