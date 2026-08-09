# PROJECT_CONTEXT

마지막 갱신: 2026-08-09

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

## 히어로 재작업 — main_visual (2026-08-09 변경)

Figma `main_visual` 신규 시안 (파일 `pnPV0rtbTuA2PPO3SQJVUT`, node `1285:4525`, 1920 × 1080)
으로 히어로를 교체했습니다. **이전 히어로는 삭제하지 않고 보존**되어 있습니다.

### 구조

`index.html` 에 히어로 섹션이 두 개 있습니다.

| 섹션 | class | id | 상태 |
| --- | --- | --- | --- |
| 신규 | `main_visual` | `hero_section` / `hero_title` | 노출 |
| 이전 | `hero_section legacy_hero` | `legacy_hero_section` / `legacy_hero_title` | `display: none` |

`css/main.css` 의 `.legacy_hero { display: none; }` 한 줄이 토글 지점입니다.
(`.hero_section` 이 `display: flex` 라서 `hidden` 속성만으로는 숨겨지지 않습니다.)

### 이전 디자인으로 되돌리기

1. `index.html` 에서 `legacy_hero` 클래스를 `.main_visual` 섹션으로 옮깁니다.
2. 두 섹션의 id 를 맞바꿉니다. `hero_section` ↔ `legacy_hero_section`,
   `hero_title` ↔ `legacy_hero_title`.
   `js/main.js` 의 `initHeroSectionJump()` 가 `#hero_section` 을 참조하므로 필수입니다.

CSS 는 양쪽 다 남아 있어 수정할 필요가 없습니다.
(`.hero_section` ~ `.hero_weather_icon` = 이전 / `.main_visual*` = 신규)

### 신규 히어로 레이아웃

1920 기준 좌표를 비율로 환산했고, 실제 렌더 결과가 Figma 좌표와 일치합니다.

| 요소 | Figma (1920 × 1080) | CSS |
| --- | --- | --- |
| 배경 원 `Ellipse 39` | x129 y333 1662² · `#ffd973` 60% | `left: 50%` / `top: 30.83%` / `width: 86.56%` |
| 타이포 마스크 | x149 y345 1581 × 468 | `left: 7.76%` / `top: 31.94%` / `width: 82.34%` |
| 회전 타워 | x729.5 y27 388.6 × 1104.6 | `left: 37.99%` / **`bottom: 0`** / `width: 20.24%` |
| 정보 바 | x160 y897 1600 × 134.4 | `.page_container` + `bottom: 4.5vh` |

- 타워는 모든 해상도에서 `bottom` 기준입니다. 시안은 `top: 27` 이지만,
  뷰포트 높이가 달라져도 밑동이 히어로 하단에 붙도록 `bottom: 0` 으로 잡았습니다.
  소스 GIF 아래쪽에 투명 여백이 있어 실제 밑동은 컨테이너 높이의 약 1.06% 위에 옵니다.
- 하단 기준으로 바뀌면서 타워가 정보 바 영역까지 내려와, 1280 미만에서도
  타워 폭을 키웠습니다 (360 은 `50%`, 834 는 `38%`).
- 겹침 순서: 배경 원(1) → 정보 바(3) → 타워(4) → 타이포(5)
  834 이상에서는 시안대로 타이포를 `z-index: 3` 으로 내려 타워가 위에 옵니다.
  360 에서는 화면이 짧을 때 타워가 제목을 덮지 않도록 타이포를 위에 둡니다 (AGENTS 6.3).
- 정보 바 구조는 해상도마다 다릅니다.
  - 360 ~ 833: 2 × 2, 구분선 표시
  - 834 ~ 1279: **세로 1열** (항목 4개를 위에서 아래로), 구분선 숨김
  - 1280 이상: 가로 1행, 구분선 표시 (시안 구조)
- 834 부터는 세로 1열이라 BOOK NOW 가 바 왼쪽에 놓여 FAB 와 가로로 겹치지 않습니다.
  그래서 아래 여백을 134px → 40px 로 되돌렸습니다. 이 값이 없으면 1279 × 900 처럼
  넓고 낮은 화면에서 히어로가 뷰포트보다 52px 높아집니다.

### 숫자 / 구분기호 폰트

이 프로젝트의 "숫자는 GmarketSans" 규칙은 `@font-face` 의 `unicode-range` 로 구현되어
있습니다. `GmarketSansNumber` 3종 모두 `unicode-range: U+0030-0039` 라서
**숫자에만** 적용되고, 나머지 글자는 스택의 다음 폰트로 넘어갑니다.

그래서 `-` 처럼 숫자 사이에 들어가는 기호는 `--font_title` 스택에서
GmarketSans 를 건너뛰고 **Poppins** 로 렌더링되고 있었습니다.
이를 Pretendard 로 되돌리는 토큰을 추가했습니다.

```css
--font_sep: "Pretendard", system-ui, sans-serif;
```

적용 대상은 히어로 운영시간의 `-` (`.main_visual_value_sep`, 시안값 Medium 500) 입니다.

### Pretendard self-host (라틴 / 기호 구간)

Pretendard 자체는 원래부터 `common.css` 첫 줄의 CDN `@import` 로 로드되고 있습니다.

```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/...");
```

이 CDN CSS 는 굵기당 약 750KB 짜리 전체 한글 폰트를 받습니다. 화면에 실제로 쓰이는
영문과 기호만 로컬에서 받도록, `@import` **뒤에** 라틴 구간 subset 을 다시 선언했습니다.

- `fonts/woff2/Pretendard-{Regular,Medium}.subset.woff2` (각 약 20KB)
- `fonts/woff/Pretendard-{Regular,Medium}.subset.woff` (각 약 25KB, 폴백)
- 출처: npm `pretendard@1.3.9` 의 `woff2-dynamic-subset` 91번 조각
  (`U+20-22, U+2c-39, U+41-5d, U+61-7b` 등 라틴 + 기호 + 자주 쓰는 한글 14자)
- 라이선스: SIL OFL 1.1 — `fonts/Pretendard-OFL.txt`

같은 family / weight 는 나중 선언이 이기므로 이 구간만 로컬 파일이 쓰이고,
여기 없는 한글과 400 / 500 이외의 굵기는 그대로 CDN 파일이 담당합니다.
브라우저 네트워크 탭에서 로컬 subset 2개만 요청되는 것을 확인했습니다.

### quick_menu(FAB) 충돌 회피 — 시안과 다른 결정

시안에는 없지만 실제 사이트에는 우측 하단 고정 `quick_menu` 가 있어
`BOOK NOW` 를 덮어 클릭이 막혔습니다. 아래처럼 피했습니다.

- 1280 미만: 히어로 아래 여백을 키워 바 전체를 FAB 위로 올림
  (360 은 `padding-bottom: 120px`, 834 은 `134px`)
- 1280 이상: 바 우측 패딩으로 확보하려 했으나
  (`padding-right: clamp(24px, calc(176px - (100vw - 1600px) / 2), 95px)`)
  **현재 이 선언은 제거된 상태입니다.** 그 결과 1280 × 800 에서 FAB 가
  BOOK NOW 우측 약 51px 을 다시 덮습니다. 1920 에서는 좌우 여백이 넓어 문제 없습니다.
- 1280 ~ 1919 는 바 폭이 줄어 한 줄이 깨지므로 내부 gap 을 36 → 24px 로 좁혔고,
  1920 이상에서 36px 로 되돌립니다.

`css/main.css` 의 `.legacy_hero { display: none; }` 는 반드시
`.hero_section` / `.main_visual` 블록보다 **뒤에** 있어야 합니다.
두 블록 모두 `display` 를 선언하고 특정도가 같아서, 앞에 두면
신규 → 이전 전환은 되지만 이전 → 신규 전환이 동작하지 않습니다.

