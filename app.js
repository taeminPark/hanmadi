import { store } from './store.js';
import { recommend, matchingPhrases } from './recommend.js';

// ---------- 데이터 ----------
const SITUATIONS = [
  { label: '회식', icon: 'dinner' },
  { label: '보고 후', icon: 'report' },
  { label: '승진 축하', icon: 'promo' },
  { label: '전보·송별', icon: 'farewell' },
  { label: '칭찬받았을 때', icon: 'praise' },
  { label: '기관장 방문', icon: 'visit' },
  { label: '감사·국감 종료 후', icon: 'audit' },
  { label: '명절·새해 인사', icon: 'calendar' },
  { label: '업무 부탁할 때', icon: 'clipboard' },
  { label: '도움받았을 때', icon: 'heart' },
  { label: '신규 직원 환영', icon: 'userPlus' },
  { label: '먼저 퇴근할 때', icon: 'moon' },
];
const TARGETS = ['기관장/임원', '부서장', '선배', '동료', '후배'].map(label => ({ label }));
const TONES = [
  { label: '정중', hint: '예의 바르고 무난하게' },
  { label: '유쾌', hint: '분위기를 살리는 한마디' },
];
const EVENTS = [
  { label: '장례식', icon: 'flower' },
  { label: '결혼식', icon: 'rings' },
  { label: '출산·돌', icon: 'cake' },
  { label: '병문안', icon: 'pulse' },
  { label: '정년퇴임', icon: 'sunset' },
  { label: '자녀 결혼', icon: 'family' },
  { label: '회갑·칠순', icon: 'gift' },
  { label: '집들이·이사', icon: 'home' },
];
const CRISES = [
  { label: '어색한 침묵', icon: 'dots' },
  { label: '내가 실수했을 때', icon: 'alert' },
  { label: '연봉·재테크 질문', icon: 'coin' },
  { label: '결혼·연애 질문', icon: 'heart' },
  { label: '정치·종교 얘기', icon: 'news' },
  { label: '농담에 반응할 때', icon: 'smile' },
  { label: '술 권유 거절', icon: 'glass' },
  { label: '2차 빠지기', icon: 'door' },
  { label: '회의 중 말이 막힐 때', icon: 'question' },
  { label: '지각했을 때', icon: 'clock' },
];
const OCCASIONS = [
  { label: '정기 회식', icon: 'dinner' },
  { label: '송년회', icon: 'calendar' },
  { label: '신년회', icon: 'praise' },
  { label: '환영회', icon: 'userPlus' },
  { label: '송별회', icon: 'farewell' },
  { label: '프로젝트 완료', icon: 'flag' },
];
const STYLES = [
  { label: '선창·후창', hint: '내가 외치면 다 같이 받는' },
  { label: '한 줄', hint: '짧고 굵게' },
  { label: '30초 스토리', hint: '짧은 이야기로 마음 전하기' },
];
const MOMENTS = [
  { value: 'meet', labels: { 장례식: '조문 가서 상주에게', 결혼식: '식장에서 직접', 병문안: '병원에 찾아가서', 정년퇴임: '퇴임식에서 직접', '자녀 결혼': '예식장에서 혼주에게', '회갑·칠순': '잔치에서 직접', '집들이·이사': '집들이 가서' }, fallback: '직접 만나서' },
  { value: 'text', labels: {}, fallback: '문자·메신저로' },
  { value: 'envelope', labels: { 장례식: '부의금 봉투', 결혼식: '축의금 봉투', '자녀 결혼': '축의금 봉투', '집들이·이사': '선물·카드 문구' }, fallback: '봉투·카드 문구' },
  { value: 'after', labels: { 장례식: '상주가 복귀했을 때', 결혼식: '신혼여행 다녀왔을 때', 병문안: '회복해서 복귀했을 때', 정년퇴임: '퇴임 후 안부 전할 때', '자녀 결혼': '결혼식 뒤 다시 만났을 때', '집들이·이사': '이사 후 다시 만났을 때' }, fallback: '다시 만났을 때' },
];
const GROUPS = [
  { label: '윗사람', hint: '기관장·부서장·선배' },
  { label: '동료·후배', hint: '편한 사이' },
];

