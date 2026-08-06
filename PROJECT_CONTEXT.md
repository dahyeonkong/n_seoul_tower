# PROJECT_CONTEXT

마지막 갱신: 2026-08-06

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

## 파일 구조

```text
n_seoul_tower/
├── index.html
├── default.html                 # 메타/파비콘/OG 만 있는 빈 템플릿 (헤더·푸터 없음)
├── pages/                       # 서브 페이지 (공통 리소스는 ../ 로 참조)
│   ├── restaurant_n_burger.html
│   └── n_gift_shop.html
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
