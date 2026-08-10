/* ==========================================================================
   main_visual pop interaction — 공용 엔진
   --------------------------------------------------------------------------
   편지 봉투에서 오브젝트가 팡 터져 나왔다가, 스크롤로 화면을 벗어나면 역순으로
   되돌아가는 인터랙션입니다. 레스토랑 / 브랜드스토리 / 교통안내가 같이 씁니다.

   이 파일에는 좌표가 없습니다. 페이지별 좌표는 js/main_visual_<페이지>.js 가
   window.MainVisualScenes 에 등록하고, 마크업에서 data-mv-scene 으로 고릅니다.

   ---------------------------------------------------------------------------
   씬 데이터 형식
   ---------------------------------------------------------------------------
   {
     assetBase: '../assets/main_brand_story/pop/',
     titleLeft: 697,          // .mv_title 을 화면 중앙에서 왼쪽으로 몇 px
     layers: [ ... ]          // 뒤 -> 앞. 배열 순서가 그대로 z-index 가 됩니다.
   }

   layers 항목은 셋 중 하나입니다.
     { type: 'envelope', part: 'back' | 'front' }   봉투 (세 페이지 공용, 아래 ENVELOPE)
     { type: 'title' }                              마크업의 .mv_title 이 놓일 자리
     { key, src, open, closed, ... }                날아다니는 오브젝트

   오브젝트 필드
     open / closed  [중심x, 중심y, 폭, 높이] — 회전이 걸리기 전의 실제 크기입니다.
                    Figma 메타데이터의 x/y 를 그대로 쓰면 안 됩니다. 그건 바깥 박스
                    좌상단이 아니라 "원래 좌상단 꼭짓점이 회전한 뒤의 위치"라서
                    회전이 걸린 오브젝트마다 어긋납니다. Dev Mode 가 주는
                    바깥 박스(left/top/size)의 중심을 쓰세요.
     rot            열린 상태 회전각(도)
     rotClosed      닫힌 상태 회전각 — 열린 상태와 다를 때만 적습니다
     flipY          Figma 의 상하 반전
     opacity        열린 상태의 투명도. 전경 심도 표현에 씁니다
     opacityClosed  닫힌 상태의 투명도. 기본 1 이고, 봉투에서 나오면서 서서히
                    나타나야 하는 오브젝트만 0 같은 낮은 값을 적습니다

     전경 흐림(Figma 의 layer blur)은 CSS filter 로 걸지 않고 에셋에 미리 구워둡니다.
     파일명이 *_blur.webp 인 것들이 그렇습니다. filter: blur() 는 매 프레임 재계산이라
     19개가 동시에 날아오를 때 프레임을 떨어뜨렸습니다. 시안도 01/02 양쪽 모두
     흐림이 걸려 있어서, 구워두는 쪽이 오히려 시안에 가깝습니다.
     굽는 반경 = Figma 의 blur 값 x (에셋 실제 폭 / 씬에서의 표시 폭) 입니다.
     fill           [left%, top%, width%, height%] — Figma 의 이미지 필이 단순
                    "꽉 채우기"가 아닐 때만 적습니다. 생략하면 object-fit: cover.
     delay          팡 터질 때의 순서(초). 되돌아갈 때는 자동으로 역순입니다.
     floatDur       착지 후 둥실거림 주기(초). 생략하면 자동으로 흩어집니다
     floatY         둥실거림 폭(px, 음수). 생략하면 크기에서 자동 계산합니다
                    두 값과 delay 를 같게 맞추면 여러 조각이 한 몸처럼 움직입니다
   ========================================================================== */

