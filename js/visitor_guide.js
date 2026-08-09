"use strict";

/* --------------------------------------------------------------------------
   Getting Here / Recommended Courses 탭 전환
   두 내용이 한 페이지 안에 있으므로 패널만 교체합니다.
   -------------------------------------------------------------------------- */
function initGuideTabs() {
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-guide-tab]"));
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-guide-panel]"));

  if (tabs.length === 0 || panels.length === 0) return;

  function renderGuideTab(selectedTab) {
    tabs.forEach(function (tab) {
      var isSelected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
      tab.classList.toggle("is_active", isSelected);
    });

    panels.forEach(function (panel) {
      panel.hidden = panel.id !== selectedTab.getAttribute("aria-controls");
    });
  }

  function findTabByPanel(panel) {
    return tabs.filter(function (tab) {
      return tab.getAttribute("aria-controls") === panel.id;
    })[0];
  }

  /* 탭을 눌러 다른 패널로 바꾸면 새 패널 상단으로 올려줍니다.
     탭 목록은 sticky 라 스크롤한 뒤에도 계속 보입니다. */
  function scrollToGuidePanel(selectedTab) {
    var panel = document.getElementById(selectedTab.getAttribute("aria-controls"));

    if (!panel) return;

    var lenis = window.lenisInstance;

    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(panel);
      return;
    }

    var prefersReducedMotion =
      typeof window.isReducedMotion === "function" && window.isReducedMotion();

    panel.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function handleGuideTabClick(event) {
    var tab = event.currentTarget;
    var wasSelected = tab.getAttribute("aria-selected") === "true";

    renderGuideTab(tab);

    /* 이미 열려 있는 탭을 다시 누른 경우에는 화면을 움직이지 않습니다. */
    if (!wasSelected) {
      scrollToGuidePanel(tab);
    }
  }

  function handleGuideTabKeydown(event) {
    var currentIndex = tabs.indexOf(event.currentTarget);
    var nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === currentIndex) return;

    event.preventDefault();
    renderGuideTab(tabs[nextIndex]);
    tabs[nextIndex].focus();
    scrollToGuidePanel(tabs[nextIndex]);
  }

  /* 숨겨진 패널 안의 앵커(#speed_course 등)로 들어온 경우 해당 탭을 먼저 엽니다.
     패널이 hidden 이면 브라우저가 스크롤하지 못하므로 직접 이동시킵니다. */
  function activateTabFromHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;

    var target = document.getElementById(hash);
    if (!target) return;

    var panel = target.closest("[data-guide-panel]");
    if (!panel || !panel.hidden) return;

    var tab = findTabByPanel(panel);
    if (!tab) return;

    renderGuideTab(tab);

    /* 방금 펼친 패널은 아직 레이아웃 전이고, 최초 로드 시에는 브라우저의
       앵커 이동과 겹칩니다. 다음 프레임으로 미뤄야 목표 위치가 정확합니다. */
    window.requestAnimationFrame(function scrollToHashTarget() {
      target.scrollIntoView();
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", handleGuideTabClick);
    tab.addEventListener("keydown", handleGuideTabKeydown);
  });

  window.addEventListener("hashchange", activateTabFromHash);

  activateTabFromHash();
}

function initCableCarInformation() {
  var disclosureButton = document.querySelector("[data-cable-info-button]");
  var infoPanel = document.querySelector("[data-cable-info-panel]");
  var fareTabs = Array.prototype.slice.call(document.querySelectorAll("[data-cable-fare-tab]"));
  var farePanels = Array.prototype.slice.call(document.querySelectorAll("[data-cable-fare-panel]"));

  if (!disclosureButton || !infoPanel) return;

  function renderCableCarInformation(isOpen) {
    disclosureButton.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      infoPanel.classList.remove("is_closing");
      infoPanel.hidden = false;
      return;
    }

    if (!infoPanel.hidden) {
      infoPanel.classList.add("is_closing");
    }
  }

  function handleCableCarInformationAnimationEnd(event) {
    if (event.target !== infoPanel || event.animationName !== "cable_info_hide") return;
    if (disclosureButton.getAttribute("aria-expanded") === "true") return;

    infoPanel.hidden = true;
    infoPanel.classList.remove("is_closing");
  }

  function handleCableCarInformationToggle() {
    var isOpen = disclosureButton.getAttribute("aria-expanded") === "true";
    renderCableCarInformation(!isOpen);
  }

  function handleCableCarInformationKeydown(event) {
    if (event.key !== "Escape" || infoPanel.hidden) return;

    renderCableCarInformation(false);
    disclosureButton.focus();
  }

  function renderFareTab(selectedTab) {
    fareTabs.forEach(function (tab) {
      var isSelected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
      tab.classList.toggle("is_active", isSelected);
    });

    farePanels.forEach(function (farePanel) {
      farePanel.hidden = farePanel.id !== selectedTab.getAttribute("aria-controls");
    });
  }

  function handleFareTabClick(event) {
    renderFareTab(event.currentTarget);
  }

  function handleFareTabKeydown(event) {
    var currentIndex = fareTabs.indexOf(event.currentTarget);
    var nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % fareTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + fareTabs.length) % fareTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = fareTabs.length - 1;
    if (nextIndex === currentIndex) return;

    event.preventDefault();
    renderFareTab(fareTabs[nextIndex]);
    fareTabs[nextIndex].focus();
  }

  disclosureButton.addEventListener("click", handleCableCarInformationToggle);
  infoPanel.addEventListener("animationend", handleCableCarInformationAnimationEnd);
  document.addEventListener("keydown", handleCableCarInformationKeydown);

  fareTabs.forEach(function (tab) {
    tab.addEventListener("click", handleFareTabClick);
    tab.addEventListener("keydown", handleFareTabKeydown);
  });
}