// 대화 흐름: 단계마다 묻고, 다 고르면 추천
const FLOWS = {
  situation: {
    title: '한마디', sub: '상황만 말해 주세요', category: 'situation',
    steps: [
      { key: 'situation', ask: '안녕하세요. 오늘은 어떤 자리인가요?', options: () => SITUATIONS },
      { key: 'target', ask: '누구에게 말하나요?', options: () => TARGETS },
    ],
    tones: true,   // 톤은 묻지 않고 결과 위 톤 바·좌우 스와이프로 바꾼다 (기본 정중)
    change: [['상대 바꾸기', 1]],
  },
  event: {
    title: '경조사', sub: '마음을 전할 말을 찾아 드려요', category: 'event',
    steps: [
      { key: 'situation', ask: '어떤 경조사인가요?', options: () => EVENTS },
      { key: 'moment', ask: '어떻게 전하나요?', options: sel => MOMENTS.map(m => ({ value: m.value, label: m.labels[sel.situation] || m.fallback })) },
      { key: 'target', ask: '누구의 경조사인가요?', options: () => GROUPS },
    ],
    change: [['전하는 방법 바꾸기', 1], ['상대 바꾸기', 2]],
    tips: sel => [sel.situation, '경조사 공통'],
  },
  toast: {
    title: '건배사', sub: '잔 들기 전에 한 번 읽어 보세요', category: 'toast',
    steps: [
      { key: 'situation', ask: '어떤 자리의 건배사인가요?', options: () => OCCASIONS },
      { key: 'style', ask: '어떤 스타일로 할까요?', options: () => STYLES },
    ],
    change: [['스타일 바꾸기', 1]],
    tips: () => ['건배사'],
  },
  crisis: {
    title: '위기 수습', sub: '난처한 순간을 부드럽게 넘겨요', category: 'crisis',
    steps: [
      { key: 'situation', ask: '어떤 순간인가요?', options: () => CRISES },
      { key: 'target', ask: '누구와 있나요?', options: () => GROUPS },
    ],
    change: [['상대 바꾸기', 1]],
    tips: sel => [sel.situation],
  },
};

const TABS = [
  { id: 'situation', label: '상황별', icon: 'chat' },
  { id: 'event', label: '경조사', icon: 'envelope' },
  { id: 'toast', label: '건배사', icon: 'toast' },
  { id: 'crisis', label: '위기 수습', icon: 'ring' },
  { id: 'collect', label: '수집함', icon: 'bookmark' },
];

