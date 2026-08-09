"use strict";

/* ==========================================================================
   brand_story.js — about 5단 고정 스크롤 전환, tower data 영상 재생 제어
   나머지 동작(헤더, 메뉴, 언어, family site, 퀵 메뉴, 확정되지 않은 링크)은
   js/common.js 가 담당합니다.
   ========================================================================== */

/* 고정 스크롤은 시안이 있는 데스크톱에서만 씁니다. */
var ABOUT_PINNED_QUERY = "(min-width: 1280px)";

/* 태블릿(1132:2612)과 모바일(1137:3648) 시안은 스크롤 고정 대신 넘기는 슬라이더입니다.
   화살표 / 좌우 스와이프 / 레일의 01~05 동그라미, 세 가지로 넘길 수 있습니다.
   고정 스크롤 구간과 겹치지 않게 잡아 한 번에 하나만 동작합니다. */
var ABOUT_SLIDER_QUERY = "(max-width: 1279.98px)";

/* 스와이프로 인정할 최소 가로 이동 거리(px)입니다.
   이보다 짧으면 넘기려던 게 아니라 그냥 누른 것으로 봅니다. */
var ABOUT_SWIPE_MIN_DISTANCE = 50;

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

  var pager = section.querySelector("[data-about-pager]");
  var prevButton = pager ? pager.querySelector("[data-about-prev]") : null;
  var nextButton = pager ? pager.querySelector("[data-about-next]") : null;
  var stepButtons = toArray(section.querySelectorAll("[data-about-step]"));
  var currentLabel = pager ? pager.querySelector("[data-about-current]") : null;
  var totalLabel = pager ? pager.querySelector("[data-about-total]") : null;
  var viewport = section.querySelector("[data-about-viewport]");

  var pinnedQuery = window.matchMedia(ABOUT_PINNED_QUERY);
  var sliderQuery = window.matchMedia(ABOUT_SLIDER_QUERY);
  var isPinned = false;
  var isSliderOn = false;
  var isFrameRequested = false;
  var swipePointerId = null;
  var swipeStartX = 0;
  var swipeStartY = 0;
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

    /* 고정 스크롤을 끈 뒤에도 예약해 둔 프레임은 한 번 더 실행됩니다.
       그대로 두면 화면을 좁혀 태블릿으로 넘어간 직후 슬라이더가 막 정한 패널을
       스크롤 위치로 덮어써 카운터와 화면이 어긋납니다. */
    if (!isPinned) {
      return;
    }

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

  /* 쌓임 배치로 돌아가면 상태 class 가 남지 않게 정리합니다.
     HTML 의 첫 패널에 붙어 있는 is_active 도 여기서 걷힙니다. */
  function resetPanels() {
    activeIndex = -1;
    panels.forEach(function (panel) {
      panel.classList.remove("is_active");
      panel.classList.remove("is_previous");
    });
  }

  /* 켜져 있을 때만 정리합니다. 조건 없이 지우면 태블릿 슬라이더가 켜진 상태에서
     모드 재확인이 돌 때 활성 패널까지 함께 지워집니다. */
  function disablePinnedScroll() {
    if (!isPinned) {
      return;
    }
    isPinned = false;
    window.removeEventListener("scroll", handleAboutScroll);
    window.removeEventListener("resize", handleAboutResize);

    railProgress = -1;
    resetPanels();
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

  /* ------------------------------------------------------------------------
     태블릿 — 화살표로 넘기는 슬라이더 (1132:2612)
     패널 전환은 데스크톱과 같은 renderActivePanel() 을 그대로 씁니다.
     직전 패널이 .is_previous 로 남아 사진이 50% 로 깔리는 것도 동일합니다.
     ------------------------------------------------------------------------ */
  function padNumber(value) {
    return value < 10 ? "0" + value : String(value);
  }

  /* 카운터와 화살표 활성 여부를 현재 인덱스에 맞춥니다.
     전체 개수는 실제 패널 수에서 읽으므로 패널이 늘어도 따로 고칠 곳이 없습니다. */
  function renderPager() {
    if (currentLabel) {
      currentLabel.textContent = padNumber(activeIndex + 1);
    }
    if (totalLabel) {
      totalLabel.textContent = "/" + padNumber(panels.length);
    }
    if (prevButton) {
      prevButton.disabled = activeIndex <= 0;
    }
    if (nextButton) {
      nextButton.disabled = activeIndex >= panels.length - 1;
    }
  }

  function goToPanel(index) {
    var target = Math.min(Math.max(index, 0), panels.length - 1);
    if (target === activeIndex) {
      return;
    }
    renderActivePanel(target);
    renderPager();
  }

  function handlePrevClick() {
    goToPanel(activeIndex - 1);
  }

  function handleNextClick() {
    goToPanel(activeIndex + 1);
  }

  /* 레일의 01~05 동그라미를 눌러 바로 그 슬라이드로 갑니다. */
  function handleStepClick(event) {
    var index = Number(event.currentTarget.getAttribute("data-about-step"));
    if (!isNaN(index)) {
      goToPanel(index);
    }
  }

  /* 데스크톱은 스크롤로 넘기므로 동그라미는 장식입니다.
     눌리지도, 탭 이동으로 잡히지도 않게 막아 둡니다 (AGENTS 10.6). */
  function renderStepButtons(canUse) {
    stepButtons.forEach(function (button) {
      button.disabled = !canUse;
    });
  }

  /* 손가락을 뗀 자리와 짚은 자리를 비교해 넘길지 정합니다.
     세로로 더 많이 움직였으면 페이지를 스크롤하려던 것으로 보고 넘기지 않습니다.
     preventDefault 를 쓰지 않아 세로 스크롤은 평소대로 동작합니다
     (가로만 JS 가 가져가도록 CSS 에서 touch-action: pan-y 를 줬습니다). */
  function handleSwipeStart(event) {
    /* 마우스는 왼쪽 버튼만 받습니다. */
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    swipePointerId = event.pointerId;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
  }

  function handleSwipeEnd(event) {
    if (swipePointerId === null || event.pointerId !== swipePointerId) {
      return;
    }
    swipePointerId = null;

    var moveX = event.clientX - swipeStartX;
    var moveY = event.clientY - swipeStartY;

    if (Math.abs(moveX) < ABOUT_SWIPE_MIN_DISTANCE || Math.abs(moveX) <= Math.abs(moveY)) {
      return;
    }

    /* 오른쪽으로 끌면 이전, 왼쪽으로 끌면 다음입니다. */
    goToPanel(moveX > 0 ? activeIndex - 1 : activeIndex + 1);
  }

  function handleSwipeCancel() {
    swipePointerId = null;
  }

  /* 사진 위에서 끌면 브라우저 기본 이미지 드래그가 시작되고,
     그러면 pointerup 대신 pointercancel 이 와서 스와이프가 끊깁니다. */
  function handleSwipeDragStart(event) {
    event.preventDefault();
  }

  function enableSlider() {
    if (isSliderOn || !pager) {
      return;
    }
    isSliderOn = true;
    if (prevButton) {
      prevButton.addEventListener("click", handlePrevClick);
    }
    if (nextButton) {
      nextButton.addEventListener("click", handleNextClick);
    }
    if (viewport) {
      viewport.addEventListener("pointerdown", handleSwipeStart, { passive: true });
      viewport.addEventListener("pointerup", handleSwipeEnd, { passive: true });
      viewport.addEventListener("pointercancel", handleSwipeCancel, { passive: true });
      viewport.addEventListener("dragstart", handleSwipeDragStart);
    }
    stepButtons.forEach(function (button) {
      button.addEventListener("click", handleStepClick);
    });
    renderStepButtons(true);
    renderActivePanel(0);
    renderPager();
  }

  function disableSlider() {
    if (!isSliderOn) {
      return;
    }
    isSliderOn = false;
    if (prevButton) {
      prevButton.removeEventListener("click", handlePrevClick);
    }
    if (nextButton) {
      nextButton.removeEventListener("click", handleNextClick);
    }
    if (viewport) {
      viewport.removeEventListener("pointerdown", handleSwipeStart);
      viewport.removeEventListener("pointerup", handleSwipeEnd);
      viewport.removeEventListener("pointercancel", handleSwipeCancel);
      viewport.removeEventListener("dragstart", handleSwipeDragStart);
    }
    stepButtons.forEach(function (button) {
      button.removeEventListener("click", handleStepClick);
    });
    renderStepButtons(false);
    swipePointerId = null;
    resetPanels();
  }

  /* 데스크톱 고정 스크롤 / 태블릿 슬라이더 / 모바일 쌓임 중 하나만 켭니다.
     모션 최소화 설정에서도 슬라이더는 그대로 둡니다. 넘기기는 장식이 아니라
     내용을 보는 유일한 수단이고, 움직임 자체는 CSS 쪽에서 없어집니다 (AGENTS 10.7). */
  function handleModeChange() {
    if (pinnedQuery.matches && !prefersReducedMotion()) {
      disableSlider();
      /* 슬라이더를 한 번도 켠 적이 없어도 동그라미는 잠가 둡니다. */
      renderStepButtons(false);
      enablePinnedScroll();
      return;
    }

    disablePinnedScroll();

    if (sliderQuery.matches) {
      enableSlider();
    } else {
      disableSlider();
      /* 모바일 쌓임 배치 — HTML 에 박혀 있는 첫 패널의 is_active 를 걷어 냅니다. */
      resetPanels();
    }
  }

  handleModeChange();

  [pinnedQuery, sliderQuery].forEach(function (query) {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleModeChange);
    } else if (typeof query.addListener === "function") {
      /* Safari 13 이하 */
      query.addListener(handleModeChange);
    }
  });
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