### 신규 에셋

- `assets/main_visual_title_mask.svg` — 두 줄(`N SEOUL` / `TOWER`) 마스크, 1581 × 468
- `assets/main_visual_turntable.gif` — 타워 회전, 1934 × 1934 / 25프레임 / **4.86MB**
- `assets/main_visual_turntable.png` — 위 GIF 의 정지 프레임, 577KB
  `<picture>` + `media="(prefers-reduced-motion: reduce)"` 로 전환합니다.

재사용한 기존 에셋: `assets/back_img.png` (마스크 채움 — Figma 원본과 바이트 동일),
`assets/icon/weather/sunny.svg` (Figma `sunny 1` 74.37² 와 동일한 파일)

### 검증 결과 (Chrome, file:// 직접 실행)

렌더 좌표를 Figma 좌표와 대조했고 1 ~ 2px 이내로 일치합니다 (1920 뷰포트,
스크롤바 15px 제외한 clientWidth 1905 기준).

| 뷰포트 | 가로 스크롤 | 정보 바 | BOOK NOW |
| --- | --- | --- | --- |
| 360 × 800 | 없음 | 2 × 2 / 320 × 247 | 높이 44px, FAB 와 겹침 없음 |
| 834 × 1112 | 없음 | 2 × 2 / 739 × 188 | FAB 와 겹침 없음 |
| 1280 × 800 | 없음 | 1행 / 1105 × 134 | FAB 까지 24px 여유 |
| 1920 × 1080 | 없음 | 1행 / 1585 × 134 (시안 1600 × 134.4) | FAB 까지 33px 여유 |

- 콘솔 오류 없음, 404 없음 (마스크 SVG / GIF / PNG / back_img / sunny 모두 200)
- 히어로 토글 양방향 동작 확인 (legacy ↔ main_visual)
- 중복 id 없음, 노출되는 `h1` 은 1개
- `reset.css` 가 outline 을 제거하지 않아 `focus-visible` 링은 브라우저 기본값으로 동작

미검증 항목

- `prefers-reduced-motion: reduce` 실제 전환 (마크업만 확인, OS 설정 미적용)
- 200% 확대, 스크린리더

### 남은 문제

- **타워 GIF 4.86MB** 가 첫 화면에서 로드됩니다. webm 또는 애니메이션 WebP 로
  변환하면 크게 줄어들지만, 시안 에셋을 그대로 쓰기 위해 GIF 를 유지했습니다.
- `assets/main_hero_vid.webm` (1.3MB) 는 이전 히어로에서도 주석 처리된 상태이며,
  `index.html` 의 preload 도 함께 주석 처리했습니다. 사용처가 없습니다.
- `assets/turn_tower.png`, `assets/hero_img.png` 는 현재 어디에서도 참조하지 않습니다.

## Getting Here 패널 인트로 (2026-08-09 추가)

`pages/visitor_guide.html` 의 Getting Here 패널 맨 위에
Recommended Courses 패널과 같은 `course_intro` 블록을 추가했습니다.

```html
<div class="course_intro">
  <h3>Getting Here</h3>
  <p>Find your best way<br>to reach N Seoul Tower</p>
  <span>Choose the easiest route and start your journey with ease.</span>
</div>
```

스타일은 새로 만들지 않고 `css/course.css` 의 기존 `course_intro` 선택자에
`.guide_sections .course_intro` 를 함께 묶었습니다. 선언 내용은 그대로이고
선택자만 추가했으므로 Recommended Courses 쪽 렌더 결과는 변하지 않습니다
(1280 기준 폭 920 / h3 20px / p 52px / span 22px 로 확인).

`--course_ink` 는 `.course_page` 안에서만 정의되므로
`var(--course_ink, var(--color_text))` 폴백을 넣었습니다.

## 서브페이지 탭 전환 시 패널로 이동 (2026-08-09 추가)

`js/visitor_guide.js` 의 `initGuideTabs()` 에 `scrollToGuidePanel()` 을 추가했습니다.
`subpage_tab` 을 눌러 다른 탭으로 바꾸면 새로 열린 패널
(`page_container guide_sections guide_tabpanel` 등) 상단으로 스크롤합니다.

- 클릭과 키보드(←/→, Home/End) 전환 모두 동작합니다.
- 이미 열려 있는 탭을 다시 눌렀을 때는 움직이지 않습니다.
- `common.js` 의 `initSubpageSectionJump()` 과 같은 방식으로
  `window.lenisInstance.scrollTo()` 를 쓰고, 없으면 `scrollIntoView` 로 대체합니다.
  도착 위치도 그 함수와 동일합니다 (패널 상단 = 뷰포트 상단, scrollY 678).
- 실제 탭 전환이 있는 페이지는 `visitor_guide.html` 뿐입니다.
  `restaurant_n_burger.html` / `brand_story.html` 의 `subpage_tab` 은
  링크이거나 `data-pending-link` 비활성 버튼입니다.

## 헤더 토글 버튼 (2026-08-05 변경)

