/* ==========================================================================
   main_visual pop interaction
   --------------------------------------------------------------------------
   Figma RESTAURANT01(1387:5670) / RESTAURANT02(1387:5635) 두 프레임의
   절대좌표를 그대로 데이터로 들고 있다가, 닫힌 상태 -> 열린 상태의 차이를
   transform(translate/rotate/scale) 하나로 환산해서 재생합니다.

   좌표 규칙
   - closed / open 은 [x, y, w, h] 형태의 Figma 바운딩 박스입니다.
   - Figma 의 w/h 는 "회전이 적용된 뒤의" 바깥 박스라서, 회전 전 실제 크기는
     size = bbox / (|cos t| + |sin t|) 로 되돌려야 합니다. (rot 이 0 이면 그대로)
   - 그래서 DOM 은 항상 "열린 상태(02)" 크기/위치로 깔아두고,
     닫힌 상태는 transform 으로만 표현합니다. 레이아웃 재계산이 없습니다.

   교통안내 / 브랜드스토리도 SCENE 배열만 갈아끼우면 그대로 재사용됩니다.
   ========================================================================== */

(function (global) {
  'use strict';

/* 에셋 경로. pages/ 아래 문서 기준입니다. */
const ASSET_BASE = '../assets/main_restaurant/pop/';

/* Figma 아트보드 기준 크기. 이 좌표계 위에서 전부 계산하고 마지막에 통째로 스케일합니다. */
const STAGE_W = 1920;
const STAGE_H = 1080;

/* 편지 봉투. 속편지는 오브젝트 뒤, 겉편지는 오브젝트 앞에 깔립니다.

   주의: 두 PNG 는 같은 2048x2048 캔버스에 렌더된 한 쌍이라 여백까지 포함돼 있습니다.
   Figma 의 겉편지 사각형(231,733,1457x844)은 이 이미지를 잘라 쓰는 프레임이고,
   실제 이미지 필 변환값은 width:100% / height:172.63% / top:-72.63% 였습니다.
   즉 이미지 자체는 아래 정사각 박스에 놓입니다. 속편지도 같은 캔버스라 동일 박스를 씁니다. */
const ENVELOPE_BOX = [231, 119.9, 1457, 1457];
const ENVELOPE = {
  inner: { src: ASSET_BASE + 'envelope_inner.png', box: ENVELOPE_BOX },
  outer: { src: ASSET_BASE + 'envelope_outer.png', box: ENVELOPE_BOX },
};

/* 배열 순서가 곧 z-order(뒤 -> 앞) 입니다. Figma 레이어 순서와 동일합니다.

   closed / open 은 [중심x, 중심y, 폭, 높이] 이고, 회전이 걸리기 전의 실제 크기입니다.
   Figma Dev Mode 가 내보낸 값을 그대로 옮겼습니다. 메타데이터의 x/y 를 쓰면 안 되는데,
   그건 바운딩 박스 좌상단이 아니라 "회전된 뒤의 원래 좌상단 꼭짓점" 위치라서
   회전이 걸린 오브젝트마다 위치가 어긋납니다.

   rot 은 열린 상태의 회전각, rotClosed 는 닫힌 상태의 회전각(다를 때만 적습니다).
   flipY 는 Figma 의 상하 반전, blur / opacity 는 전경 심도 표현입니다.
   front: true 는 겉편지보다 앞에 놓이는 오브젝트입니다.
   delay 는 팡 터질 때의 순서(초). 되돌아갈 때는 이 순서가 자동으로 뒤집힙니다. */
const SCENE = [
  { key: 'cloud_large',  src: ASSET_BASE + 'cloud_large.png',  closed: [1108, 830, 182, 182],              open: [1108, 375, 182, 182],                 rot: 0,                     delay: 0.24 },
  { key: 'gold_cloche',  src: ASSET_BASE + 'gold_cloche.png',  closed: [1428.45, 900.86, 135, 135],        open: [1641.45, 183.45, 135, 135],           rot: 13.57,                 delay: 0.16 },
  { key: 'branch_r2',    src: ASSET_BASE + 'branch_right.png', closed: [518.83, 1156.83, 218.003, 218.003], open: [518.83, 664.83, 218.003, 218.003],   rot: -54.95,                delay: 0.32 },
  { key: 'tower',        src: ASSET_BASE + 'tower.png',        closed: [1022.5, 1325.5, 483, 635],         open: [1044.5, 466.5, 673, 885],             rot: 0,                     delay: 0 },
  { key: 'branch_r1',    src: ASSET_BASE + 'branch_right.png', closed: [1346.84, 1235.84, 369, 369],       open: [1346.84, 780.84, 369, 369],           rot: -166.76, flipY: true,  delay: 0.35 },
  { key: 'chair_left',   src: ASSET_BASE + 'chair_left.png',   closed: [708.16, 1198.87, 411.867, 411.867], open: [708.16, 743.87, 411.867, 411.867],   rot: -7.54,                 delay: 0.12 },
  { key: 'chair_right',  src: ASSET_BASE + 'chair_right.png',  closed: [1209.28, 1195.29, 336, 337],       open: [1209.28, 740.29, 336, 337],           rot: 0,                     delay: 0.19 },
  { key: 'table',        src: ASSET_BASE + 'table.png',        closed: [981.94, 1373.22, 495.973, 495.973], open: [981.94, 780.81, 495.973, 495.973],   rot: 13.43,                 delay: 0.08 },
  { key: 'aengomi',      src: ASSET_BASE + 'aengomi.png',      closed: [1326.35, 1029.76, 371.41, 371.41], open: [1329.68, 433.68, 371.41, 371.41],     rot: 15.1, rotClosed: -2.52, delay: 0.28 },
  { key: 'sphere',       src: ASSET_BASE + 'sphere.png',       closed: [1431.5, 1006.91, 213, 213],        open: [1844.5, 263.5, 213, 213],             rot: 0,                     delay: 0.45, blur: 5 },
  { key: 'fork_right',   src: ASSET_BASE + 'fork_right.png',   closed: [733.88, 1133.29, 366.283, 366.283], open: [251.31, 450.31, 366.283, 366.283],   rot: -15.7,                 delay: 0.38, blur: 6 },
  { key: 'fork_left',    src: ASSET_BASE + 'fork_left.png',    closed: [1390.06, 999.47, 163, 163],        open: [1559.5, 468.5, 163, 163],             rot: 11.45,                 delay: 0.42, opacity: 0.7 },
  { key: 'wine',         src: ASSET_BASE + 'wine.png',         closed: [570.5, 1097.91, 290.452, 290.452], open: [157.88, 1051.88, 641.982, 641.982],   rot: 13.7, rotClosed: -16.51, delay: 0.48, blur: 13.5, front: true },
  { key: 'cloud_small',  src: ASSET_BASE + 'cloud_small.png',  closed: [841.5, 1094.91, 355, 355],         open: [789.5, 373.5, 355, 355],              rot: 0,                     delay: 0.34 },
  { key: 'steak',        src: ASSET_BASE + 'steak.png',        closed: [714.36, 1195.77, 294.665, 294.665], open: [597.36, 466.36, 294.665, 294.665],   rot: -12.83,                delay: 0.22 },
  { key: 'lamp',         src: ASSET_BASE + 'lamp.png',         closed: [571.07, 1051.48, 204.252, 204.252], open: [607.48, 100.48, 204.252, 204.252],   rot: -7.17,                 delay: 0.1 },
  { key: 'branch_left',  src: ASSET_BASE + 'branch_left.png',  closed: [1136.35, 1183.76, 315.637, 315.637], open: [1833.18, 766.18, 503.453, 503.453], rot: 168.41, rotClosed: -112.6, flipY: true, delay: 0.5, blur: 10.5, opacity: 0.9, front: true },
  { key: 'leaf_1',       src: ASSET_BASE + 'leaf.png',         closed: [1166.78, 1151.19, 212.014, 212.014], open: [1746.65, 991.65, 212.014, 212.014], rot: -42.54,                delay: 0.56, blur: 9.5, front: true },
  { key: 'leaf_2',       src: ASSET_BASE + 'leaf.png',         closed: [824.72, 1195.13, 142.69, 142.69],  open: [383.72, 691.72, 142.69, 142.69],      rot: -53.75,                delay: 0.4 },
];

/* 첫 진입 후 01 을 보여주는 시간. 이후 재진입부터는 REPLAY_HOLD 만 기다립니다. */
const FIRST_HOLD = 2000;
const REPLAY_HOLD = 300;

function initMainVisual(root) {
  const stage = root.querySelector('[data-mv-stage]');
  if (!stage) return;

  const layer = document.createElement('div');
  layer.className = 'mv_layer';

  const envInner = makeEnvelope(ENVELOPE.inner, 'mv_envelope_inner');
  const envOuter = makeEnvelope(ENVELOPE.outer, 'mv_envelope_outer');

  /* 뒤 -> 앞. 겉편지(z 100) 보다 앞에 서야 하는 오브젝트는 z 를 200 대로 올립니다. */
  const maxDelay = Math.max(...SCENE.map((s) => s.delay));
  const nodes = SCENE.map((item, i) => buildObject(item, i));

  layer.append(envInner, ...nodes, envOuter);
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

  /* 모션을 줄여달라는 사용자에게는 02 를 바로 보여주고 끝냅니다. */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
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

  function makeEnvelope({ src, box: [x, y, w, h] }, className) {
    const img = new Image();
    img.className = `mv_envelope ${className}`;
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    Object.assign(img.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    return img;
  }

  function buildObject(item, index) {
    const rotOpen = item.rot ?? 0;
    const rotClosed = item.rotClosed ?? rotOpen;
    const [ocx, ocy, ow, oh] = item.open;
    const [ccx, ccy, cw] = item.closed;

    const el = document.createElement('div');
    el.className = 'mv_object';
    el.dataset.mvKey = item.key;
    if (item.front) el.classList.add('is_front');

    /* DOM 은 항상 열린 상태 기준. 닫힌 상태는 아래 delta 로만 표현합니다. */
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
    el.style.setProperty('--mv_blur', `${item.blur ?? 0}px`);
    el.style.setProperty('--mv_opacity', `${item.opacity ?? 1}`);
    /* z-order 는 Figma 레이어 순서 그대로입니다. 다만 타이틀(3)과 속편지(4)가
       구름/클로슈 뒤에 끼어 있어서, 그 다음 오브젝트부터 2 를 건너뜁니다.
       1 cloud_large / 2 gold_cloche / 3 타이틀 / 4 속편지 / 5~21 나머지 / 22 겉편지 */
    el.style.setProperty('--mv_z', `${index < 2 ? index + 1 : index + 3}`);

    /* 착지 후 둥실거림. 오브젝트마다 주기와 폭을 조금씩 흩어 놓아야
       한 덩어리로 같이 출렁이지 않고 자연스럽게 보입니다.
       큰 오브젝트는 느리고 얕게, 작은 오브젝트는 빠르고 깊게 움직입니다. */
    const floatScale = Math.min(1, 320 / ow);
    el.style.setProperty('--mv_float_dur', `${(3.4 + (index % 5) * 0.42).toFixed(2)}s`);
    el.style.setProperty('--mv_float_y', `${(-6 - floatScale * 7).toFixed(1)}px`);

    /* 나갈 때 순서 / 들어올 때는 그 역순 */
    el.style.setProperty('--mv_delay_out', `${item.delay}s`);
    el.style.setProperty('--mv_delay_in', `${(maxDelay - item.delay).toFixed(3)}s`);

    const inner = document.createElement('div');
    inner.className = 'mv_object_inner';
    /* Figma 의 상하 반전. 회전과 섞이면 안 되니 이미지에만 겁니다. */
    if (item.flipY) inner.classList.add('is_flip_y');

    const img = new Image();
    img.src = item.src;
    img.alt = '';
    img.decoding = 'async';

    inner.append(img);
    el.append(inner);
    return el;
  }
}

  global.initMainVisual = initMainVisual;

  /* [data-mv-root] 가 있는 페이지에서 자동으로 실행됩니다.
     인터랙션은 데스크톱 전용이라, 1280 미만에서는 DOM 자체를 만들지 않습니다.
     (태블릿/모바일은 기존 히어로 이미지가 그대로 보입니다.) */
  function boot() {
    if (!window.matchMedia('(min-width: 1280px)').matches) return;
    document.querySelectorAll('[data-mv-root]').forEach(initMainVisual);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
