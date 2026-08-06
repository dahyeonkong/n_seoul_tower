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

  function handleGuideTabClick(event) {
    renderGuideTab(event.currentTarget);
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
    infoPanel.hidden = !isOpen;
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
  document.addEventListener("keydown", handleCableCarInformationKeydown);

  fareTabs.forEach(function (tab) {
    tab.addEventListener("click", handleFareTabClick);
    tab.addEventListener("keydown", handleFareTabKeydown);
  });
}

function initVisitorGuidePage() {
  initGuideTabs();
  initCableCarInformation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVisitorGuidePage);
} else {
  initVisitorGuidePage();
}
