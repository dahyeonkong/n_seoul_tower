"use strict";

/* ========================================================================== 
   Restaurant > N Burger page interactions
   ========================================================================== */

function initRestaurantScrollAnimations() {
  var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isReducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".subpage_hero_image_reveal", {
    autoAlpha: 0,
    y: 72,
    scale: 0.84,
    rotation: -4,
    duration: 1.25,
    delay: 0.15,
    ease: "back.out(1.35)",
    clearProps: "transform,opacity,visibility"
  });

  function revealFrom(targets, options) {
    if (!targets || targets.length === 0) {
      return;
    }

    var settings = options || {};

    gsap.from(targets, {
      autoAlpha: 0,
      x: settings.x || 0,
      y: settings.y || 48,
      scale: settings.scale || 1,
      duration: settings.duration || 0.85,
      stagger: settings.stagger || 0,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: {
        trigger: settings.trigger || targets[0],
        start: settings.start || "top 82%",
        once: true
      }
    });
  }

  revealFrom(document.querySelectorAll(".burger_info_thumb"), {
    x: -64,
    y: 0,
    trigger: document.querySelector(".burger_info")
  });

  revealFrom(document.querySelectorAll(".burger_info_head, .burger_info_boxes, .burger_reserve_btn"), {
    x: 64,
    y: 0,
    stagger: 0.12,
    trigger: document.querySelector(".burger_info")
  });

  revealFrom(document.querySelectorAll(".burger_gallery_stage"), {
    y: 64,
    scale: 0.96,
    duration: 1,
    trigger: document.querySelector(".burger_gallery")
  });

  revealFrom(document.querySelectorAll(".burger_best_type_top"), {
    x: -80,
    y: 0,
    trigger: document.querySelector(".burger_best")
  });

  revealFrom(document.querySelectorAll(".burger_best_type_bottom"), {
    x: 80,
    y: 0,
    trigger: document.querySelector(".burger_best")
  });

  revealFrom(document.querySelectorAll(".burger_best_card"), {
    y: 72,
    stagger: 0.1,
    trigger: document.querySelector(".burger_best_list"),
    start: "top 88%"
  });

  revealFrom(document.querySelectorAll(".burger_menu_header"), {
    y: 48,
    trigger: document.querySelector(".burger_menu_board")
  });

  ScrollTrigger.batch(".burger_menu_group, .burger_tower_cup", {
    start: "top 88%",
    once: true,
    onEnter: function handleMenuGroupEnter(elements) {
      gsap.from(elements, {
        autoAlpha: 0,
        y: 56,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility"
      });
    }
  });

  window.addEventListener("load", function handleRestaurantPageLoad() {
    ScrollTrigger.refresh();
  }, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRestaurantScrollAnimations);
} else {
  initRestaurantScrollAnimations();
}
