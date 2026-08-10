/* ==========================================================================
   main_visual 씬 데이터 — 레스토랑
   --------------------------------------------------------------------------
   Figma RESTAURANT01(1387:5670, 닫힘) / RESTAURANT02(1387:5635, 열림)
   엔진과 데이터 형식 설명은 js/main_visual.js 주석을 보세요.

   layers 배열 순서는 Figma 레이어 트리 순서 그대로입니다.
   봉투와 타이틀도 항목으로 들어가 있어서, 순서만 맞춰두면 z 는 알아서 정해집니다.
   ========================================================================== */

(function (global) {
  'use strict';

  const A = '../assets/main_restaurant/pop/';

  (global.MainVisualScenes = global.MainVisualScenes || {}).restaurant = {
    assetBase: A,
    titleLeft: 646,
    layers: [
      { key: 'cloud_large',  src: 'cloud_large.webp',  closed: [1108, 830, 182, 182],               open: [1108, 375, 182, 182],                 rot: 0,                            delay: 0.24 },
      { key: 'gold_cloche',  src: 'gold_cloche.webp',  closed: [1428.45, 900.86, 135, 135],         open: [1641.45, 183.45, 135, 135],           rot: 13.57,                        delay: 0.16 },
      { type: 'title' },
      { type: 'envelope', part: 'back' },
      { key: 'branch_r2',    src: 'branch_right.webp', closed: [518.83, 1156.83, 218.003, 218.003], open: [518.83, 664.83, 218.003, 218.003],    rot: -54.95,                       delay: 0.32 },
      { key: 'tower',        src: 'tower.webp',        closed: [1022.5, 1325.5, 483, 635],          open: [1044.5, 466.5, 673, 885],             rot: 0,                            delay: 0 },
      { key: 'branch_r1',    src: 'branch_right.webp', closed: [1346.84, 1235.84, 369, 369],        open: [1346.84, 780.84, 369, 369],           rot: -166.76, flipY: true,         delay: 0.35 },
      { key: 'chair_left',   src: 'chair_left.webp',   closed: [708.16, 1198.87, 411.867, 411.867], open: [708.16, 743.87, 411.867, 411.867],    rot: -7.54,                        delay: 0.12 },
      { key: 'chair_right',  src: 'chair_right.webp',  closed: [1209.28, 1195.29, 336, 337],        open: [1209.28, 740.29, 336, 337],           rot: 0,                            delay: 0.19 },
      { key: 'table',        src: 'table.webp',        closed: [981.94, 1373.22, 495.973, 495.973], open: [981.94, 780.81, 495.973, 495.973],    rot: 13.43,                        delay: 0.08 },
      { key: 'aengomi',      src: 'aengomi.webp',      closed: [1326.35, 1029.76, 371.41, 371.41],  open: [1329.68, 433.68, 371.41, 371.41],     rot: 15.1, rotClosed: -2.52,       delay: 0.28 },
      { key: 'sphere',       src: 'sphere_blur.webp',       closed: [1431.5, 1006.91, 213, 213],         open: [1844.5, 263.5, 213, 213],             rot: 0,                            delay: 0.45 },
      { key: 'fork_right',   src: 'fork_right_blur.webp',   closed: [733.88, 1133.29, 366.283, 366.283], open: [251.31, 450.31, 366.283, 366.283],    rot: -15.7,                        delay: 0.38 },
      { key: 'fork_left',    src: 'fork_left.webp',    closed: [1390.06, 999.47, 163, 163],         open: [1559.5, 468.5, 163, 163],             rot: 11.45,                        delay: 0.42, opacity: 0.7 },
      { key: 'wine',         src: 'wine_blur.webp',         closed: [570.5, 1097.91, 290.452, 290.452],  open: [157.88, 1051.88, 641.982, 641.982],   rot: 13.7, rotClosed: -16.51,      delay: 0.48 },
      { key: 'cloud_small',  src: 'cloud_small.webp',  closed: [841.5, 1094.91, 355, 355],          open: [789.5, 373.5, 355, 355],              rot: 0,                            delay: 0.34 },
      { key: 'steak',        src: 'steak.webp',        closed: [714.36, 1195.77, 294.665, 294.665], open: [597.36, 466.36, 294.665, 294.665],    rot: -12.83,                       delay: 0.22 },
      { key: 'lamp',         src: 'lamp.webp',         closed: [571.07, 1051.48, 204.252, 204.252], open: [607.48, 100.48, 204.252, 204.252],    rot: -7.17,                        delay: 0.1 },
      { key: 'branch_left',  src: 'branch_left_blur.webp',  closed: [1136.35, 1183.76, 315.637, 315.637], open: [1833.18, 766.18, 503.453, 503.453],  rot: 168.41, rotClosed: -112.6, flipY: true, delay: 0.5, opacity: 0.9 },
      { key: 'leaf_1',       src: 'leaf_blur.webp',         closed: [1166.78, 1151.19, 212.014, 212.014], open: [1746.65, 991.65, 212.014, 212.014],  rot: -42.54,                       delay: 0.56 },
      { key: 'leaf_2',       src: 'leaf.webp',         closed: [824.72, 1195.13, 142.69, 142.69],   open: [383.72, 691.72, 142.69, 142.69],      rot: -53.75,                       delay: 0.4 },
      { type: 'envelope', part: 'front' },
    ],
  };
})(window);
