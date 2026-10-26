// 말투는 고정하고, 짧은 문장은 해당 말투 안에서만 고른다.
export function matchingPhrases(phrases, { tone, length, ...match }) {
  const pool = phrases.filter(p => Object.entries(match).every(([k,v]) => p[k] === v));
  const toned = tone ? pool.filter(p => tone === '정중' ? ['정중','짧게'].includes(p.tone) : p.tone === tone) : pool;
  return length === '짧게' ? toned.filter(p => p.text.length <= 60 && !p.lead) : toned;
}
function shuffle(list) {
  const result = [...list];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function recommend(phrases, match, recent=[], count=3) {
  const pool=matchingPhrases(phrases,match), seen=new Set(recent);
  return [...shuffle(pool.filter(p=>!seen.has(p.id))),...shuffle(pool.filter(p=>seen.has(p.id)))].slice(0,count);
}
