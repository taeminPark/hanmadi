// 브라우저 없이 추천·저장·복원·화면 생성의 주요 계약을 검증한다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const load = async name => import('data:text/javascript;base64,'+Buffer.from(read(name)).toString('base64'));
const { recommend, matchingPhrases } = await load('recommend.js');
const data = JSON.parse(read('data/phrases.json'));
const memory = new Map();
let failStorage = false;
globalThis.localStorage = {getItem:k=>memory.get(k)??null,setItem:(k,v)=>{if(failStorage)throw Error('quota');memory.set(k,v);}};
const {store}=await load('store.js');
store.toggleFavorite(data[0].id);assert(store.isFavorite(data[0].id));
failStorage=true;assert.throws(()=>store.toggleFavorite(data[0].id));assert(store.isFavorite(data[0].id));assert.equal(store.write('copies',[]),false);failStorage=false;
memory.set('hanmadi.copies','{}');assert.deepEqual(store.list('copies'),[]);
const node={innerHTML:'',classList:{toggle(){},add(){},remove(){}},querySelector(){return null;},querySelectorAll(){return [];},addEventListener(){}};
const context=vm.createContext({store,recommend,matchingPhrases,console,setTimeout,clearTimeout,matchMedia:()=>({matches:true,addEventListener(){}}),document:{getElementById:()=>node,documentElement:{classList:{toggle(){}},dataset:{}},activeElement:null,addEventListener(){}},window:{scrollTo(){}},navigator:{},location:{protocol:'http:'},fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url))})});
const app=read('app.js').replace(/^import .*;$/gm,'').replace(/^boot\(\);$/m,'');
vm.runInContext(app+`\nglobalThis.api={state,actions,boot,restore,flowView,collectionView,recentSituations,newRound,display,getHtml:()=>$app.innerHTML,getFlows:()=>FLOWS,getData:()=>phrases};`,context);
const api=context.api;await api.boot();assert(api.getHtml().includes('전체 상황 보기'));
let conditions=0;
function walk(cfg,sel,i,visit){if(i===cfg.steps.length)return visit(sel);for(const o of cfg.steps[i].options(sel))walk(cfg,{...sel,[cfg.steps[i].key]:o.value??o.label},i+1,visit);}
for(const [tab,cfg]of Object.entries(api.getFlows()))walk(cfg,{},0,sel=>{
  const variants=cfg.tones?['정중','유쾌'].flatMap(tone=>['전체','짧게'].map(length=>({...sel,tone,length}))):[sel];
  for(const selection of variants){const match={category:cfg.category,...selection};const pool=matchingPhrases(data,match);const ids=pool.map(p=>p.id);const result=recommend(data,match,ids);assert.equal(result.length,Math.min(3,pool.length));assert.equal(new Set(result.map(p=>p.id)).size,result.length);if(selection.tone==='유쾌')assert(result.every(p=>p.tone==='유쾌'));if(selection.length==='짧게')assert(result.every(p=>p.text.length<=60));api.state.tab=tab;api.state.flows[tab]={sel:selection,rounds:[],seen:[]};api.newRound();const html=api.flowView(tab).__raw;assert(html.includes('추천 멘트'));assert(!html.includes('undefined'));conditions++;}
});
api.state.tab='situation';api.state.flows.situation={sel:{situation:'회식',target:'동료',tone:'유쾌',length:'전체'},rounds:[],seen:[]};
for(let i=0;i<20;i++)api.newRound();assert.equal(api.state.flows.situation.rounds.length,10);assert(api.state.flows.situation.repeated);
const html=api.flowView('situation').__raw;assert.equal((html.split('<details')[0].match(/class="phrase-card"/g)||[]).length,3);
api.state.flows.situation={sel:{},rounds:[],seen:[]};api.actions.resume({dataset:{index:'0'}});assert(api.state.flows.situation.sel.situation);
store.write('session',{tab:'situation',flows:{situation:{sel:{situation:'회식',target:'동료',tone:'짧게'},rounds:[['missing',data[0].id]],seen:['missing']}}});api.restore();assert.equal(api.state.flows.situation.sel.tone,'정중');assert(api.state.flows.situation.rounds.flat().every(id=>data.find(p=>p.id===id)?.target==='동료'));
store.write('recentSituations',[null,{}, {tab:'fake',sel:{} }]);assert.equal(api.recentSituations().length,0);
store.saveSettings({workplace:'company'});assert.equal(api.display('기관장/임원 부서장 감사·국감'),'대표/임원 팀장 감사·평가');
api.state.tab='collect';api.state.query='<script>';assert(!api.collectionView().__raw.includes('value="<script>"'));
console.log(`PASS: ${conditions} recommendation combinations; strict tone and length; exhausted pools; bounded history; resume/restore; invalid storage; quota failure; company wording; escaped search.`);
// 내용 확장: 모든 선택 조합에 실제 답변이 있고, 기존 ID도 유지된다.
for(const [tab,cfg]of Object.entries(api.getFlows()))walk(cfg,{},0,sel=>{
  for(const tone of cfg.tones?['정중','유쾌']:[undefined])for(const length of cfg.tones?['전체','짧게']:[undefined]){
    const pool=matchingPhrases(data,{category:cfg.category,...sel,...(tone?{tone,length}:{})});
    assert(pool.length>=3,`insufficient pool: ${tab} ${JSON.stringify(sel)} ${tone} ${length}`);
  }
});
const additions=data.filter(p=>p.id.startsWith('expanded_'));
assert.equal(additions.length,1024);assert.equal(new Set(additions.map(p=>p.text)).size,368);
assert(data.some(p=>p.id==='dinner_exec_formal_01'));
const synthetic=[
 {id:'a',category:'demo',text:'현재 상황은 확인 중입니다. 정리해서 전달하겠습니다.',tags:['상황설명']},
 {id:'b',category:'demo',text:'현재 상황을 확인하고 있습니다. 정리 후 전달하겠습니다.',tags:['상황설명']},
 {id:'c',category:'demo',text:'필요한 자료를 먼저 보내는 방식은 어떠신가요?',tags:['대안제안']},
 {id:'d',category:'demo',text:'내일 오전 회의에서 담당자와 기한을 함께 정해요.',tags:['다음행동']},
];
for(let i=0;i<30;i++){const result=recommend(synthetic,{category:'demo'});assert.equal(new Set(result.flatMap(p=>p.tags)).size,3);}
assert(recommend(synthetic,{category:'demo'},['a','b','c']).some(p=>p.id==='d'));
console.log('PASS: all 462 pools have at least 3 answers; 1,024 additions / 368 distinct new texts; purpose diversity and unseen priority.');
