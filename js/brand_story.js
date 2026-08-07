"use strict";

/* ==========================================================================
   brand_story.js — about 5단 고정 스크롤 전환, tower data 영상 재생 제어
   나머지 동작(헤더, 메뉴, 언어, family site, 퀵 메뉴, 확정되지 않은 링크)은
   js/common.js 가 담당합니다.
   ========================================================================== */

/* 고정 스크롤은 시안이 있는 데스크톱에서만 씁니다. 그 아래는 5개가 그냥 쌓입니다. */
var ABOUT_PINNED_QUERY = "(min-width: 1280px)";

/* 각 점이 레일 선 위의 어디에 놓이는지입니다 (선 길이 342.755 대비 %).
   시안 좌표(선 시작 125.03,54.23 / 기울기 103도)에 점 중심을 투영해 구했습니다.
   슬라이드가 넘어가는 동안 이 값 사이를 채워 나가면 선이 다음 점에 정확히 닿습니다.
   마지막 항목 100 은 5번째 점을 지난 뒤 선 끝까지 채우는 값입니다. */
var ABOUT_RAIL_STOPS = [0.15, 22.02, 43.89, 68.45, 92.94, 100];

/* 이미지 사다리꼴의 아랫변 비율입니다. CSS 의 --brand_image_bottom 과 같아야 합니다. */
var ABOUT_IMAGE_BOTTOM_RATIO = 0.7163;

/* 레일 선이 차지하는 세로 길이 (레일 박스 높이 대비). 시안 333.97 / 424 입니다. */
var ABOUT_RAIL_VSPAN_RATIO = 333.97 / 424;

