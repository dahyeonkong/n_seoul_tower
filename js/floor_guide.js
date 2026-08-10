(() => {
  "use strict";

  const floorStage = document.querySelector("[data-floor-stage]");
  const floorSections = Array.from(document.querySelectorAll("[data-floor-section]"));
  const towerImages = Array.from(document.querySelectorAll("[data-tower-floor]"));
  const activeFloorStatus = document.querySelector("[data-active-floor-status]");
  const floorTabs = Array.from(document.querySelectorAll("[data-floor-tab]"));
  const mobileFloorQuery = window.matchMedia("(max-width: 833px)");

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

  function renderActiveFloor(floorName, shouldFocusTab = false) {
    if (!floorName) {
      return;
    }

    activeFloor = floorName;
    floorStage.dataset.activeFloor = floorName;

    towerImages.forEach((towerImage) => {
      towerImage.classList.toggle("is_active", towerImage.dataset.towerFloor === floorName);
    });

    floorSections.forEach((floorSection) => {
      const isActiveSection = floorSection.dataset.floorSection === floorName;
      floorSection.classList.toggle("is_active", isActiveSection);
    });

    floorTabs.forEach((floorTab) => {
      const isActiveTab = floorTab.dataset.floorTab === floorName;
      floorTab.classList.toggle("is_active", isActiveTab);
      floorTab.toggleAttribute("aria-current", isActiveTab);

      if (isActiveTab && shouldFocusTab) {
        floorTab.focus();
      }
    });

    if (activeFloorStatus) {
      activeFloorStatus.textContent = `Current floor: ${formatFloorName(floorName)}`;
    }
  }

  function scrollToFloor(floorName) {
    const targetSection = floorSections.find((floorSection) => floorSection.dataset.floorSection === floorName);

    if (!targetSection) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    targetSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function handleFloorTabClick(event) {
    const floorName = event.currentTarget.dataset.floorTab;
    renderActiveFloor(floorName);
    scrollToFloor(floorName);
  }
  function handleFloorTabKeydown(event) {
    const currentIndex = floorTabs.indexOf(event.currentTarget);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % floorTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + floorTabs.length) % floorTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = floorTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextFloor = floorTabs[nextIndex].dataset.floorTab;
    renderActiveFloor(nextFloor, true);
    scrollToFloor(nextFloor);
  }

  function initFloorTabs() {
    floorTabs.forEach((floorTab) => {
      floorTab.addEventListener("click", handleFloorTabClick);
      floorTab.addEventListener("keydown", handleFloorTabKeydown);
    });
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
      () => {
        /* IntersectionObserver entries의 순서는 층 순서와 같지 않을 수 있습니다.
           변경 시점에 화면 중앙에 가장 가까운 층을 다시 계산해 깜빡임을 막습니다. */
        handleViewportChange();
      },
      {
        rootMargin: "-48% 0px -48% 0px",
        threshold: 0
      }
    );

    floorSections.forEach((floorSection) => floorObserver.observe(floorSection));
    window.addEventListener("resize", handleViewportChange);
  }

  /* 배치를 보고 등장 방향을 정합니다.
     좌우 끝에 있으면 그쪽에서, 가운데 위쪽이면 위에서 들어옵니다.
     모바일처럼 전부 가운데 정렬이면 좌우를 번갈아 써서 단조롭지 않게 합니다. */
  function getRevealDirection(revealTarget, sceneBounds, targetIndex) {
    const targetBounds = revealTarget.getBoundingClientRect();

    if (sceneBounds.width === 0 || targetBounds.width === 0) {
      return "";
    }

    const centerRatio = (targetBounds.left + targetBounds.width / 2 - sceneBounds.left) / sceneBounds.width;
    const topRatio = (targetBounds.top - sceneBounds.top) / sceneBounds.height;

    if (centerRatio < 0.38) {
      return "is_from_left";
    }

    if (centerRatio > 0.62) {
      return "is_from_right";
    }

    if (topRatio < 0.3) {
      return "is_from_top";
    }

    return targetIndex % 2 === 0 ? "is_from_left" : "is_from_right";
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
      const floorScene = floorSection.querySelector(".floor_scene_inner") || floorSection;
      const sceneBounds = floorScene.getBoundingClientRect();
      const sectionTargets = floorSection.querySelectorAll(".floor_card, .floor_deco");

      sectionTargets.forEach((revealTarget, targetIndex) => {
        const direction = getRevealDirection(revealTarget, sceneBounds, targetIndex);

        if (direction) {
          revealTarget.classList.add(direction);
        }

        revealTarget.style.setProperty("--reveal_delay", `${Math.min(targetIndex, 2) * 50}ms`);
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
    initFloorTabs();
    renderActiveFloor(activeFloor);
    initFloorObserver();
    initRevealMotion();
    updateFloorFromViewport();

    mobileFloorQuery.addEventListener("change", () => {
      renderActiveFloor(activeFloor);
      updateFloorFromViewport();
    });
  }

  initFloorGuide();
})();
