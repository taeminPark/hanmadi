import { store } from './store.js';
import { recommend } from './recommend.js';

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
  { label: '짧게', hint: '한 문장으로 끝' },
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
      { key: 'tone', ask: '어떤 톤으로 할까요?', options: () => TONES },
    ],
    change: [['상대 바꾸기', 1], ['톤 바꾸기', 2]],
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
  { id: 'smalltalk', label: '스몰토크', icon: 'cup', soon: '스몰토크는 그다음 단계에서 열려요. 오늘 꺼내기 좋은 화젯거리를 골라 드릴게요.' },
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

// ---------- 상태 ----------
const state = {
  tab: 'situation',
  // 탭마다 고른 값과 추천 묶음([[id, id, id], ...] — '다른 멘트'를 누를 때마다 쌓인다)
  flows: Object.fromEntries(['situation', 'event', 'toast', 'crisis'].map(id => [id, { sel: {}, rounds: [] }])),
  sheet: false,
};
let tips = {};
let phrases = [];
let byId = new Map();
let seenCount = 0;   // 직전 렌더 때 대화에 있던 요소 수 → 새로 생긴 것만 애니메이션

// ---------- html helpers ----------
function raw(s) { return { __raw: String(s) }; }
function fmt(v) {
  if (v == null || v === false) return '';
  if (Array.isArray(v)) return v.map(fmt).join('');
  if (typeof v === 'object' && '__raw' in v) return v.__raw;
  return esc(String(v));
}
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML.replace(/"/g, '&quot;');
}
function h(strings, ...vals) {
  return raw(strings.reduce((acc, s, i) => acc + s + (i < vals.length ? fmt(vals[i]) : ''), ''));
}

