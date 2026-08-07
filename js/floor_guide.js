(() => {
  "use strict";

  const floorStage = document.querySelector("[data-floor-stage]");
  const floorSections = Array.from(document.querySelectorAll("[data-floor-section]"));
  const towerImages = Array.from(document.querySelectorAll("[data-tower-floor]"));
  const activeFloorStatus = document.querySelector("[data-active-floor-status]");

  if (!floorStage || floorSections.length === 0 || towerImages.length === 0) {
    return;
  }

  /* 아래층에서 시작해 위로 올라갑니다. */
  const DEFAULT_FLOOR = "f5";

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

  /* 카드와 장식이 화면에 들어올 때 서서히 나타납니다.
     같은 층 안에서는 순서대로 조금씩 늦게 등장합니다. */
  function initRevealMotion() {
    const revealTargets = Array.from(document.querySelectorAll(".floor_card, .floor_deco"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || revealTargets.length === 0 || !("IntersectionObserver" in window)) {
      return;
    }

    floorSections.forEach((floorSection) => {
      const sectionTargets = floorSection.querySelectorAll(".floor_card, .floor_deco");

      sectionTargets.forEach((revealTarget, targetIndex) => {
        revealTarget.style.setProperty("--reveal_delay", `${Math.min(targetIndex, 5) * 90}ms`);
      });
    });

    /* 클래스를 붙이는 순간부터 숨겨지므로, 관찰을 시작하기 직전에 붙입니다. */
    floorStage.classList.add("has_floor_motion");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is_revealed");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.05
      }
    );

    revealTargets.forEach((revealTarget) => revealObserver.observe(revealTarget));
  }

  function initFloorGuide() {
    floorStage.dataset.activeFloor = activeFloor;
    initFloorObserver();
    initRevealMotion();
    updateFloorFromViewport();
  }

  initFloorGuide();
})();
