# PROJECT_CONTEXT

마지막 갱신: 2026-08-05

## 완료 내용

N SEOUL TOWER 메인 페이지 1종을 HTML / CSS / Vanilla JavaScript 로 구현했습니다.

기준 자료

- `PRD.md`, `design-analysis.md`, `AGENTS.md`
- Figma: `(develope) 개발 시안 5개 페이지` 페이지의 `main` 프레임 (1920 × 12433, node `645:4324`)
  - 메뉴 오버레이는 별도 프레임 `menu` (node `645:5527`)

구현한 섹션 (문서 순서)

1. 글로벌 헤더 (`645:4657`) + 메뉴 오버레이 (`645:5527`)
2. 히어로 `main_visual` (`645:4325`)
3. Events (`645:4363`)
4. Recommended Course (`645:4400`)
5. N Pass (`645:4433` + 보조 티켓 `645:4432`)
6. Restaurant (`793:9570`) — PRD 에는 없고 Figma 에만 있는 섹션
7. N Gift Shop (`645:4442`)
8. 커스텀 타워 조립 비주얼 (`645:4469`)
9. Custom Goods (`668:8619`)
10. 푸터 (`645:4572`)
11. 섹션 이동 페이저 (`737:2667`, PRD 8.4 / 10.5)

## 파일 구조

```text
n_seoul_tower/
├── index.html
├── css/
│   ├── reset.css
│   ├── common.css   # 디자인 토큰, 폰트, 공통 버튼/카드/헤더/메뉴/푸터/페이저
│   └── main.css     # 섹션별 레이아웃과 반응형
├── js/
│   ├── common.js    # 메뉴, 언어, family site, 섹션 페이저, 공통 상태
│   └── main.js      # 목업 데이터 + renderXxx + 섹션 인터랙션
└── assets/          # 기존 에셋 + Figma 에서 추가 다운로드한 에셋
```

## 디자인 토큰 (Figma 실측)

- 페이지 배경 `#f7f4e8`, 히어로 배경 `#fff5dc`
- 텍스트 `#212121`, 브랜드 `#0b251f` / `#1b5c4e` / `#1e4c43` / `#3a786b`
- 올리브 `#626f47` / `#839051` / `#a4b465`, 포인트 `#f8ac22` / `#f9bd4e` / `#ffd973` / `#ffecb9`
- 푸터 `#333333`, 푸터 버튼 `#8c9275`
- 폰트: 제목 Poppins SemiBold, 본문 Pretendard, 디스플레이 Montserrat Bold, 메뉴 로고 Jost Medium

## 남은 문제 / 확인 필요

- 모든 상세 페이지 URL 미확정 → CTA·메뉴는 `data-pending-link` + `aria-disabled="true"` 버튼으로 두고 안내 메시지만 노출합니다. URL 확정 시 `<a href>` 로 교체해야 합니다.
- Restaurant 슬라이더는 Figma 에 3개 인디케이터가 있으나 실제 사진 에셋은 1장(`restaurant_dining.png`)만 존재합니다. 나머지 2장을 받으면 `mainPageData.restaurantPhotos` 에 추가하면 됩니다.
- 기프트숍 상품명·가격·재고 데이터 없음 (디자인에도 없음). 현재는 이미지 + alt 만 사용합니다.
- 날씨·대기시간·티켓가격은 Figma 표기값을 그대로 넣은 정적 값입니다. 실제 API 미연동.
- 모바일 360 / 태블릿 834 Figma 프레임이 없어 반응형은 PRD·AGENTS 규칙 기준으로 설계했습니다.
- **명도 대비**: 디자인 색상을 그대로 사용한 결과 아래 조합이 WCAG AA(일반 텍스트 4.5:1)에 미달합니다. 색상을 임의로 바꾸지 않고 그대로 두었으니 디자인 확인이 필요합니다.
  - 히어로 보조 정보 `#eab451` on `#fff5dc` → 1.74:1
  - 히어로 BOOKING `#f9bd4e` on `#fff5dc` → 1.56:1
  - N Pass 라벨 `#a4b465` on 티켓 배경 → 1.96:1
  - N Pass BOOKING `#ffffff` on `#f8ac22` → 1.92:1
  - 푸터 버튼 `#ffffff` on `#8c9275` → 3.24:1
  - Custom Goods 버튼 `#ffffff` on `#839051` → 3.46:1
  - 메뉴 LNB `#e4e4e4` on `#626f47` → 4.25:1
- 폰트는 Google Fonts + jsDelivr(Pretendard) CDN 으로 로드합니다. 로컬 폰트 파일 사용이 필요하면 `assets/fonts` 로 전환해야 합니다.

## 마지막 검증 결과

정적 프로젝트로 `package.json` 이 없어 lint / test / build 명령은 존재하지 않습니다.
로컬 정적 서버(PowerShell HttpListener, `http://localhost:8123`)로 실제 브라우저에서 확인했습니다.

- 문서 전체 높이 12408px (Figma main 12433px)
- 섹션 시작 위치: hero 0 / events 1080 / course 2260 / pass 3364 / restaurant 4444 / gift 5258 / tower 6274 / goods 10092 — Figma 대비 최대 40px 이내
- 360 / 834 / 1280 / 1920 모두 페이지 전체 가로 스크롤 없음
- 콘솔 오류 없음, 404 에셋 없음, 깨진 이미지 없음
- `h1` 1개, 중복 id 없음, `alt` 누락 없음, 제목 계층 h1 → h2 → h3
- 메뉴 열기/닫기, ESC 닫기, 포커스 복귀, 언어 선택 + localStorage 저장, family site 토글, 확정되지 않은 링크 안내 동작 확인