// ---------- motion ----------
function motionOn() {
  return store.settings().animations && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function applyMotionClass() {
  document.documentElement.classList.toggle('no-motion', !motionOn());
}

// ---------- views ----------
function header(title, sub) {
  const favCount = store.favorites().length;
  return h`
  <header class="head">
    <img class="logo" src="logo.svg" alt="">
    <div class="head-text"><div class="head-title">${title}</div>${sub ? h`<div class="head-sub">${sub}</div>` : ''}</div>
    <button class="fav-count" data-action="tab" data-tab="collect" aria-label="즐겨찾기 ${favCount}개"><span aria-hidden="true">♥</span> ${favCount}</button>
    <button class="icon-btn" data-action="open-settings" aria-label="설정">${icon('sliders', 'plain')}</button>
  </header>`;
}

function chip(label, action, extra = {}) {
  const data = Object.entries(extra).map(([k, v]) => h` data-${raw(k)}="${v}"`);
  return h`<button class="chip" data-action="${action}"${data}>${extra.icon ? icon(extra.icon) : ''}<span>${label}</span></button>`;
}

const restartChip = () => h`<button class="chip chip-ghost" data-action="change" data-step="0"><span>처음부터</span></button>`;

const optionValue = o => o.value ?? o.label;
function optionChip(o, step) {
  if (o.hint) {
    return h`<button class="chip chip-tone" data-action="choose" data-step="${step}" data-value="${optionValue(o)}"><span>${o.label}</span><small>${o.hint}</small></button>`;
  }
  return chip(o.label, 'choose', { step, value: optionValue(o), ...(o.icon ? { icon: o.icon } : {}) });
}

function pickBubble(p, sel) {
  const fav = store.isFavorite(p.id);
  return h`
  <div class="b pick" data-id="${p.id}">
    ${sel.tone && p.tone !== sel.tone ? h`<span class="tone-tag">${p.tone}</span>` : ''}
    <p class="pick-text">${p.text}</p>
    ${p.lead ? h`<div class="callout"><span class="call lead"><small>선창</small>${p.lead}</span><span class="call resp"><small>후창</small>${p.response}</span></div>` : ''}
    <div class="pick-actions">
      <button class="act-copy" data-action="copy" data-id="${p.id}">${icon('copy')}복사</button>
      <button class="act-fav ${fav ? 'on' : ''}" data-action="fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="즐겨찾기">${fav ? '♥' : '♡'}</button>
    </div>
  </div>`;
}

function tipBubble(keys) {
  const list = keys.flatMap(k => tips[k] || []);
  if (!list.length) return '';
  return h`<div class="b app tip"><strong>알아 두면 좋아요</strong><ul>${list.map(t => h`<li>${t}</li>`)}</ul></div>`;
}

function poolSize(cfg, sel) {
  const match = { category: cfg.category, ...sel };
  delete match.tone;
  return phrases.filter(p => Object.entries(match).every(([k, v]) => p[k] === v)).length;
}

function flowView(id) {
  const cfg = FLOWS[id];
  const { sel, rounds } = state.flows[id];
  const msgs = [h`<div class="sys">오늘</div>`];
  let chips = null;
  for (const [i, step] of cfg.steps.entries()) {
    msgs.push(h`<div class="b app">${step.ask}</div>`);
    const options = step.options(sel);
    if (sel[step.key] == null) {
      chips = [...options.map(o => optionChip(o, i)), i ? restartChip() : ''];
      break;
    }
    const picked = options.find(o => optionValue(o) === sel[step.key]);
    msgs.push(h`<div class="b me">${picked ? picked.label : sel[step.key]}</div>`);
  }
  if (!chips) {
    const envelope = sel.moment === 'envelope';
    rounds.forEach((ids, r) => {
      msgs.push(h`<div class="b app">${r ? '이건 어때요?' : envelope ? '봉투엔 이렇게 써요.' : '이렇게 말해 보세요.'}</div>`);
      ids.forEach(pid => msgs.push(pickBubble(byId.get(pid), sel)));
      if (r === 0 && cfg.tips) msgs.push(tipBubble(cfg.tips(sel)));
    });
    chips = [
      poolSize(cfg, sel) > 3 ? chip('다른 멘트', 'reroll', { icon: 'reroll' }) : '',
      ...cfg.change.map(([label, step]) => chip(label, 'change', { step })),
      chip('처음부터', 'change', { step: 0 }),
    ];
  }
  return h`
  ${header(cfg.title, cfg.sub)}
  <section class="thread" aria-live="polite">
    ${msgs}
    <div class="chips">${chips}</div>
  </section>`;
}

function soonView(tab) {
  return h`
  ${header(tab.label)}
  <section class="thread">
    <div class="b app">${tab.soon}</div>
    <div class="b app">지금은 상황별 멘트를 써 보세요.</div>
    <div class="chips">${chip('상황별 멘트로 가기', 'tab', { tab: 'situation', icon: 'chat' })}</div>
  </section>`;
}

function collectView() {
  const favs = store.favorites().map(id => byId.get(id)).filter(Boolean);
  return h`
  ${header('수집함')}
  <div class="filters">
    <button class="filter on" aria-pressed="true">즐겨찾기 ${favs.length}</button>
    <button class="filter" data-action="soon" data-msg="내가 모은 멘트는 다음 단계에서 열려요">내가 모은 멘트</button>
    <button class="filter" data-action="soon" data-msg="상대 메모는 그다음 단계에서 열려요">상대 메모</button>
  </div>
  ${favs.length ? h`<section class="inbox">${favs.map(p => h`
    <article class="row" data-id="${p.id}">
      <p class="row-text">${p.text}</p>
      ${p.lead ? h`<div class="callout"><span class="call lead"><small>선창</small>${p.lead}</span><span class="call resp"><small>후창</small>${p.response}</span></div>` : ''}
      <div class="row-foot">
        <span class="row-meta">${[p.situation, p.target, p.style, p.category === 'situation' && p.tone].filter(Boolean).join(' · ')}</span>
        <button class="act-copy" data-action="copy" data-id="${p.id}">${icon('copy')}복사</button>
        <button class="act-fav on" data-action="fav" data-id="${p.id}" aria-pressed="true" aria-label="즐겨찾기 해제">♥</button>
      </div>
    </article>`)}</section>`
  : h`<section class="thread">
      <div class="b app">마음에 드는 멘트에 ♡를 누르면 여기 모여요.</div>
      <div class="chips">${chip('멘트 고르러 가기', 'tab', { tab: 'situation', icon: 'chat' })}</div>
    </section>`}`;
}

function tabBar() {
  return h`
  <nav class="tabs" aria-label="카테고리">
    ${TABS.map(t => h`
      <button class="tab ${state.tab === t.id ? 'on' : ''}" data-action="tab" data-tab="${t.id}" ${state.tab === t.id ? raw('aria-current="page"') : ''}>
        ${icon(t.icon)}<span>${t.label}</span>
      </button>`)}
  </nav>`;
}

function settingsSheet() {
  const s = store.settings();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return h`
  <div class="scrim" data-action="close-settings"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="설정">
    <div class="grabber" aria-hidden="true"></div>
    <h2 class="sheet-title">설정</h2>
    <label class="set-row">
      <span><span class="set-label">애니메이션</span>
      ${reduced ? h`<span class="set-hint">기기의 '동작 줄이기'가 켜져 있어 꺼진 상태로 동작해요.</span>` : ''}</span>
      <input type="checkbox" class="switch" data-action="toggle-anim" ${s.animations ? raw('checked') : ''}>
    </label>
    <button class="btn-secondary" data-action="close-settings">닫기</button>
  </div>`;
}

// ---------- render ----------
const $app = document.getElementById('app');

function render({ scroll = false } = {}) {
  const tab = TABS.find(t => t.id === state.tab);
  const body = FLOWS[tab.id] ? flowView(tab.id) : tab.id === 'collect' ? collectView() : soonView(tab);
  $app.innerHTML = fmt(body) + fmt(tabBar()) + fmt(state.sheet ? settingsSheet() : '');

  // 새로 생긴 말풍선과 칩만 아래에서 튀어 오르게
  const items = [...$app.querySelectorAll('.thread > .b, .thread > .sys, .chips > .chip')];
  if (motionOn()) {
    let n = 0;
    items.forEach((el, i) => {
      if (i >= seenCount) { el.style.setProperty('--i', n++); el.classList.add('enter'); }
    });
  }
  seenCount = items.length;
  if (scroll) {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: motionOn() ? 'smooth' : 'auto' });
  }
}