function prefersReducedMotion() {
  /* common.js 의 isReducedMotion() 을 쓰되, 단독으로도 동작하게 대비합니다. */
  if (typeof isReducedMotion === "function") {
    return isReducedMotion();
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toArray(nodeList) {
  return Array.prototype.slice.call(nodeList);
}

/* --------------------------------------------------------------------------
   about — 고정 스크롤 전환 (1058:11721)
   .about_viewport 가 sticky 로 멈춰 있는 동안 스크롤 진행도로 패널을 바꿉니다.
   패널 전환은 class 를 바꿔 CSS transition 에 맡기고,
   레일 선은 진행도에 비례해 매 프레임 채워 다음 점까지 끊김 없이 이어집니다.
   스크롤 이벤트는 requestAnimationFrame 으로 프레임당 1회만 처리합니다 (AGENTS 7.2).
   -------------------------------------------------------------------------- */
function initAboutPanels() {
  var section = document.querySelector("[data-about-section]");
  if (!section) {
    return;
  }

  var panels = toArray(section.querySelectorAll("[data-about-panel]"));
  var rail = section.querySelector("[data-about-rail]");
  var steps = rail ? toArray(rail.querySelectorAll(".about_step")) : [];

  if (!panels.length) {
    return;
  }

  var pinnedQuery = window.matchMedia(ABOUT_PINNED_QUERY);
  var isPinned = false;
  var isFrameRequested = false;
  var activeIndex = -1;
  var railProgress = -1;

  /* 직전 패널은 사라지지 않고 사진만 50% 로 남아 새 사진에 덮입니다. */
  function renderActivePanel(index) {
    var leavingIndex = activeIndex;
    activeIndex = index;

    panels.forEach(function (panel, order) {
      panel.classList.toggle("is_active", order === index);
      panel.classList.toggle("is_previous", order === leavingIndex && order !== index);
    });

    steps.forEach(function (step, order) {
      step.classList.toggle("is_active", order === index);
    });
  }

  /* 레일 선의 기울기를 이미지 사다리꼴의 대각선과 맞춥니다.
     패널 높이가 뷰포트를 따라가므로 각도가 고정이 아니라 실제 렌더 크기에서 구합니다.
     세로로 차지하는 길이는 그대로 두고 각도에 맞춰 선 길이만 늘립니다. */
  function renderRailGeometry() {
    if (!rail) {
      return;
    }

    var imageBox = section.querySelector(".about_image_box");
    if (!imageBox) {
      return;
    }

    var image = imageBox.getBoundingClientRect();
    var box = rail.getBoundingClientRect();
    if (!image.width || !image.height || !box.height) {
      return;
    }

    /* 대각선은 오른쪽 위에서 왼쪽 아래로 내려갑니다 (가로 변화량이 음수). */
    var angle = Math.atan2(image.height, -image.width * (1 - ABOUT_IMAGE_BOTTOM_RATIO));
    var length = (box.height * ABOUT_RAIL_VSPAN_RATIO) / Math.sin(angle);

    rail.style.setProperty("--rail_angle", ((angle * 180) / Math.PI).toFixed(2) + "deg");
    rail.style.setProperty("--rail_len", length.toFixed(1) + "px");
  }

  /* 선이 점에 닿으면 그 점을 채워진 색으로 바꿉니다.
     값이 바뀔 때만 class 를 건드려 매 프레임 DOM 을 흔들지 않습니다. */
  function renderRail(percent) {
    if (percent === railProgress) {
      return;
    }
    railProgress = percent;

    if (rail) {
      rail.style.setProperty("--rail_progress", percent + "%");
    }

    steps.forEach(function (step, order) {
      var reached = percent >= ABOUT_RAIL_STOPS[order];
      if (step.classList.contains("is_passed") !== reached) {
        step.classList.toggle("is_passed", reached);
      }
    });
  }

  /* 섹션이 얼마나 지나갔는지(0~1)를 구합니다.
     섹션 높이는 패널 수 × 100vh 이고, 고정돼 있는 구간은 (섹션 높이 − 화면 높이) 입니다. */
  function readProgress() {
    var travel = section.offsetHeight - window.innerHeight;
    if (travel <= 0) {
      return 0;
    }

    var passed = -section.getBoundingClientRect().top;
    return Math.min(Math.max(passed / travel, 0), 1);
  }

  /* 스크롤 이벤트마다 계산하지 않고 프레임당 한 번만 계산합니다 (AGENTS 7.2).
     common.js 의 initStickyHeader() 와 같은 방식입니다. */
  function renderScrollState() {
    isFrameRequested = false;

    var lastIndex = panels.length - 1;
    /* 0~5 구간으로 펼쳐 정수부는 현재 패널, 소수부는 다음 패널로 넘어가는 정도입니다. */
    var scaled = readProgress() * panels.length;
    var index = Math.min(lastIndex, Math.floor(scaled));
    var withinPanel = Math.min(Math.max(scaled - index, 0), 1);

    var from = ABOUT_RAIL_STOPS[index];
    var to = ABOUT_RAIL_STOPS[index + 1];
    /* 소수점 두 자리까지만 반영해 불필요한 스타일 갱신을 줄입니다. */
    var percent = Math.round((from + (to - from) * withinPanel) * 100) / 100;

    if (index !== activeIndex) {
      renderActivePanel(index);
    }
    renderRail(percent);
  }

  function handleAboutScroll() {
    if (isFrameRequested) {
      return;
    }
    isFrameRequested = true;
    window.requestAnimationFrame(renderScrollState);
  }

  /* 각도는 크기가 바뀔 때만 다시 재면 됩니다. 스크롤 중에는 계산하지 않습니다. */
  function handleAboutResize() {
    renderRailGeometry();
    handleAboutScroll();
  }

  function enablePinnedScroll() {
    if (isPinned) {
      return;
    }
    isPinned = true;
    window.addEventListener("scroll", handleAboutScroll, { passive: true });
    window.addEventListener("resize", handleAboutResize);
    renderRailGeometry();
    renderScrollState();
  }

  function disablePinnedScroll() {
    if (isPinned) {
      isPinned = false;
      window.removeEventListener("scroll", handleAboutScroll);
      window.removeEventListener("resize", handleAboutResize);
    }
    /* 쌓임 배치로 돌아가면 상태 class 가 남지 않게 정리합니다. */
    activeIndex = -1;
    railProgress = -1;
    panels.forEach(function (panel) {
      panel.classList.remove("is_active");
      panel.classList.remove("is_previous");
    });
    steps.forEach(function (step) {
      step.classList.remove("is_active");
      step.classList.remove("is_passed");
    });
    if (rail) {
      rail.style.removeProperty("--rail_progress");
      rail.style.removeProperty("--rail_angle");
      rail.style.removeProperty("--rail_len");
    }
  }

  function handlePinnedQueryChange() {
    if (pinnedQuery.matches && !prefersReducedMotion()) {
      enablePinnedScroll();
    } else {
      disablePinnedScroll();
    }
  }

  handlePinnedQueryChange();

  if (typeof pinnedQuery.addEventListener === "function") {
    pinnedQuery.addEventListener("change", handlePinnedQueryChange);
  } else if (typeof pinnedQuery.addListener === "function") {
    /* Safari 13 이하 */
    pinnedQuery.addListener(handlePinnedQueryChange);
  }
}

/* --------------------------------------------------------------------------
   tower data — 타워 실루엣 영상 (1095:14757)
   장식 영상이라 소리 없이 반복 재생하고, 모션 최소화 설정에서는 첫 프레임에 멈춥니다.
   -------------------------------------------------------------------------- */
function initTowerVideo() {
  var video = document.querySelector("[data-tower-video]");
  if (!video) {
    return;
  }

  if (prefersReducedMotion()) {
    video.removeAttribute("autoplay");
    video.pause();
    return;
  }

  var playRequest = video.play();
  if (playRequest && typeof playRequest.catch === "function") {
    playRequest.catch(function handleAutoplayBlocked() {
      /* 브라우저 정책으로 막힌 경우입니다. 오류가 아니므로 상태만 남겨 둡니다.
         멈춰 있어도 첫 프레임이 타워 모양으로 보이며 정보 손실은 없습니다.
         autoplay 속성이 뒤늦게 재생을 시작하는 경우가 있어 실제 상태를 다시 확인합니다. */
      if (video.paused) {
        video.setAttribute("data-autoplay-blocked", "true");
      }
    });
  }
}

/* --------------------------------------------------------------------------
   init
   -------------------------------------------------------------------------- */
function initBrandStoryPage() {
  initAboutPanels();
  initTowerVideo();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBrandStoryPage);
} else {
  initBrandStoryPage();
}