`assets/menu_icon.svg` 정적 이미지 대신 **인라인 SVG 1개 path 를 `stroke-dasharray` 구간으로 잘라 햄버거 ↔ X 로 변형**하는 방식으로 교체했습니다. (참고: https://survedaa.com 헤더 토글)

- 닫힘: `stroke-dasharray: 12 63`, `stroke-dashoffset: 0`, 회전 없음 → 가로 3줄
- 열림: `stroke-dasharray: 20 300`, `stroke-dashoffset: -32.42px`, `rotate(-45deg)` → X
- 전환 500ms `ease-in-out`, `prefers-reduced-motion` 에서는 공통 규칙으로 즉시 전환
- 색상은 우리 토큰 유지: 닫힘 `--color_text`(#212121), 열림 `--color_gray_300`(#d4d4d4)
- 버튼 크기(44px), 아이콘 32/40px, 위치, 테두리 없음 등 기존 스타일은 그대로입니다.

### 스크롤바 폭 보정

메뉴를 열 때 `body { overflow: hidden }` 으로 스크롤바가 사라지면 뷰포트 폭이 ~15px 넓어져 오른쪽 정렬 요소(토글 버튼, 스크롤 페이저)가 밀렸습니다. 아래로 해결했습니다.

- `html { scrollbar-gutter: stable }` — 스크롤바 자리를 항상 확보
- 미지원 브라우저 대비: 잠글 때 `.site_wrapper` 의 실제 폭 변화를 재서 `--scrollbar_gap` 에 넣고 `body` 의 `padding-right`, `.global_menu` 의 `padding-right`, `.scroll_pager` 의 `right` 에 적용
- 기준을 `documentElement.clientWidth` 로 잡으면 `scrollbar-gutter` 가 이미 잡아준 경우에도 중복 보정되므로 반드시 본문 흐름 요소를 기준으로 측정해야 합니다.

### 닫기 버튼

이에 따라 오버레이 안의 별도 닫기(X) 버튼은 제거했습니다. Figma 에서도 header 의 `menu_icon`(1720~1760, 41.5~81.5)과 menu 프레임의 `x`(1724~1760, 43.5~79.5)가 같은 좌표라 하나의 컨트롤입니다. 토글이 오버레이 위에 남도록 `.site_header` 의 `z-index` 를 120 으로 올렸고(구조는 기존 `position: absolute` 유지), 메뉴가 열리면 로고는 숨깁니다.

## 페이지 구조 / GNB 링크 (2026-08-06)

서브 페이지는 `pages/` 폴더에 둡니다. 루트에는 `index.html` 만 남습니다.
`pages/` 안의 문서는 `../css/`, `../js/`, `../assets/` 로 공통 리소스를 참조합니다.

GNB 11개 항목 중 **Figma `(develope) 개발 시안 5개 페이지` 에 시안이 있는 5개만 `<a>` 링크**이고,
시안이 없는 나머지는 기존 `data-pending-link` 버튼을 유지합니다.

| GNB 항목 | Figma node | 링크 | HTML |
|---|---|---|---|
| brand story | 880:6605 | `pages/brand_story.html` | 미구현 |
| history | — | pending 버튼 | — |
| restaurants | 645:1375 | `pages/restaurant_n_burger.html` | ✅ |
| N gift shop | 986:6586 | `pages/n_gift_shop.html` | ✅ |
| amenities | — | pending 버튼 | — |
| floor guide | 790:7008 | `pages/floor_guide.html` | 미구현 |
| Hours & Tickets | — | pending 버튼 | — |
| visitor guide | 645:3216 | `pages/visitor_guide.html` | ✅ |
| notice & news / FAQ | — | pending 버튼 | — |

**주의: 미구현 3개(`brand_story` / `floor_guide` / `visitor_guide`)는 파일을 만들기 전까지 클릭 시 404 입니다.** 해당 파일을 `pages/` 에 추가하면 링크 수정 없이 바로 연결됩니다.

## Restaurant > N Burger 상세 페이지 (2026-08-06 추가)

`pages/restaurant_n_burger.html` — Figma `restaurant_n버거` (**645:1375**, 1920 × 7431) 기준.

| 섹션 | Figma node | 비고 |
|---|---|---|
| header | 645:1506 | **시안 대신 기존 공통 헤더 재사용** (시안은 가로 GNB, 우리는 로고 + 토글 + 오버레이) |
| hero | 645:1376 | bg `#b6c384`, 오브젝트 626, 제목 Poppins SemiBold 120 |
| tabs | 645:1938 | bg `#c8d2a3`, 7개, 가로 스크롤, 활성 `#3b432b` |
| info | 647:1422 | 썸네일 673×506 + 정보 863 |
| gallery | 647:1424 | **이미지 1장** → 화살표는 비활성 유지, 슬라이드 미구현 |
| best menu | 647:1427 | 타이포 2장 + 카드 5장 (burger_image5→1) |
| full menu | 645:1557 | menu_wrap 을 PNG 로 export 해 사용 |
| footer | 793:10410 | 기존 공통 푸터 재사용 |

- 페이지 전용 CSS: `css/restaurant_n_burger.css` (위치 그대로, 서브페이지에서 `../css/` 로 참조) (전용 토큰도 이 파일의 `:root` 에 정의)
- **페이지 전용 JS 없음** — 탭·갤러리 모두 CSS 로 처리, 공통 동작만 `js/common.js` 사용
- 신규 에셋: `assets/icon/chevron_left.svg`, `assets/restaurant/menu/n_burger_full_menu.png` (1600×2170) 및 `@2x` (3200×4340)
- 주의: `<img>` 의 `width`/`height` 속성은 CSS `aspect-ratio` 를 무력화하므로 비율 제어가 필요한 이미지에는 `height: auto` 를 함께 지정해야 합니다.

## Explore > N Gift Shop 상세 페이지 (2026-08-06 추가)

`pages/n_gift_shop.html` — Figma `N Gift Shop 7` (**986:6586**, 1920 × 3142) 기준.
**주의: 기존 표에 적혀 있던 `667:4906` 이 아니라 `986:6586` 이 최신 시안입니다.**

| 섹션 | Figma node | 비고 |
|---|---|---|
| header | 986:6587 | **시안 대신 기존 공통 헤더 재사용** (시안은 가로 GNB, 우리는 로고 + 토글 + 오버레이) |
| left_tab | 986:6639 | bg `#c8d2a3`, 폭 340, 카테고리 4개 + 운영시간 3개소 + 전화. **기본 숨김 + Filters 버튼으로 여는 `position: fixed` 좌측 드로어** |
| txt / toolbar | 986:6673 | 제목 Poppins SemiBold 64, 하단 구분선 `#1b5c4e`, Filters 버튼 + KRW 안내 |
| goods | 986:6690 | Product Card 12개 (4열 × 3행), 카드 이미지 334 × 396 bg `#edf0e0` |
| pager | 986:6706 | 1 / 2, 2페이지 데이터 없음 |
| footer | 986:6720 | 기존 공통 푸터 재사용 |

- 페이지 전용 CSS: `css/n_gift_shop.css` (전용 토큰도 이 파일의 `:root` 에 정의)
- 페이지 전용 JS: `js/n_gift_shop.js` (카테고리 필터 + 사이드바 드로어 토글만. hover 는 CSS)
- **사이드바 동작 (2026-08-06 수정)** — 초기 구현은 사이드바가 항상 보이는 2열 그리드였고
  Filters 버튼은 별도 태그 패널을 여는 구조였습니다. 검수 결과 아래로 변경했습니다.
  - 사이드바는 `position: fixed; left: 0; height: 100%` 로 **스크롤해도 위치가 고정**됩니다.
  - 기본 상태는 `transform: translateX(-100%)` + `visibility: hidden` 으로 **숨김**이고,
    본문 상품 그리드는 화면 중앙 정렬입니다.
  - Filters 버튼(`aria-controls="giftshop_sidebar"`)이 사이드바를 여닫습니다.
    1280 이상에서 열리면 `.giftshop.is_sidebar_open { padding-left: 340px }` 로 본문을 밀어
    시안 배치(사이드바 340 + 여백 80 + 콘텐츠 1406)를 재현합니다.
  - ESC / 바깥 클릭으로 닫히고, 열면 첫 카테고리로 포커스 이동, 닫으면 버튼으로 복귀합니다.
  - `visibility: hidden` 이라 닫힘 상태에서는 사이드바 내부가 탭 순서에서 제외됩니다.
  - 태그(#) 필터 패널은 제거했습니다. 카드의 `data-tags` 속성도 함께 삭제했습니다.
  - **카테고리 선택 시 스크롤 초기화 (2026-08-06 추가)** — 카테고리를 바꾸면 목록이 짧아져
    문서가 줄고 스크롤 위치가 푸터 쪽으로 밀립니다(예: 1280 에서 Best 선택 시 scrollY 2339 → 899,
    푸터가 화면에 노출). `handleCategoryClick` 끝에서 `window.scrollTo(0, 0)` 으로 상단에 맞춥니다.
    부드러운 이동 여부는 `common.css` 의 `html { scroll-behavior: smooth }` 를 따르며,
    `prefers-reduced-motion` 에서는 공통 규칙대로 즉시 이동합니다.
  - **푸터 경계 (2026-08-06 추가)** — 아래로 스크롤해 푸터를 만나면 사이드바가 푸터를 덮지 않도록
    `renderSidebarFooterBound()` 가 인라인 `top` 을 `min(0, 푸터top − 사이드바높이)` 로 잡아
    사이드바 bottom 을 푸터 top 에 붙여 멈춰 세웁니다. 그 뒤로는 페이지와 함께 위로 밀려나
    푸터가 온전히 보입니다. 여닫을 때와 `scroll` / `resize` 에서 갱신하며,
    스크롤 이벤트는 `requestAnimationFrame` 으로 프레임당 1회만 계산합니다 (AGENTS 7.2).
    닫으면 인라인 `top` 을 비워 CSS 의 `top: 0` 으로 되돌립니다.
    여닫는 데 `transform` 을 쓰고 있어 세로 보정은 `top` 으로만 합니다.
- **Filters 버튼 상태 (2026-08-06 수정)** — 기본은 올리브 외곽선 + 올리브 글자/아이콘,
  hover 와 열림(`[aria-expanded="true"]`)에서 `--giftshop_olive`(#626c3d) 로 채우고 글자/아이콘은 흰색입니다.
  다시 누르거나 ESC / 바깥 클릭으로 닫으면 `aria-expanded` 가 false 로 돌아가 색이 빠집니다.
  - `assets/icon/gift_shop/list.svg` 는 `stroke="white"` 가 하드코딩돼 있어 `<img>` 로는
    CSS 색 제어가 되지 않았습니다(기본 상태에서 크림 배경 위 흰 아이콘이라 보이지 않았음).
    같은 파일을 `mask` 로 쓰는 `<span class="giftshop_filter_icon">` 으로 바꿔
    `background-color: currentColor` 가 버튼 색을 그대로 따르게 했습니다.
    에셋 파일은 그대로 재사용하며 새로 만들지 않았습니다.
- 신규 에셋
  - `assets/n_gift_shop/` — `namsan_yakgwa` / `love_lock_package` / `monami_pen` / `snow_globe` /
    `hand_mirror` / `metal_pins` / `tower_365_bear` / `map_postcard` (Figma MCP 로 내려받음)
  - 기존 `gift2~5.png` 는 그대로 재사용 (plush toy / mug / keyring / tumbler 가 시안과 동일)
  - `assets/icon/gift_shop/` — `list.svg`, `chevrons_left/chevron_left/chevron_right/chevrons_right.svg`
- 카테고리 매핑은 시안에 근거가 있는 것만 부여했습니다.
  - `souvenirs` = `#Souvenir` 태그 4종, `toys` = 실제 완구 2종(Plush Toy / Tower 365 Bear)
  - **`best` 는 시안에 판단 근거가 없어 어떤 상품에도 부여하지 않았고, 선택 시 공통 빈 상태를 노출합니다.**
- 시안의 `Gmarket Sans TTF`(가격 일부)와 `Inter`(Filters 라벨)는 프로젝트에 없는 폰트라
  임의로 CDN 을 추가하지 않고 `--font_body`(Pretendard) 로 통일했습니다.

## 서브 페이지 전용 가로 헤더 (2026-08-06 추가)

Figma `header` (**645:2903**, 1920 × 84) 기준. **메인(`index.html`)은 기존 로고 + 햄버거 헤더를
그대로 두고, `pages/` 안의 4개 서브 페이지만** `.site_header_sub` 로 가로 GNB 를 씁니다.

| 요소 | Figma node | 값 |
|---|---|---|
| header | 645:2903 | 높이 84, bg `rgba(255,255,255,.2)`, 좌우 160 |
| nst_logo | 645:2905 | 43 × 43 — 기존 `nst_logo_defalut.svg` 재사용 |
| gnb 항목 | 645:2908 | 5개, 각 폭 130.042, 20px Pretendard Medium `#212121` |
| lnb | 645:2912 등 | 폭 105.037, gap 14, 16px Regular `#212121` |
| Book Now | 645:2948 | bg `#ffaf04`, radius 30, padding 10/20, 20px white |
| 언어 | 645:2950 | 밑줄 `#4e5939`, 20px `#4e5939`, chevron 20 |

- 스타일은 `common.css` 의 `site page header` 블록에 있습니다. 페이지 전용 CSS 가 아니라
  4개 페이지가 공유하므로 공통 파일에 두었습니다.
- **1280 미만에서는 가로 GNB 를 `display: none` 으로 두고 기존 토글 + 오버레이를 그대로 씁니다.**
  모바일·태블릿 시안이 없고 가로 GNB 가 1000px 이상 필요합니다 (AGENTS 6.4).
- **1280–1439 구간만 gap 을 30 → 20 으로 좁혔습니다.** 시안 값 30 을 그대로 쓰면 1280 에서
  메뉴가 로고에 붙습니다(여백 1px). 1440 이상은 시안 값 30 그대로입니다.
- LNB 는 `:hover` 와 `:focus-within` 으로만 엽니다. 시안에서 LNB 가 `height: 46` 으로 잘려 있어
  hover 노출이 의도로 보입니다. 닫힌 동안에도 키보드 포커스를 받아야 `:focus-within` 이 걸리므로
  `visibility: hidden` 대신 `opacity` + `pointer-events` 를 씁니다.
- **LNB 배경면은 시안에 없지만 추가했습니다.** `floor_guide` 는 LNB 가 층 일러스트 위로 떨어져
  글자만으로는 읽기 어렵습니다. 같은 헤더의 언어 드롭다운과 맞춰 흰 패널 + radius 16 +
  `0 8px 24px rgba(33,33,33,.12)` 를 씁니다.
  - **제목 바로 아래(`top: 100%`)에 붙여야 합니다.** 시안의 `gap: 14` 를 그대로 두면
    제목과 패널 사이 빈 틈에서 hover 가 끊겨 패널에 마우스가 닿지 못합니다.
    대신 패널 안쪽 `padding: 14px 16px` 로 시안의 간격 리듬(제목 padding 10 + gap 14)을 맞췄습니다.
  - 시안의 `width: 105` 는 `min-width` 로 바꿨습니다. 배경면이 생긴 뒤에도 고정 폭을 쓰면
    `FAQ / contact us`(146px) 같은 항목이 패널 밖으로 삐져나옵니다.
  - `.site_gnb_link` 의 `width: 100%` 는 제거했습니다. 이 값이 있으면 패널이 가장 긴 항목 기준으로
    넓어지지 않습니다. 기본 stretch 로 두면 패널 폭이 내용에 맞게 늘어납니다.
- **메뉴 라벨은 기존 오버레이 메뉴(645:5527) 기준으로 통일했습니다.** 새 헤더 시안(645:2903)의
  `restaurant` / `pricing & Hours` 대신 `restaurants` / `Hours & Tickets` 를 씁니다.
  1280 을 넘나들 때 같은 항목의 이름이 바뀌지 않아야 하기 때문입니다.
- **언어 선택기가 한 페이지에 둘(헤더 GNB, 오버레이 메뉴)이 되어** `common.js` 의 언어 로직을
  `initGlobalMenu` 안에서 `initLanguageSelector(button)` 로 분리했습니다.
  - 기준 컨테이너는 `button.parentElement` 입니다. 오버레이(`.language_selector`)와
    헤더(`.site_gnb_language`) 의 class 가 달라도 같은 함수를 씁니다.
  - 한쪽에서 언어를 고르면 `applySelectedLanguage()` 가 **양쪽 표시를 함께 갱신**합니다.
    이걸 빼면 헤더는 Korean, 오버레이는 English 로 갈립니다.
- 신규 에셋: `assets/icon/icon_chevron_down_dark.svg` — 기존 `icon_chevron_down.svg` 는
  어두운 오버레이용 `stroke="white"` 라 밝은 헤더에서 보이지 않습니다.
- 신규 토큰: `--color_point_800: #ffaf04`, `--color_new_secondary_600: #4e5939`

## 공통 플로팅 퀵 메뉴 (2026-08-06 추가)

Figma `fixed_button` (**1072:1493**) 안의 컴포넌트 `chatbot` (**987:7708**, variants `속성1=off/on`) 기준.
**5개 페이지(`index.html` + `pages/` 4개) 전부**에 같은 마크업이 들어갑니다.

| 요소 | Figma node | 값 |
|---|---|---|
| 링 박스(닫힘 전체) | 987:7706 | 133.2 × 133.2 (패딩 18.6) |
| 곰 버튼 | 987:7670 | 96 원형, 이미지는 `assets/icon/chatbot.png` 를 그대로 사용 |
| CLICK ME 링 | 987:7672 | 10.8px Pretendard Medium `#424828`, 글자 중심 반지름 60 |
| search | 977:5207 | 96 원형, bg `#3b432b`, shadow `0 0 7.86px .6px rgba(0,0,0,.1)`, 아이콘 36 |
| top | 977:5201 | 위와 동일 |
| 액션 사이 간격 | 987:8606 | 30 |
| 액션블록 ↔ 토글 간격 | 987:7707 | 24 |

- 스타일은 `common.css` 의 `floating quick menu` 블록, 동작은 `common.js` 의 `initQuickMenu()` 입니다.
- **곰 이미지는 CSS 로 원형 배경을 다시 그리지 않습니다.** `assets/icon/chatbot.png`(189×189)에
  이미 딥그린 원형 배경이 포함돼 있어 `object-fit: contain` 으로 96 크기만 지정합니다.
  이 파일은 그동안 프로젝트에 있었지만 아무 데서도 쓰이지 않던 에셋입니다.
- **CLICK ME 링 글자는 `renderQuickMenuRing()` 이 생성합니다.** 시안은 10도 간격 36칸에
  `"CLICK ME" + 빈칸 4`를 3번 반복한 구조이고, 첫 글자가 **9시 방향(-90도)에서 시작해 시계 방향**입니다
  (987:6688 이 `-90deg`). 실제로 그려지는 글자는 공백을 뺀 21개입니다.
  마크업에 21개 span 을 5개 파일에 중복해서 넣지 않으려고 JS 렌더링을 택했습니다.
- 링 회전은 `animation: quick_ring_spin 2s linear infinite` 이고
  `prefers-reduced-motion` 에서는 공통 규칙이 멈춥니다.
- **크기는 `--quick_btn` 하나로 전부 파생됩니다.** 링 박스 = ×1.3875, 아이콘 = ×0.375,
  액션 간격 = ×0.3125, 토글 간격 = ×0.25, 링 폰트 = ×0.1125.
  360 = 64 / 834 = 80 / 1280+ = 96(시안 실측값).
- `z-index: 60` — 기존 섹션 페이저(55)보다 위, 메뉴 오버레이(100)·헤더(120)보다 아래입니다.
  메뉴를 열면 퀵 메뉴가 오버레이에 덮입니다.
- **기존 기능 재사용**
  - TOP 은 푸터와 같은 `<a href="#top">` 입니다. 모든 페이지의 `.site_wrapper` 에 `id="top"` 이 있어
    JS 없이도 동작합니다.
  - `index.html` 의 섹션 목록은 기존 섹션 페이저(`[data-scroll-pager]`, PRD 8.4)와 같은 6개입니다.
  - 챗봇·검색은 프로젝트에 기능이 없어 기존 `data-pending-link` 패턴으로 안내만 노출합니다.
- **섹션 목록은 페이지마다 마크업에 직접 씁니다.** 숨은 탭·동적 섹션까지 자동 추출하면 어긋나서,
  헤더·푸터와 같은 방식으로 페이지별로 둡니다. 목록이 비면 `initQuickMenu()` 가 버튼을 제거합니다.
  - `visitor_guide` 의 `recommended courses` 는 숨은 탭 안이지만
    `visitor_guide.js` 의 해시 처리가 탭을 먼저 열어 줍니다.
  - `n_gift_shop` 은 본문이 상품 목록 한 덩어리라 이동할 섹션이 없어 섹션 버튼을 넣지 않았습니다.
- `restaurant_n_burger.html` 의 4개 섹션에 `id` 를 추가했습니다(`burger_info` / `burger_gallery` /
  `burger_best` / `burger_menu`). 이동 대상이 필요해서이며 다른 변경은 없습니다.
- 신규 에셋 `assets/icon/quick/`
  - `search.svg` / `arrow_up.svg` — Figma export 그대로
  - `sections.svg` / `chat.svg` — **시안에 벡터가 없어 직접 작성**했습니다.
    4점 아이콘은 래스터 참고 이미지에만 있고, 챗봇 아이콘은 시안 자체에 없습니다.
    나머지 두 아이콘과 같은 36 × 36 / `stroke: white` / `stroke-width: 1.2` 규격으로 맞췄습니다.
- 신규 토큰: `--color_new_primary_800: #424828`, `--color_new_secondary_700: #3b432b`

### 퀵 메뉴 호버·챗봇 패널 (2026-08-09 추가)

사용자 요청으로 세 가지를 더했습니다. 셋 다 `common.css` 의 `floating quick menu` 블록과
`common.js` 의 `initQuickMenu()` 안에서만 처리했고, 5개 페이지에 공통 적용됩니다.

- **섹션 버튼 호버로 섹션 패널 열기.** 클릭 토글은 그대로 두고, 버튼과 패널을 함께 감싸는
  `.quick_section` 에 `mouseenter` / `mouseleave` 를 걸었습니다. 패널이 버튼의 DOM 자식이라
  패널 위에서는 닫히지 않습니다. 버튼과 패널 사이 16px 틈에서 호버가 끊기지 않도록
  `.quick_section_menu::before` 로 투명한 연결 영역을 뒀습니다.
  `matchMedia("(hover: hover) and (pointer: fine)")` 로 마우스 환경에서만 동작시켜,
  터치에서 hover 상태가 남는 문제를 피했습니다.
- **챗봇 버튼 안내 문구.** `.quick_action_tip` — 호버·`focus-visible` 에서 버튼 왼쪽에
  "Ask me anything!" 을 띄웁니다. CSS 만으로 동작하고 `aria-hidden="true"` 입니다.
- **챗봇 패널** (`.quick_chatbot`, `getQuickChatbotMarkup()`) — 채널톡형 위젯을 참고한 구조.
  클릭하면 열리고 아이콘이 `icon_close.svg`(X)로 바뀝니다. 아이콘 교체는
  `[aria-expanded="true"]` 선택자로 CSS 에서 처리합니다.
  - 아이콘 전환은 `display` 대신 **두 아이콘을 겹쳐 두고 opacity + 90도 회전 + scale 로 교차**시킵니다
    (`--duration` 320ms, `--ease_out`). `display` 는 전환 효과를 줄 수 없어서입니다.
    가운데 정렬은 `inset: 0` + `margin: auto` 로 잡아 `transform` 은 모션에만 씁니다.
    `prefers-reduced-motion` 에서는 공통 규칙이 전환을 없앱니다.
  - 배치: **834px 이상은 버튼 왼쪽 옆**(`right: calc(100% + 16px)`, 340px),
    그 아래는 폭이 부족해 **버튼 위쪽**(`bottom: calc(100% + 12px)`, 최대 320px)입니다.
    두 경우 모두 X 버튼이 패널에 가리지 않습니다.
  - 챗봇 패널과 섹션 패널은 같은 자리에 겹치므로 한쪽이 열리면 다른 쪽을 닫습니다.
  - 문의 버튼은 연결 대상이 없어 기존 `data-pending-link` + `aria-disabled` 패턴입니다.
  - 패널 글자는 `--fs_*` 대신 고정 px 입니다. 패널 폭이 해상도와 무관하게 고정이라
    토큰을 쓰면 1280 이상에서 본문이 18px 로 커집니다(`.quick_section_link` 와 같은 방식).
  - 문구는 운영 사실을 단정하지 않는 범위로만 썼습니다. 참고한 위젯의
    "24시간 운영해요", "몇 분 내 답변" 같은 운영 약속은 넣지 않았습니다.
  - 참고 이미지의 하단 탭바(홈/대화/설정)는 아이콘 에셋이 없어 넣지 않았습니다.

## 히어로 → 이벤트 한 번에 이동 (2026-08-09 추가)

`main.js` 의 `initHeroSectionJump()` 입니다. 메인 페이지 전용이라 `main.js` 에 뒀습니다.

- 히어로가 화면을 채우고 있을 때(`hero.getBoundingClientRect().bottom > innerHeight * 0.9`)
  아래로 한 번 스크롤하면 `#events_section` 상단으로 옮깁니다.
- **Lenis 로 이동시킵니다.** 이 프로젝트는 `common.js` 가 Lenis 를 쓰고 있어서
  직접 `scrollTo` 하면 Lenis 의 관성 스크롤과 서로 밀칩니다.
  전역 `lenisInstance` 를 통해 `scrollTo(target, { lock: true })` 를 호출하고,
  Lenis 가 없거나 실패하면 `scrollIntoView` 로 넘어갑니다
  (`prefers-reduced-motion` 에서는 Lenis 가 아예 뜨지 않아 `behavior: "auto"` 로 즉시 이동).
- 개입하지 않는 경우: 위로 스크롤 / `ctrl + 휠`(확대 축소) /
  메뉴 오버레이로 `body` 가 잠긴 동안 / 히어로를 벗어난 뒤.
- 이동 중 재발동은 `isJumping` 과 900ms 타이머로 막습니다.
  트랙패드 관성으로 휠 이벤트가 연달아 들어와도 한 번만 이동합니다.
- 터치는 `touchstart` / `touchmove` 를 **passive 로만** 듣고 24px 이상 밀었을 때 이동합니다.
  `preventDefault` 를 쓰지 않아 기존 스크롤 동작을 막지 않습니다.

## 파일 구조

```text
n_seoul_tower/
├── index.html                   # 메인 — 로고 + 햄버거 헤더 (서브와 다름)
├── default.html                 # 메타/파비콘/OG 만 있는 빈 템플릿 (헤더·푸터 없음)
├── pages/                       # 서브 페이지 (공통 리소스는 ../ 로 참조)
│   │                            # 4개 모두 .site_header_sub 가로 GNB 사용
│   ├── floor_guide.html
│   ├── n_gift_shop.html
│   ├── restaurant_n_burger.html
│   └── visitor_guide.html
├── css/
│   ├── reset.css
│   ├── common.css   # 디자인 토큰, 폰트, 공통 버튼/카드/헤더/메뉴/푸터/페이저 + subpage hero·tabs
│   ├── main.css     # 섹션별 레이아웃과 반응형
│   ├── course.css   # .course_page 스코프 — visitor_guide 의 코스 탭에서 재사용
│   ├── restaurant_n_burger.css
│   └── visitor_guide.css
├── js/
│   ├── common.js    # 메뉴, 언어, family site, 섹션 페이저, 공통 상태
│   ├── course.js    # 코스 카테고리 IntersectionObserver
│   ├── visitor_guide.js  # 탭 전환 + 케이블카 안내 패널
│   └── main.js      # 목업 데이터 + renderXxx + 섹션 인터랙션
└── assets/
    ├── back_img.png / turn_tower.png / footer_tower.png / hero_title_mask.svg
    ├── nst_logo_defalut.svg   # 헤더·푸터 로고 (620x620)
    ├── nst_logo_gray.svg      # 메뉴 오버레이 로고 (219x136)
    ├── icon/                  # 화살표, 티켓, chevron, 커서 + sns/ weather/
    ├── event/                 # 이벤트 카드, 곤돌라, 곡선
    ├── guide_course/          # course1~4, walk_bg, walk_nbear (+ 서브페이지용 course/ guide/)
    ├── npass/                 # ticket, ticket_bg
    ├── n_gift_shop/           # gift1~8
    ├── custom_goods/          # candle1~6, goods1~4, arc svg
    └── restaurant/            # restaurant_bg, restaurant_dining (+ 서브페이지용 menu/ bg_title/)
```

JS 는 `ASSET_PATH = "./assets/"` 를 접두로 두고 데이터에 하위 경로를 포함합니다
(예: `image: "event/event1.png"`). 새 폴더가 생기면 데이터 값만 바꾸면 됩니다.

## 디자인 토큰 (Figma 실측)

- 페이지 배경 `#f7f4e8`, 히어로 배경 `#fff5dc`
- 텍스트 `#212121`, 브랜드 `#0b251f` / `#1b5c4e` / `#1e4c43` / `#3a786b`
- 올리브 `#626f47` / `#839051` / `#a4b465`, 포인트 `#f8ac22` / `#f9bd4e` / `#ffd973` / `#ffecb9`
- 푸터 `#333333`, 푸터 버튼 `#8c9275`
- 폰트: 제목 Poppins SemiBold, 본문 Pretendard, 디스플레이 Montserrat Bold, 메뉴 로고 Jost Medium

## 남은 문제 / 확인 필요

- GNB 는 시안이 있는 5개만 `<a>` 로 연결했고 그중 3개(`brand_story` / `n_gift_shop` / `floor_guide`)는 **HTML 파일이 아직 없어 404** 입니다. 나머지 CTA·메뉴는 `data-pending-link` + `aria-disabled="true"` 버튼으로 두고 안내 메시지만 노출합니다.
- Restaurant 슬라이더는 Figma 에 3개 인디케이터가 있으나 실제 사진 에셋은 1장(`restaurant_dining.png`)만 존재합니다. 나머지 2장을 받으면 `mainPageData.restaurantPhotos` 에 추가하면 됩니다.
- 메인 페이지 기프트숍 섹션은 상품명·가격 데이터 없이 이미지 + alt 만 사용합니다.
  (서브 페이지 `pages/n_gift_shop.html` 는 시안 986:6586 에 표기된 실제 상품명·가격·태그를 사용합니다.)
- 기프트숍 서브 페이지 확인 필요 항목
  - `Best` 카테고리에 어떤 상품이 들어가는지 기획 확인 필요 (현재 빈 상태)
  - 페이지네이션 2페이지 상품 데이터 없음 → 구조와 상태만 구현, `data-pending-link` 로 안내
  - **사이드바를 열고 닫을 때 문서 전체 높이가 바뀝니다.** 1280 이상에서 본문을 340px 밀면
    그리드 폭이 줄어(예: 1105 → 765) 카드 높이가 달라져 문서가 약 500px 짧아집니다.
    페이지 하단 근처에서 열면 `scrollY` 가 clamp 되어 화면이 100px 정도 튑니다.
    푸터 경계 처리와는 무관한 별개 현상이며, 본문을 미는 동작 자체를 바꿔야 해결됩니다.
  - **`js/main.js` 의 `giftShopItems` 가 삭제된 `n_gift_shop/gift1~8.png` 를 참조 중이라
    메인 페이지(`index.html`) 기프트숍 섹션 이미지 8장이 404 입니다.** 에셋 파일명이
    `n_gomi_toy` / `n_gomi_mug` / `n_gomi_keyring` / `tumbler` 등으로 바뀌었고
    `gift1` / `gift6` / `gift7` / `gift8` 은 삭제되어 대체 이미지가 없습니다.
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
  - (기프트숍) 미선택 카테고리 `rgba(98,108,61,0.45)` on `#c8d2a3` → **1.66:1** (24px 큰 텍스트 기준 3:1 미달)
  - (기프트숍) 미선택 페이지 번호 `rgba(59,67,43,0.4)` on `#f7f4e8` → **2.07:1** (3:1 미달)
  - 위 2건은 Figma 값 그대로이며 hover / focus-visible 에서는 불투명 색으로 전환됩니다.
- 폰트는 Google Fonts + jsDelivr(Pretendard) CDN 으로 로드합니다. 로컬 폰트 파일 사용이 필요하면 `assets/fonts` 로 전환해야 합니다.
- **교통안내 페이지 확인 필요 항목**
  - `Cable Car Website` / `Cable Car Information` 버튼의 실제 주소. 현재는 시안의 주차 안내에 적힌
    `namsancablecar.com` 도메인을 임시로 씁니다.
  - `City Tour Bus Website` 버튼의 실제 주소. 시안에 표기가 없어 임시 주소를 넣고 주석으로 표시했습니다.
  - Figma `cable_info` 컴포넌트는 `베리언트3` 만 배치되어 있고 chevron-down 을 달고 있습니다.
    펼침 패널이 있는 컴포넌트인지 확인이 필요해, 지금은 링크 형태로만 구현했습니다.
  - 히어로/탭 스타일이 `restaurant_n_burger.css` 의 `rest_hero` / `rest_tab` 과 사실상 동일합니다.
    서브 페이지가 더 늘어나면 `common.css` 로 승격을 검토하세요(이번엔 기존 파일 수정을 피해 중복 유지).
  - `visitor_guide.css` 의 `.guide_tabs` / `.guide_tab` 규칙(`:target` 기반)은 탭이 공통
    `.subpage_tab` 으로 통일되면서 쓰이지 않는 죽은 코드입니다. 정리 여부 확인 필요.
  - `pages/custom_course.html` 은 내용이 `visitor_guide.html` 탭으로 옮겨져 삭제했습니다.
    외부에서 이 주소를 공유했다면 `pages/visitor_guide.html#panel_recommended_courses` 로 안내해야 합니다.
- **서브 페이지 가로 헤더(645:2903) 확인 필요 항목**
  - **LNB 배경면(흰 패널 + radius 16 + 그림자)은 시안에 없는 요소입니다.** 가독성 때문에
    넣기로 결정했으니 디자인 확인 후 값 조정이 필요할 수 있습니다.
  - **라벨은 기존 오버레이 메뉴(645:5527) 기준으로 통일했습니다.** 새 헤더 시안의
    `restaurant` / `pricing & Hours` 는 쓰지 않습니다. 두 시안 중 어느 쪽이 최종인지 확인이 필요합니다.
  - `Book Now` 의 목적지가 시안에 없어 `data-pending-link` 로 두었습니다.
  - `tower story` / `explore` / `visit` / `support` 상단 라벨은 시안에 링크 표시가 없어
    클릭 대상이 아닌 텍스트(`<p>`)로 두고 LNB 만 이동하게 했습니다.
  - 1280–1439 구간은 시안이 없어 gap 만 20 으로 좁혔습니다. 이 구간 시안이 나오면 교체해야 합니다.
- **플로팅 퀵 메뉴(987:7708) 확인 필요 항목**
  - **시안 컴포넌트에는 펼침 액션이 search / top 2개뿐**입니다. 섹션 이동 버튼은 프레임 안의
    래스터 참고 이미지(1072:1492)에만 있고, 챗봇 버튼은 어느 쪽에도 없습니다.
    요청받은 4가지 기능에 맞춰 곰 버튼을 토글 전용으로 두고 액션 4개(챗봇/검색/섹션/TOP)를 넣었습니다.
  - `sections.svg` / `chat.svg` 는 시안에 벡터가 없어 직접 작성한 아이콘입니다. 에셋 확인이 필요합니다.
  - 참고 이미지의 `QUICK MENU` 패널(Visitor Guide / Transportation / Courses / Tickets / Dining /
    Gift Shop)은 메인 기준 목록으로 보입니다. 현재는 페이지별 실제 섹션으로 채웠습니다.
  - 챗봇·검색은 연결할 서비스가 없어 `data-pending-link` 안내만 노출합니다.
  - 퀵 메뉴가 뷰포트 우측 하단에 고정돼 기존 섹션 페이저(우측 세로 중앙)와 같은 쪽에 있습니다.
    1280 이상에서 둘이 함께 보이므로 배치 조정이 필요한지 확인이 필요합니다.

## 마지막 검증 결과

정적 프로젝트로 `package.json` 이 없어 lint / test / build 명령은 존재하지 않습니다.
로컬 정적 서버(PowerShell HttpListener, `http://localhost:8123`)로 실제 브라우저에서 확인했습니다.

- 문서 전체 높이 12408px (Figma main 12433px)
- 섹션 시작 위치: hero 0 / events 1080 / course 2260 / pass 3364 / restaurant 4444 / gift 5258 / tower 6274 / goods 10092 — Figma 대비 최대 40px 이내
- 360 / 834 / 1280 / 1920 모두 페이지 전체 가로 스크롤 없음
- 콘솔 오류 없음, 404 에셋 없음, 깨진 이미지 없음
- `h1` 1개, 중복 id 없음, `alt` 누락 없음, 제목 계층 h1 → h2 → h3
- 메뉴 열기/닫기, ESC 닫기, 포커스 복귀, 언어 선택 + localStorage 저장, family site 토글, 확정되지 않은 링크 안내 동작 확인

### N Gift Shop 서브 페이지 (2026-08-06)

로컬 정적 서버(PowerShell HttpListener, `http://localhost:8137`)에서 확인했습니다.

- 1920 실측: 사이드바 `x=0 y=84 340×1080`, 콘텐츠 `x=420 y=84`, 제목 블록 `x=420 y=152 w=683`
  → Figma(사이드바 340×1080 / 콘텐츠 x=420 / 제목 y=152)와 좌표 일치. 콘텐츠 폭만 스크롤바 15px 만큼 차이
- 열 수: 360 = 1열, 560+ = 2열, 834 = 2열, 1280 = 3열, 1600·1920 = 4열
- 360 / 834 / 1280 / 1920 모두 페이지 전체 가로 스크롤 없음
- 콘솔 오류 없음, 404 에셋 없음, 깨진 이미지 0건(이미지 28장), `alt` 누락 0건, 중복 id 없음
- 제목 계층 `h1`(N Gift Shop) → `h2`(customer service) 1개씩. 사이드바는 숨김 h2 대신 region 이름 사용
- 터치 영역: 360 에서 44px 미만 컨트롤 0건 (페이지네이션 gap 축소 + 전화 링크 min-height 로 수정)
- 필터 동작 확인: All 12 / Souvenirs 4 / Toys 2 / Best 0(빈 상태 "상품 준비 중입니다.")
  태그 다중 선택(OR), 카테고리+태그 조합, Reset, 패널 열기·닫기·ESC·바깥 클릭 모두 정상
- 공통 파일 미수정 확인: `git status` 기준 `common.css` / `reset.css` / `common.js` / `main.*` / `index.html` /
  `default.html` / restaurant 페이지 변경 0건 (신규 파일만 추가)

### 서브 페이지 가로 헤더 (2026-08-06)

로컬 정적 서버(PowerShell HttpListener, `http://localhost:8123`)에서 확인했습니다.

- 1920 실측 — 헤더 높이 84, bg `rgba(255,255,255,.2)`, inner `x=160`, 로고 43×43 `x=160`,
  gnb 항목 폭 130 × 5, 라벨 20px/500, Book Now bg `rgb(255,175,4)` 높이 46,
  언어 색 `rgb(78,89,57)` → 시안(645:2903) 값과 일치
- 로고와 GNB 사이 여백: 1280 = 46px, 1440 = 146px, 1920 = 여유. 네 폭 모두 가로 스크롤 없음
- LNB 는 `:hover` / `:focus-within` 에서 `opacity 0 → 1`, `pointer-events none → auto` 동작 확인
  (검증 패널이 프레임을 그리지 않아 transition 은 끄고 규칙만 확인)
- LNB 패널 실측 — 흰 배경 `rgb(255,255,255)`, radius 16, 그림자 적용, 제목과의 간격 0(붙임).
  폭은 내용에 맞춰 tower story 137 / explore 138 / visit 164 / support 178 이고
  **모든 항목이 패널 안에 들어옵니다**(1줄 유지, 삐져나옴 0건)
- 1280 에서도 네 패널 모두 뷰포트 안에 들어옴 (support 패널 오른쪽 끝 924 < 1265)
- 헤더 GNB 라벨과 오버레이 메뉴 라벨이 4개 페이지 모두 **완전히 일치**함을 문자열 비교로 확인
- 헤더 탭 순서: 로고 → tower story LNB → explore → visit → support → Book Now → 언어.
  1280 이상에서 햄버거 토글은 포커스 대상에서 제외됨
- 언어 선택: 헤더에서 고르면 오버레이 라벨도 함께 바뀌고 그 반대도 동일, localStorage 저장 확인.
  바깥 클릭 / ESC 로 닫힘
- 360 실측 — 가로 GNB `display: none`, 토글 노출, 헤더 배경 투명 + `padding-top: 20px` +
  inner 높이 43px 로 **기존 모바일 헤더 그대로**. 오버레이 열기 / ESC 닫기 / 포커스 복귀 정상
- `index.html` 회귀 없음 — `.site_gnb` 없음, 헤더 class `site_header` 그대로,
  오버레이 메뉴와 언어 선택 정상 동작
- 4개 서브 페이지 모두 중복 id 없음, 404 에셋 없음
- **미검증**: 화면 캡처 비교. 검증에 쓴 브라우저 패널이 프레임을 그리지 않아
  스크린샷을 얻지 못했고, DOM 실측값으로만 시안과 대조했습니다

### 공통 플로팅 퀵 메뉴 (2026-08-06)

로컬 정적 서버(PowerShell HttpListener, `http://localhost:8123`)에서 확인했습니다.

- 1920 실측이 시안과 일치 — 링 박스 **133.2**, 곰 이미지 96(`object-fit: contain`, 원본 189×189),
  액션 4개 모두 **96×96**, bg `rgb(59,67,43)`=`#3b432b`, `border-radius: 50%`,
  shadow `rgba(0,0,0,.1) 0 0 7.86px .6px`, 아이콘 **36×36**,
  액션 간격 **30**, 액션블록↔토글 간격 **24**
- CLICK ME 링 — 글자 21개(공백 제외), 각도 `-90 / -80 / -70 / -60 / -50 / -30 / -20 / 30 …`
  으로 시안의 빈칸 위치까지 일치. 폰트 10.8px, 색 `rgb(66,72,40)`=`#424828`,
  애니메이션 `2s linear infinite`. 글자 중심 반지름 **60.9**(시안 60, 1px 이내)
- 진입 시 닫힘 상태 확인 — `aria-expanded="false"`, 액션 `hidden`, 포커스 가능한 요소 0개
- 열면 포커스 대상 4개, 토글 라벨이 `Open quick menu` ↔ `Close quick menu` 로 바뀜
- ESC 1회 = 섹션 패널만 닫힘 / 2회 = 전체 닫힘, 바깥 클릭으로도 닫힘
- 섹션 링크 대상이 전 페이지에서 모두 실제로 존재함
  (index 6 / visitor_guide 5 / restaurant 4 / floor_guide 7, n_gift_shop 은 버튼 없음)
- `visitor_guide` 의 `recommended courses` 클릭 → 코스 탭이 열리고 퀵 메뉴가 닫힘
- 360 실측 — 토글 89, 곰 64, 액션 64, 아이콘 24, 여백 20, 터치 영역 44px 이상 전부 충족,
  섹션 패널이 뷰포트 안에 들어옴, 가로 스크롤 없음
- `z-index` 60 < 오버레이 100 < 헤더 120, 섹션 페이저 55보다는 위
- 5개 페이지 모두 퀵 메뉴 이미지 5장 로드 성공, 중복 id 없음
- 콘솔 404 8건은 **이번 작업과 무관한 기존 이슈**입니다
  (`js/main.js` 의 `giftShopItems` 가 삭제된 `n_gift_shop/gift1~8.png` 참조)
- **미검증**: 화면 캡처 비교. 브라우저 패널이 프레임을 그리지 않아 스크린샷을 얻지 못했고,
  DOM 실측값으로만 시안과 대조했습니다. 회전 애니메이션도 규칙 적용만 확인했습니다

### 퀵 메뉴 호버·챗봇 패널 (2026-08-09)

이 환경에는 python 이 실제로 설치돼 있지 않아(스토어 스텁) 정적 서버를 띄우지 못했고,
공통 CSS/JS 만 불러오는 임시 페이지를 `file://` 로 열어 확인한 뒤 삭제했습니다.
프리뷰가 `index.html` 의 이전 스냅샷을 캐시해서 변경분이 반영되지 않았기 때문입니다.

- 섹션 버튼 호버 → 패널 노출, 벗어나면 숨김, `aria-expanded` 복귀 확인
- `.quick_action_tip` — 평소 `opacity 0 / visibility hidden`, 호버 시 노출(스크린샷으로 확인)
- 챗봇 패널 실측 (애니메이션 끄고 측정)
  - 360: 버튼 위쪽, 폭 307, 좌측 여백 19, 토글과 겹침 없음, 가로 스크롤 없음
  - 834 / 1920: 버튼 왼쪽 옆, 버튼과 간격 15~16, 하단 정렬, 뷰포트 안에 들어옴
- 동작: 재클릭으로 닫힘 / 재열기 / ESC 닫힘 + 포커스가 버튼으로 복귀 /
  바깥 클릭 시 챗봇·퀵메뉴 함께 닫힘 — 모두 정상
- 콘솔 오류 없음, 깨진 이미지 0건
### 히어로 → 이벤트 한 번에 이동 (2026-08-09)

`index.html` 사본을 `file://` 로 열어 확인한 뒤 삭제했습니다. Lenis 는 CDN 에서 정상 로드됐습니다.

- 1280×800 에서 히어로 높이 = 뷰포트 800, 이벤트 섹션 상단 = 800
- 아래로 휠 1회 → `lenis.scrollTo(#events_section, { lock: true })` 호출, `scrollY` 800 도달
- 개입하지 않는 경우 확인 — 위로 휠 0회 / `ctrl + 휠` 0회 / `body` 잠금 중 0회 /
  이벤트 상단에서 추가 휠 0회(그대로 아래로 스크롤)
- 휠을 연속 3회 보내도 이동은 1회 (잠금 동작 확인)
- 히어로로 돌아온 뒤 다시 아래로 휠 → 다시 1회 이동
- 터치 — 5px 스와이프 0회, 60px 스와이프 1회
- **미검증**: 실제 트랙패드·마우스 휠 감각, 실기기 터치, 화면 캡처 비교

### 퀵 메뉴 챗봇 미검증 항목

- **미검증**: 실제 페이지(`index.html`)에서의 확인, 섹션 패널 ↔ 챗봇 패널 상호 배타 동작
  (임시 페이지에는 섹션 목록이 없어 섹션 버튼이 생성되지 않습니다), 화면 캡처 비교,
  터치 기기 확인