function switchTab(id) {
  if (id === state.tab) return;
  const update = () => { state.tab = id; seenCount = 0; render(); window.scrollTo(0, 0); };
  if (!document.startViewTransition || !motionOn()) return update();
  document.startViewTransition(update);
}

// ---------- actions ----------
function newRound() {
  const cfg = FLOWS[state.tab];
  const f = state.flows[state.tab];
  const recent = f.rounds.flat();  // 이번 대화에서 본 멘트는 모두 뒤로
  f.rounds.push(recommend(phrases, { category: cfg.category, ...f.sel }, recent).map(p => p.id));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

function stamp(target) {
  target.querySelector('.stamp')?.remove();
  const s = document.createElement('span');
  s.className = 'stamp';
  s.setAttribute('aria-hidden', 'true');
  s.textContent = '복사됨';
  target.appendChild(s);
  s.addEventListener('animationend', e => { if (e.animationName === 'stamp-out') s.remove(); });
  if (!motionOn()) setTimeout(() => s.remove(), 1200);
}

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

const actions = {
  choose: el => {
    const cfg = FLOWS[state.tab];
    const f = state.flows[state.tab];
    const step = Number(el.dataset.step);
    f.sel[cfg.steps[step].key] = el.dataset.value;
    if (step === cfg.steps.length - 1) newRound();
    render({ scroll: true });
  },
  reroll: () => { newRound(); render({ scroll: true }); },
  // step 단계부터 다시 고르기 (0이면 처음부터)
  change: el => {
    const cfg = FLOWS[state.tab];
    const f = state.flows[state.tab];
    const step = Number(el.dataset.step);
    cfg.steps.slice(step).forEach(s => delete f.sel[s.key]);
    f.rounds = [];
    seenCount = 2 + step * 2;   // '오늘' + 앞 단계 질문·답은 그대로, 새 질문 아래부터 애니메이션
    render({ scroll: step > 0 });
    if (!step) window.scrollTo({ top: 0, behavior: motionOn() ? 'smooth' : 'auto' });
  },
  tab: el => switchTab(el.dataset.tab),
  soon: el => toast(el.dataset.msg),
  copy: async el => {
    const p = byId.get(el.dataset.id);
    await copyText(p.lead ? `${p.text}\n선창: ${p.lead}\n후창: ${p.response}` : p.text);
    stamp(el.closest('.pick, .row'));
    document.getElementById('sr-live').textContent = '복사했어요';
  },
  fav: el => {
    const on = store.toggleFavorite(el.dataset.id);
    if (state.tab === 'collect') { seenCount = Infinity; return render(); }
    el.classList.toggle('on', on);
    el.textContent = on ? '♥' : '♡';
    el.setAttribute('aria-pressed', on);
    if (on && motionOn()) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    const count = $app.querySelector('.fav-count');
    const n = store.favorites().length;
    count.innerHTML = `<span aria-hidden="true">♥</span> ${n}`;
    count.setAttribute('aria-label', `즐겨찾기 ${n}개`);
  },
  'open-settings': () => { state.sheet = true; seenCount = Infinity; render(); },
  'close-settings': () => { state.sheet = false; seenCount = Infinity; render(); },
  'toggle-anim': el => {
    store.saveSettings({ ...store.settings(), animations: el.checked });
    applyMotionClass();
  },
};

$app.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  if (el.matches('input')) return; // 체크박스는 change로 처리
  actions[el.dataset.action]?.(el);
});
$app.addEventListener('change', e => {
  const el = e.target.closest('input[data-action]');
  if (el) actions[el.dataset.action]?.(el);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.sheet) actions['close-settings']();
});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', applyMotionClass);

// ---------- boot ----------
applyMotionClass();
Promise.all([fetch('data/phrases.json').then(r => r.json()), fetch('data/tips.json').then(r => r.json())])
  .then(([data, tipData]) => { phrases = data; byId = new Map(data.map(p => [p.id, p])); tips = tipData; render(); })
  .catch(() => { $app.innerHTML = '<p class="load-error">멘트를 불러오지 못했어요. 새로고침해 주세요.</p>'; });

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js');
}
