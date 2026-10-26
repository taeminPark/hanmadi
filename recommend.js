// 말투와 길이는 고정하고, 같은 추천 묶음에서는 내용과 목적이 겹치지 않게 고른다.
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
function grams(text) {
  const normalized=text.replace(/[\s\p{P}\p{S}]/gu,'');
  return new Set(Array.from({length:Math.max(1,normalized.length-2)},(_,i)=>normalized.slice(i,i+3)));
}
function similarity(a,b) {
  let common=0;for(const token of a)if(b.has(token))common++;
  return common / Math.max(1,Math.min(a.size,b.size));
}
function diverse(candidates,selected,count) {
  const pool=shuffle(candidates).map(p=>({p,tokens:grams(p.text)}));
  const tokens=selected.map(p=>grams(p.text));
  while(pool.length && selected.length<count){
    let best=0,bestPenalty=Infinity;
    for(let i=0;i<pool.length;i++){
      const {p,tokens:next}=pool[i];
      const penalty=selected.reduce((sum,previous,j)=>sum+similarity(next,tokens[j])+((p.tags||[]).some(tag=>(previous.tags||[]).includes(tag))?.65:0),0);
      if(penalty<bestPenalty){best=i;bestPenalty=penalty;}
    }
    const item=pool.splice(best,1)[0];selected.push(item.p);tokens.push(item.tokens);
  }
}
export function recommend(phrases, match, recent=[], count=3) {
  const pool=matchingPhrases(phrases,match),seen=new Set(recent),selected=[];
  diverse(pool.filter(p=>!seen.has(p.id)),selected,count);
  diverse(pool.filter(p=>seen.has(p.id)),selected,count);
  return selected;
}