(function (global) {
  'use strict';

  /* Figma 아트보드 기준 크기. 이 좌표계 위에서 전부 계산하고 마지막에 통째로 스케일합니다. */
  const STAGE_W = 1920;
  const STAGE_H = 1080;

  /* --------------------------------------------------------------------------
     편지 봉투 — 세 페이지가 에셋도 좌표도 똑같이 씁니다.
     시안에서도 세 프레임 모두 속편지 (231,282,1457x1295) / 겉편지 (231,733,1457x844)
     로 동일하고, 가로도 중앙(중심 959.5 / 화면 중앙 960)에 맞춰져 있습니다.
     여기 한 벌만 두는 이유가 그것입니다. 페이지마다 따로 잡지 마세요.

     아래 box 는 Figma 노드가 아니라 그 안의 "이미지 필" 을 역산한 값입니다.
     두 PNG 는 같은 2048x2048 캔버스 한 쌍이지만 필 변환이 서로 다릅니다.
     - 겉편지 노드의 필 width:100% / height:172.63% / top:-72.63%
         -> [231, 120.01, 1457, 1457]        정사각 그대로, 균등 스케일
     - 속편지 노드의 필 width:100% / height:81.44% / left:0.06% / top:6.49%
         -> [231.87, 366.05, 1457, 1054.65]  세로로 눌린 비균등 스케일
     같은 캔버스라는 이유로 같은 박스를 쓰면 안 됩니다. 그렇게 두면 안감이 246px
     솟고 세로로 402px 커져서 녹색이 타이틀까지 올라옵니다.
     비균등이라 CSS 는 object-fit: fill 입니다. (.mv_envelope)
     -------------------------------------------------------------------------- */
  const ENVELOPE_BASE = '../assets/main_visual/';
  const ENVELOPE = {
    back: { src: ENVELOPE_BASE + 'envelope_back.webp', box: [231.87, 366.05, 1457, 1054.65] },
    front: { src: ENVELOPE_BASE + 'envelope_front.webp', box: [231, 120.01, 1457, 1457] },
  };

  /* 첫 진입 후 닫힌 상태를 보여주는 시간. 이후 재진입부터는 REPLAY_HOLD 만 기다립니다. */
  const FIRST_HOLD = 2000;
  const REPLAY_HOLD = 300;

  function initMainVisual(root) {
    const stage = root.querySelector('[data-mv-stage]');
    if (!stage) return;

    const scene = (global.MainVisualScenes || {})[root.dataset.mvScene];
    if (!scene) return;

    const layer = document.createElement('div');
    layer.className = 'mv_layer';

    /* 되돌아가는 순서는 나갔던 순서의 역순입니다. */
    const maxDelay = Math.max(
      ...scene.layers.filter((l) => !l.type).map((l) => l.delay || 0)
    );

    /* 배열 순서 = 레이어 순서 = z-index. 봉투와 타이틀도 같은 줄에 서 있기 때문에
       "타이틀은 3번" 같은 예외를 둘 필요가 없습니다.
       타이틀만 마크업에 있는 실제 텍스트라 여기서는 z 만 얹어줍니다. */
    const titleEl = stage.querySelector('.mv_title');

    scene.layers.forEach((item, i) => {
      const z = i + 1;

      if (item.type === 'envelope') {
        layer.append(makeEnvelope(ENVELOPE[item.part], item.part, z));
        return;
      }
      if (item.type === 'title') {
        if (titleEl) {
          titleEl.style.zIndex = z;
          if (scene.titleLeft != null) {
            titleEl.style.left = `calc(50% - ${scene.titleLeft}px)`;
          }
        }
        return;
      }
      layer.append(buildObject(item, z));
    });

    stage.append(layer);

    /* ---------- 스테이지 스케일: 뷰포트를 꽉 채우도록 cover ---------- */
    const fit = () => {
      const scale = Math.max(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
      stage.style.setProperty('--mv_scale', scale);
    };
    fit();
    window.addEventListener('resize', fit, { passive: true });

    /* ---------- 열기 / 닫기 ---------- */
    let holdTimer = null;
    let played = false;

    const open = () => {
      stage.classList.remove('is_closing');
      stage.classList.add('is_open');
      played = true;
    };

    /* 되돌아가는 모션. 나갔던 순서의 역순으로 봉투 안으로 빨려 들어갑니다. */
    const close = () => {
      clearTimeout(holdTimer);
      holdTimer = null;
      if (!stage.classList.contains('is_open')) return;
      stage.classList.add('is_closing');
      stage.classList.remove('is_open');
    };

    const scheduleOpen = () => {
      if (holdTimer || stage.classList.contains('is_open')) return;
      holdTimer = setTimeout(() => {
        holdTimer = null;
        open();
      }, played ? REPLAY_HOLD : FIRST_HOLD);
    };

    /* 모션을 줄여달라는 사용자에게는 열린 상태를 바로 보여주고 끝냅니다. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.classList.add('is_static', 'is_open');
      return { open, close };
    }

    /* ---------- 스크롤 재발화 ---------- */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.55) scheduleOpen();
          else if (entry.intersectionRatio < 0.25) close();
        }
      },
      { threshold: [0, 0.25, 0.55, 1] }
    );
    io.observe(root);

    return { open, close };

    /* ---------- 빌더 ---------- */

    function makeEnvelope({ src, box: [x, y, w, h] }, part, z) {
      const img = new Image();
      img.className = `mv_envelope mv_envelope_${part}`;
      img.src = src;
      img.alt = '';
      img.decoding = 'async';
      Object.assign(img.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: z,
      });
      return img;
    }

    function buildObject(item, z) {
      const rotOpen = item.rot ?? 0;
      const rotClosed = item.rotClosed ?? rotOpen;
      const [ocx, ocy, ow, oh] = item.open;
      const [ccx, ccy, cw] = item.closed;

      const el = document.createElement('div');
      el.className = 'mv_object';
      el.dataset.mvKey = item.key;

      /* DOM 은 항상 열린 상태 기준. 닫힌 상태는 아래 delta 로만 표현합니다.
         재생 중에는 transform / filter / opacity 만 바뀌어 레이아웃 재계산이 없습니다. */
      el.style.left = `${ocx - ow / 2}px`;
      el.style.top = `${ocy - oh / 2}px`;
      el.style.width = `${ow}px`;
      el.style.height = `${oh}px`;

      /* 가로 이동은 바깥 요소, 세로 이동은 안쪽 요소가 각각 맡습니다.
         두 축에 서로 다른 이징을 걸면 합성 궤적이 직선이 아니라 포물선이 됩니다. */
      el.style.setProperty('--mv_dx', `${(ccx - ocx).toFixed(2)}px`);
      el.style.setProperty('--mv_dy', `${(ccy - ocy).toFixed(2)}px`);
      el.style.setProperty('--mv_sc', (cw / ow).toFixed(5));
      el.style.setProperty('--mv_rot_open', `${rotOpen}deg`);
      el.style.setProperty('--mv_rot_closed', `${rotClosed}deg`);
      el.style.setProperty('--mv_opacity', `${item.opacity ?? 1}`);
      el.style.setProperty('--mv_opacity_closed', `${item.opacityClosed ?? 1}`);
      el.style.setProperty('--mv_z', `${z}`);

      /* 착지 후 둥실거림. 오브젝트마다 주기와 폭을 조금씩 흩어 놓아야
         한 덩어리로 같이 출렁이지 않고 자연스럽게 보입니다.
         큰 오브젝트는 느리고 얕게, 작은 오브젝트는 빠르고 깊게 움직입니다.

         다만 원래 한 덩어리인 것들(케이블카 칸과 그 위 케이블·기둥)은 따로 흔들리면
         분리돼 보입니다. 그런 오브젝트는 씬에서 floatDur / floatY 를 같은 값으로
         지정하고 delay 도 맞춰서 한 몸처럼 움직이게 합니다. */
      const floatScale = Math.min(1, 320 / ow);
      el.style.setProperty('--mv_float_dur', `${(item.floatDur ?? 3.4 + (z % 5) * 0.42).toFixed(2)}s`);
      el.style.setProperty('--mv_float_y', `${(item.floatY ?? -6 - floatScale * 7).toFixed(1)}px`);

      /* 나갈 때 순서 / 들어올 때는 그 역순 */
      const delay = item.delay || 0;
      el.style.setProperty('--mv_delay_out', `${delay}s`);
      el.style.setProperty('--mv_delay_in', `${(maxDelay - delay).toFixed(3)}s`);

      const inner = document.createElement('div');
      inner.className = 'mv_object_inner';
      /* Figma 의 상하 반전. 회전과 섞이면 안 되니 이미지에만 겁니다. */
      if (item.flipY) inner.classList.add('is_flip_y');

      const img = new Image();
      img.src = (scene.assetBase || '') + item.src;
      img.alt = '';
      img.decoding = 'async';

      /* Figma 의 이미지 필. 대부분은 박스를 꽉 채우는 cover 라 생략하지만,
         일부 노드는 원본을 확대해서 일부만 잘라 씁니다(인물, 벤치, 타워 클러스터).
         그런 노드는 fill 로 사각형을 직접 지정하고 바깥은 inner 가 잘라냅니다. */
      if (item.fill) {
        const [fl, ft, fw, fh] = item.fill;
        img.classList.add('is_cropped');
        Object.assign(img.style, {
          left: `${fl}%`,
          top: `${ft}%`,
          width: `${fw}%`,
          height: `${fh}%`,
        });
      }

      inner.append(img);
      el.append(inner);
      return el;
    }
  }

  global.initMainVisual = initMainVisual;

  /* [data-mv-root] 가 있는 페이지에서 자동으로 실행됩니다.
     인터랙션은 데스크톱 전용이라, 1280 미만에서는 무거운 DOM 을 만들지 않습니다.
     (태블릿/모바일은 기존 히어로 이미지가 그대로 보입니다.)

     판정은 로드 때 한 번으로 끝내면 안 됩니다. 1280 미만에서 열었다가 창을 넓히면
     CSS 는 대체 이미지를 숨기는데 오브젝트는 없는 상태라 히어로가 통째로 비어버립니다.
     그래서 미디어쿼리 변화를 듣고 처음 데스크톱이 되는 시점에 한 번 만들어 둡니다.
     (다시 좁아져도 CSS 가 스테이지를 숨기고 대체 이미지를 되살리므로 그대로 둡니다.) */
  const desktop = window.matchMedia('(min-width: 1280px)');

  function boot() {
    if (!desktop.matches) return;
    document.querySelectorAll('[data-mv-root]:not([data-mv-ready])').forEach((root) => {
      root.dataset.mvReady = '';
      initMainVisual(root);
    });
  }

  desktop.addEventListener('change', boot);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