// 24px 듀오톤 아이콘: .fill 은 연한 면, 나머지는 선
const ICONS = {
  chat: '<path class="fill" d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M8 9.5h8M8 13h5"/>',
  toast: '<path class="fill" d="M4 7h6v3.5a3 3 0 0 1-6 0Z"/><path class="fill" d="M14 7h6v3.5a3 3 0 0 1-6 0Z"/><path d="M4 5h6v5.5a3 3 0 0 1-6 0Z M7 13.5V19 M4.8 19h4.4 M14 5h6v5.5a3 3 0 0 1-6 0Z M17 13.5V19 M14.8 19h4.4 M12 2.5v1.6 M10.4 3.3l.6.7 M13.6 3.3l-.6.7"/>',
  ring: '<circle class="fill" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/><path d="M6 6l3.4 3.4M14.6 14.6 18 18M18 6l-3.4 3.4M9.4 14.6 6 18"/>',
  cup: '<path class="fill" d="M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16 M8 3.5c-.9 1 .9 2 0 3.2 M12 3.5c-.9 1 .9 2 0 3.2"/>',
  bookmark: '<path class="fill" d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1Z"/><path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1Z M9.5 8h5"/>',
  dinner: '<circle class="fill" cx="12" cy="12" r="5.5"/><path d="M4 3v5a2 2 0 0 0 2 2v11 M8 3v5a2 2 0 0 1-2 2 M6 3v4.5 M20 21V3c-2 1-3 4-3 7.5h3"/><circle cx="12" cy="12" r="4"/>',
  report: '<path class="fill" d="M6 3h8l4 4v14H6Z"/><path d="M6 3h8l4 4v14H6Z M14 3v4h4 M9 14l2 2 4-4"/>',
  promo: '<circle class="fill" cx="12" cy="9" r="6"/><circle cx="12" cy="9" r="6"/><path d="M9 14.2 7.5 21l4.5-2.4 4.5 2.4-1.5-6.8 M12 6.2l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3Z"/>',
  farewell: '<path class="fill" d="M21 3 3 10.5l7 2.5 2.5 7Z"/><path d="M21 3 3 10.5l7 2.5 2.5 7Z M10 13l5.5-5.5"/>',
  praise: '<path class="fill" d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z M19 16v4.5 M16.8 18.3h4.4"/>',
  visit: '<path class="fill" d="M4 10h16v9H4Z"/><path d="M3 9.5 12 4l9 5.5 M5.5 10.5v7.5 M10 10.5v7.5 M14 10.5v7.5 M18.5 10.5v7.5 M3 20.5h18"/>',
  audit: '<circle class="fill" cx="10.5" cy="10.5" r="6.5"/><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 20.5 20.5 M7.8 9h5.4 M7.8 12h3.4"/>',
  calendar: '<rect class="fill" x="3" y="5" width="18" height="16" rx="2.5"/><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4M8 14.5h2M14 14.5h2"/>',
  clipboard: '<rect class="fill" x="5" y="5" width="14" height="16" rx="2"/><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 3.5h6v3H9Z M8.5 11h7M8.5 15h4.5"/>',
  heart: '<path class="fill" d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"/><path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"/>',
  userPlus: '<circle class="fill" cx="10" cy="8" r="3.8"/><circle cx="10" cy="8" r="3.8"/><path d="M3 20a7 7 0 0 1 14 0 M19.5 7v6 M16.5 10h6"/>',
  moon: '<path class="fill" d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10Z"/><path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10Z"/>',
  envelope: '<rect class="fill" x="3" y="6" width="18" height="13" rx="2"/><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6.5L20.5 7"/>',
  flower: '<circle class="fill" cx="12" cy="8.5" r="5"/><path d="M12 13.5V21 M12 17.5c-1.5-2-4-2.5-5.5-2 M12 17.5c1.5-2 4-2.5 5.5-2"/><circle cx="12" cy="8.5" r="2"/><path d="M12 3.5v3 M12 10.5v3 M7 8.5h3 M14 8.5h3 M8.5 5l2.1 2.1 M13.4 9.9l2.1 2.1 M15.5 5l-2.1 2.1 M10.6 9.9 8.5 12"/>',
  rings: '<circle class="fill" cx="9" cy="14" r="5.5"/><circle cx="9" cy="14" r="5.5"/><circle cx="15" cy="14" r="5.5"/><path d="M10 3.5h4l1.5 2-3.5 3-3.5-3Z"/>',
  cake: '<path class="fill" d="M4 13h16v7H4Z"/><path d="M4 13h16v7H4Z M6 13v-3h12v3 M4 16.5c2 1.5 4 1.5 5.3 0 1.4 1.5 4 1.5 5.4 0 1.3 1.5 3.3 1.5 5.3 0 M12 10V7.5 M12 3.5c-.9 1 .9 1.8 0 3"/>',
  pulse: '<rect class="fill" x="3" y="4" width="18" height="16" rx="3"/><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M6 12h3l1.5-3 3 6 1.5-3h3"/>',
  sunset: '<path class="fill" d="M6 17a6 6 0 0 1 12 0Z"/><path d="M6 17a6 6 0 0 1 12 0 M3 17h18 M7 20.5h10 M12 4v3 M4.9 8.9l2 2 M19.1 8.9l-2 2"/>',
  family: '<circle class="fill" cx="8" cy="7.5" r="3"/><circle cx="8" cy="7.5" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0 M12.5 20a4 4 0 0 1 8 0"/>',
  gift: '<rect class="fill" x="4" y="10" width="16" height="10" rx="1.5"/><rect x="4" y="10" width="16" height="10" rx="1.5"/><path d="M3 7h18v3H3Z M12 7v13 M12 7c-1.5-3.5-5-3.5-5-1.5S10 7 12 7Zm0 0c1.5-3.5 5-3.5 5-1.5S14 7 12 7Z"/>',
  home: '<path class="fill" d="M5 10.5 12 4.5l7 6V20H5Z"/><path d="M3 12 12 4.5 21 12 M5 10.5V20h14v-9.5 M10 20v-5h4v5"/>',
  dots: '<path class="fill" d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><circle cx="8.5" cy="11" r=".6"/><circle cx="12" cy="11" r=".6"/><circle cx="15.5" cy="11" r=".6"/>',
  alert: '<path class="fill" d="M12 3.5 21.5 20h-19Z"/><path d="M12 3.5 21.5 20h-19Z M12 10v4.5 M12 17.2v.3"/>',
  coin: '<circle class="fill" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path d="M8.5 8.5l1.8 7 1.7-5 1.7 5 1.8-7 M7.8 11.5h8.4"/>',
  news: '<rect class="fill" x="3" y="5" width="18" height="15" rx="2"/><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M7 9h10 M7 12.5h4 M7 16h4 M14 12.5h3v3.5h-3Z"/>',
  smile: '<circle class="fill" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4 4 0 0 0 7 0 M9.2 9.5v.6 M14.8 9.5v.6"/>',
  glass: '<path class="fill" d="M7 4h10l-.7 6a4.3 4.3 0 0 1-8.6 0Z"/><path d="M7 4h10l-.7 6a4.3 4.3 0 0 1-8.6 0Z M12 14.3V20 M8.5 20h7"/>',
  door: '<path class="fill" d="M5 3h9v18H5Z"/><path d="M5 21V3h9v6 M14 15v6 M3 21h12 M11 12h.01 M14 12h7 M18.5 9.5 21 12l-2.5 2.5"/>',
  question: '<path class="fill" d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z M10 9a2 2 0 1 1 2.8 1.8c-.5.3-.8.6-.8 1.2 M12 14.2v.2"/>',
  clock: '<circle class="fill" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  flag: '<path class="fill" d="M5 4h12l-2.5 4L17 12H5Z"/><path d="M5 21V4h12l-2.5 4L17 12H5"/>',
  reroll: '<path d="M20 11a8 8 0 0 0-14.3-4.9M4 13a8 8 0 0 0 14.3 4.9"/><path d="M5 2.8v3.8h3.8M19 21.2v-3.8h-3.8"/>',
  copy: '<rect class="fill" x="8" y="8" width="12" height="12" rx="2.5"/><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 5.5V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h.5"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/>',
};
const icon = (name, cls = '') => raw(`<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`);

