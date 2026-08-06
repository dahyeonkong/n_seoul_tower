"use strict";

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCableCarInformation);
} else {
  initCableCarInformation();
}
