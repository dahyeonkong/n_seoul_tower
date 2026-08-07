# Scroll Stack 3D

스크롤에 맞춰 3D 오브젝트가 한 단씩 쌓이는 **중간 섹션 모듈**. GSAP ScrollTrigger로 핀 고정 + 스크럽.
페이지 전체를 차지하지 않고, 다른 프로젝트의 섹션 하나로 끼워 넣도록 만들었다.

```
scroll3d/
├─ scroll-stack-3d.js    # 모듈 (모델 생성 + ScrollTrigger 타임라인 + 렌더 루프)
├─ scroll-stack-3d.css   # .s3d 스코프 스타일
├─ demo.html             # 앞/중간/뒤 3개 섹션으로 구성된 사용 예시
└─ README.md
```

로컬 확인: 정적 서버에서 `demo.html`을 연다 (`npx serve` 등). `file://`로 열어도 동작하지만
CDN 스크립트 3개는 네트워크가 필요하다.

## 넣는 법 (3단계)

**1. 의존성** — 이미 three/gsap을 쓰는 프로젝트라면 중복 로드하지 말 것.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

**2. 마크업** — 중간 섹션이 들어갈 자리에 빈 섹션 하나. 내부 DOM은 모듈이 만든다.

```html
<link rel="stylesheet" href="/scroll3d/scroll-stack-3d.css">
<section id="stack" class="s3d"></section>
<script src="/scroll3d/scroll-stack-3d.js"></script>
```

**3. 호출**

```js
const stack = ScrollStack3D.init({ mount: '#stack' });
// 섹션을 없앨 때 (SPA 라우팅 등): stack.destroy();
```

## 옵션

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `mount` | `'.s3d'` | 셀렉터 또는 엘리먼트 |
| `scrollLength` | `'620%'` | 핀 고정 상태로 소비할 스크롤 길이. 줄이면 조립이 빨라진다 |
| `scrub` | `0.8` | 스크롤 추종 지연(초). `true`면 즉시 추종, 값이 클수록 부드럽고 늦다 |
| `pin` | `true` | `false`면 핀 없이 섹션이 지나가는 동안만 진행 |
| `scroller` | `null` | 커스텀 스크롤 컨테이너 |
| `drift` | `0.6` | 오브젝트가 좌우로 흐르는 폭. `0`이면 중앙 고정 |
| `dpr` | `2` | 픽셀 비율 상한 |
| `ui` | `true` | 단계 목록·진행 레일 오버레이 |
| `eyebrow` | `'ASSEMBLY'` | 오버레이 상단 라벨 |
| `markers` | `false` | ScrollTrigger 디버그 마커 |

반환 객체: `{ destroy(), refresh(), progress, scene, group, timeline }`

## 스타일 맞추기

CSS 변수만 덮어쓰면 된다.

```css
#stack {
  --s3d-ink: #1b1b1b;
  --s3d-muted: #8a8a8a;
  --s3d-accent: #c05621;
  --s3d-bg: #fffdf8;   /* 기본 transparent — 호스트 배경이 그대로 비친다 */
}
```

## 모델 바꾸기

`scroll-stack-3d.js`의 `PARTS` 배열이 조립 순서 그 자체다. 항목 하나가 스크롤 한 단계다.

```js
{ name: 'base', label: '받침', height: 0.5, build: () => THREE.Group }
```

- `build()`는 **자기 원점 바닥 기준**의 그룹을 돌려준다. 위치 계산은 모듈이 `height` 누적으로 처리한다.
- `height`는 다음 파트가 얹히는 높이다. 실제 지오메트리 높이와 맞춰야 틈이 안 생긴다.
- 파트를 추가/삭제하면 타임라인 슬롯이 자동으로 재분배된다. 상수 수정 불필요.

[img2threejs](https://github.com/img2threejs/img2threejs)로 참조 이미지에서 모델을 생성해 갈아끼울 경우,
**파트를 병합하지 말고 named child로 분리해서 내보내라**고 지정해야 한다. 메시가 하나로 합쳐지면
단계별 조립이 불가능하다. 출력이 TypeScript이므로 타입만 걷어내고 `build()` 안에 붙이면 된다.

## 알아둘 것

- **핀이 안 먹을 때**: 조상 엘리먼트에 `overflow: hidden`이나 `transform`이 걸려 있으면
  `position: fixed` 기반 핀이 깨진다. ScrollTrigger의 알려진 제약이며, 해당 조상에서 그 속성을 빼야 한다.
- **Lenis 등 스무스 스크롤과 함께 쓸 때**: 호스트에서 아래를 연결한다.
  ```js
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- **레이아웃이 나중에 바뀌는 경우**(폰트 로드, 이미지 지연 등): `stack.refresh()`를 호출한다.
- **접근성**: `prefers-reduced-motion: reduce`면 조립 애니메이션 없이 완성 상태만 렌더한다.
- **성능**: 섹션이 뷰포트 밖이면 렌더 루프가 즉시 반환한다. DPR은 2로 상한을 둔다.
- **React/Next**: `useEffect`에서 `init()`하고 클린업에서 `destroy()`. 의존성 배열은 비워 둘 것
  (StrictMode의 이중 마운트에서도 `destroy()`가 캔버스와 ScrollTrigger를 정리한다).