function initGuideScrollMotion() {
  var desktopMedia = window.matchMedia("(min-width: 1280px)");
  var reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("#panel_getting_here .guide_section")
  );
  var frameId = 0;

  if (sections.length === 0) return;

  function clearMotion() {
    sections.forEach(function (section) {
      section.classList.remove("has_scroll_motion");
      section.style.removeProperty("--guide_scroll_progress");
      section.style.removeProperty("--guide_scroll_opacity");
      section.style.removeProperty("--guide_media_scale");
      section.style.removeProperty("--guide_text_shift");
      section.style.removeProperty("--guide_media_shift");
    });
  }

  function renderMotion() {
    frameId = 0;

    if (!desktopMedia.matches || reducedMotionMedia.matches) {
      clearMotion();
      return;
    }

    var viewportHeight = window.innerHeight;

    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var motionStart = viewportHeight * 0.9;
      var motionEnd = viewportHeight * 0.28;
      var travel = Math.max(motionStart - motionEnd, 1);
      var progress = Math.min(1, Math.max(0, (motionStart - rect.top) / travel));
      var easedProgress = progress * progress * (3 - 2 * progress);
      var shift = (1 - easedProgress) * 140;
      var textDirection = section.classList.contains("guide_section_media_first") ? 1 : -1;

      section.classList.add("has_scroll_motion");
      section.style.setProperty("--guide_scroll_progress", easedProgress.toFixed(4));
      section.style.setProperty("--guide_scroll_opacity", (0.06 + easedProgress * 0.94).toFixed(4));
      section.style.setProperty("--guide_media_scale", (0.84 + easedProgress * 0.16).toFixed(4));
      section.style.setProperty("--guide_text_shift", (shift * textDirection).toFixed(2) + "px");
      section.style.setProperty("--guide_media_shift", (shift * textDirection * -1).toFixed(2) + "px");
    });
  }

  function requestMotionRender() {
    if (frameId) return;
    frameId = window.requestAnimationFrame(renderMotion);
  }

  window.addEventListener("scroll", requestMotionRender, { passive: true });
  window.addEventListener("resize", requestMotionRender);
  desktopMedia.addEventListener("change", requestMotionRender);
  reducedMotionMedia.addEventListener("change", requestMotionRender);
  renderMotion();
}

function initPointerTilt() {
  var pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
  var reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  var targets = Array.prototype.slice.call(
    document.querySelectorAll(".guide_media, .course_visual")
  );
  var maxTilt = 7;

  if (targets.length === 0) return;

  function canTilt() {
    return pointerMedia.matches && !reducedMotionMedia.matches;
  }

  function resetTarget(target) {
    target.classList.remove("is_tilt_active");
    target.style.setProperty("--pointer_tilt_x", "0deg");
    target.style.setProperty("--pointer_tilt_y", "0deg");
  }

  function renderTiltState() {
    targets.forEach(function (target) {
      target.classList.toggle("has_pointer_tilt", canTilt());
      if (!canTilt()) resetTarget(target);
    });
  }

  targets.forEach(function (target) {
    var frameId = 0;
    var tiltX = 0;
    var tiltY = 0;

    function renderTargetTilt() {
      frameId = 0;
      target.style.setProperty("--pointer_tilt_x", tiltX.toFixed(2) + "deg");
      target.style.setProperty("--pointer_tilt_y", tiltY.toFixed(2) + "deg");
    }

    function handlePointerMove(event) {
      if (!canTilt()) return;

      var rect = target.getBoundingClientRect();
      var relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      var relativeY = (event.clientY - rect.top) / rect.height - 0.5;

      tiltX = relativeY * maxTilt * -2;
      tiltY = relativeX * maxTilt * 2;
      target.classList.add("is_tilt_active");

      if (!frameId) frameId = window.requestAnimationFrame(renderTargetTilt);
    }

    function handlePointerLeave() {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      resetTarget(target);
    }

    target.addEventListener("pointermove", handlePointerMove);
    target.addEventListener("pointerleave", handlePointerLeave);
    target.addEventListener("pointercancel", handlePointerLeave);
  });

  pointerMedia.addEventListener("change", renderTiltState);
  reducedMotionMedia.addEventListener("change", renderTiltState);
  renderTiltState();
}

function initVisitorGuidePage() {
  initGuideTabs();
  initCableCarInformation();
  initGuideScrollMotion();
  initPointerTilt();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVisitorGuidePage);
} else {
  initVisitorGuidePage();
}
