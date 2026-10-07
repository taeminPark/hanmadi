# 한마디

상황과 상대만 고르면 바로 쓸 회사생활 멘트를 추천하는 모바일 PWA (바닐라 JS, 빌드 없음).

- 앱: https://taeminpark.github.io/hanmadi/
- 탭: 상황별 · 경조사 · 건배사 · 위기 수습 · 스몰토크(준비 중) · 수집함

## 실행
```bash
python3 -m http.server 8765   # http://localhost:8765
```

## 멘트 수정
`tools/build_phrases.py`의 원본 데이터(DATA, EXTRA, EVENTS, CRISIS, TOASTS, TIPS)를 고친 뒤
`python3 tools/build_phrases.py` → `data/phrases.json`, `data/tips.json` 재생성.

## 저장
내장 멘트는 `data/phrases.json`(읽기 전용). 즐겨찾기·설정 등 내 기록은 localStorage(`hanmadi.*`).
Gemini 키(2단계)도 앱 설정에서 입력해 기기에만 저장한다.
