/* ==========================================================================
   main_visual 씬 데이터 — 브랜드스토리
   --------------------------------------------------------------------------
   Figma BRANDSTORY01(1467:4534, 닫힘) / BRANDSTORY02(1433:4489, 열림)
   엔진과 데이터 형식 설명은 js/main_visual.js 주석을 보세요.

   레스토랑과 다른 점 두 가지가 이 파일에 그대로 드러납니다.
   1. 속편지가 맨 뒤(1번)입니다. 레스토랑은 타이틀 뒤(4번)였습니다.
   2. 토피어리 나무 두 그루가 겉편지보다 앞에 섭니다. 그래서 배열에서도
      { type:'envelope', part:'front' } 뒤에 놓여 있습니다.
   레이어 순서를 배열 순서로 표현하기 때문에 예외 처리가 따로 없습니다.

   좌표는 01/02 두 프레임에서 회전·크기·블러·이미지 필이 전부 같고 위치만
   다릅니다. 그래서 rotClosed 가 하나도 없습니다.
   ========================================================================== */

(function (global) {
  'use strict';

  const A = '../assets/main_brand_story/pop/';

  (global.MainVisualScenes = global.MainVisualScenes || {}).brand_story = {
    assetBase: A,
    titleLeft: 697,
    layers: [
      { type: 'envelope', part: 'back' },
      { key: 'star_cream',       src: 'star_cream_blur.webp',       closed: [1251.5, 1054.5, 389, 389],           open: [1604.5, 503.5, 389, 389],            rot: 0,      delay: 0.36 },
      { type: 'title' },
      /* 앤고미는 원본을 110.49% 로 키워 좌상단 기준으로 잘라 씁니다(중앙 crop 이 아님). */
      { key: 'aengomi_hugging',  src: 'aengomi_hugging.webp',  closed: [1022.84, 1079.84, 265.556, 265.556], open: [1022.84, 340.84, 265.556, 265.556],  rot: 5.96,   delay: 0.24, fill: [0, 0, 110.49, 110.49] },
      /* 타워 + 도시 클러스터. 가로로 긴 원본(1536x1024)을 세로 박스에 맞춰 잘라 씁니다. */
      { key: 'tower_city',       src: 'tower_city_cluster.webp', closed: [960.5, 1510, 901, 1160],           open: [960.5, 589, 901, 1160],              rot: 0,      delay: 0,    fill: [-44.4, 0, 193.21, 100] },
      { key: 'visitor_stand',    src: 'visitor_standing.webp',  closed: [783, 1110, 92, 292],                open: [783, 757, 92, 292],                  rot: 0,      delay: 0.1,  fill: [-109.27, -0.1, 318.54, 100.21] },
      { key: 'bench',            src: 'bench_curved.webp',      closed: [966, 1213.5, 406, 107],             open: [966, 860.5, 406, 107],               rot: 0,      delay: 0.06, fill: [0, -139.37, 100, 378.74] },
      { key: 'visitor_mustard',  src: 'visitor_seated_mustard.webp',    closed: [868, 1120, 104, 262],       open: [868, 767, 104, 262],                 rot: 0,      delay: 0.12, fill: [-75.92, -0.1, 251.83, 100.21] },
      { key: 'visitor_hat',      src: 'visitor_seated_yellow_hat.webp', closed: [1081, 1120.5, 124, 263],    open: [1081, 767.5, 124, 263],              rot: 0,      delay: 0.16, fill: [-55.95, 0, 211.89, 100] },
      { key: 'padlock',          src: 'padlock_heart.webp',     closed: [1317.38, 1039.33, 232.761, 245.791], open: [1379.38, 422.33, 232.761, 245.791], rot: 32.77,  delay: 0.3,  fill: [-26.54, -19.83, 153.08, 144.97] },
      { key: 'crane',            src: 'construction_crane.webp', closed: [675.55, 1086.55, 400.685, 400.685], open: [521.55, 425.55, 400.685, 400.685],  rot: -14.67, delay: 0.28 },
      { key: 'visitor_green',    src: 'visitor_seated_green.webp', closed: [970.5, 1114, 115, 262],          open: [970.5, 761, 115, 262],               rot: 0,      delay: 0.14, fill: [-63.98, -0.1, 227.96, 100.21] },
      { key: 'photo_vintage',    src: 'photo_vintage_blur.webp',     closed: [621.9, 1146.9, 481, 481],           open: [281.5, 548.5, 481, 481],             rot: -16.15, delay: 0.46 },
      { key: 'photo_sunset',     src: 'photo_sunset_blur.webp',      closed: [660.33, 1136.33, 481, 481],         open: [208.5, 734.5, 481, 481],             rot: -31.95, delay: 0.5 },
      { key: 'branch_right',     src: 'branch_right.webp',      closed: [768.09, 1049.09, 297.074, 297.074], open: [189.69, 845.69, 297.074, 297.074],   rot: -68.87, delay: 0.44 },
      { key: 'neon_ring',        src: 'neon_ring.webp',         closed: [1036.5, 1080.5, 213, 213],          open: [1764.5, 549.5, 213, 213],            rot: 0,      delay: 0.34 },
      { key: 'foliage_puff',     src: 'foliage_puff.webp',      closed: [887.5, 1036.5, 145, 145],           open: [664.5, 566.5, 145, 145],             rot: 0,      delay: 0.2 },
      { key: 'leaf_single',      src: 'leaf_single_blur.webp',       closed: [1179.2, 1022.2, 132.554, 132.554],  open: [1512.2, 646.2, 132.554, 132.554],    rot: 38.92,  delay: 0.4 },
      { type: 'envelope', part: 'front' },
      /* 여기부터는 겉편지보다 앞. 시안에서 나무가 봉투 오른쪽 아래를 덮고 있습니다. */
      { key: 'topiary_1',        src: 'topiary_tree.webp',      closed: [1475.38, 1240.38, 498.753, 498.753], open: [1568.38, 947.38, 498.753, 498.753], rot: 0,      delay: 0.18 },
      { key: 'topiary_2',        src: 'topiary_tree.webp',      closed: [1371.5, 1310.5, 313, 313],          open: [1464.5, 1017.5, 313, 313],           rot: 0,      delay: 0.22 },
    ],
  };
})(window);
