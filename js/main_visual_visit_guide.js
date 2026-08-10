/* ==========================================================================
   main_visual 씬 데이터 — 교통안내
   --------------------------------------------------------------------------
   Figma RVISITGUIDE01(1433:4432, 닫힘) / RVISITGUIDE02(1433:4399, 열림)
   엔진과 데이터 형식 설명은 js/main_visual.js 주석을 보세요.

   시안에는 오브젝트가 16개로 보이지만 그중 둘(15_arrow_yellow_blurred,
   07_location_pin)은 이미지 필이 없는 빈 사각형이라 화면에 아무것도 그리지
   않습니다. 두 프레임에서 위치도 똑같습니다. 그래서 여기서는 뺐습니다.

   전경 흐림은 에셋에 미리 구워져 있습니다. 그중 넷(arrow_white,
   route_ribbon_right, arrow_yellow, city_bus)은 원본 여백이 모자라
   번짐이 잘려서, 캔버스를 넓혀 구운 뒤 늘어난 만큼 아래 크기도 키웠습니다.
   그래서 이 넷의 크기는 Figma 노드 크기보다 조금 큽니다. 중심은 그대로입니다.
   ========================================================================== */

(function (global) {
  'use strict';

  const A = '../assets/main_visit_guide/pop/';

  (global.MainVisualScenes = global.MainVisualScenes || {}).visit_guide = {
    assetBase: A,
    titleLeft: 578,
    layers: [
      /* 여백 보정: Figma 214.583x191.456 -> 245.238x222.111 */
      { key: 'arrow_white',    src: 'arrow_white.webp',        closed: [801.42, 845.11, 245.238, 222.111],  open: [185.67, 626.97, 245.238, 222.111],   rot: -153.96, flipY: true, delay: 0.46 },
      { type: 'envelope', part: 'back' },
      /* 숲은 원본을 세로로 잘라 쓰고, 시안에서 절반 투명입니다. */
      { key: 'forest_mountain', src: 'forest_mountain.webp',   closed: [960.5, 1132.5, 769, 769],           open: [959.5, 938.5, 769, 769],             rot: 0,       delay: 0.05, opacity: 0.5, fill: [0.07, 7.9, 100, 89.51] },
      { key: 'ribbon_left',    src: 'route_ribbon_left.webp',  closed: [1013.68, 1309.41, 696, 858],        open: [514.68, 696.41, 696, 858],           rot: -14.74,  delay: 0.3 },
      /* 여백 보정: Figma 544.42x671.452 -> 565.384x692.416 */
      { key: 'ribbon_right',   src: 'route_ribbon_right.webp', closed: [1093.35, 1334.72, 565.384, 692.416], open: [1455.35, 725.72, 565.384, 692.416], rot: 165.33,  flipY: true, delay: 0.42 },
      { key: 'cloud_large',    src: 'cloud_large.webp',        closed: [880.41, 1080.41, 417.698, 417.698], open: [398.95, 158.95, 417.698, 417.698],   rot: -14.47,  delay: 0.38 },
      { key: 'namsan_tower',   src: 'namsan_tower.webp',       closed: [1066.76, 1427.94, 375.896, 1001.973], open: [1319.62, 574.69, 375.896, 1001.973], rot: 9.96,  delay: 0 },
      { type: 'title' },
      { key: 'signpost',       src: 'direction_signpost.webp', closed: [1183.52, 1299.26, 258.572, 570.296], open: [1446.52, 773.26, 258.572, 570.296], rot: -12.4,   delay: 0.16 },
      { key: 'pine_right',     src: 'pine_right.webp',         closed: [1479.01, 1313.65, 333, 519],        open: [1646.01, 999.65, 333, 519],          rot: 15.56,   delay: 0.24 },
      /* 여백 보정: Figma 150.359 -> 187.949 */
      { key: 'arrow_yellow',   src: 'arrow_yellow.webp',       closed: [1092.92, 1118.92, 187.949, 187.949], open: [1696.92, 530.92, 187.949, 187.949], rot: -40.03,  delay: 0.5 },
      { key: 'ticket_card',    src: 'ticket_card.webp',        closed: [746.84, 1108.84, 377.26, 377.26],   open: [416.57, 502.57, 377.26, 377.26],     rot: -10.88,  delay: 0.2 },
      /* 케이블카 칸과 그 위의 케이블·기둥. 원본을 세로로 늘려 일부만 잘라 씁니다.
         시안에서도 한 그룹(Group 21)이고 실제로 매달려 있는 한 덩어리라,
         delay 와 둥실거림 값을 똑같이 맞춰 따로 놀지 않게 했습니다. */
      { key: 'cable_cabin',    src: 'cable_car_cabin.webp',    closed: [986.89, 1410.39, 403.555, 378.105], open: [986.89, 666.34, 403.555, 378.105],   rot: -7.47,   delay: 0.08, fill: [0, -40.79, 100, 140.88], floatDur: 4.66, floatY: -11.6 },
      { key: 'cable_line',     src: 'cable_car_line.webp',     closed: [968.5, 1142.03, 820.44, 181.781],   open: [968.5, 397.97, 820.44, 181.781],     rot: -5.18,   delay: 0.08, fill: [0, -66.04, 100, 453.77], floatDur: 4.66, floatY: -11.6 },
      { type: 'envelope', part: 'front' },
      /* 여기부터는 겉편지보다 앞입니다. 시안에서 버스와 소나무가 봉투를 덮습니다.
         버스는 닫힌 상태에서 아주 작게 시작합니다 (Figma 25x19).
         이 하나만 겉편지 앞이라 봉투에 가려지지 않고 그냥 나타나 보이므로,
         투명도 0 에서 시작해 나오면서 서서히 드러나게 했습니다.
         여백 보정: Figma 354x271 -> 368.75x285.75 (닫힘 크기도 같은 비율로) */
      { key: 'city_bus',       src: 'city_bus.webp',           closed: [781.5, 949.5, 26.042, 20.181],      open: [626, 757.5, 368.75, 285.75],         rot: 0,       delay: 0.28, opacityClosed: 0 },
      { key: 'pine_cluster',   src: 'pine_cluster.webp',       closed: [461.3, 1294.3, 460.731, 460.731],   open: [382.3, 968.3, 460.731, 460.731],     rot: -8.92,   delay: 0.34 },
    ],
  };
})(window);
