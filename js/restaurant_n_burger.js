"use strict";

/* ========================================================================== 
   Restaurant > N Burger page interactions
   ========================================================================== */

function initRestaurantScrollAnimations() {
  var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initBurgerGallerySlider(isReducedMotion);

  if (isReducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

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

  function initBurgerGallerySlider(shouldReduceMotion) {
    var slider = document.querySelector("[data-gallery-slider]");
    var previousButton = document.querySelector("[data-gallery-prev]");
    var nextButton = document.querySelector("[data-gallery-next]");

    if (!slider || !previousButton || !nextButton) {
      return;
    }

    var sliderRegion = slider.closest(".burger_gallery_inner") || slider;
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-gallery-slide]"));
    var galleryGsap = window.gsap;

    if (!galleryGsap || slides.length < 2) {
      previousButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    var currentIndex = 0;
    var isAnimating = false;
    var autoPlayTimer = null;
    var SLIDE_INTERVAL = 2000;

    galleryGsap.set(slides, { xPercent: -100, autoAlpha: 0 });
    galleryGsap.set(slides[currentIndex], { xPercent: 0, autoAlpha: 1 });

    function renderSlideAccessibility() {
      slides.forEach(function renderSlideState(slide, index) {
        var isCurrentSlide = index === currentIndex;
        slide.classList.toggle("is_active", isCurrentSlide);
        slide.setAttribute("aria-hidden", String(!isCurrentSlide));
      });
    }

    function moveGallery(direction) {
      if (isAnimating) {
        return;
      }

      isAnimating = true;
      var nextIndex = (currentIndex + direction + slides.length) % slides.length;
      var currentSlide = slides[currentIndex];
      var nextSlide = slides[nextIndex];
      var incomingPosition = direction > 0 ? -100 : 100;
      var outgoingPosition = direction > 0 ? 100 : -100;
      var transitionDuration = shouldReduceMotion ? 0 : 0.65;

      galleryGsap.set(nextSlide, {
        xPercent: incomingPosition,
        autoAlpha: 1,
        zIndex: 2
      });
      galleryGsap.set(currentSlide, { zIndex: 1 });

      galleryGsap.timeline({
        defaults: {
          duration: transitionDuration,
          ease: "power2.inOut"
        },
        onComplete: function handleGalleryTransitionComplete() {
          galleryGsap.set(currentSlide, { autoAlpha: 0, zIndex: 0 });
          currentIndex = nextIndex;
          isAnimating = false;
          renderSlideAccessibility();
        }
      })
        .to(currentSlide, { xPercent: outgoingPosition }, 0)
        .to(nextSlide, { xPercent: 0 }, 0);
    }

    function startAutoPlay() {
      if (shouldReduceMotion || autoPlayTimer) {
        return;
      }

      autoPlayTimer = window.setInterval(function handleGalleryAutoPlay() {
        moveGallery(1);
      }, SLIDE_INTERVAL);
    }

    function stopAutoPlay() {
      if (!autoPlayTimer) {
        return;
      }

      window.clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }

    function handlePreviousClick() {
      moveGallery(-1);
    }

    function handleNextClick() {
      moveGallery(1);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    }

    previousButton.addEventListener("click", handlePreviousClick);
    nextButton.addEventListener("click", handleNextClick);
    sliderRegion.addEventListener("pointerenter", stopAutoPlay);
    sliderRegion.addEventListener("pointerleave", startAutoPlay);
    sliderRegion.addEventListener("focusin", stopAutoPlay);
    sliderRegion.addEventListener("focusout", startAutoPlay);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    renderSlideAccessibility();
    startAutoPlay();
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
