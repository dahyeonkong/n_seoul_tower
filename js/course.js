"use strict";

function initCourseCategoryNavigation() {
  var navigation = document.querySelector("[data-course-nav]");
  if (!navigation) {
    return;
  }

  var links = Array.prototype.slice.call(navigation.querySelectorAll("[data-course-link]"));
  var sections = links.map(function getSection(link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  function renderActiveCourse(section) {
    links.forEach(function updateCourseLink(link) {
      var isActive = link.getAttribute("href") === "#" + section.id;
      link.classList.toggle("is_active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (!("IntersectionObserver" in window)) {
    return;
  }

  var observer = new IntersectionObserver(function handleCourseIntersection(entries) {
    var visible = entries.filter(function isVisible(entry) { return entry.isIntersecting; })
      .sort(function sortByVisibility(a, b) { return b.intersectionRatio - a.intersectionRatio; });
    if (visible.length > 0) {
      renderActiveCourse(visible[0].target);
    }
  }, { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.15, 0.5] });

  sections.forEach(function observeCourse(section) { observer.observe(section); });
}

function initCourseSectionAnimations() {
  var sections = [
    document.querySelector("#food_course"),
    document.querySelector("#photo_spot_course"),
    document.querySelector("#history_culture_course"),
    document.querySelector("#running_course")
  ].filter(Boolean);

  if (sections.length === 0 || !("IntersectionObserver" in window)) {
    return;
  }

  var tabletMedia = window.matchMedia("(max-width: 1279px)");
  var reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  var sectionObserver = null;

  function clearAnimationState() {
    sections.forEach(function clearSectionAnimation(section) {
      section.classList.remove("is_in_view");
    });
  }

  function renderAnimationMode() {
    if (sectionObserver) {
      sectionObserver.disconnect();
      sectionObserver = null;
    }

    clearAnimationState();

    if (!tabletMedia.matches || reducedMotionMedia.matches) {
      return;
    }

    sectionObserver = new IntersectionObserver(function handleSectionIntersection(entries) {
      entries.forEach(function updateSectionAnimation(entry) {
        entry.target.classList.toggle("is_in_view", entry.isIntersecting);
      });
    }, {
      rootMargin: "-15% 0px -15% 0px",
      threshold: 0.15
    });

    sections.forEach(function observeSection(section) {
      sectionObserver.observe(section);
    });
  }

  if (typeof tabletMedia.addEventListener === "function") {
    tabletMedia.addEventListener("change", renderAnimationMode);
    reducedMotionMedia.addEventListener("change", renderAnimationMode);
  } else {
    tabletMedia.addListener(renderAnimationMode);
    reducedMotionMedia.addListener(renderAnimationMode);
  }

  renderAnimationMode();
}

function initCoursePage() {
  initCourseCategoryNavigation();
  initCourseSectionAnimations();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCoursePage);
} else {
  initCoursePage();
}
