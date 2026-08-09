/*
 * scroll-stack-3d.js
 * 스크롤에 맞춰 3D 오브젝트가 한 단씩 쌓이는 "중간 섹션" 모듈.
 *
 * 전제(호스트 페이지가 먼저 로드해야 하는 전역):
 *   THREE (r128 이상), gsap, ScrollTrigger
 *
 * 사용:
 *   <section id="stack" class="s3d"></section>
 *   ScrollStack3D.init({ mount: '#stack' });
 *
 * 반환값의 destroy()를 부르면 ScrollTrigger·리스너·WebGL 컨텍스트까지 정리한다.
 * SPA 라우팅에서 섹션을 언마운트할 때 반드시 호출할 것.
 */
(function (global) {
  'use strict';

  var DEFAULTS = {
    mount: '.s3d',
    // 섹션이 핀으로 고정된 채 소비할 스크롤 길이. 단계 수 대비 넉넉해야 각 단이 또렷하다.
    scrollLength: '620%',
    scrub: 0.8,
    pin: true,
    // ScrollTrigger가 붙을 스크롤 컨테이너. 기본은 window.
    scroller: null,
    // 오브젝트가 좌우로 흐르는 폭(월드 단위). 0이면 정중앙 고정.
    drift: 0.6,
    dpr: 2,
    ui: true,
    eyebrow: 'ASSEMBLY',
    markers: false
  };

  // 화면에 보이길 원하는 실제 색(sRGB 16진수). 선형 변환은 srgb()가 처리한다.
  var PALETTE = {
    olive: 0x6e7a4e,
    cream: 0xe9e7da,
    sage: 0x93a473,
    sand: 0xdcc079,
    clay: 0xc98a63,
    wax: 0xf0e4c0,
    flame: 0xffb648
  };

  // r128에는 ColorManagement가 없어서 16진수가 선형값으로 그대로 들어간다.
  // outputEncoding이 sRGB이므로 여기서 미리 선형으로 바꿔야 지정한 색이 그대로 나온다.
  // 이 변환을 빼면 팔레트 전체가 파스텔로 떠버린다.
  function srgb(hex) {
    return new THREE.Color(hex).convertSRGBToLinear();
  }

  /* ---------------------------------------------------------------- 지오메트리 헬퍼 */

  // [[radius, y], ...] 프로파일을 회전시켜 도자기 같은 매끈한 형태를 만든다.
  // 프로파일은 중심 바닥에서 시작해 바깥·위로 진행하고, 마지막에 상단 구멍 벽으로 내려온다.
  function lathe(profile, color, segments) {
    var pts = profile.map(function (p) {
      return new THREE.Vector2(p[0], p[1]);
    });
    // LatheGeometry가 계산해 둔 법선을 그대로 쓴다.
    // computeVertexNormals()를 다시 부르면 회전 이음매에 세로 줄이 생긴다.
    var geo = new THREE.LatheGeometry(pts, segments || 64);
    return new THREE.Mesh(geo, ceramic(color));
  }

  function ceramic(color) {
    return new THREE.MeshStandardMaterial({
      color: srgb(color),
      roughness: 0.78,
      metalness: 0.0,
      transparent: true,
      opacity: 1
    });
  }

  // 밴드 옆면에 파인 홈. 이미지의 세로 슬롯 디테일.
  function slotRing(group, opts) {
    var count = opts.count;
    var geo = new THREE.BoxGeometry(opts.width, opts.height, opts.depth);
    var mat = ceramic(opts.color);
    for (var i = 0; i < count; i++) {
      var a = (i / count) * Math.PI * 2;
      var slot = new THREE.Mesh(geo, mat);
      slot.position.set(Math.cos(a) * opts.radius, opts.y, Math.sin(a) * opts.radius);
      slot.rotation.y = -a;
      group.add(slot);
    }
  }

  /* ---------------------------------------------------------------- 파트 정의 */
  // 각 파트는 { name, label, height, build() } — build()는 원점 바닥 기준의 Group을 돌려준다.
  // 순서가 곧 조립 순서이고, height 누적이 다음 파트가 얹히는 높이다.

  var PARTS = [
    {
      name: 'base',
      label: '받침',
      height: 0.5,
      build: function () {
        var g = new THREE.Group();
        g.add(lathe([
          [0, 0], [0.92, 0], [1.10, 0.04], [1.20, 0.16],
          [1.20, 0.34], [1.12, 0.46], [0.96, 0.50],
          [0.17, 0.50], [0.11, 0.46], [0.11, 0.28]
        ], PALETTE.olive));
        return g;
      }
    },
    {
      name: 'spool',
      label: '크림 스풀',
      height: 0.84,
      build: function () {
        var g = new THREE.Group();
        g.add(lathe([
          [0, 0], [0.74, 0], [0.76, 0.05], [0.70, 0.09],
          [0.60, 0.26], [0.58, 0.44], [0.66, 0.56],
          [0.78, 0.62], [0.78, 0.70], [0.70, 0.76],
          [0.62, 0.80], [0.62, 0.84], [0.16, 0.84], [0.11, 0.80], [0.11, 0.62]
        ], PALETTE.cream));
        return g;
      }
    },
    {
      name: 'bandSage',
      label: '세이지 밴드',
      height: 0.62,
      build: function () {
        var g = new THREE.Group();
        g.add(lathe([
          [0, 0], [0.86, 0], [0.90, 0.06], [0.90, 0.54],
          [0.86, 0.60], [0.72, 0.62], [0.15, 0.62], [0.10, 0.58], [0.10, 0.42]
        ], PALETTE.sage));
        slotRing(g, {
          count: 20, radius: 0.885, y: 0.31,
          width: 0.075, height: 0.30, depth: 0.05,
          color: 0x7f9061
        });
        return g;
      }
    },
    {
      name: 'bandSand',
      label: '샌드 밴드',
      height: 0.5,
      build: function () {
        var g = new THREE.Group();
        g.add(lathe([
          [0, 0], [0.62, 0], [0.66, 0.05], [0.66, 0.44],
          [0.62, 0.50], [0.14, 0.50], [0.10, 0.46], [0.10, 0.32]
        ], PALETTE.sand));
        slotRing(g, {
          count: 16, radius: 0.645, y: 0.25,
          width: 0.065, height: 0.24, depth: 0.045,
          color: 0xc9a95f
        });
        return g;
      }
    },
    {
      name: 'cone',
      label: '테라코타 콘',
      height: 0.98,
      build: function () {
        var g = new THREE.Group();
        g.add(lathe([
          [0, 0], [0.54, 0], [0.56, 0.05], [0.40, 0.48],
          [0.26, 0.84], [0.20, 0.98], [0.09, 0.98], [0.09, 0.74]
        ], PALETTE.clay));
        return g;
      }
    },
    {
      name: 'candle',
      label: '초',
      height: 0.62,
      build: function () {
        var g = new THREE.Group();
        g.add(lathe([
          [0, 0], [0.115, 0], [0.115, 0.58], [0.10, 0.62], [0, 0.62]
        ], PALETTE.wax, 24));
        var wick = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6),
          new THREE.MeshStandardMaterial({ color: srgb(0x4a4034), roughness: 1, transparent: true })
        );
        wick.position.y = 0.65;
        g.add(wick);
        return g;
      }
    },
    {
      name: 'flame',
      label: '불',
      height: 0.2,
      build: function () {
        var g = new THREE.Group();
        var body = new THREE.Mesh(
          new THREE.ConeGeometry(0.045, 0.16, 12),
          new THREE.MeshBasicMaterial({ color: srgb(PALETTE.flame), transparent: true })
        );
        body.position.y = 0.10;
        g.add(body);
        g.userData.flicker = body;
        return g;
      }
    }
  ];

  /* ---------------------------------------------------------------- 마크업 */

  function buildDom(mount, cfg) {
    mount.classList.add('s3d');

    var stage = document.createElement('div');
    stage.className = 's3d__stage';

    var canvas = document.createElement('canvas');
    canvas.className = 's3d__canvas';
    stage.appendChild(canvas);

    var ui = null;
    if (cfg.ui) {
      ui = document.createElement('div');
      ui.className = 's3d__ui';
      ui.innerHTML =
        '<p class="s3d__eyebrow">' + cfg.eyebrow + '</p>' +
        '<ol class="s3d__steps">' +
        PARTS.map(function (p, i) {
          return '<li class="s3d__step" data-i="' + i + '">' +
            '<span class="s3d__num">' + String(i + 1).padStart(2, '0') + '</span>' +
            '<span class="s3d__name">' + p.label + '</span></li>';
        }).join('') +
        '</ol>' +
        '<div class="s3d__rail"><span class="s3d__rail-fill"></span></div>';
      stage.appendChild(ui);
    }

    mount.appendChild(stage);
    return {
      stage: stage,
      canvas: canvas,
      steps: ui ? Array.prototype.slice.call(ui.querySelectorAll('.s3d__step')) : [],
      railFill: ui ? ui.querySelector('.s3d__rail-fill') : null
    };
  }

  /* ---------------------------------------------------------------- 본체 */

  function init(options) {
    var cfg = Object.assign({}, DEFAULTS, options || {});

    if (!global.THREE || !global.gsap || !global.ScrollTrigger) {
      console.error('[ScrollStack3D] THREE, gsap, ScrollTrigger를 먼저 로드해야 합니다.');
      return null;
    }
    gsap.registerPlugin(ScrollTrigger);

    var mount = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
    if (!mount) {
      console.error('[ScrollStack3D] mount 요소를 찾을 수 없습니다:', cfg.mount);
      return null;
    }

    var dom = buildDom(mount, cfg);
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- 렌더러 / 씬 --- */
    var renderer = new THREE.WebGLRenderer({
      canvas: dom.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, cfg.dpr));
    if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 2, 9.4);

    // 스튜디오 3점 조명. 정면광 합계가 1을 크게 넘으면 팔레트가 날아간다.
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd2d0c2, 0.5));
    var key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(4.5, 7, 5.5);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xfff3e2, 0.28);
    fill.position.set(-5, 2.5, -3.5);
    scene.add(fill);

    /* --- 모델 조립 --- */
    var group = new THREE.Group();
    scene.add(group);

    var built = [];
    var y = 0;
    PARTS.forEach(function (spec) {
      var part = spec.build();
      part.userData.restY = y;
      part.userData.u = 0;
      part.userData.mats = [];
      part.traverse(function (o) {
        if (o.material) {
          o.material.transparent = true;
          part.userData.mats.push(o.material);
        }
      });
      group.add(part);
      built.push(part);
      y += spec.height;
    });
    var totalHeight = y;
    group.position.y = -totalHeight * 0.5;

    function applyPart(part) {
      var u = part.userData.u;
      part.visible = u > 0.002;
      if (!part.visible) return;
      part.position.y = part.userData.restY + (1 - u) * 1.7;
      part.scale.setScalar(0.55 + 0.45 * u);
      part.rotation.y = (1 - u) * 0.8;
      for (var i = 0; i < part.userData.mats.length; i++) {
        part.userData.mats[i].opacity = u;
      }
    }

    /* --- 리사이즈 --- */
    function resize() {
      var w = dom.stage.clientWidth;
      var h = dom.stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // 좁은 화면에서는 뒤로 물러나 스택 전체가 프레임에 남게 한다.
      camera.fov = w < 720 ? 42 : 34;
      camera.updateProjectionMatrix();
    }

    /* --- 진행률 → 씬 --- */
    var progress = 0;

    function applyProgress(p) {
      progress = p;
      group.position.x = cfg.drift * Math.sin(p * Math.PI * 2);
      group.rotation.y = -0.45 + p * 0.9;
      // 스택이 자랄수록 카메라가 같이 올라가며 꼭대기를 따라간다.
      var top = totalHeight * p;
      camera.position.y = -totalHeight * 0.5 + 0.6 + top * 0.55;
      camera.lookAt(0, -totalHeight * 0.5 + top * 0.55, 0);
      if (dom.railFill) dom.railFill.style.transform = 'scaleY(' + p + ')';
      var idx = Math.min(PARTS.length - 1, Math.floor(p * PARTS.length + 0.0001));
      for (var i = 0; i < dom.steps.length; i++) {
        dom.steps[i].classList.toggle('is-on', i <= idx);
        dom.steps[i].classList.toggle('is-now', i === idx);
      }
    }

    /* --- 렌더 루프: 섹션이 화면에 있을 때만 돈다 --- */
    var active = false;
    var clock = new THREE.Clock();

    function render() {
      if (!active) return;
      var t = clock.getElapsedTime();
      var flameGroup = built[built.length - 1];
      var flick = flameGroup.userData.flicker;
      if (flick && flameGroup.visible) {
        flick.scale.set(1 + Math.sin(t * 17) * 0.07, 1 + Math.sin(t * 11) * 0.13, 1);
      }
      for (var i = 0; i < built.length; i++) applyPart(built[i]);
      renderer.render(scene, camera);
    }
    gsap.ticker.add(render);

    /* --- ScrollTrigger --- */
    var tl = null;
    var st = null;

    if (reduced) {
      // 모션 최소화 설정: 조립 애니메이션 없이 완성 상태만 보여준다.
      built.forEach(function (p) { p.userData.u = 1; });
      applyProgress(1);
      st = ScrollTrigger.create({
        trigger: mount,
        scroller: cfg.scroller || undefined,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: function (self) { active = self.isActive; if (active) render(); }
      });
    } else {
      tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: mount,
          scroller: cfg.scroller || undefined,
          start: 'top top',
          end: '+=' + cfg.scrollLength,
          pin: cfg.pin ? dom.stage : false,
          pinSpacing: true,
          // position: fixed 핀은 스무스 스크롤(Lenis 등)에서 갱신을 놓치면
          // 화면에 고정된 채 남아 다른 섹션을 덮는다. transform 핀은 문서 흐름에
          // 남으므로 그런 상태가 생기지 않는다.
          pinType: 'transform',
          anticipatePin: 1,
          scrub: cfg.scrub,
          invalidateOnRefresh: true,
          markers: cfg.markers,
          onUpdate: function (self) { applyProgress(self.progress); },
          onToggle: function (self) { active = self.isActive; }
        }
      });

      // 각 파트는 자기 슬롯보다 조금 길게 잡아 앞뒤 단계와 겹치게 한다.
      // 딱 잘라 붙이면 단계 전환이 계단처럼 끊긴다.
      var slot = 1 / PARTS.length;
      built.forEach(function (part, i) {
        tl.to(part.userData, { u: 1, duration: slot * 1.35 }, i * slot);
      });
      tl.to({}, { duration: slot * 0.4 }); // 마지막 단계를 잠깐 감상할 여유

      st = tl.scrollTrigger;
    }

    /* --- 부팅 --- */
    var ro = null;
    if (global.ResizeObserver) {
      ro = new ResizeObserver(function () { resize(); render(); });
      ro.observe(dom.stage);
    } else {
      global.addEventListener('resize', resize);
    }
    resize();
    applyProgress(0);
    // 첫 프레임은 active와 무관하게 한 번 그려 빈 캔버스가 보이지 않게 한다.
    active = true; render(); active = false;
    ScrollTrigger.refresh();

    /* --- 정리 --- */
    function destroy() {
      gsap.ticker.remove(render);
      if (tl) tl.kill();
      if (st) st.kill();
      if (ro) ro.disconnect(); else global.removeEventListener('resize', resize);
      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      renderer.dispose();
      mount.innerHTML = '';
    }

    return {
      destroy: destroy,
      refresh: function () { resize(); ScrollTrigger.refresh(); },
      get progress() { return progress; },
      scene: scene,
      group: group,
      timeline: tl
    };
  }

  global.ScrollStack3D = { init: init, PARTS: PARTS, PALETTE: PALETTE };
})(window);