// ---------- 상태와 저장 ----------
const state = { tab: 'situation', flows: {}, sheet: null, query: '', all: false, collection: 'favorites', category: '', edit: null };
for (const id of Object.keys(FLOWS)) state.flows[id] = { sel: {}, rounds: [], seen: [] };
let phrases = [], tips = {}, byId = new Map(), undoFavorites = null, returnFocus = null;
const $app = document.getElementById('app');
function raw(s) { return { __raw: String(s) }; }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmt(v) { return v == null || v === false ? '' : Array.isArray(v) ? v.map(fmt).join('') : v?.__raw ?? esc(v); }
function h(strings, ...vals) { return raw(strings.reduce((a, s, i) => a + s + (i < vals.length ? fmt(vals[i]) : ''), '')); }
function motionOn() { return store.settings().animations && !matchMedia('(prefers-reduced-motion: reduce)').matches; }
function applySettings() {
  document.documentElement.classList.toggle('no-motion', !motionOn());
  document.documentElement.dataset.theme = store.settings().theme || 'system';
}
function persist() { store.write('session', { tab: state.tab, flows: state.flows }); }
function recentSituations() { return store.list('recentSituations').filter(r => r && FLOWS[r.tab] && r.sel && typeof r.sel === 'object' && FLOWS[r.tab].steps.every(s => s.options(r.sel).some(o => (o.value ?? o.label) === r.sel[s.key]))); }
function display(text) {
  if (store.settings().workplace !== 'company') return text;
  return text.replace(/기관장\/임원/g, '대표/임원').replace(/기관장/g, '대표').replace(/부서장/g, '팀장').replace(/감사·국감/g, '감사·평가').replace(/국감/g, '대외 평가');
}
function button(label, action, attrs = {}, cls = 'chip') {
  return h`<button class="${cls}" data-action="${action}"${Object.entries(attrs).map(([k,v]) => h` data-${raw(k)}="${v}"`)}>${label}</button>`;
}
function header(title, sub = '') {
  return h`<header class="head"><img class="logo" src="logo.svg" alt=""><div class="head-text"><div class="head-title">${title}</div><div class="head-sub">${sub}</div></div><button class="icon-btn" data-action="settings" aria-label="설정">${icon('sliders')}</button></header>`;
}
function search(value, label) { return h`<label class="search"><span class="sr">${label}</span><span aria-hidden="true">⌕</span><input type="search" id="search" placeholder="${label}" value="${value}" autocomplete="off"></label>`; }
function matches(p, query) { return display([p.text,p.situation,p.target,p.style,p.tone].join(' ')).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()); }
function card(p) {
  const fav = store.isFavorite(p.id);
  return h`<article class="phrase-card" data-id="${p.id}"><div class="card-meta">${display([p.situation,p.target,p.style,p.tone].filter(Boolean).join(' · '))}</div><p class="pick-text">${display(p.text)}</p>${p.lead ? h`<div class="callout"><span class="call lead"><small>선창</small>${display(p.lead)}</span><span class="call resp"><small>후창</small>${display(p.response)}</span></div>` : ''}<div class="pick-actions"><button class="act-copy" data-action="copy" data-id="${p.id}">${icon('copy')}<span>복사</span></button><button class="act-fav ${fav ? 'on' : ''}" data-action="fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? '즐겨찾기 해제' : '즐겨찾기 저장'}">${fav ? '♥' : '♡'}</button></div></article>`;
}
function filters(sel) {
  return h`<div class="result-filters"><fieldset><legend>말투</legend>${TONES.map(t => h`<button class="filter ${sel.tone === t.label ? 'on' : ''}" data-action="tone" data-value="${t.label}" aria-pressed="${sel.tone === t.label}">${t.label}</button>`)}</fieldset><fieldset><legend>길이</legend>${['전체','짧게'].map(t => h`<button class="filter ${sel.length === t ? 'on' : ''}" data-action="length" data-value="${t}" aria-pressed="${sel.length === t}">${t}</button>`)}</fieldset></div>`;
}
function optionsView(cfg, f, step) {
  let opts = cfg.steps[step].options(f.sel);
  const initial = step === 0;
  const query = state.query.trim();
  if (initial && query) opts = opts.filter(o => display(o.label).includes(query));
  const visible = initial && !state.all && !query ? opts.slice(0,6) : opts;
  const recent = initial ? recentSituations().filter(r => r.tab === state.tab).slice(0,3) : [];
  return h`<section class="selection" tabindex="-1"><div class="eyebrow">${step + 1} / ${cfg.steps.length} 단계</div><h1>${cfg.steps[step].ask}</h1>${initial ? search(state.query,'상황 검색 · 회식, 감사, 퇴근') : ''}${recent.length && !query ? h`<div class="section-label">최근 사용</div><div class="chips">${recent.map(r => button(display(r.sel.situation), 'resume', {index: recentSituations().findIndex(x => x.tab === r.tab && JSON.stringify(x.sel) === JSON.stringify(r.sel))}))}</div>` : ''}<div class="option-grid">${visible.map(o => h`<button class="option" data-action="choose" data-step="${step}" data-value="${o.value ?? o.label}">${o.icon ? icon(o.icon) : ''}<span>${display(o.label)}${o.hint ? h`<small>${display(o.hint)}</small>` : ''}</span></button>`)}</div>${!visible.length ? h`<p class="empty">맞는 상황이 없어요. 다른 단어로 검색해 주세요.</p>` : ''}${initial && opts.length > 6 && !query ? button(state.all ? '자주 쓰는 상황만 보기' : `전체 상황 보기 (${opts.length})`, 'all', {}, 'text-button') : ''}${step ? button('이전 단계', 'back', {step: step-1}, 'text-button') : ''}</section>`;
}
function flowView(id) {
  const cfg = FLOWS[id], f = state.flows[id];
  const step = cfg.steps.findIndex(s => f.sel[s.key] == null);
  const summary = cfg.steps.filter(s => f.sel[s.key] != null).map((s,i) => {
    const option = s.options(f.sel).find(o => (o.value ?? o.label) === f.sel[s.key]);
    return h`<button class="condition" data-action="edit" data-step="${i}" aria-label="${display(option?.label || f.sel[s.key])} 변경">${display(option?.label || f.sel[s.key])}<span aria-hidden="true">⌄</span></button>`;
  });
  return h`${header(cfg.title,display(cfg.sub))}<div class="content">${summary.length ? h`<div class="conditions" aria-label="선택한 조건">${summary}</div>` : ''}${step >= 0 ? optionsView(cfg,f,step) : h`<section class="recommendations"><div class="result-heading"><div><div class="eyebrow">지금 필요한 한마디</div><h1>이렇게 말해 보세요</h1></div>${button('새로 고르기','restart',{},'text-button')}</div>${cfg.tones ? filters(f.sel) : ''}<div class="result-status" role="status">${f.repeated ? '선택한 조건의 멘트를 모두 봤어요. 이전 멘트를 다시 추천해요.' : '마음에 드는 문장을 복사하거나 저장하세요.'}</div><div class="results" tabindex="-1" aria-label="추천 멘트">${(f.rounds.at(-1) || []).map(id => byId.get(id)).filter(Boolean).map(card)}${!f.rounds.at(-1)?.length ? h`<p class="empty">이 조건에 맞는 멘트가 없어요. 길이를 ‘전체’로 바꿔 보세요.</p>` : ''}</div><div class="result-controls">${button(h`${icon('reroll')}다른 멘트 보기`,'reroll',{},'primary-button')}</div>${f.rounds.length > 1 ? h`<details class="history"><summary>이전 추천 보기 (${f.rounds.length-1}묶음)</summary><div class="inbox">${[...f.rounds.slice(0,-1)].reverse().map(ids => ids.map(id=>byId.get(id)).filter(Boolean).map(card))}</div></details>` : ''}${cfg.tips ? h`<details class="history tips"><summary>알아 두면 좋은 에티켓</summary><ul>${cfg.tips(f.sel).flatMap(k=>tips[k]||[]).map(t=>h`<li>${t}</li>`)}</ul></details>` : ''}</section>`}</div>`;
}
function collectionView() {
  const ids = store.list(state.collection === 'favorites' ? 'favorites' : 'copies');
  const list = ids.map(id=>byId.get(id)).filter(Boolean).filter(p=>(!state.category || p.category===state.category)&&matches(p,state.query));
  return h`${header('수집함','다시 꺼내 쓰기 좋은 말들')}<div class="content"><div class="collection-tabs">${[['favorites','즐겨찾기'],['copies','최근 복사']].map(([value,label])=>h`<button class="filter ${state.collection===value?'on':''}" data-action="collection" data-value="${value}" aria-pressed="${state.collection===value}">${label} ${store.list(value).length}</button>`)}</div>${search(state.query,'저장한 멘트 검색')}<div class="filters">${[['','전체'],...TABS.filter(t=>FLOWS[t.id]).map(t=>[t.id,t.label])].map(([value,label])=>h`<button class="filter ${state.category===value?'on':''}" data-action="category" data-value="${value}" aria-pressed="${state.category===value}">${label}</button>`)}</div><div class="inbox" id="collection-results">${list.length ? list.map(card) : h`<div class="empty"><h2>${ids.length ? '검색 결과가 없어요' : state.collection === 'copies' ? '복사한 멘트가 여기 모여요' : '다시 쓰고 싶은 말을 모아 보세요'}</h2><p>${ids.length ? '검색어나 분류를 바꿔 보세요.' : '멘트의 복사 버튼이나 하트를 눌러 보세요.'}</p>${button('멘트 찾으러 가기','tab',{tab:'situation'})}</div>`}</div><p class="storage-note">기록은 이 브라우저에 저장돼요. 브라우저 데이터를 삭제하면 사라질 수 있어요.</p></div>`;
}
function sheetView() {
  if (state.sheet === 'edit') {
    const cfg=FLOWS[state.tab], f=state.flows[state.tab], step=state.edit;
    return h`<h2 id="sheet-title">${cfg.steps[step].ask}</h2><div class="option-grid">${cfg.steps[step].options(f.sel).map(o=>button(display(o.label),'replace',{step,value:o.value??o.label},'option'))}</div>`;
  }
  const s=store.settings();
  return h`<h2 id="sheet-title">설정</h2><label class="set-row"><span class="set-label">화면 효과</span><input type="checkbox" class="switch" data-setting="animations" ${s.animations ? raw('checked') : ''}></label><p class="set-hint">기기의 ‘동작 줄이기’ 설정을 우선 적용해요.</p><label class="set-row"><span class="set-label">화면 테마</span><select data-setting="theme">${[['system','기기 설정'],['light','밝게'],['dark','어둡게']].map(([v,l])=>h`<option value="${v}" ${s.theme===v?raw('selected'):''}>${l}</option>`)}</select></label><label class="set-row"><span class="set-label">직장 표현</span><select data-setting="workplace">${[['public','공공기관'],['company','일반 기업']].map(([v,l])=>h`<option value="${v}" ${s.workplace===v?raw('selected'):''}>${l}</option>`)}</select></label><p class="set-hint">기관장·부서장 등의 호칭을 선택한 직장에 맞춰 표시하고 복사해요.</p>`;
}
function render({ focus = false } = {}) {
  const active=document.activeElement, searchFocused=active?.id==='search', cursor=active?.selectionStart;
  const focusKey=active?.dataset.action ? {action:active.dataset.action,id:active.dataset.id,value:active.dataset.value,step:active.dataset.step,tab:active.dataset.tab} : null;
  $app.innerHTML=fmt(state.tab==='collect'?collectionView():flowView(state.tab))+fmt(h`<nav class="tabs" aria-label="카테고리">${TABS.map(t=>h`<button class="tab ${state.tab===t.id?'on':''}" data-action="tab" data-tab="${t.id}" ${state.tab===t.id?raw('aria-current="page"'):''}>${icon(t.icon)}<span>${t.label}</span></button>`)}</nav>`)+fmt(state.sheet?h`<div class="scrim" data-action="close"></div><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabindex="-1">${sheetView()}${button('닫기','close',{},'btn-secondary')}</section>`:'');
  $app.querySelector('.content')?.toggleAttribute('inert',!!state.sheet);
  $app.querySelector('.head')?.toggleAttribute('inert',!!state.sheet);
  $app.querySelector('.tabs')?.toggleAttribute('inert',!!state.sheet);
  persist();
  if(searchFocused && !state.sheet) { const input=$app.querySelector('#search'); input?.focus({preventScroll:true}); try { input?.setSelectionRange(cursor,cursor); } catch {} }
  else if(state.sheet) $app.querySelector('.sheet')?.focus({preventScroll:true});
  else if(focus) { const el=$app.querySelector('.results, .selection'); el?.focus({preventScroll:true}); el?.scrollIntoView({block:'start',behavior:motionOn()?'smooth':'auto'}); }
  else if(focusKey) [...$app.querySelectorAll('[data-action]')].find(e=>Object.entries(focusKey).every(([k,v])=>e.dataset[k]===v))?.focus({preventScroll:true});
}
function closeSheet() { state.sheet=null; render(); const target=returnFocus; if(target) [...$app.querySelectorAll('[data-action]')].find(e=>e.dataset.action===target.action&&e.dataset.step===target.step)?.focus({preventScroll:true}); }
function openSheet(type,el) { returnFocus={action:el.dataset.action,step:el.dataset.step};state.sheet=type;render(); }
function newRound(reset=false) {
  const f=state.flows[state.tab],cfg=FLOWS[state.tab];
  if(reset){f.rounds=[];f.seen=[];}
  const pool=matchingPhrases(phrases,{category:cfg.category,...f.sel});
  const seen=new Set(f.seen);
  f.repeated=pool.length>0&&pool.every(p=>seen.has(p.id));
  const ids=recommend(phrases,{category:cfg.category,...f.sel},f.seen).map(p=>p.id);
  f.rounds.push(ids);f.rounds=f.rounds.slice(-10);f.seen=[...new Set([...f.seen,...ids])];
  const recent=recentSituations().filter(r=>r.tab!==state.tab||JSON.stringify(r.sel)!==JSON.stringify(f.sel));
  store.write('recentSituations',[{tab:state.tab,sel:{...f.sel}},...recent].slice(0,12));
}
let toastTimer;
function toast(message,undo=false) {
  const el=document.getElementById('toast');el.innerHTML=esc(message)+(undo?' <button type="button" id="undo">되돌리기</button>':'');el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.classList.remove('show');undoFavorites=null;},6000);
}
async function copyText(text) {
  try { if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;} } catch {}
  const active=document.activeElement,ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0';document.body.append(ta);ta.select();
  let ok=false;try{ok=document.execCommand('copy');}finally{ta.remove();active?.focus({preventScroll:true});}if(!ok)throw new Error('copy failed');
}
const actions={
  tab(el){state.tab=el.dataset.tab;state.query='';state.all=false;state.category='';render();window.scrollTo(0,0);},
  choose(el){const cfg=FLOWS[state.tab],f=state.flows[state.tab];f.sel[cfg.steps[Number(el.dataset.step)].key]=el.dataset.value;state.query='';if(cfg.steps.every(s=>f.sel[s.key]!=null)){if(cfg.tones){f.sel.tone ||= '정중';f.sel.length ||= '전체';}newRound(true);}render({focus:true});},
  all(){state.all=!state.all;render();},
  restart(){state.flows[state.tab]={sel:{},rounds:[],seen:[]};state.query='';render({focus:true});},
  back(el){const cfg=FLOWS[state.tab],f=state.flows[state.tab];cfg.steps.slice(Number(el.dataset.step)).forEach(s=>delete f.sel[s.key]);f.rounds=[];render({focus:true});},
  edit(el){state.edit=Number(el.dataset.step);openSheet('edit',el);},
  replace(el){const cfg=FLOWS[state.tab],f=state.flows[state.tab],i=Number(el.dataset.step);f.sel[cfg.steps[i].key]=el.dataset.value;for(const step of cfg.steps){if(f.sel[step.key]!=null&&!step.options(f.sel).some(o=>(o.value??o.label)===f.sel[step.key]))delete f.sel[step.key];}state.sheet=null;if(cfg.steps.every(s=>f.sel[s.key]!=null))newRound(true);render({focus:true});},
  reroll(){newRound();render({focus:true});},
  tone(el){state.flows[state.tab].sel.tone=el.dataset.value;newRound(true);render();},
  length(el){state.flows[state.tab].sel.length=el.dataset.value;newRound(true);render();},
  resume(el){const r=recentSituations()[Number(el.dataset.index)];if(!r)return;state.tab=r.tab;state.flows[r.tab]={sel:{...r.sel},rounds:[],seen:[]};newRound();render({focus:true});},
  collection(el){state.collection=el.dataset.value;state.query='';render();},
  category(el){state.category=el.dataset.value;render();},
  settings(el){openSheet('settings',el);},close:closeSheet,
  fav(el){const previous=store.favorites();try{const on=store.toggleFavorite(el.dataset.id);if(!on){undoFavorites=previous;toast('즐겨찾기를 해제했어요',true);}else toast('즐겨찾기에 저장했어요');render();}catch{toast('저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.');}},
  async copy(el){const p=byId.get(el.dataset.id);if(!p)return;try{await copyText(display(p.lead?`${p.text}\n선창: ${p.lead}\n후창: ${p.response}`:p.text));el.querySelector('span').textContent='복사 완료';setTimeout(()=>{if(el.isConnected)el.querySelector('span').textContent='복사';},1800);const ids=store.list('copies');const saved=store.write('copies',[p.id,...ids.filter(id=>id!==p.id)].slice(0,50));toast(saved?'복사했어요':'복사했어요. 최근 기록은 저장하지 못했어요.');}catch{toast('복사하지 못했어요. 문장을 길게 눌러 직접 복사해 주세요.');}},
};
$app.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el&&!el.disabled)actions[el.dataset.action]?.(el);});
$app.addEventListener('input',e=>{if(e.target.id==='search'){state.query=e.target.value;render();}});
$app.addEventListener('change',e=>{const key=e.target.dataset.setting;if(!key)return;const saved=store.saveSettings({...store.settings(),[key]:e.target.type==='checkbox'?e.target.checked:e.target.value});if(!saved)toast('설정을 저장하지 못했어요.');applySettings();render();$app.querySelector(`[data-setting="${key}"]`)?.focus();});
document.getElementById('toast').addEventListener('click',e=>{if(e.target.id==='undo'&&undoFavorites){try{store.writeOrThrow('favorites',undoFavorites);undoFavorites=null;toast('즐겨찾기를 복원했어요');render();}catch{toast('저장하지 못했어요.');}}});
document.addEventListener('keydown',e=>{if(!state.sheet)return;if(e.key==='Escape'){e.preventDefault();closeSheet();}if(e.key==='Tab'){const list=[...$app.querySelectorAll('.sheet button,.sheet input,.sheet select')],first=list[0],last=list.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement.matches('.sheet'))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement.matches('.sheet'))){e.preventDefault();first?.focus();}}});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',applySettings);
function restore() {
  const saved=store.read('session',null);if(!saved)return;
  if(TABS.some(t=>t.id===saved.tab))state.tab=saved.tab;
  for(const [id,cfg] of Object.entries(FLOWS)){
    const f=saved.flows?.[id];if(!f?.sel||typeof f.sel!=='object')continue;
    const sel={};for(const step of cfg.steps){if(!step.options(sel).some(o=>(o.value??o.label)===f.sel[step.key]))break;sel[step.key]=f.sel[step.key];}
    if(cfg.tones){sel.tone=TONES.some(t=>t.label===f.sel.tone)?f.sel.tone:'정중';sel.length=f.sel.length==='짧게'?'짧게':'전체';}
    const complete=cfg.steps.every(s=>sel[s.key]!=null);
    const valid=new Set(matchingPhrases(phrases,{category:cfg.category,...sel}).map(p=>p.id));
    const rounds=complete&&Array.isArray(f.rounds)?f.rounds.filter(Array.isArray).map(ids=>ids.filter(id=>valid.has(id))).filter(ids=>ids.length).slice(-10):[];
    state.flows[id]={sel,rounds,seen:Array.isArray(f.seen)?f.seen.filter(id=>byId.has(id)):[]};
    if(complete&&!rounds.length){const old=state.tab;state.tab=id;newRound();state.tab=old;}
  }
}
async function boot(){
  applySettings();$app.innerHTML='<p class="load-error" role="status">한마디를 준비하고 있어요…</p>';
  try{const data=await Promise.all(['data/phrases.json','data/tips.json'].map(async url=>{const r=await fetch(url);if(!r.ok)throw new Error('load');return r.json();}));phrases=data[0];tips=data[1];byId=new Map(phrases.map(p=>[p.id,p]));restore();render();}catch{$app.innerHTML='<div class="load-error"><p>멘트를 불러오지 못했어요.</p><button class="chip" id="retry">다시 시도</button></div>';document.getElementById('retry').onclick=boot;}
}
boot();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
