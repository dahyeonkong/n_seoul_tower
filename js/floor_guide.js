(() => {
  "use strict";

  const floorStage = document.querySelector("[data-floor-stage]");
  const floorSections = Array.from(document.querySelectorAll("[data-floor-section]"));
  const towerImages = Array.from(document.querySelectorAll("[data-tower-floor]"));
  const activeFloorStatus = document.querySelector("[data-active-floor-status]");

  if (!floorStage || floorSections.length === 0 || towerImages.length === 0) {
    return;
  }

  /* 디자인과 동일하게 최상층에서 시작합니다. */
  const DEFAULT_FLOOR = "t7";

  let activeFloor = DEFAULT_FLOOR;
  let scrollFrame = 0;

  function formatFloorName(floorName) {
    return floorName.toUpperCase();
  }

  function renderActiveFloor(floorName) {
    if (!floorName || floorName === activeFloor) {
      return;
    }

    activeFloor = floorName;
    floorStage.dataset.activeFloor = floorName;

    towerImages.forEach((towerImage) => {
      towerImage.classList.toggle("is_active", towerImage.dataset.towerFloor === floorName);
    });

    if (activeFloorStatus) {
      activeFloorStatus.textContent = `Current floor: ${formatFloorName(floorName)}`;
    }
  }

  function findSectionAtViewportCenter() {
    const viewportCenter = window.innerHeight / 2;
    let closestSection = floorSections[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    floorSections.forEach((floorSection) => {
      const sectionRect = floorSection.getBoundingClientRect();
      const sectionCenter = sectionRect.top + sectionRect.height / 2;
      const centerDistance = Math.abs(sectionCenter - viewportCenter);

      if (sectionRect.top <= viewportCenter && sectionRect.bottom >= viewportCenter) {
        closestSection = floorSection;
        closestDistance = 0;
        return;
      }

      if (centerDistance < closestDistance) {
        closestSection = floorSection;
        closestDistance = centerDistance;
      }
    });

    return closestSection;
  }

  function updateFloorFromViewport() {
    scrollFrame = 0;
    const currentSection = findSectionAtViewportCenter();

    if (currentSection) {
      renderActiveFloor(currentSection.dataset.floorSection);
    }
  }

  function handleViewportChange() {
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(updateFloorFromViewport);
  }

  function initFloorObserver() {
    if (!("IntersectionObserver" in window)) {
      window.addEventListener("scroll", handleViewportChange, { passive: true });
      window.addEventListener("resize", handleViewportChange);
      return;
    }

    const floorObserver = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries.find((entry) => entry.isIntersecting);

        if (activeEntry) {
          renderActiveFloor(activeEntry.target.dataset.floorSection);
        }
      },
      {
        rootMargin: "-48% 0px -48% 0px",
        threshold: 0
      }
    );

    floorSections.forEach((floorSection) => floorObserver.observe(floorSection));
    window.addEventListener("resize", handleViewportChange);
  }

  function initFloorGuide() {
    floorStage.dataset.activeFloor = activeFloor;
    initFloorObserver();
    updateFloorFromViewport();
  }

  initFloorGuide();
})();
