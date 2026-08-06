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

function initCoursePage() {
  initCourseCategoryNavigation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCoursePage);
} else {
  initCoursePage();
}
